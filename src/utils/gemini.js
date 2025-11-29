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
      
      請提供以下 JSON 格式的回覆 (不要包含 Markdown code block 標記，直接輸出 JSON 字串)：
      {
        "studentName": "學生姓名 (若無法辨識請留空)",
        "score": 總分 (數字，滿分 100),
        "feedback": "給予學生的整體評語 (純文字)",
        "detailedResult": "詳細的批改結果，包含每一題的對錯與更正 (Markdown 格式)"
      }

      評分標準：
      1. 請根據題目數量自行配分，總分 100 分。
      2. 詳細結果請使用 Markdown 格式，清楚列出錯題與正確答案。
    `;

        const result = await model.generateContent([prompt, ...examParts]);
        const text = result.response.text();

        // Attempt to parse JSON
        try {
            // Remove markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("Failed to parse JSON:", e);
            // Fallback to returning raw text in a structure
            return {
                studentName: "",
                score: 0,
                feedback: "解析失敗，請查看詳細結果",
                detailedResult: text
            };
        }
    } catch (error) {
        console.error("Error grading exam:", error);
        throw error;
    }
};
