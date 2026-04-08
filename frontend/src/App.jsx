import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link2, Copy, ExternalLink, History, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/links`);
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShortenedUrl(null);

    // Basic client-side validation
    if (!longUrl.startsWith('http')) {
      setError('Please enter a valid URL starting with http:// or https://');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/shorten`, { longUrl });
      const fullUrl = `${API_BASE_URL}/${response.data.shortCode}`;
      setShortenedUrl(fullUrl);
      setLongUrl('');
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-cyan-500/30 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border border-white/10 shadow-xl shadow-cyan-500/5">
            <Link2 className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Link Shrinker
          </h1>
          <p className="text-lg text-slate-400 max-w-lg mx-auto">
            Transform long URLs into sleek, trackable short links. 
            Simple. Secure. Fast.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl mb-12">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="url"
                required
                placeholder="Paste your long URL here..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-600 appearance-none"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-semibold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Shorten Now
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm px-4 py-3 bg-red-400/10 rounded-xl border border-red-400/20">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {shortenedUrl && (
            <div className="mt-8 p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-cyan-400 mb-1 font-medium">Link successfully shrunk:</p>
                <p className="text-xl font-mono truncate text-white">{shortenedUrl}</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => copyToClipboard(shortenedUrl, 'result')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                >
                  {copiedId === 'result' ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copiedId === 'result' ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={shortenedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <History className="w-5 h-5 text-slate-500" />
            <h2 className="text-xl font-semibold text-slate-300">Recent Links</h2>
          </div>

          <div className="grid gap-4">
            {history.length > 0 ? (
              history.map((item) => (
                <div 
                  key={item.shortCode}
                  className="group flex items-center justify-between p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl transition-all"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm text-slate-500 truncate mb-1">{item.originalUrl}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-mono text-cyan-400">{`${API_BASE_URL}/${item.shortCode}`}</span>
                      <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full border border-white/10 text-slate-400">
                        {item.clicks} clicks
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${API_BASE_URL}/${item.shortCode}`, item.shortCode)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    {copiedId === item.shortCode ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                <p className="text-slate-500">No links in your history.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center py-12 text-slate-600 text-sm border-t border-white/5 mt-20">
        &copy; {new Date().getFullYear()} Premium URL Shortener &middot; Firestore Powered
      </footer>
    </div>
  );
}

export default App;
