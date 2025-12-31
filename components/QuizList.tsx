
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Copy, Edit, Play, BarChart2, Calendar, ClipboardList, Share2, Check, ExternalLink } from 'lucide-react';
import { db } from '../services/db';
import { Quiz } from '../types';

const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuizzes(db.getQuizzes());
  }, []);

  const handleCreate = () => {
    const id = crypto.randomUUID();
    const newQuiz: Quiz = {
      id,
      title: 'New Legal Tech Assessment',
      description: 'Define the scope and objectives of this IT maturity review.',
      createdAt: new Date().toISOString()
    };
    db.saveQuiz(newQuiz);
    setQuizzes(db.getQuizzes());
    navigate(`/edit/${id}`);
  };

  const handleClone = (id: string) => {
    const cloned = db.cloneQuiz(id);
    if (cloned) setQuizzes(db.getQuizzes());
  };

  const handleCopyLink = (id: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const fullUrl = `${baseUrl}#/quiz/${id}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-4xl font-black text-slate-950 tracking-tight">Assessments</h2>
          <p className="text-slate-600 mt-2 font-medium text-lg">Benchmark IT maturity and AI readiness across the firm.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-xl shadow-blue-200 font-bold"
        >
          <Plus size={20} strokeWidth={3} />
          New Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex flex-col group">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
                <Calendar size={14} strokeWidth={2.5} />
                <span>{new Date(quiz.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-950 mb-3 group-hover:text-blue-700 transition-colors leading-tight">{quiz.title}</h3>
              <p className="text-slate-600 font-medium leading-relaxed line-clamp-3 mb-8">
                {quiz.description}
              </p>
            </div>

            <div className="space-y-3 mt-6">
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to={`/quiz/${quiz.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md"
                >
                  <ExternalLink size={16} strokeWidth={2.5} />
                  Take Survey
                </Link>
                <button 
                  onClick={() => handleCopyLink(quiz.id)}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all border-2 ${
                    copiedId === quiz.id 
                      ? 'bg-emerald-600 border-emerald-600 text-white' 
                      : 'bg-white border-slate-200 text-slate-900 hover:border-blue-600 hover:text-blue-600 shadow-sm'
                  }`}
                >
                  {copiedId === quiz.id ? <Check size={16} strokeWidth={3} /> : <Share2 size={16} strokeWidth={2.5} />}
                  {copiedId === quiz.id ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to={`/dashboard/${quiz.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-blue-800 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                >
                  <BarChart2 size={16} strokeWidth={2.5} />
                  Analytics
                </Link>
                <div className="flex gap-2">
                   <Link 
                    to={`/edit/${quiz.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-800 hover:text-white rounded-xl transition-all"
                    title="Manage Assessment"
                  >
                    <Edit size={16} strokeWidth={2.5} />
                  </Link>
                  <button 
                    onClick={() => handleClone(quiz.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-800 hover:text-white rounded-xl transition-all"
                    title="Duplicate Assessment"
                  >
                    <Copy size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {quizzes.length === 0 && (
          <div className="col-span-full py-24 bg-white border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <ClipboardList size={64} className="opacity-10 text-slate-900" />
            </div>
            <p className="text-xl font-bold text-slate-800">No Assessments Found</p>
            <p className="text-slate-500 mt-2">Initialize your first consulting quiz to begin.</p>
            <button 
              onClick={handleCreate}
              className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg"
            >
              Get Started Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;
