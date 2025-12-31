
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Send, CheckCircle2 } from 'lucide-react';
import { db } from '../services/db';
import { Quiz, Question, Submission, Answer } from '../types';

const QuizTaker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  useEffect(() => {
    if (id) {
      const q = db.getQuizzes().find(item => item.id === id);
      if (q) {
        setQuiz(q);
        const qList = db.getQuestions(id);
        setQuestions(qList);
        setAnswers(qList.map(item => ({ questionId: item.id, optionIds: [] })));
        
        // Calculate theoretical max score
        const totalMax = qList.reduce((acc, question) => {
          if (question.type === 'single') {
            const maxOpt = Math.max(...question.options.map(o => o.score));
            return acc + maxOpt;
          } else {
            // For multi-select, max score is the sum of all positive scores
            const sumPositive = question.options.reduce((sum, o) => sum + Math.max(0, o.score), 0);
            return acc + sumPositive;
          }
        }, 0);
        setMaxScore(totalMax);
      }
    }
  }, [id]);

  const handleSelect = (optionId: string) => {
    const question = questions[currentIdx];
    const newAnswers = [...answers];
    const ansIdx = newAnswers.findIndex(a => a.questionId === question.id);

    if (question.type === 'single') {
      newAnswers[ansIdx].optionIds = [optionId];
    } else {
      const currentOpts = newAnswers[ansIdx].optionIds;
      if (currentOpts.includes(optionId)) {
        newAnswers[ansIdx].optionIds = currentOpts.filter(o => o !== optionId);
      } else {
        newAnswers[ansIdx].optionIds = [...currentOpts, optionId];
      }
    }
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (!quiz) return;

    let totalScore = 0;
    answers.forEach(ans => {
      const q = questions.find(item => item.id === ans.questionId);
      ans.optionIds.forEach(oid => {
        const opt = q?.options.find(o => o.id === oid);
        if (opt) totalScore += opt.score;
      });
    });

    const submission: Submission = {
      id: crypto.randomUUID(),
      quizId: quiz.id,
      totalScore,
      submittedAt: new Date().toISOString(),
      answers,
    };

    db.saveSubmission(submission);
    setFinalScore(totalScore);
    setIsSubmitted(true);
  };

  if (!quiz || questions.length === 0) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-pulse text-slate-400 font-black tracking-widest uppercase text-center">
        Establishing Secure Assessment Link...
      </div>
    </div>
  );

  const currentQuestion = questions[currentIdx];
  const currentAnswer = answers[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6 text-center">
        <div className="bg-white rounded-[3rem] p-16 shadow-2xl border-4 border-slate-50">
          <div className="w-28 h-28 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg shadow-emerald-100">
            <CheckCircle2 size={56} strokeWidth={2.5} />
          </div>
          <h2 className="text-5xl font-black text-slate-950 mb-6 tracking-tight">Assessment Submitted</h2>
          <p className="text-slate-600 text-xl font-medium mb-12 leading-relaxed">
            Thank you for completing the <span className="text-slate-950 font-bold underline decoration-blue-500">{quiz.title}</span>. Your data has been recorded for organizational review.
          </p>
          <div className="bg-slate-950 rounded-[2rem] p-10 shadow-2xl shadow-blue-900/10">
            <p className="text-xs uppercase tracking-[0.3em] text-blue-400 font-black mb-4">Your Maturity Score</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-7xl font-black text-white">{finalScore}</span>
              <span className="text-2xl font-bold text-slate-500">/ {maxScore}</span>
            </div>
          </div>
          <p className="mt-12 text-slate-400 text-sm font-bold uppercase tracking-widest">
            You may now close this window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <div className="mb-16">
        <h1 className="text-3xl font-black text-slate-950 mb-4 tracking-tight leading-tight">{quiz.title}</h1>
        <div className="flex items-center gap-6 text-slate-900 text-sm font-black uppercase tracking-widest">
          <span className="shrink-0">Question {currentIdx + 1} / {questions.length}</span>
          <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden border border-slate-300/50 p-0.5">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out shadow-inner" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border-2 border-slate-50 mb-10 min-h-[500px] flex flex-col transition-all duration-300">
        <h2 className="text-3xl font-black text-slate-950 mb-14 leading-[1.3] tracking-tight">
          {currentQuestion.text}
        </h2>

        <div className="space-y-4 flex-1">
          {currentQuestion.options.map((opt, i) => {
            const isSelected = currentAnswer?.optionIds.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left p-8 rounded-[2rem] border-2 transition-all duration-200 flex items-center gap-6 group relative ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-200' 
                    : 'border-slate-100 bg-slate-50 hover:border-slate-400 text-slate-900'
                }`}
              >
                <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? 'border-white bg-white shadow-md' : 'border-slate-200 bg-white group-hover:border-slate-400'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                </div>
                <span className={`text-xl font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {opt.text}
                </span>
                {!isSelected && (
                  <span className="ml-auto text-slate-300 font-black text-2xl group-hover:text-slate-400 transition-colors">0{i+1}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-16 flex justify-between items-center pt-10 border-t-2 border-slate-50">
          <button
            onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-3 text-slate-900 hover:text-blue-600 disabled:opacity-0 transition-all font-black uppercase tracking-widest text-sm"
          >
            <ChevronLeft size={24} strokeWidth={3} />
            Previous
          </button>
          
          {currentIdx === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={currentAnswer?.optionIds.length === 0}
              className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-emerald-200 transition-all disabled:opacity-50"
            >
              Finalize Survey
              <Send size={20} strokeWidth={3} />
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(prev => prev + 1)}
              disabled={currentAnswer?.optionIds.length === 0}
              className="flex items-center gap-3 bg-slate-950 hover:bg-slate-800 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-slate-300 transition-all disabled:opacity-50"
            >
              Next Step
              <ChevronRight size={24} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
      
      <p className="text-center text-slate-950 text-xs font-black uppercase tracking-[0.4em] opacity-30">
        LexMaturity Consulting Group · Secure Digital Assessment
      </p>
    </div>
  );
};

export default QuizTaker;
