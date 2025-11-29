const STORAGE_KEYS = {
    GEMINI_API_KEY: 'gemini_api_key',
    GOOGLE_SHEET_LINK: 'google_sheet_link',
    GOOGLE_CLIENT_ID: 'google_client_id',
    ANSWER_KEY_MARKDOWN: 'answer_key_markdown',
    GOOGLE_ACCESS_TOKEN: 'google_access_token',
    GOOGLE_TOKEN_EXPIRY: 'google_token_expiry',
};

export const storage = {
    get(key) {
        return localStorage.getItem(key);
    },

    set(key, value) {
        localStorage.setItem(key, value);
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    // Specific getters/setters for typed access
    getGeminiApiKey() {
        return this.get(STORAGE_KEYS.GEMINI_API_KEY);
    },

    setGeminiApiKey(key) {
        this.set(STORAGE_KEYS.GEMINI_API_KEY, key);
    },

    getGoogleSheetLink() {
        return this.get(STORAGE_KEYS.GOOGLE_SHEET_LINK);
    },

    setGoogleSheetLink(link) {
        this.set(STORAGE_KEYS.GOOGLE_SHEET_LINK, link);
    },

    getGoogleClientId() {
        return this.get(STORAGE_KEYS.GOOGLE_CLIENT_ID);
    },

    setGoogleClientId(clientId) {
        this.set(STORAGE_KEYS.GOOGLE_CLIENT_ID, clientId);
    },

    getAnswerKey() {
        return this.get(STORAGE_KEYS.ANSWER_KEY_MARKDOWN);
    },

    setAnswerKey(markdown) {
        this.set(STORAGE_KEYS.ANSWER_KEY_MARKDOWN, markdown);
    },

    getGoogleToken() {
        const token = this.get(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN);
        const expiry = this.get(STORAGE_KEYS.GOOGLE_TOKEN_EXPIRY);

        if (!token || !expiry) return null;

        if (Date.now() > parseInt(expiry, 10)) {
            this.removeGoogleToken();
            return null;
        }

        return token;
    },

    setGoogleToken(token, expiresInSeconds) {
        this.set(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN, token);
        // Set expiry slightly before actual expiry to be safe (e.g., -60s)
        const expiryTime = Date.now() + (expiresInSeconds - 60) * 1000;
        this.set(STORAGE_KEYS.GOOGLE_TOKEN_EXPIRY, expiryTime.toString());
    },

    removeGoogleToken() {
        this.remove(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN);
        this.remove(STORAGE_KEYS.GOOGLE_TOKEN_EXPIRY);
    }
};

export { STORAGE_KEYS };
