
import { GoogleGenAI, Type } from "@google/genai";

// Always use the named parameter for apiKey and obtain it directly from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEnglishTest = async (grade: number, topic: string, level: string) => {
  const prompt = `
    Bạn là chuyên gia giáo dục Tiếng Anh THCS tại Việt Nam. 
    Hãy tạo một đề kiểm tra Tiếng Anh lớp ${grade} về chủ đề "${topic}" (Mức độ: ${level}) theo chuẩn Công văn 5512.
    
    Yêu cầu cấu trúc đề (Tổng 50 câu trắc nghiệm):
    1. Ngữ âm (Phát âm): 5 câu
    2. Trọng âm: 5 câu
    3. Từ vựng & Ngữ pháp: 15 câu (Bám sát chương trình SGK lớp ${grade})
    4. Tìm lỗi sai: 5 câu
    5. Đồng nghĩa/Trái nghĩa: 4 câu
    6. Tình huống giao tiếp: 3 câu
    7. Bài đọc điền từ (Cloze test): 5 câu (1 đoạn văn)
    8. Bài đọc hiểu (Reading comprehension): 8 câu (1-2 đoạn văn)

    Mỗi câu hỏi phải bao gồm:
    - Nội dung câu hỏi
    - 4 phương án A, B, C, D
    - Đáp án đúng
    - Mức độ (Nhận biết, Thông hiểu, Vận dụng)
    - Giải thích ngắn gọn

    Lưu ý quan trọng: Với bài đọc (Reading/Cloze), trường 'passage' phải chứa đoạn văn chung cho các câu hỏi liên quan.
  `;

  // Always use ai.models.generateContent to query GenAI with the model name and prompt.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                content: { type: Type.STRING },
                passage: { type: Type.STRING },
                options: {
                  type: Type.OBJECT,
                  properties: {
                    A: { type: Type.STRING },
                    B: { type: Type.STRING },
                    C: { type: Type.STRING },
                    D: { type: Type.STRING }
                  },
                  required: ["A", "B", "C", "D"]
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["id", "type", "difficulty", "content", "options", "correctAnswer", "explanation"]
            }
          }
        },
        required: ["title", "questions"]
      }
    }
  });

  // Extract text output using the .text property directly.
  return JSON.parse(response.text || '{}');
};

export const getAIFeedback = async (score: number, answers: any, questions: any) => {
  const prompt = `
    Dựa trên kết quả làm bài Tiếng Anh THCS:
    - Điểm: ${score}/10
    - Các lỗi sai thường gặp ở dạng bài: ${JSON.stringify(answers)}
    Hãy đưa ra nhận xét năng lực ngắn gọn (khoảng 100 từ) và gợi ý lộ trình học tập phù hợp cho học sinh này theo chuẩn đánh giá năng lực 5512.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  
  // Extract text output using the .text property directly.
  return response.text;
};
