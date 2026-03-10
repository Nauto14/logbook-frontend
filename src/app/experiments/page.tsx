'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getExperiments } from '@/lib/experimentStore';
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
    <div className="max-w-7xl mx-auto pb-12">
      <div className="md:flex md:items-center md:justify-between mb-8 pb-4 border-b border-border-custom">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-bold leading-7 text-text-primary sm:truncate sm:tracking-tight">
            Laboratory Dashboard
          </h2>
          <p className="mt-2 text-base text-text-secondary">
            Your experiment sessions — stored locally on this device.
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0 gap-3">
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
            className="inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-text-primary shadow-sm border border-border-custom hover:bg-slate-50 transition-colors"
          >
            <svg className="-ml-0.5 mr-1.5 h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export
          </button>

          <label className="inline-flex items-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-text-primary shadow-sm border border-border-custom hover:bg-slate-50 transition-colors cursor-pointer">
            <svg className="-ml-0.5 mr-1.5 h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Import
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={async (e) => {
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
              }} 
            />
          </label>

          <Link href="/new" className="ml-3 inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:focus-visible:outline hover:focus-visible:outline-2 hover:focus-visible:outline-offset-2 hover:focus-visible:outline-accent transition-colors">
            <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Session
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24">
           <svg className="animate-spin mx-auto h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           <p className="mt-4 text-text-secondary">Loading sessions...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50/50 p-6 border border-red-200">
           <h3 className="text-base font-semibold text-red-800">Error</h3>
           <div className="mt-2 text-sm text-red-700">
             <p>{error}</p>
           </div>
        </div>
      ) : experiments.length === 0 ? (
        <div className="text-center rounded-2xl border-2 border-dashed border-border-custom bg-card-bg/50 py-20 px-6">
           <svg className="mx-auto h-12 w-12 text-text-secondary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
           </svg>
           <h3 className="mt-5 text-base font-semibold text-text-primary">No sessions logged</h3>
           <p className="mt-2 text-sm text-text-secondary">Get started by creating a new experiment session.</p>
           <div className="mt-8">
             <Link href="/new" className="inline-flex items-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-accent/90 transition-colors">
               <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
               </svg>
               New Session
             </Link>
           </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
           {experiments.map((exp) => (
              <div key={exp.experiment_id} className="relative group overflow-hidden rounded-2xl border border-border-custom bg-white shadow-sm hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="px-6 py-6 flex-1">
                   <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex items-center rounded-md bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent border border-accent/20">
                        {exp.experiment_id}
                      </span>
                      <span className="text-[11px] font-bold tracking-wider text-text-muted uppercase flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        {exp.date}
                      </span>
                   </div>
                   
                   <h3 className="text-xl font-extrabold tracking-tight text-text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
                     {exp.title || 'Untitled Session'}
                   </h3>
                   <p className="text-sm text-text-secondary mb-5 line-clamp-2 leading-relaxed">{exp.objective_short}</p>
                   
                   <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm bg-app-bg p-4 rounded-xl border border-border-custom shadow-inner">
                     <div>
                       <dt className="text-text-muted font-bold tracking-wider text-[9px] uppercase">Technique</dt>
                       <dd className="text-text-primary font-semibold mt-0.5 truncate">{exp.technique}</dd>
                     </div>
                     <div>
                       <dt className="text-text-muted font-bold tracking-wider text-[9px] uppercase">Sample</dt>
                       <dd className="text-text-primary font-semibold mt-0.5 truncate">{exp.sample?.sample_name || 'N/A'}</dd>
                     </div>
                     <div className="col-span-2">
                       <dt className="text-text-muted font-bold tracking-wider text-[9px] uppercase">Categories / Tags</dt>
                       <dd className="mt-1.5 flex gap-1.5 flex-wrap">
                         {exp.tags ? (
                           exp.tags.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, i) => (
                             <span key={i} className="inline-flex items-center rounded-full bg-secondary-accent/10 px-2 py-0.5 text-xs font-semibold text-secondary-accent border border-secondary-accent/20">
                               {tag}
                             </span>
                           ))
                         ) : (
                           <span className="text-text-muted text-xs italic">Uncategorized</span>
                         )}
                       </dd>
                     </div>
                   </dl>
                </div>
                <div className="bg-white border-t border-border-custom px-6 py-4 flex items-center justify-between mt-auto">
                   <div className="text-xs text-text-muted font-bold tracking-wider uppercase flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      {exp.researcher}
                   </div>
                   <Link href={`/experiment/${exp.experiment_id}`} className="text-sm font-bold text-accent hover:text-secondary-accent flex items-center group-hover:underline">
                      View Log 
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                   </Link>
                </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
}
