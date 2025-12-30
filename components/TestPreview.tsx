
import React from 'react';
import { Test, Difficulty, QuestionType, Question } from '../types';
import { Button } from './Button';
import { ArrowLeft, Printer, Send, Edit3, ShieldCheck } from 'lucide-react';

interface TestPreviewProps {
  test: Test;
  onBack: () => void;
  onAssign: () => void;
}

export const TestPreview: React.FC<TestPreviewProps> = ({ test, onBack, onAssign }) => {
  // Group questions by type
  const sections: Record<string, Question[]> = test.questions.reduce((acc: Record<string, Question[]>, q: Question) => {
    const typeKey = q.type as string;
    if (!acc[typeKey]) acc[typeKey] = [];
    acc[typeKey].push(q);
    return acc;
  }, {});

  const handlePrint = () => {
    window.print();
  };

  const testCode = React.useMemo(() => Math.floor(100 + Math.random() * 900), []);

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 sm:px-0">
      {/* Action Bar - Hidden during print */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 sticky top-20 bg-slate-50/90 backdrop-blur py-4 z-30 gap-4 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại Dashboard</span>
        </button>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none bg-white" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> In đề thi (PDF)
          </Button>
          <Button variant="primary" className="flex-1 md:flex-none" onClick={onAssign}>
            <Send className="w-4 h-4" /> Giao cho lớp {test.assignedClass}
          </Button>
        </div>
      </div>

      {/* The "Paper" Exam - optimized for print */}
      <div className="bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none">
        <div className="p-8 md:p-16 print:p-0">
          
          {/* Header Section (Vietnamese Exam Standard) */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm md:text-base">
            <div className="text-center space-y-1">
              <p className="font-bold uppercase">SỞ GD&ĐT TỈNH/THÀNH PHỐ</p>
              <p className="font-bold uppercase underline decoration-1 underline-offset-4">TRƯỜNG THCS ............................</p>
              <p className="text-sm">Họ và tên: .....................................................</p>
              <p className="text-sm text-left pl-4">Lớp: ............................................................</p>
            </div>
            <div className="text-center space-y-1 border-l border-slate-300 print:border-slate-800 pl-4">
              <p className="font-bold">ĐỀ KIỂM TRA {test.title.toUpperCase()}</p>
              <p className="font-bold">NĂM HỌC 2024 - 2025</p>
              <p>Môn: TIẾNG ANH {test.grade}</p>
              <p>Thời gian làm bài: {test.duration} phút</p>
            </div>
          </div>

          <div className="text-center mb-10 border-y py-2 border-slate-200 print:border-slate-800">
            <p className="font-black text-xl tracking-widest uppercase">MÃ ĐỀ: {testCode}</p>
          </div>

          {/* Exam Questions Section */}
          <div className="space-y-10">
            {Object.entries(sections).map(([type, qs], sIdx) => (
              <div key={type} className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-black text-slate-900 uppercase">
                    PHẦN {sIdx + 1}: {type.toUpperCase()}
                  </h3>
                  <p className="text-sm text-slate-500 italic print:hidden">(Gồm {qs.length} câu)</p>
                </div>
                
                <div className="space-y-6">
                  {(qs as Question[]).map((q, qIdx) => (
                    <div key={q.id} className="relative">
                      {q.passage && (
                        <div className="mb-4 p-5 bg-slate-50 print:bg-white rounded-xl border border-slate-200 print:border-slate-800 italic text-slate-700 print:text-black leading-relaxed text-sm">
                          <p className="font-bold mb-2 not-italic">Read the following passage and mark the letter A, B, C, or D on your answer sheet to indicate the correct answer to each of the questions.</p>
                          {q.passage}
                        </div>
                      )}

                      <div className="flex gap-2 items-start">
                        <span className="font-bold min-w-[4.5rem]">Question {test.questions.indexOf(q) + 1}:</span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 mb-3">{q.content}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                            {Object.entries(q.options).map(([key, val]) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className="font-bold">{key}.</span>
                                <span className={`${q.correctAnswer === key ? 'print:text-black' : ''}`}>
                                  {val}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Teacher's Key & Explanation - Hidden during print */}
                          <div className="no-print mt-2 bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-400 text-xs">
                            <p className="text-indigo-900">
                              <span className="font-bold">Đáp án: {q.correctAnswer}</span> | <span className="font-medium">Mức độ: {q.difficulty}</span>
                            </p>
                            <p className="text-indigo-700 mt-1 italic">Giải thích: {q.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center border-t border-slate-200 print:border-slate-800 pt-8 italic text-slate-500 print:text-black">
            <p>--- HẾT ---</p>
            <p className="text-xs mt-2 uppercase">(Giáo viên không giải thích gì thêm)</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
};
