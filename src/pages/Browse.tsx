import { useEffect, useState, useRef } from 'react';
import { Search, Loader, AlertCircle, ChevronRight } from 'lucide-react';
import { loadManifest, loadMarkdownFile } from '../utils/manifest';
import { parseMarkdown, highlightCodeBlocks } from '../utils/markdown';
import type { Manifest } from '../types';

export default function BrowsePage() {
  const [manifest, setManifest] = useState<Manifest>({});
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadManifest().then(setManifest);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      highlightCodeBlocks(contentRef.current);
    }
  }, [content]);

  const loadTopic = async (topicKey: string) => {
    setSelectedTopic(topicKey);
    setLoading(true);
    setError(null);

    try {
      const topic = manifest[topicKey];
      const filePromises = topic.files.map((file) =>
        loadMarkdownFile(`/${topic.folder}/${file}`)
      );

      const files = await Promise.all(filePromises);
      const combinedContent = files.join('\n\n---\n\n');
      const htmlContent = parseMarkdown(combinedContent);
      setContent(htmlContent);
    } catch (err) {
      setError('Failed to load content. Please try again.');
      console.error('Error loading topic:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTopics = Object.entries(manifest).filter(([_, topic]) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100 mb-4">Topics</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredTopics.map(([topicKey, topic]) => (
                <button
                  key={topicKey}
                  onClick={() => loadTopic(topicKey)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    selectedTopic === topicKey
                      ? 'bg-primary-500/20 border border-primary-500/30 text-primary-400'
                      : 'bg-slate-700/30 border border-slate-600/30 text-slate-300 hover:border-primary-500/30 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-2xl">{topic.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{topic.name}</div>
                      <div className="text-xs text-slate-500">{topic.count} files</div>
                    </div>
                  </div>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {!selectedTopic && (
            <div className="card text-center py-16">
              <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-primary-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">Select a Topic</h3>
              <p className="text-slate-400">
                Choose a topic from the sidebar to browse questions and answers
              </p>
            </div>
          )}

          {loading && (
            <div className="card text-center py-16">
              <Loader className="animate-spin text-primary-400 mx-auto mb-4" size={48} />
              <p className="text-slate-300">Loading content...</p>
            </div>
          )}

          {error && (
            <div className="card text-center py-16">
              <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && content && (
            <div className="space-y-6">
              {selectedTopic && (
                <div className="card">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{manifest[selectedTopic]?.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100">
                        {manifest[selectedTopic]?.name}
                      </h2>
                      <p className="text-slate-400 text-sm">
                        {manifest[selectedTopic]?.count} comprehensive questions
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="card">
                <div
                  ref={contentRef}
                  className="markdown prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
