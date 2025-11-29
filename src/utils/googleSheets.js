import { storage } from './storage';

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

let tokenClient;
let gapiInited = false;
let gisInited = false;

export const googleSheets = {
    isInitialized: false,

    async init(clientId) {
        if (this.isInitialized) return;

        // Load scripts if not loaded
        await Promise.all([
            this.loadGapi(),
            this.loadGis()
        ]);

        // Init GAPI
        await new Promise((resolve, reject) => {
            window.gapi.load('client', { callback: resolve, onerror: reject });
        });

        await window.gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;

        // Init GIS
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES,
            callback: (resp) => {
                if (resp.error !== undefined) {
                    throw resp;
                }
                // Save token
                storage.setGoogleToken(resp.access_token, resp.expires_in);
            },
        });
        gisInited = true;
        this.isInitialized = true;
    },

    loadGapi() {
        return new Promise((resolve) => {
            if (window.gapi) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = resolve;
            document.body.appendChild(script);
        });
    },

    loadGis() {
        return new Promise((resolve) => {
            if (window.google?.accounts) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = resolve;
            document.body.appendChild(script);
        });
    },

    async login() {
        if (!tokenClient) throw new Error('Google Sheets API not initialized');

        return new Promise((resolve, reject) => {
            try {
                // Override callback for this specific login request to handle promise
                tokenClient.callback = (resp) => {
                    if (resp.error) {
                        reject(resp);
                    } else {
                        storage.setGoogleToken(resp.access_token, resp.expires_in);
                        resolve(resp.access_token);
                    }
                };

                // Request token
                tokenClient.requestAccessToken({ prompt: 'consent' });
            } catch (err) {
                reject(err);
            }
        });
    },

    logout() {
        const token = storage.getGoogleToken();
        if (token) {
            window.google.accounts.oauth2.revoke(token, () => {
                console.log('Token revoked');
            });
            storage.removeGoogleToken();
        }
    },

    extractSpreadsheetId(url) {
        const matches = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        return matches ? matches[1] : null;
    },

    async fetchWorksheets(spreadsheetId) {
        const token = storage.getGoogleToken();
        if (!token) throw new Error('Not authenticated');

        window.gapi.client.setToken({ access_token: token });

        try {
            const response = await window.gapi.client.sheets.spreadsheets.get({
                spreadsheetId,
            });
            return response.result.sheets.map(sheet => ({
                id: sheet.properties.sheetId,
                title: sheet.properties.title,
            }));
        } catch (err) {
            console.error('Error fetching worksheets:', err);
            throw err;
        }
    },

    async appendRow(spreadsheetId, sheetTitle, values) {
        const token = storage.getGoogleToken();
        if (!token) throw new Error('Not authenticated');

        window.gapi.client.setToken({ access_token: token });

        const range = `${sheetTitle}!A:F`; // Assuming columns A-F based on plan

        try {
            const response = await window.gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [values],
                },
            });
            return response.result;
        } catch (err) {
            console.error('Error appending row:', err);
            throw err;
        }
    }
};
