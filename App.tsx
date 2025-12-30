
import React, { useState, useEffect } from 'react';
import { 
  UserRole, User, Test, Submission, Question, Difficulty, QuestionType 
} from './types';
import { Button } from './components/Button';
import { TestGenerator } from './components/TestGenerator';
import { Statistics } from './components/Statistics';
import { TestPreview } from './components/TestPreview';
// Added missing ShieldCheck icon to the lucide-react imports
import { 
  ClipboardList, Users, PieChart, LogOut, Clock, Send, 
  ChevronRight, ArrowLeft, CheckCircle2, XCircle, Info, Download, Sparkles, Eye, Printer, FileSpreadsheet, ShieldCheck
} from 'lucide-react';
import { getAIFeedback } from './geminiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'dashboard' | 'test-taking' | 'results' | 'test-preview'>('landing');
  const [tests, setTests] = useState<Test[]>([]);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [latestResult, setLatestResult] = useState<Submission | null>(null);

  // Mock initial data
  useEffect(() => {
    if (tests.length === 0) {
      const mockTest: Test = {
        id: '1',
        title: 'Kiểm tra 15 phút - Unit 1: My New School',
        grade: 6,
        topic: 'My New School',
        duration: 15,
        questions: [],
        createdAt: new Date().toISOString(),
        assignedClass: '6A1'
      };
      setTests([mockTest]);
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (view === 'test-taking' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && view === 'test-taking') {
      handleSubmitTest();
    }
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  const handleLogin = (role: UserRole) => {
    setUser({
      id: Math.random().toString(),
      name: role === UserRole.TEACHER ? 'Thầy Lê Vũ Thương' : 'Học sinh Trần Văn B',
      role,
      classCode: role === UserRole.STUDENT ? 'CLASS6A' : undefined
    });
    setView('dashboard');
  };

  const handleCreateTest = (newTest: Test) => {
    setTests([newTest, ...tests]);
    setActiveTest(newTest);
    setView('test-preview'); 
  };

  const handlePreviewTest = (test: Test) => {
    setActiveTest(test);
    setView('test-preview');
  };

  const startTest = (test: Test) => {
    setActiveTest(test);
    setCurrentAnswers({});
    setTimeLeft(test.duration * 60);
    setView('test-taking');
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;
    
    let correctCount = 0;
    activeTest.questions.forEach(q => {
      if (currentAnswers[q.id] === q.correctAnswer) correctCount++;
    });
    const score = (correctCount / activeTest.questions.length) * 10;
    
    const submission: Submission = {
      id: Math.random().toString(),
      testId: activeTest.id,
      studentId: user?.id || 'anonymous',
      studentName: user?.name || 'Học sinh Ẩn danh',
      answers: currentAnswers,
      score: parseFloat(score.toFixed(1)),
      completedAt: new Date().toISOString()
    };

    setLatestResult(submission);
    setView('results');

    // Fetch AI feedback in background
    const feedback = await getAIFeedback(submission.score, currentAnswers, activeTest.questions);
    setSubmissions(prev => [...prev, { ...submission, aiFeedback: feedback }]);
    setLatestResult(prev => prev ? { ...prev, aiFeedback: feedback } : null);
  };

  const exportToCSV = () => {
    if (submissions.length === 0) {
      alert("Chưa có kết quả để xuất file.");
      return;
    }
    const headers = ["Tên Học Sinh", "Điểm Số", "Thời Gian Nộp"];
    const rows = submissions.map(s => [
      s.studentName,
      s.score.toString(),
      new Date(s.completedAt).toLocaleString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bao_cao_diem_${activeTest?.assignedClass || 'lop'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-4">
        <div className="max-w-md w-full text-center bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/20 shadow-2xl">
          <div className="bg-white w-24 h-24 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500">
            <ClipboardList className="text-indigo-600 w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">EduTest AI</h1>
          <p className="text-indigo-100 mb-10 text-balance opacity-80 font-medium">Hệ thống khảo thí thông minh chuẩn Công văn 5512 dành cho giáo dục THCS</p>
          
          <div className="grid grid-cols-1 gap-4">
            <Button variant="primary" onClick={() => handleLogin(UserRole.TEACHER)} className="py-5 text-lg bg-white text-indigo-700 hover:bg-indigo-50 border-none shadow-xl">
              Cổng Giáo viên
            </Button>
            <Button variant="outline" onClick={() => handleLogin(UserRole.STUDENT)} className="py-5 text-lg border-white/40 text-white hover:bg-white/10">
              Cổng Học sinh
            </Button>
          </div>
          <p className="mt-8 text-[10px] text-white/50 font-bold uppercase tracking-widest">Phát triển cho chuyên môn Tiếng Anh THCS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col print:bg-white">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl cursor-pointer shadow-lg shadow-indigo-100" onClick={() => setView('dashboard')}>
              <ClipboardList className="text-white w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tighter text-slate-800 cursor-pointer" onClick={() => setView('dashboard')}>EduTest <span className="text-indigo-600">AI</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block border-r border-slate-100 pr-4">
              <p className="text-sm font-bold text-slate-800">{user?.name}</p>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{user?.role === UserRole.TEACHER ? 'Giáo viên Chuyên môn' : 'Học sinh'}</p>
            </div>
            <button 
              onClick={() => setView('landing')} 
              className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {user?.role === UserRole.TEACHER ? (
          <>
            {view === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Trang Quản lý</h2>
                    <p className="text-slate-500 font-medium italic">Chào Thầy {user.name.split(' ').pop()}, chúc thầy một ngày làm việc hiệu quả.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="bg-white" onClick={exportToCSV}>
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Xuất Bảng điểm
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <TestGenerator onTestCreated={handleCreateTest} />
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <PieChart className="w-6 h-6 text-indigo-600" /> 
                        Phân tích năng lực lớp {tests[0]?.assignedClass}
                      </h3>
                      <Statistics submissions={submissions} />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 overflow-hidden">
                      <div className="p-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                        <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Kho đề thi của thầy</h4>
                        <span className="text-[10px] font-black text-white bg-indigo-500 px-2 py-0.5 rounded-full">{tests.length}</span>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                        {tests.map(test => (
                          <div 
                            key={test.id} 
                            className="p-5 hover:bg-slate-50 cursor-pointer transition-all group relative"
                            onClick={() => handlePreviewTest(test)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                Khối {test.grade}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400">{new Date(test.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="font-bold text-slate-800 line-clamp-2 pr-8 text-sm group-hover:text-indigo-600 transition-colors">{test.title}</p>
                            <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {test.assignedClass}</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {test.duration} PHÚT</span>
                            </div>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                <Eye className="w-5 h-5 text-indigo-600" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-[1.5rem] p-8 text-white shadow-xl">
                      <h4 className="font-black text-lg mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" /> Hỗ trợ Giáo án
                      </h4>
                      <p className="text-indigo-100 text-xs mb-6 leading-relaxed font-medium italic">
                        "Mọi đề thi đều tự động bám sát ma trận Nhận biết - Thông hiểu - Vận dụng theo Thông tư 22/2021/TT-BGDĐT."
                      </p>
                      <Button variant="outline" className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 border-2 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest">
                        <Download className="w-4 h-4" /> Ma trận chuẩn 5512
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === 'test-preview' && activeTest && (
              <TestPreview 
                test={activeTest} 
                onBack={() => setView('dashboard')}
                onAssign={() => {
                  alert(`Đề thi "${activeTest.title}" đã được lưu trữ và sẵn sàng để học sinh truy cập.`);
                  setView('dashboard');
                }}
              />
            )}
          </>
        ) : (
          /* STUDENT PORTAL */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {view === 'dashboard' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                  <div className="bg-indigo-50 w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-inner">
                    <ClipboardList className="text-indigo-600 w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-black mb-2 text-slate-900 tracking-tight">Khu vực Học tập</h2>
                  <p className="text-slate-500 mb-10 font-medium">Lớp: <span className="text-indigo-600 font-black">{user?.classCode}</span> | Hãy bắt đầu bài thi đúng giờ.</p>
                  
                  <div className="space-y-4">
                    {tests.filter(t => t.questions.length > 0).map(test => (
                      <div key={test.id} className="p-6 border-2 border-slate-100 rounded-2xl flex items-center justify-between hover:border-indigo-300 transition-all bg-white shadow-sm hover:shadow-xl group">
                        <div className="text-left">
                          <h4 className="font-bold text-xl text-slate-800 group-hover:text-indigo-600 transition-colors">{test.title}</h4>
                          <div className="flex gap-4 mt-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {test.duration} PHÚT
                            </span>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                                MÃ ĐỀ: {test.id.slice(0,4).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <Button variant="primary" onClick={() => startTest(test)} className="px-8 rounded-xl shadow-lg shadow-indigo-100 font-black uppercase text-xs tracking-widest">
                          Bắt đầu
                        </Button>
                      </div>
                    ))}
                    {tests.filter(t => t.questions.length > 0).length === 0 && (
                      <div className="py-12 border-2 border-dashed border-slate-200 rounded-[2rem]">
                        <p className="text-slate-400 font-bold italic uppercase text-xs tracking-widest">Chưa có bài kiểm tra nào được giao</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {view === 'test-taking' && activeTest && (
              <div className="max-w-4xl mx-auto pb-24">
                <div className="sticky top-20 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-indigo-100 mb-10 flex justify-between items-center z-40 animate-in slide-in-from-top-4 duration-700">
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight">{activeTest.title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{user?.name}</p>
                  </div>
                  <div className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-mono text-3xl font-black shadow-inner transition-colors duration-500 ${timeLeft < 300 ? 'text-red-600 bg-red-50 animate-pulse' : 'text-indigo-600 bg-indigo-50'}`}>
                    <Clock className="w-7 h-7" />
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <Button variant="primary" onClick={handleSubmitTest} className="shadow-2xl shadow-indigo-200 px-8 py-4 font-black uppercase tracking-widest text-xs">
                    Nộp bài
                  </Button>
                </div>

                <div className="space-y-10">
                  {activeTest.questions.map((q, idx) => (
                    <div key={q.id} className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:shadow-xl hover:border-indigo-100">
                      {q.passage && (
                        <div className="mb-8 p-8 bg-slate-50 rounded-[1.5rem] border-l-[6px] border-indigo-500 text-base leading-relaxed italic text-slate-700 shadow-inner relative">
                          <div className="absolute -top-3 left-6 bg-indigo-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">Bài đọc / Reading</div>
                          {q.passage}
                        </div>
                      )}
                      <div className="flex gap-4 mb-8">
                        <span className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg flex-shrink-0">
                            {idx + 1}
                        </span>
                        <p className="font-bold text-2xl text-slate-900 leading-snug">
                          {q.content}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(q.options).map(([key, value]) => (
                          <button
                            key={key}
                            onClick={() => setCurrentAnswers({ ...currentAnswers, [q.id]: key })}
                            className={`p-6 text-left rounded-2xl border-2 transition-all flex items-center gap-5 group ${
                              currentAnswers[q.id] === key 
                                ? 'bg-indigo-50 border-indigo-600 ring-4 ring-indigo-50 shadow-lg' 
                                : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl transition-all ${
                              currentAnswers[q.id] === key ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                            }`}>
                              {key}
                            </span>
                            <span className={`text-lg font-medium ${currentAnswers[q.id] === key ? 'text-indigo-900 font-bold' : 'text-slate-600'}`}>{value}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'results' && latestResult && (
              <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-500">
                <div className="bg-white p-14 rounded-[3rem] shadow-2xl border border-slate-200 text-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-3 bg-indigo-600"></div>
                  <div className={`w-32 h-32 mx-auto flex items-center justify-center rounded-full mb-8 shadow-2xl ${latestResult.score >= 8 ? 'bg-emerald-100 text-emerald-600' : latestResult.score >= 5 ? 'bg-indigo-100 text-indigo-600' : 'bg-red-100 text-red-600'}`}>
                    {latestResult.score >= 5 ? <CheckCircle2 className="w-16 h-16" /> : <XCircle className="w-16 h-16" />}
                  </div>
                  <h2 className="text-4xl font-black mb-2 text-slate-900 tracking-tight">Hoàn thành bài thi!</h2>
                  <p className="text-slate-400 mb-10 font-bold uppercase tracking-widest text-xs">Kết quả đã được gửi đến thầy giáo</p>
                  
                  <div className="flex justify-center gap-20 mb-12">
                    <div className="transform transition-transform hover:scale-110 duration-500">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.3em] mb-3">Điểm của bạn</p>
                      <p className={`text-8xl font-black tracking-tighter ${latestResult.score >= 8 ? 'text-emerald-600' : latestResult.score >= 5 ? 'text-indigo-600' : 'text-red-600'}`}>{latestResult.score}</p>
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-[2rem] p-10 text-left border-2 border-indigo-100 relative group transition-all hover:bg-indigo-100">
                    <Sparkles className="w-8 h-8 text-indigo-400 absolute top-6 right-6 animate-bounce" />
                    <h4 className="flex items-center gap-3 font-black text-indigo-900 mb-4 text-xl uppercase tracking-tight">
                      <Info className="w-6 h-6" />
                      Nhận xét Chuyên môn (AI)
                    </h4>
                    <div className="text-indigo-900 leading-relaxed text-lg font-medium italic whitespace-pre-line">
                      {latestResult.aiFeedback || (
                        <div className="flex items-center gap-3 text-indigo-400">
                            <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
                            <span>Đang phân tích dữ liệu bài làm...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" onClick={() => setView('dashboard')} className="px-10 py-5 rounded-2xl border-2 font-black uppercase text-xs tracking-widest">
                      Về trang chủ
                    </Button>
                    <Button variant="primary" className="px-10 py-5 rounded-2xl shadow-2xl shadow-indigo-200 font-black uppercase text-xs tracking-widest">
                      Giải thích đáp án
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-10 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-8 mb-6 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
            {/* Using ShieldCheck from lucide-react */}
            <ShieldCheck className="w-6 h-6" />
            <Sparkles className="w-6 h-6" />
            <Users className="w-6 h-6" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">
            Hệ thống Khảo thí EduTest AI v2.5
          </p>
          <p className="text-[10px] text-slate-300 font-medium">
            Phòng thí nghiệm Sư phạm Số | Tối ưu hóa cho chương trình GDPT 2018
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
