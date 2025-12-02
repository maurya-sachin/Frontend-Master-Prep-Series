import { TrendingUp, Target, Award, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStudyProgress } from '../utils/storage';
import type { StudyProgress } from '../types';

export default function StatsPage() {
  const [progress, setProgress] = useState<StudyProgress>({
    lastStudied: '',
    totalCards: 0,
    masteredCards: 0,
    streak: 0,
  });

  useEffect(() => {
    setProgress(getStudyProgress());
  }, []);

  const masteryPercent = progress.totalCards > 0
    ? Math.round((progress.masteredCards / progress.totalCards) * 100)
    : 0;

  const stats = [
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${progress.streak} days`,
      color: 'from-orange-500 to-red-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
    },
    {
      icon: Target,
      label: 'Cards Studied',
      value: progress.totalCards.toString(),
      color: 'from-primary-500 to-blue-500',
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/30',
    },
    {
      icon: Award,
      label: 'Mastered',
      value: progress.masteredCards.toString(),
      color: 'from-green-500 to-emerald-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
    },
    {
      icon: TrendingUp,
      label: 'Mastery',
      value: `${masteryPercent}%`,
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
    },
  ];

  const topicsProgress = [
    { name: 'JavaScript', icon: '📜', studied: 45, total: 53, percent: 85 },
    { name: 'React', icon: '⚛️', studied: 58, total: 71, percent: 82 },
    { name: 'TypeScript', icon: '📘', studied: 16, total: 22, percent: 73 },
    { name: 'Next.js', icon: '▲', studied: 10, total: 16, percent: 63 },
    { name: 'HTML & CSS', icon: '🎨', studied: 11, total: 19, percent: 58 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="card text-center py-8">
        <TrendingUp className="text-primary-400 mx-auto mb-4" size={48} />
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Your Progress</h2>
        <p className="text-slate-400">
          {progress.lastStudied
            ? `Last studied on ${new Date(progress.lastStudied).toLocaleDateString()}`
            : 'Start studying to track your progress'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`card ${stat.bg} border ${stat.border}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className="text-white" size={20} />
                </div>
                <span className="text-sm font-medium text-slate-300">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold text-slate-100">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Topics Progress */}
      <div className="card">
        <h3 className="text-xl font-bold text-slate-100 mb-6">Progress by Topic</h3>
        <div className="space-y-4">
          {topicsProgress.map((topic, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{topic.icon}</span>
                  <span className="font-medium text-slate-100">{topic.name}</span>
                </div>
                <div className="text-sm text-slate-400">
                  {topic.studied}/{topic.total}
                </div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${topic.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="card">
        <h3 className="text-xl font-bold text-slate-100 mb-6">Weekly Activity</h3>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-slate-500 mb-2">{day}</div>
              <div
                className={`h-12 rounded-lg ${
                  index < 4
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-slate-700/30 border border-slate-600/30'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h3 className="text-xl font-bold text-slate-100 mb-6">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: '🔥', label: 'First Streak', unlocked: true },
            { emoji: '📚', label: '50 Cards', unlocked: true },
            { emoji: '🎯', label: '100 Cards', unlocked: false },
            { emoji: '🏆', label: '7 Day Streak', unlocked: false },
          ].map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border text-center ${
                achievement.unlocked
                  ? 'bg-primary-500/10 border-primary-500/30'
                  : 'bg-slate-700/30 border-slate-600/30 opacity-50'
              }`}
            >
              <div className="text-4xl mb-2">{achievement.emoji}</div>
              <div className="text-sm text-slate-300">{achievement.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
