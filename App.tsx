
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Home } from 'lucide-react';
import QuizList from './components/QuizList';
import QuizEditor from './components/QuizEditor';
import QuizTaker from './components/QuizTaker';
import Dashboard from './components/Dashboard';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-slate-950 text-white min-h-screen p-4 flex flex-col fixed left-0 top-0 border-r border-slate-800">
      <div className="flex items-center gap-3 mb-10 px-2 py-4 border-b border-slate-800/50">
        <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
          <ClipboardList size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-white uppercase">LexMaturity</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        <Link 
          to="/" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive('/') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'}`}
        >
          <Home size={20} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="font-semibold text-sm">Assessments</span>
        </Link>
        <Link 
          to="/dashboard" 
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname.startsWith('/dashboard') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'}`}
        >
          <LayoutDashboard size={20} strokeWidth={location.pathname.startsWith('/dashboard') ? 2.5 : 2} />
          <span className="font-semibold text-sm">Analytics</span>
        </Link>
      </nav>

      <div className="mt-auto p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
        <p className="font-bold text-blue-400 text-[10px] uppercase tracking-widest mb-2">LexMaturity Pro</p>
        <p className="text-xs text-slate-300 font-medium leading-relaxed">Legal Tech Consulting & AI Assessment Suite</p>
      </div>
    </aside>
  );
};

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex text-slate-900">
        <Sidebar />
        <main className="flex-1 ml-64 p-10">
          <Routes>
            <Route path="/" element={<QuizList />} />
            <Route path="/edit/:id" element={<QuizEditor />} />
            <Route path="/quiz/:id" element={<QuizTaker />} />
            <Route path="/dashboard/:id" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
