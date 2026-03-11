'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getExperimentsForAI } from '@/lib/experimentStore';
import { authFetch } from '@/lib/auth';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  references?: string[];
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || loading) return;

    const question = input.trim();
    setInput('');

    const userMsg: Message = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Gather local experiments for context
      const experiments = await getExperimentsForAI(String(user.id));

      const res = await authFetch(`${API_URL}/api/ai/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, experiments }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Your session has expired or is invalid. Please sign out and log back in.');
        }
        let errDetail = 'AI query failed';
        try {
          const err = await res.json();
          errDetail = err.detail || errDetail;
        } catch (_) {}
        throw new Error(errDetail);
      }

      const data = await res.json();

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.answer,
        references: data.referenced_experiments,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg: Message = {
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to get response'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const exampleQuestions = [
    "How many experiments did we do on bilayer nickelate in 2025?",
    "Summarize all Raman experiments on trilayer nickelate.",
    "Show experiments where pressure was above 10 GPa.",
    "What samples have we measured most frequently?",
    "Compare the conclusions of our last 5 experiments.",
  ];

  return (
    <div className="max-w-4xl mx-auto pb-4 flex flex-col" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-border-custom">
        <h2 className="text-3xl font-bold text-text-primary tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          AI Experiment Assistant
        </h2>
        <p className="mt-2 text-base text-text-secondary">Ask questions about your locally stored experiments. Your data stays on your device.</p>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Coming Soon</h3>
            <p className="text-sm text-text-secondary mb-8 max-w-sm mx-auto">
              Our natural language interface for automatically analyzing your experimental logs is currently under active development.
            </p>
            <div className="max-w-xl mx-auto">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-4">Example Questions you can ask</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {exampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="text-left bg-white border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-600 text-[13px] py-2 px-4 rounded-xl transition-all shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.role === 'user'
                ? 'bg-accent text-white shadow-md shadow-accent/20'
                : 'bg-white border border-border-custom shadow-sm'
            }`}>
              <p className={`text-sm whitespace-pre-wrap ${msg.role === 'assistant' ? 'text-text-primary' : ''}`}>
                {msg.content}
              </p>
              {msg.references && msg.references.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200/50">
                  <p className="text-xs text-text-secondary font-medium mb-1">Referenced experiments:</p>
                  <div className="flex flex-wrap gap-1">
                    {msg.references.map((ref, j) => (
                      <a key={j} href={`/experiment/${ref}`}
                        className="text-[11px] font-mono bg-accent/10 text-accent px-2 py-0.5 rounded border border-accent/20 hover:bg-accent/20 transition-colors">
                        {ref}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-text-secondary'}`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-card-bg border border-border-custom rounded-2xl px-5 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <svg className="animate-spin h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing your experiments...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleAsk} className="flex gap-3 bg-card-bg border border-border-custom rounded-2xl p-3 shadow-sm">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="AI Assistant is currently under development and will be available soon."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-text-primary placeholder:text-text-secondary focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 transition-colors text-sm cursor-not-allowed opacity-70"
          disabled={true}
        />
        <button
          type="submit"
          disabled={true}
          className="px-5 py-2.5 rounded-xl bg-slate-300 text-white font-semibold text-sm shadow-sm cursor-not-allowed transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
