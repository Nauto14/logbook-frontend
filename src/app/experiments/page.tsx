'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getExperiments, deleteExperiment } from '@/lib/experimentStore';
import type { ExperimentRecord } from '@/lib/db';

export default function Dashboard() {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchExperiments() {
      if (!user) return;
      try {
        const data = await getExperiments(String(user.id));
        setExperiments(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load experiments');
      } finally {
        setLoading(false);
      }
    }
    fetchExperiments();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto pb-20 relative px-4 sm:px-6 lg:px-8">
      {/* Mesh Background for Dashboard */}
      <div className="absolute inset-x-0 -top-24 -bottom-24 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-blob"></div>
        <div className="absolute top-[40%] right-[-5%] w-[35%] h-[35%] bg-secondary-accent/5 blur-[100px] rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-[20%] w-[30%] h-[30%] bg-tertiary-accent/10 blur-[80px] rounded-full animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 pt-12">
        <div className="md:flex md:items-end md:justify-between mb-16 pb-12 border-b border-white/40">
          <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-left-4 duration-1000">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-accent/20">
              Research Management
            </span>
            <h2 className="text-5xl sm:text-7xl font-black leading-[0.9] text-[#1F2937] sm:truncate tracking-tight">
              Laboratory <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary-accent">Dashboard</span>
            </h2>
            <p className="mt-8 text-xl text-[#6B7280] font-medium max-w-xl">
              Physical data layer — <span className="text-accent underline decoration-accent/30 underline-offset-8">Encrypted & Stored Locally</span>
            </p>
          </div>
          
          <div className="mt-12 flex md:ml-4 md:mt-0 gap-4 items-center animate-in fade-in slide-in-from-right-4 duration-1000">
            <div className="flex bg-white/40 backdrop-blur-xl rounded-[1.5rem] p-1.5 border border-white shadow-xl">
              <button 
                onClick={async () => {
                  const { exportLogbook } = await import('@/lib/experimentStore');
                  const data = await exportLogbook();
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `physics_logbook_backup_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center px-6 py-3 text-xs font-black uppercase tracking-widest text-[#1F2937] hover:bg-white rounded-xl transition-all"
              >
                <svg className="mr-2 h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                Export
              </button>
              <label className="inline-flex items-center px-6 py-3 text-xs font-black uppercase tracking-widest text-[#1F2937] hover:bg-white rounded-xl transition-all cursor-pointer">
                <svg className="mr-2 h-4 w-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Import
                <input type="file" accept=".json" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    const json = event.target?.result as string;
                    try {
                      const { importLogbook } = await import('@/lib/experimentStore');
                      await importLogbook(json);
                      window.location.reload();
                    } catch (err) {
                      alert('Failed to import logbook: ' + (err instanceof Error ? err.message : 'Unknown error'));
                    }
                  };
                  reader.readAsText(file);
                }} />
              </label>
            </div>

            <Link href="/new" className="inline-flex items-center rounded-2xl bg-gradient-to-r from-accent to-secondary-accent px-8 py-4 text-sm font-black text-white shadow-[0_10px_30px_-5px_rgba(77,166,255,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(77,166,255,0.5)] transform hover:-translate-y-1 transition-all active:scale-95">
              <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              New Session
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-48 animate-in fade-in duration-500">
             <div className="relative w-20 h-20 mx-auto mb-8">
               <div className="absolute inset-0 border-[3px] border-accent/10 rounded-full"></div>
               <div className="absolute inset-0 border-[3px] border-accent rounded-full border-t-transparent animate-spin"></div>
             </div>
             <p className="text-[#6B7280] font-black uppercase tracking-[0.3em] text-[10px]">Accessing Data Layers...</p>
          </div>
        ) : error ? (
          <div className="rounded-[2.5rem] bg-red-50/50 p-10 border border-red-200 backdrop-blur-3xl animate-in fade-in zoom-in duration-500">
             <h3 className="text-2xl font-black text-red-800 tracking-tight">System Fault</h3>
             <p className="mt-4 text-red-700 font-medium text-lg">{error}</p>
          </div>
        ) : experiments.length === 0 ? (
          <div className="text-center rounded-[4rem] border border-white bg-white/40 backdrop-blur-3xl py-40 px-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 shadow-2xl">
             <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl border border-slate-50 transform rotate-3">
               <svg className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
               </svg>
             </div>
             <h3 className="text-4xl font-black text-[#1F2937] tracking-tight">Logbook is Empty</h3>
             <p className="mt-6 text-xl text-[#6B7280] font-medium max-sm:mx-auto leading-relaxed">Your physical data vault is initialized. Create your first session to begin.</p>
             <Link href="/new" className="mt-12 inline-flex items-center rounded-[1.5rem] bg-accent px-10 py-5 text-lg font-black text-white shadow-2xl shadow-accent/40 hover:bg-accent/90 transition-all transform hover:-translate-y-1 active:scale-95">
               Start Session Alpha
             </Link>
          </div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
             {experiments.map((exp, index) => (
                <div key={exp.experiment_id} 
                     className="group relative overflow-hidden rounded-[2.5rem] border border-white bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-15px_rgba(77,166,255,0.15)] hover:-translate-y-3 transition-all duration-700 flex flex-col animate-in fade-in slide-in-from-bottom-12 fill-mode-both"
                     style={{ animationDelay: `${index * 150}ms` }}>
                  
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-secondary-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  <div className="relative z-10 px-10 py-10 flex-1">
                     <div className="flex items-center justify-between mb-8">
                        <span className="inline-flex items-center rounded-xl bg-accent/10 px-4 py-2 text-[10px] font-black text-accent border border-accent/20 uppercase tracking-[0.2em]">
                          {exp.experiment_id}
                        </span>
                        <div className="flex items-center text-[10px] font-black tracking-[0.2em] text-[#9CA3AF] uppercase">
                          <svg className="w-3.5 h-3.5 mr-2 text-accent/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          {exp.date}
                        </div>
                     </div>
                     
                     <h3 className="text-3xl font-black tracking-tight text-[#1F2937] mb-4 group-hover:text-accent transition-colors line-clamp-2 leading-[1.1]">
                       {exp.title || 'Untitled Session'}
                     </h3>
                     <p className="text-[#6B7280] font-medium text-lg mb-10 line-clamp-2 leading-relaxed h-[3.5rem]">{exp.objective_short}</p>
                     
                     <div className="space-y-5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-black uppercase tracking-[0.15em] text-[#9CA3AF]">Technique</span>
                          <span className="font-black text-[#1F2937] bg-[#F3F4F6] px-3 py-1 rounded-lg uppercase tracking-wider">{exp.technique || 'General'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-black uppercase tracking-[0.15em] text-[#9CA3AF]">Material</span>
                          <span className="font-black text-[#1F2937] uppercase">{exp.sample?.sample_name || 'N/A'}</span>
                        </div>
                        <div className="pt-4">
                          <div className="flex gap-2 flex-wrap min-h-6">
                            {exp.tags ? (
                              exp.tags.split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 3).map((tag, i) => (
                                <span key={i} className="inline-flex items-center rounded-lg bg-secondary-accent/5 px-3 py-1.5 text-[10px] font-black text-secondary-accent border border-secondary-accent/10 uppercase tracking-widest">
                                  #{tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-[#9CA3AF] text-[10px] uppercase font-black tracking-[0.1em]">Draft Session</span>
                            )}
                          </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="relative z-10 bg-white/40 backdrop-blur-xl border-t border-white/50 px-10 py-6 flex items-center justify-between mt-auto group/footer">
                     <button 
                       onClick={async (e) => {
                         e.preventDefault();
                         if (confirm(`Confirm deletion of session ${exp.experiment_id}? Data will be purged from local storage.`)) {
                           await deleteExperiment(exp.experiment_id);
                           setExperiments(prev => prev.filter(e => e.experiment_id !== exp.experiment_id));
                         }
                       }}
                       className="text-[10px] text-red-400 font-black tracking-[0.2em] uppercase flex items-center hover:text-red-600 transition-colors"
                     >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Purge
                     </button>
                     <Link href={`/experiment/${exp.experiment_id}`} className="inline-flex items-center text-sm font-black text-accent hover:text-secondary-accent transition-all group/link">
                        Access Log
                        <svg className="w-5 h-5 ml-3 transform group-hover/link:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                     </Link>
                  </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
