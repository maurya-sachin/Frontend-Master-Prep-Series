import { useNavigate } from 'react-router-dom';
import { BookOpen, CreditCard, Code, TrendingUp, Target, Zap, Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStudyProgress } from '../utils/storage';
import type { StudyProgress } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<StudyProgress>({
    lastStudied: '',
    totalCards: 0,
    masteredCards: 0,
    streak: 0,
  });

  useEffect(() => {
    setProgress(getStudyProgress());
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: 'Browse Q&A',
      description: '420+ comprehensive interview questions across 17 topics',
      color: 'from-blue-500 to-cyan-500',
      path: '/browse',
      stats: '420+ Questions',
    },
    {
      icon: CreditCard,
      title: 'Flashcards',
      description: '526 interview-ready flashcards with spaced repetition',
      color: 'from-purple-500 to-pink-500',
      path: '/flashcards',
      stats: '526 Cards',
    },
    {
      icon: Code,
      title: 'Coding Challenges',
      description: '65+ problems covering algorithms, React, and system implementations',
      color: 'from-green-500 to-emerald-500',
      path: '/challenges',
      stats: '65+ Problems',
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Monitor your study sessions and maintain your streak',
      color: 'from-orange-500 to-red-500',
      path: '/stats',
      stats: `${progress.streak} Day Streak`,
    },
  ];

  const topics = [
    { name: 'JavaScript', icon: '📜', count: 53 },
    { name: 'TypeScript', icon: '📘', count: 22 },
    { name: 'React', icon: '⚛️', count: 71 },
    { name: 'Next.js', icon: '▲', count: 16 },
    { name: 'HTML & CSS', icon: '🎨', count: 19 },
    { name: 'Testing', icon: '🧪', count: 5 },
    { name: 'Performance', icon: '⚡', count: 6 },
    { name: 'Accessibility', icon: '♿', count: 17 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Frontend Master
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Complete interview preparation for senior frontend roles
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full">
            <Target className="text-primary-400" size={16} />
            <span className="text-primary-400 font-medium">$80K-150K Roles</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
            <Zap className="text-green-400" size={16} />
            <span className="text-green-400 font-medium">1000+ Resources</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
            <Award className="text-purple-400" size={16} />
            <span className="text-purple-400 font-medium">Interview Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Start Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <button
              key={index}
              onClick={() => navigate(feature.path)}
              className="card text-left group hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-slate-100">{feature.title}</h3>
                    <span className="text-xs px-2 py-1 bg-slate-700/50 rounded-full text-slate-300">
                      {feature.stats}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Topics Overview */}
      <div className="card">
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Topics Covered</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topics.map((topic, index) => (
            <div
              key={index}
              className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-primary-500/30 transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{topic.icon}</span>
                <span className="text-sm font-medium text-slate-300">{topic.name}</span>
              </div>
              <div className="text-2xl font-bold text-primary-400">{topic.count}</div>
              <div className="text-xs text-slate-500">Files</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/flashcards')}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <CreditCard size={20} />
          Start Studying
        </button>
        <button
          onClick={() => navigate('/browse')}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <BookOpen size={20} />
          Browse Q&A
        </button>
        <button
          onClick={() => navigate('/challenges')}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <Code size={20} />
          Practice Coding
        </button>
      </div>
    </div>
  );
}
