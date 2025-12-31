
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, CheckCircle } from 'lucide-react';
import { db } from '../services/db';
import { Quiz, Question, Option } from '../types';

const QuizEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      const q = db.getQuizzes().find(item => item.id === id);
      if (q) {
        setQuiz(q);
        setQuestions(db.getQuestions(id));
      }
    }
  }, [id]);

  const handleSave = () => {
    if (quiz) {
      db.saveQuiz(quiz);
      db.saveQuestions(quiz.id, questions);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      quizId: quiz?.id || '',
      text: 'New Strategic Question',
      type: 'single',
      position: questions.length + 1,
      options: [
        { id: crypto.randomUUID(), text: 'Baseline Practice', score: 1 },
        { id: crypto.randomUUID(), text: 'Optimized Workflow', score: 5 }
      ]
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (qId: string) => {
    setQuestions(questions.filter(q => q.id !== qId));
  };

  const updateQuestion = (qId: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, ...updates } : q));
  };

  const addOption = (qId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: [...q.options, { id: crypto.randomUUID(), text: 'New Response Tier', score: 0 }]
        };
      }
      return q;
    }));
  };

  const updateOption = (qId: string, oId: string, updates: Partial<Option>) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: q.options.map(o => o.id === oId ? { ...o, ...updates } : o)
        };
      }
      return q;
    }));
  };

  const removeOption = (qId: string, oId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return {
          ...q,
          options: q.options.filter(o => o.id !== oId)
        };
      }
      return q;
    }));
  };

  if (!quiz) return <div className="p-20 text-center font-bold text-slate-400">Loading editor environment...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-12 sticky top-0 bg-slate-50/95 backdrop-blur-xl py-6 z-10 border-b border-slate-200">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/')} 
            className="p-3 bg-white border border-slate-200 hover:shadow-md rounded-2xl transition-all text-slate-900 group"
          >
            <ArrowLeft size={24} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-950 tracking-tight leading-none">Quiz Architect</h2>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-1">Design Maturity Metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isSaved && (
            <span className="text-emerald-700 text-sm flex items-center gap-2 font-black bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
              <CheckCircle size={18} strokeWidth={3} /> UPDATED
            </span>
          )}
          <button 
            onClick={handleSave}
            className="bg-slate-950 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl font-black transition-all"
          >
            <Save size={20} strokeWidth={2.5} />
            Commit Changes
          </button>
        </div>
      </div>

      {/* Quiz Info Section */}
      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-12 mb-12 shadow-sm space-y-8">
        <div>
          <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 block">Assessment Title</label>
          <input 
            type="text"
            className="w-full text-4xl font-black outline-none border-b-2 border-slate-200 focus:border-blue-600 focus:bg-slate-50/50 pb-4 transition-all text-slate-950 bg-white px-4 rounded-xl"
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            placeholder="AI Maturity Assessment 2024"
          />
        </div>
        <div>
          <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 block">Executive Description</label>
          <textarea 
            className="w-full text-slate-900 font-bold text-lg outline-none border-b-2 border-slate-200 focus:border-blue-500 focus:bg-slate-50/50 p-4 resize-none leading-relaxed bg-white rounded-xl shadow-inner"
            value={quiz.description}
            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
            placeholder="Outline the scope and instructions for participants..."
            rows={3}
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-10">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-12 shadow-sm group hover:border-blue-100 transition-all">
            <div className="flex items-start justify-between gap-6 mb-10">
              <div className="flex items-center gap-5 flex-1">
                <span className="bg-slate-950 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-slate-200">
                  {idx + 1}
                </span>
                <input 
                  type="text"
                  className="w-full font-black text-2xl border-b-2 border-slate-100 focus:border-blue-600 focus:bg-slate-50/50 outline-none p-4 rounded-xl transition-all text-slate-950 bg-white"
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                  placeholder="Enter assessment question..."
                />
              </div>
              <button 
                onClick={() => removeQuestion(q.id)}
                className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Remove Question"
              >
                <Trash2 size={24} />
              </button>
            </div>

            <div className="mb-10 flex items-center gap-6">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Response Configuration:</span>
              <div className="relative">
                <select 
                  value={q.type}
                  onChange={(e) => updateQuestion(q.id, { type: e.target.value as any })}
                  className="bg-slate-50 border-2 border-slate-200 rounded-xl px-5 py-2.5 text-sm font-black text-slate-950 outline-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-200 transition-all cursor-pointer appearance-none pr-10"
                >
                  <option value="single">EXCLUSIVE CHOICE (RADIO)</option>
                  <option value="multi">MULTI-SELECT (CHECKBOX)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <Plus size={14} className="rotate-45" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 block px-1">Response Options & Scoring Weights</label>
              {q.options.map((opt, oIdx) => (
                <div key={opt.id} className="flex items-center gap-5 group/opt">
                  <div className="w-10 h-10 border-2 border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-950 font-black bg-slate-50 uppercase tracking-tighter shadow-sm">
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                  <input 
                    type="text"
                    className="flex-1 bg-white border-2 border-slate-200 focus:border-blue-300 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all font-bold text-slate-950 shadow-sm placeholder:text-slate-300"
                    value={opt.text}
                    onChange={(e) => updateOption(q.id, opt.id, { text: e.target.value })}
                    placeholder="Describe the response tier..."
                  />
                  <div className="flex flex-col items-center">
                    <input 
                      type="number"
                      className="w-20 bg-white border-2 border-slate-200 focus:border-blue-300 focus:bg-white rounded-2xl px-3 py-4 outline-none text-center font-black text-blue-700 shadow-sm"
                      value={opt.score}
                      onChange={(e) => updateOption(q.id, opt.id, { score: parseInt(e.target.value) || 0 })}
                    />
                    <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-[0.2em]">Weight</span>
                  </div>
                  <button 
                    onClick={() => removeOption(q.id, opt.id)}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover/opt:opacity-100 transition-all"
                    title="Remove Option"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => addOption(q.id)}
                className="flex items-center gap-3 text-sm text-blue-700 hover:text-blue-900 font-black pt-4 pl-14 transition-all uppercase tracking-widest group"
              >
                <div className="p-1.5 bg-blue-50 group-hover:bg-blue-100 rounded-lg">
                  <Plus size={18} strokeWidth={3} />
                </div>
                Append Response Tier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Question Button */}
      <div className="mt-16 flex justify-center">
        <button 
          onClick={addQuestion}
          className="flex items-center gap-4 bg-white border-4 border-slate-950 text-slate-950 hover:bg-slate-950 hover:text-white px-12 py-6 rounded-3xl font-black transition-all shadow-2xl hover:shadow-slate-300 uppercase tracking-[0.2em] group"
        >
          <Plus size={24} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
          Add Assessment Category
        </button>
      </div>
    </div>
  );
};

export default QuizEditor;
