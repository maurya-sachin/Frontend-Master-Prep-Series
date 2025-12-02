import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Home,
  BookOpen,
  CreditCard,
  Code,
  BarChart3,
  Menu,
  X,
  Github,
  Moon,
  Sun,
} from 'lucide-react';
import HomePage from './pages/Home';
import BrowsePage from './pages/Browse';
import FlashcardsPage from './pages/Flashcards';
import ChallengesPage from './pages/Challenges';
import StatsPage from './pages/Stats';
import { getTheme, saveTheme } from './utils/storage';

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedTheme = getTheme();
    setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/browse', label: 'Browse Q&A', icon: BookOpen },
    { path: '/flashcards', label: 'Flashcards', icon: CreditCard },
    { path: '/challenges', label: 'Challenges', icon: Code },
    { path: '/stats', label: 'Statistics', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-slate-900/50 backdrop-blur-sm border-r border-slate-700/50 flex flex-col overflow-hidden`}
      >
        <div className="p-6 border-b border-slate-700/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Frontend Master
          </h1>
          <p className="text-sm text-slate-400 mt-1">Interview Prep</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-primary-400'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-all duration-200"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">Toggle Theme</span>
          </button>

          <a
            href="https://github.com/your-username/frontend-master-prep"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800/50 transition-all duration-200"
          >
            <Github size={20} />
            <span className="font-medium">GitHub</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 flex items-center px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-100">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Home'}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="px-3 py-1 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400">
              420+ Q&A
            </span>
            <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400">
              526 Flashcards
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/challenges" element={<ChallengesPage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
