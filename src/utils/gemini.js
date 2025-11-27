import { GoogleGenerativeAI } from "@google/generative-ai";

export const getGeminiModel = (apiKey) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });
};

export const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const extractAnswerFromPdf = async (apiKey, pdfFile) => {
    try {
        const model = getGeminiModel(apiKey);
        const pdfPart = await fileToGenerativePart(pdfFile);

        const prompt = `
            請分析這份 PDF 文件，並將其中的考卷解答提取出來。
            請以純文字格式輸出，標題清楚，不需要額外的 markdown 裝飾，方便閱讀與編輯。
            如果 PDF 中包含多個部分的解答，請清楚區分。
        `;

        const result = await model.generateContent([prompt, pdfPart]);
        return result.response.text();
    } catch (error) {
        console.error("Error extracting answer from PDF:", error);
        throw error;
    }
};

export const gradeExam = async (apiKey, answerText, examImages) => {
    try {
        const model = getGeminiModel(apiKey);

        // answerText is now a string, not a file part
        const examParts = await Promise.all(examImages.map(img => fileToGenerativePart(img)));

        const prompt = `
      你是一位嚴格但公正的老師。請根據提供的正確解答文字，批改學生的考卷圖片。
      
      正確解答：
      ${answerText}
      
      請提供以下格式的回覆：
      1. 總分 (滿分 100 分，請根據題目數量自行配分)
      2. 詳細的批改結果，包含每一題的對錯。
      3. 針對錯誤題目的更正與解釋。
      4. 給予學生的整體評語。

      請以 Markdown 格式輸出。
    `;

        const result = await model.generateContent([prompt, ...examParts]);
        return result.response.text();
    } catch (error) {
        console.error("Error grading exam:", error);
        throw error;
    }
};
