# V2 增強功能開發計劃

## 目標
透過整合 Google 試算表儲存結果、利用 LocalStorage 持久化設定，以及優化批改流程，來強化現有的作業批改工具。

## 使用者故事 (User Stories)
為了確保我們對需求的理解一致，以下是我對使用者故事的理解：

1.  **身為一名首次使用者**，我希望能夠清楚地引導我完成 Gemini API Key 和 Google 試算表的連結設定，以便我能順利開始使用工具。
2.  **身為一名老師**，我希望能將考卷解答上傳後自動儲存，這樣我就不需要每次批改時都重新上傳。
3.  **身為一名老師**，我希望能從選單中選擇特定的班級 (工作表) 和輸入學生座號，確保成績被登記到正確的位置。
4.  **身為一名老師**，我希望在儲存成績之前，能先檢視並修改 AI 的批改結果，以確保評分的準確性。
5.  **身為一名老師**，我希望能一鍵將批改結果 (分數、評語) 儲存到 Google 試算表，省去人工登錄的時間。
6.  **身為一名使用者**，我希望能在「環境設定」和「作業批改」頁面之間自由切換，以便隨時調整設定。

## 技術堆疊
1.  **Vue Router**: 用於管理頁面路由 (`/setup`, `/grading`)。
2.  **Google Sheets API**: 用於讀取學生名單和寫入批改結果。
3.  **LocalStorage**: 用於持久化儲存：
    - Gemini API Key
    - Google 試算表連結
    - 考卷解答 (Markdown 格式)
4.  **Google OAuth**: 用於驗證使用者身分以存取其 Google 試算表。

## 用戶操作邏輯調整

### 1. 首次使用 (設定)
- **輸入**:
    - Gemini API Key
    - Google 試算表連結
- **動作**:
    - 登入 Google (OAuth) 以授權試算表存取。
    - 將 API Key 和試算表連結儲存至 LocalStorage。

### 2. 解答管理
- **動作**:
    - 上傳解答 (PDF/圖片)。
    - 預覽解析後的文字 (Markdown)。
    - 確認並儲存。
- **儲存**: 將確認後的解答儲存至 LocalStorage。

### 3. 批改階段
- **選擇**:
    - 從連結的 Google 試算表中選擇特定的工作表 (Worksheet)。
    - 輸入學生座號 (關鍵識別碼)。
- **上傳**:
    - 上傳學生作業 (照片/檔案，允許多張)。
- **處理 (Gemini 3 Pro)**:
    - **輸入**: 解答、學生作業、座號。
    - **輸出欄位**:
        - 學生姓名 (如果有偵測到/提供)
        - 學生座號
        - 批改結果 (Markdown)
        - 分數
        - 回饋
- **檢視與儲存**:
    - 老師檢視並在必要時修改結果。
    - 點擊「儲存至 Google 試算表」以新增/更新該學生的資料列。

## 詳細實作計畫

### 需要用戶審查
> [!IMPORTANT]
> **Google Cloud 設定**: 用戶必須設定 Google Cloud Project，啟用 Google Sheets API，並設定 OAuth 同意畫面以取得 Client ID。這是 Google 試算表整合的必要條件。

### 基礎設施
#### [NEW] [src/utils/googleSheets.js](src/utils/googleSheets.js)
- 實作 Google OAuth 登入/登出。
- 實作 `fetchWorksheets(spreadsheetId)` 以取得工作表清單。
- 實作 `appendRow(spreadsheetId, range, values)` 以儲存結果。
- 實作 `updateRow` 如果我們想要支援重新批改（目前先以新增為主，較安全）。

#### [NEW] [src/utils/storage.js](src/utils/storage.js)
- `localStorage` 的包裝器，用於管理：
    - `gemini_api_key`
    - `google_sheet_link`
    - `answer_key_markdown`
    - `google_access_token` (通常由 Google SDK 管理，但我們可能需要儲存過期時間)

### 元件與視圖

#### [NEW] [src/router/index.js](src/router/index.js)
- 設定路由：
    - `/`: 預設導向 `/grading` (若未設定則導向 `/setup`)。
    - `/setup`: `SetupView.vue`。
    - `/grading`: `HomeView.vue` (或重新命名為 `GradingView.vue`)。
- 加入導航守衛 (Navigation Guard)：檢查 LocalStorage 是否有 API Key，若無則強制導向 `/setup`。

#### [NEW] [src/views/SetupView.vue](src/views/SetupView.vue)
- 用於首次設定的新視圖。
- 輸入：Gemini API Key, Google 試算表連結。
- 動作：Google 登入按鈕。
- 邏輯：將金鑰儲存至 LocalStorage。

#### [MODIFY] [src/views/HomeView.vue](src/views/HomeView.vue)
- **狀態**: 新增 `selectedSheet`, `seatNumber`。
- **流程**:
    - 檢查設定是否完成 (API Key, Sheet Link)。如果未完成，重導向至 `SetupView` 或顯示設定模態框。
    - **步驟 1**: 解答。如果有，從 LocalStorage 載入。允許上傳/替換。
    - **步驟 2**: 批改。
        - 下拉選單選擇工作表 (從 Sheets API 取得)。
        - 輸入座號。
        - 拍攝/上傳學生作業。
    - **步驟 3**: 結果。
        - 顯示解析後的結果。
        - 「儲存至 Google 試算表」按鈕。

#### [MODIFY] [src/App.vue](src/App.vue)
- 在 Header 加入導航連結：「環境設定」、「作業批改」。

#### [MODIFY] [src/components/AnswerUploader.vue](src/components/AnswerUploader.vue)
- 新增「儲存解答」功能 (持久化至 LocalStorage)。

#### [MODIFY] [src/components/GradingResult.vue](src/components/GradingResult.vue)
- 顯示結構化欄位 (分數、回饋)。
- 新增「儲存至 Google 試算表」按鈕。
- 發送事件 `save-to-sheets` 帶有結果資料。

#### [MODIFY] [src/utils/gemini.js](src/utils/gemini.js)
- 更新 `gradeExam` prompt 以要求 **JSON 格式** 輸出。
- **Prompt 需求**:
    - 必須包含完整的中文提詞 (System Prompt)，以便後續修改。
    - 輸出結構範例：
      ```json
      {
        "studentName": "姓名",
        "seatNumber": "座號",
        "score": 100,
        "feedback": "評語",
        "detailedResult": "Markdown 格式的詳細批改結果"
      }
      ```
- 確保輸出包含：學生姓名、座號、分數、回饋、詳細 Markdown。

## 驗證計畫

### 手動驗證
1.  **設定流程**:
    - 清除 LocalStorage。
    - 開啟 App。驗證是否要求輸入 API Key 和試算表連結。
    - 輸入測試用的金鑰/連結。驗證是否儲存至 LocalStorage。
    - 測試 Google 登入 (需要有效的 Client ID)。
2.  **解答**:
    - 上傳 PDF。
    - 驗證文字解析。
    - 點擊「確認/儲存」。重新整理頁面。驗證解答是否從 LocalStorage 載入。
3.  **批改**:
    - 選擇工作表 (如果 API 尚未準備好，則使用模擬資料)。
    - 輸入座號 "10"。
    - 上傳圖片。
    - 執行批改。
    - 驗證結果顯示分數、回饋等。
4.  **儲存**:
    - 點擊「儲存至 Google 試算表」。
    - 驗證資料是否發送至 API (檢查 Network 標籤或 Console log)。

## 資料結構 (Google 試算表)
建議試算表中的欄位：
- 座號
- 時間戳記
- 姓名
- 分數
- 回饋
- 詳細結果 (Markdown/連結)
