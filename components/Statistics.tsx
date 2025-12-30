
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { Submission } from '../types';

interface StatisticsProps {
  submissions: Submission[];
}

export const Statistics: React.FC<StatisticsProps> = ({ submissions }) => {
  const scoreData = [
    { range: '0-3', count: submissions.filter(s => s.score < 3.5).length },
    { range: '4-5', count: submissions.filter(s => s.score >= 3.5 && s.score < 5).length },
    { range: '5-7', count: submissions.filter(s => s.score >= 5 && s.score < 7).length },
    { range: '7-8', count: submissions.filter(s => s.score >= 7 && s.score < 9).length },
    { range: '9-10', count: submissions.filter(s => s.score >= 9).length },
  ];

  const competencyData = [
    { name: 'Nhận biết', value: 85 },
    { name: 'Thông hiểu', value: 70 },
    { name: 'Vận dụng', value: 45 },
    { name: 'Vận dụng cao', value: 20 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const avgScore = submissions.length > 0 
    ? (submissions.reduce((acc, s) => acc + s.score, 0) / submissions.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1 uppercase tracking-wider">Điểm trung bình</p>
          <h3 className="text-4xl font-bold text-indigo-600">{avgScore}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1 uppercase tracking-wider">Số học sinh đã nộp</p>
          <h3 className="text-4xl font-bold text-emerald-600">{submissions.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm mb-1 uppercase tracking-wider">Tỉ lệ đạt chuẩn</p>
          <h3 className="text-4xl font-bold text-amber-600">
            {submissions.length > 0 ? ((submissions.filter(s => s.score >= 5).length / submissions.length) * 100).toFixed(0) : 0}%
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="font-bold mb-4 text-slate-700">Phân phối điểm số</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="font-bold mb-4 text-slate-700">Tỉ lệ đạt chuẩn năng lực (%)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={competencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {competencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
