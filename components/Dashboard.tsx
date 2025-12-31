
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Users, Target, Activity, BarChart2 as ChartIcon, Trash2, Clock, Sparkles, Loader2 } from 'lucide-react';
import { db } from '../services/db';
import { Quiz, Question, Submission } from '../types';
import { analyzeQuizResults } from '../services/geminiService';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#334155'];

const Dashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  // AI Analysis states
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = () => {
    const q = db.getQuizzes().find(item => item.id === id);
    if (q) {
      setQuiz(q);
      setQuestions(db.getQuestions(id));
      setSubmissions(db.getSubmissions(id));
      setAnalysis(null); // Clear analysis when changing assessments
    }
  };

  const handleGenerateAI = async () => {
    if (submissions.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeQuizResults(submissions, questions);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setAnalysis("An unexpected error occurred during AI analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteSubmission = (sid: string) => {
    if (window.confirm("Are you sure you want to delete this submission? This will permanently remove it from analytics.")) {
      db.deleteSubmission(sid);
      loadData();
    }
  };

  if (!quiz) return (
    <div className="p-20 text-center flex flex-col items-center justify-center">
      <ChartIcon size={64} className="text-slate-200 mb-6" />
      <h2 className="text-2xl font-bold text-slate-800">Select an Assessment</h2>
      <p className="text-slate-500 mt-2">Pick a quiz from the list to view maturity metrics.</p>
    </div>
  );

  const avgScore = submissions.length > 0 
    ? (submissions.reduce((acc, s) => acc + s.totalScore, 0) / submissions.length).toFixed(1)
    : 0;

  const scoreData = submissions.reduce((acc: any[], s) => {
    const range = Math.floor(s.totalScore / 10) * 10;
    const label = `${range}-${range + 10}`;
    const existing = acc.find(i => i.range === label);
    if (existing) existing.count++;
    else acc.push({ range: label, count: 1 });
    return acc;
  }, []).sort((a, b) => parseInt(a.range) - parseInt(b.range));

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="flex justify-between items-start pb-8 border-b border-slate-200">
        <div>
          <h2 className="text-4xl font-black text-slate-950 tracking-tight">{quiz.title}</h2>
          <p className="text-slate-600 mt-2 font-medium text-lg">LexMaturity Executive Analytics Suite</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
              <Users size={24} strokeWidth={2.5} />
            </div>
            <h3 className="font-black text-slate-500 text-xs uppercase tracking-[0.2em]">Respondents</h3>
          </div>
          <p className="text-5xl font-black text-slate-950">{submissions.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
              <Target size={24} strokeWidth={2.5} />
            </div>
            <h3 className="font-black text-slate-500 text-xs uppercase tracking-[0.2em]">Avg. Maturity</h3>
          </div>
          <p className="text-5xl font-black text-slate-950">{avgScore}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl">
              <Activity size={24} strokeWidth={2.5} />
            </div>
            <h3 className="font-black text-slate-500 text-xs uppercase tracking-[0.2em]">Pulse Check</h3>
          </div>
          <p className="text-2xl font-black text-slate-950 uppercase tracking-tight">
            {submissions.length > 0 
              ? new Date(submissions[0].submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : 'Awaiting Data'}
          </p>
        </div>
      </div>

      {/* AI Executive Insights */}
      <div className="bg-slate-950 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-900/20 text-white overflow-hidden relative border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h3 className="text-2xl font-black flex items-center gap-3">
                <Sparkles className="text-blue-400" size={28} />
                Executive AI Insights
              </h3>
              <p className="text-slate-400 font-medium mt-1 text-sm">Automated maturity gap analysis and strategic roadmap recommendations.</p>
            </div>
            {!analysis && !isAnalyzing && (
              <button 
                onClick={handleGenerateAI}
                disabled={submissions.length === 0}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40"
              >
                Generate Report
              </button>
            )}
          </div>

          {isAnalyzing && (
            <div className="py-16 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-blue-400" size={48} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse text-center max-w-xs">
                AI Consultant is synthesizing organizational data and benchmark metrics...
              </p>
            </div>
          )}

          {analysis && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900/50 rounded-3xl p-8 md:p-10 border border-slate-800 font-medium leading-relaxed whitespace-pre-wrap text-slate-200 text-lg shadow-inner">
                {analysis}
              </div>
              <button 
                onClick={() => setAnalysis(null)}
                className="mt-6 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-all px-4 py-2 hover:bg-slate-900 rounded-lg"
              >
                Clear Analysis
              </button>
            </div>
          )}

          {!analysis && !isAnalyzing && submissions.length === 0 && (
            <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-10 text-center text-slate-500 font-bold uppercase tracking-widest text-sm">
              Insufficient submission data to generate AI insights.
            </div>
          )}
        </div>
      </div>

      {/* Main Charts & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Score Distribution */}
        <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-950 mb-10 flex items-center gap-3">
            <ChartIcon className="text-blue-600" size={24} strokeWidth={2.5} />
            Aggregate Maturity Profile
          </h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 13, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 13, fontWeight: 700 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px' }} />
                <Bar dataKey="count" fill="#2563eb" radius={[12, 12, 4, 4]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Submission Ledger (Delete Entries) */}
        <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-black text-slate-950 mb-10 flex items-center gap-3">
            <Clock className="text-indigo-600" size={24} strokeWidth={2.5} />
            Submission Audit Log
          </h3>
          <div className="flex-1 overflow-y-auto max-h-[320px] scrollbar-hide">
            {submissions.length === 0 ? (
              <div className="text-center text-slate-400 py-10 font-bold uppercase tracking-widest text-sm">No entries recorded</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                    <th className="text-center py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Score</th>
                    <th className="text-right py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {submissions.map((s) => (
                    <tr key={s.id} className="group">
                      <td className="py-4">
                        <p className="text-sm font-bold text-slate-900">{new Date(s.submittedAt).toLocaleDateString()}</p>
                        <p className="text-[10px] text-slate-400">{new Date(s.submittedAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="py-4 text-center">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-black">{s.totalScore}</span>
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleDeleteSubmission(s.id)}
                          className="p-2 text-slate-300 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Individual Question Breakdown */}
      <div className="space-y-8 pt-6">
        <h3 className="text-3xl font-black text-slate-950 tracking-tight">Question Analysis Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {questions.map((q, idx) => {
            const data: any[] = q.options.map((opt, i) => {
              const count = submissions.filter(s => 
                s.answers.find(a => a.questionId === q.id)?.optionIds.includes(opt.id)
              ).length;
              return { name: `Opt ${i+1}`, fullText: opt.text, value: count };
            });

            return (
              <div key={q.id} className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col transition-all hover:border-slate-200">
                <div className="flex items-center gap-3 mb-8">
                   <div className="bg-slate-950 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                    Q{idx + 1}
                  </div>
                  <h4 className="text-lg font-black text-slate-900 line-clamp-2 leading-snug">{q.text}</h4>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 12, fontWeight: 900 }} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900 p-4 rounded-xl shadow-2xl border border-slate-800 text-white max-w-xs">
                                <p className="text-xs font-black text-blue-400 mb-1 uppercase tracking-widest">{payload[0].payload.name}</p>
                                <p className="text-sm font-medium leading-relaxed">{payload[0].payload.fullText}</p>
                                <p className="mt-2 text-xl font-black">Responses: {payload[0].value}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                        {data.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
