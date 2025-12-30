
import React, { useState } from 'react';
import { Button } from './Button';
import { generateEnglishTest } from '../geminiService';
import { Test, Difficulty } from '../types';
import { Sparkles, FileText, CheckCircle } from 'lucide-react';

interface TestGeneratorProps {
  onTestCreated: (test: Test) => void;
}

export const TestGenerator: React.FC<TestGeneratorProps> = ({ onTestCreated }) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    grade: 6,
    topic: 'My New School',
    level: 'Chuẩn',
    duration: 45
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateEnglishTest(config.grade, config.topic, config.level);
      const newTest: Test = {
        id: Math.random().toString(36).substr(2, 9),
        title: result.title || `Đề kiểm tra Tiếng Anh lớp ${config.grade} - ${config.topic}`,
        grade: config.grade,
        topic: config.topic,
        duration: config.duration,
        questions: result.questions,
        createdAt: new Date().toISOString(),
        assignedClass: '6A1' // Mock class
      };
      onTestCreated(newTest);
    } catch (error) {
      console.error("Lỗi khi tạo đề:", error);
      alert("Có lỗi xảy ra khi gọi AI. Vui lòng kiểm tra API Key hoặc thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-indigo-600 w-6 h-6" />
        <h2 className="text-xl font-bold">AI Tạo Đề Kiểm Tra (Chuẩn 5512)</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Khối lớp</label>
          <select 
            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={config.grade}
            onChange={(e) => setConfig({...config, grade: parseInt(e.target.value)})}
          >
            {[6, 7, 8, 9].map(g => <option key={g} value={g}>Lớp {g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Thời gian (phút)</label>
          <input 
            type="number" 
            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={config.duration}
            onChange={(e) => setConfig({...config, duration: parseInt(e.target.value)})}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Chủ đề bài học (Unit)</label>
          <input 
            type="text" 
            placeholder="Ví dụ: My New School, Sports and Games..."
            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={config.topic}
            onChange={(e) => setConfig({...config, topic: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mức độ</label>
          <select 
            className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            value={config.level}
            onChange={(e) => setConfig({...config, level: e.target.value})}
          >
            <option>Chuẩn</option>
            <option>Nâng cao</option>
          </select>
        </div>
      </div>

      <div className="bg-indigo-50 p-4 rounded-lg mb-6 text-sm text-indigo-800">
        <p className="font-semibold mb-2">💡 Quy chuẩn 5512 được áp dụng:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Phân bổ 50 câu trắc nghiệm (10 điểm)</li>
          <li>Đầy đủ ma trận: Nhận biết, Thông hiểu, Vận dụng</li>
          <li>Đa dạng các dạng bài: Ngữ âm, Grammar, Reading, Writing</li>
        </ul>
      </div>

      <Button 
        variant="primary" 
        className="w-full py-3 text-lg" 
        onClick={handleGenerate}
        loading={loading}
      >
        {loading ? 'AI đang thiết lập đề...' : 'Bắt đầu tạo đề với AI'}
      </Button>

      {loading && (
        <p className="mt-4 text-center text-slate-500 text-sm italic">
          AI đang tổng hợp dữ liệu từ ngân hàng đề và chương trình SGK mới...
        </p>
      )}
    </div>
  );
};
