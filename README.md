# 拍照改作業工具 (Homework Grading Tool)

這是一個基於 Vue.js 開發的自動化改作業工具，利用 **Google Gemini Pro** 的強大視覺辨識與推理能力來批改考卷，並整合 **Google Sheets** 進行成績儲存與管理。

## 核心功能

1.  **AI 智能批改**：上傳考卷照片，AI 自動辨識學生姓名、座號，並根據解答進行評分與講評。
2.  **Google 試算表整合**：自動讀取班級名單（工作表），並將批改結果（分數、評語、詳細檢討）寫入試算表。
3.  **本地資料隱私**：敏感資訊（API Key、解答、連結）僅儲存於瀏覽器 LocalStorage，不經過第三方伺服器。

## 系統需求與服務申請

本工具依賴以下外部服務，使用前請先完成申請：

### 1. Gemini API Key (用於 AI 批改)
本工具使用 Google Gemini 3 Pro 模型進行影像分析。
- **申請網址**：[Google AI Studio](https://aistudio.google.com/app/apikey)
- **步驟**：
    1. 登入 Google 帳號。
    2. 點擊 "Create API key"。
    3. 複製產生的 API Key (以 `AIza` 開頭的字串)。

### 2. Google OAuth Client ID (用於試算表存取)
本工具需要您的授權才能讀寫 Google 試算表。
- **申請網址**：[Google Cloud Console](https://console.cloud.google.com/)
- **步驟**：
    1. **建立專案**：在 Console 中建立一個新專案 (例如命名為 "Homework Grading")。
    2. **啟用 API**：
        - 進入 "APIs & Services" > "Library"。
        - 搜尋並啟用 **"Google Sheets API"**。
    3. **設定 OAuth 同意畫面 (Consent Screen)**：
        - 進入 "APIs & Services" > "OAuth consent screen"。
        - User Type 選擇 "External" (外部)，點擊建立。
        - 填寫 App name (例如 "改作業工具") 和 User support email。
        - "Developer contact information" 填寫您的信箱。
        - 點擊 "Save and Continue" 直到完成。
    4. **建立憑證 (Credentials)**：
        - 進入 "APIs & Services" > "Credentials"。
        - 點擊 "Create Credentials" > **"OAuth client ID"**。
        - Application type 選擇 **"Web application"**。
        - Name 填寫 "Web Client"。
        - **重要**：在 "Authorized JavaScript origins" (已授權的 JavaScript 來源) 加入您的應用程式網址。
            - 本地開發請加入：`http://localhost:5173`
            - 若有部署，請加入部署後的網址。
        - 點擊 "Create"。
    5. **取得 Client ID**：
        - 複製產生的 **Client ID** (以 `.apps.googleusercontent.com` 結尾的字串)。

## 安裝與執行

### 1. 安裝依賴
```sh
npm install
```

### 2. 啟動開發伺服器
```sh
npm run dev
```

## 使用指南

### 首次設定 (Environment Setup)
1. 開啟應用程式，進入「環境設定」頁面。
2. 輸入 **Gemini API Key**。
3. 輸入 **Google Client ID**。
4. 輸入 **Google 試算表連結** (您必須擁有該試算表的編輯權限)。
5. 點擊「登入 Google」進行授權。
6. 點擊「儲存並開始」。

### 準備工作 (Answer Key)
1. 在「作業批改」頁面，點擊「上傳正確解答 (PDF)」。
2. 系統會自動解析 PDF 內容為 Markdown 文字。
3. 確認解答內容無誤後，點擊「確認並儲存解答」。

### 批改流程 (Grading)
1. **輸入座號**：輸入該張考卷的學生座號。
2. **上傳考卷**：點擊相機圖示拍照，或上傳考卷圖片 (支援多張)。
3. **開始批改**：點擊「開始批改考卷」。
    - AI 會自動辨識學生 **姓名**。
    - AI 會根據解答進行評分。
4. **檢視與編輯**：
    - 批改完成後，您可以檢視分數、評語與詳細結果。
    - 若 AI 辨識有誤，可點擊「編輯」圖示修改座號、姓名或分數。
5. **儲存結果**：
    - 選擇要寫入的 **班級 (工作表)**。
    - 點擊「儲存至 Google 試算表」。

---
**隱私聲明**：本工具純屬前端應用，您的 API Key 與 Google Token 僅儲存於您瀏覽器的 LocalStorage 中，不會傳送至任何後端伺服器。
