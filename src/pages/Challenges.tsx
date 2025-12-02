import { Code, ExternalLink } from 'lucide-react';

export default function ChallengesPage() {
  const categories = [
    {
      name: 'JavaScript Fundamentals',
      icon: '📜',
      count: 30,
      description: 'Core JS problems covering closures, promises, and prototypes',
    },
    {
      name: 'React Problems',
      icon: '⚛️',
      count: 25,
      description: 'Custom hooks, state management, and component patterns',
    },
    {
      name: 'Algorithms',
      icon: '🧮',
      count: 30,
      description: 'Data structures, sorting, searching, and optimization',
    },
    {
      name: 'UI Components',
      icon: '🎨',
      count: 25,
      description: 'Build autocomplete, modals, carousels, and more',
    },
    {
      name: 'System Implementations',
      icon: '🏗️',
      count: 20,
      description: 'Design and implement complex frontend systems',
    },
    {
      name: 'Performance',
      icon: '⚡',
      count: 5,
      description: 'Lazy loading, memoization, web workers, and optimization',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="card text-center py-8">
        <Code className="text-primary-400 mx-auto mb-4" size={48} />
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Coding Challenges</h2>
        <p className="text-slate-400 mb-4">
          Practice with 65+ real interview problems
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400">
            ✅ Solutions Included
          </div>
          <div className="px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400">
            📝 Step-by-Step Explanations
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category, index) => (
          <div key={index} className="card group hover:scale-105 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="text-5xl group-hover:scale-110 transition-transform">
                {category.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-100">{category.name}</h3>
                  <span className="text-xs px-2 py-1 bg-slate-700/50 rounded-full text-slate-300">
                    {category.count} problems
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-4">{category.description}</p>
                <button className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Browse Problems
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-gradient-to-r from-primary-500/10 to-purple-500/10 border-primary-500/30">
        <div className="flex items-center gap-4">
          <div className="text-4xl">💡</div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-100 mb-1">Pro Tip</h3>
            <p className="text-sm text-slate-300">
              Start with fundamentals, then move to system implementations. Each problem includes
              multiple approaches with time/space complexity analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
