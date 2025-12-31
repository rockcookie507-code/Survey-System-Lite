
import { Quiz, Question, Submission, Answer } from '../types';

const STORAGE_KEYS = {
  QUIZZES: 'law_firm_quizzes',
  QUESTIONS: 'law_firm_questions',
  SUBMISSIONS: 'law_firm_submissions',
};

// Initial data for demonstration
const INITIAL_QUIZZES: Quiz[] = [
  {
    id: '1',
    title: 'AI Maturity Assessment 2024',
    description: 'Evaluate your firm\'s readiness for artificial intelligence implementation.',
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    quizId: '1',
    text: 'How does your firm currently manage case documents?',
    type: 'single',
    position: 1,
    options: [
      { id: 'o1', text: 'Paper only', score: 0 },
      { id: 'o2', text: 'Local server files', score: 1 },
      { id: 'o3', text: 'Cloud-based document management', score: 3 },
      { id: 'o4', text: 'AI-assisted tagging and indexing', score: 5 },
    ]
  },
  {
    id: 'q2',
    quizId: '1',
    text: 'Do you use generative AI for legal research?',
    type: 'single',
    position: 2,
    options: [
      { id: 'o5', text: 'No, banned by policy', score: 0 },
      { id: 'o6', text: 'Informally/Individuals only', score: 2 },
      { id: 'o7', text: 'Yes, with standard tools', score: 4 },
      { id: 'o8', text: 'Yes, with firm-approved secure models', score: 5 },
    ]
  }
];

export const db = {
  getQuizzes: (): Quiz[] => {
    const data = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(INITIAL_QUIZZES));
      return INITIAL_QUIZZES;
    }
    return JSON.parse(data);
  },

  saveQuiz: (quiz: Quiz) => {
    const quizzes = db.getQuizzes();
    const index = quizzes.findIndex(q => q.id === quiz.id);
    if (index >= 0) quizzes[index] = quiz;
    else quizzes.push(quiz);
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
  },

  getQuestions: (quizId: string): Question[] => {
    const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS.filter(q => q.quizId === quizId);
    }
    const allQuestions: Question[] = JSON.parse(data);
    return allQuestions.filter(q => q.quizId === quizId).sort((a, b) => a.position - b.position);
  },

  saveQuestions: (quizId: string, questions: Question[]) => {
    const data = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    let allQuestions: Question[] = data ? JSON.parse(data) : [];
    allQuestions = allQuestions.filter(q => q.quizId !== quizId).concat(questions);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(allQuestions));
  },

  getSubmissions: (quizId: string): Submission[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!data) return [];
    const all: Submission[] = JSON.parse(data);
    return all.filter(s => s.quizId === quizId).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  },

  saveSubmission: (submission: Submission) => {
    const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const all: Submission[] = data ? JSON.parse(data) : [];
    all.push(submission);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(all));
  },

  deleteSubmission: (submissionId: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!data) return;
    const all: Submission[] = JSON.parse(data);
    const filtered = all.filter(s => s.id !== submissionId);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(filtered));
  },

  cloneQuiz: (quizId: string) => {
    const quizzes = db.getQuizzes();
    const source = quizzes.find(q => q.id === quizId);
    if (!source) return;

    const newQuiz: Quiz = {
      ...source,
      id: crypto.randomUUID(),
      title: `${source.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };

    const sourceQuestions = db.getQuestions(quizId);
    const newQuestions = sourceQuestions.map(q => ({
      ...q,
      id: crypto.randomUUID(),
      quizId: newQuiz.id,
      options: q.options.map(o => ({ ...o, id: crypto.randomUUID() }))
    }));

    db.saveQuiz(newQuiz);
    db.saveQuestions(newQuiz.id, newQuestions);
    return newQuiz;
  }
};
