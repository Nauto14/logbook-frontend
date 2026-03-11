'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getExperiment, getFilesForExperiment, deleteFile as deleteFileRecord } from '@/lib/experimentStore';
import type { ExperimentRecord, FileRecord } from '@/lib/db';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

export default function ExperimentDetails() {
  const params = useParams();
  const id = params.id as string;
  const [experiment, setExperiment] = useState<ExperimentRecord | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [fileUrls, setFileUrls] = useState<Record<number, string>>({});
  const fileUrlsRef = useRef<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const exp = await getExperiment(id);
      if (!exp) throw new Error('Experiment not found');
      setExperiment(exp);

      if (exp.id) {
        const expFiles = await getFilesForExperiment(exp.id, undefined, exp.experiment_id);
        setFiles(expFiles);
        // Create blob URLs for display
        const urls: Record<number, string> = {};
        for (const f of expFiles) {
          if (f.id && f.blob) {
            urls[f.id] = URL.createObjectURL(f.blob);
          }
        }
        setFileUrls(urls);
        fileUrlsRef.current = urls;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load experiment');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) loadData();
    return () => {
      // Cleanup blob URLs using ref to avoid React warnings about dependencies
      Object.values(fileUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
    };
  }, [id, loadData]);

  const handleDeleteFile = async (fileId: number) => {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    try {
      await deleteFileRecord(fileId);
      // Revoke the blob URL
      if (fileUrls[fileId]) {
        URL.revokeObjectURL(fileUrls[fileId]);
      }
      // Update state
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setFileUrls(prev => {
        const next = { ...prev };
        delete next[fileId];
        return next;
      });
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  const getFilesByCategory = (category: string) => files.filter(f => f.category === category);

  if (loading) return (
    <div className="max-w-5xl mx-auto pb-12 text-center py-24">
      <svg className="animate-spin mx-auto h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p className="mt-4 text-slate-500">Loading session details...</p>
    </div>
  );

  if (error || !experiment) return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="rounded-md bg-red-50 p-4 border border-red-200">
        <h3 className="text-sm font-medium text-red-800">Error</h3>
        <div className="mt-2 text-sm text-red-700">{error || 'Experiment not found'}</div>
      </div>
      <div className="mt-4"><Link href="/" className="text-indigo-600 hover:text-indigo-800">&larr; Back to Dashboard</Link></div>
    </div>
  );

  const ImageGrid = ({ category, title }: { category: string; title: string }) => {
    const categoryFiles = getFilesByCategory(category);
    if (categoryFiles.length === 0) return null;
    return (
      <div className="mt-4 break-inside-avoid">
        <h4 className="text-sm font-semibold text-label mb-2 print:text-lg">{title}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 print:grid-cols-2 print:gap-6">
          {categoryFiles.map((f) => (
            <div key={f.id} className="relative group rounded-lg overflow-hidden border border-slate-200 print:border-slate-300 print:rounded-xl">
              {f.id && fileUrls[f.id] && (
                <Zoom>
                  <img src={fileUrls[f.id]} alt={f.fileName} className="w-full h-32 object-cover print:h-auto print:max-h-80" />
                </Zoom>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-start justify-end p-1.5 print:hidden pointer-events-none">
                <button
                  onClick={() => f.id && handleDeleteFile(f.id)}
                  className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-lg"
                  title="Delete image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="px-2 py-1 bg-slate-50 text-xs text-text-secondary truncate print:whitespace-normal print:bg-white print:text-sm">{f.fileName}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 print:max-w-none print:pb-0 relative px-4 sm:px-6 lg:px-8">
      {/* Mesh Background */}
      <div className="absolute inset-x-0 -top-24 -bottom-24 pointer-events-none z-0 overflow-hidden print:hidden">
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full animate-blob"></div>
        <div className="absolute bottom-[20%] left-[-5%] w-[35%] h-[35%] bg-secondary-accent/5 blur-[100px] rounded-full animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-border-custom/50 print:hidden pt-8">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <Link href="/" className="text-xs font-black uppercase tracking-widest text-accent hover:text-secondary-accent mb-4 inline-flex items-center transition-all group">
              <svg className="w-3.5 h-3.5 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              Dashboard
            </Link>
            <h2 className="text-4xl sm:text-5xl font-black leading-none text-[#1F2937] tracking-tight mt-2">
              {experiment.title || 'Untitled Session'}
            </h2>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                experiment.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                experiment.status === 'ongoing' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {experiment.status || 'Planned'}
              </span>
              {experiment.technique && (
                <span className="px-3 py-1 rounded-xl bg-accent/10 text-accent border border-accent/20 text-[10px] font-black uppercase tracking-widest">
                  {experiment.technique}
                </span>
              )}
              {experiment.tags && typeof experiment.tags === 'string' && experiment.tags.length > 0 && experiment.tags.split(',').map((tag, i) => (
                <span key={i} className="px-3 py-1 rounded-xl bg-secondary-accent/5 text-secondary-accent border border-secondary-accent/10 text-[10px] font-black uppercase tracking-widest">
                  #{tag.trim()}
                </span>
              ))}
            </div>
            
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-bold text-[#6B7280] uppercase tracking-wider">
               <div className="flex items-center">
                 <span className="text-[#9CA3AF] mr-2">ID:</span>
                 <span className="font-mono text-accent">{experiment.experiment_id}</span>
               </div>
               <div className="flex items-center">
                 <svg className="w-4 h-4 mr-2 text-accent/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                 {experiment.date} <span className="mx-2 text-slate-300">|</span> {experiment.start_time}
               </div>
               <div className="flex items-center">
                 <svg className="w-4 h-4 mr-2 text-accent/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                 {experiment.researcher}
               </div>
            </div>
          </div>
          <div className="flex gap-4 mt-8 md:mt-0 animate-in fade-in slide-in-from-right-4 duration-700">
            <Link href={`/experiment/${id}/edit`} className="inline-flex items-center px-6 py-3 text-sm font-black bg-white/70 backdrop-blur-xl border border-white text-[#1F2937] rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <svg className="w-4 h-4 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Modify
            </Link>
            <button onClick={() => window.print()} className="inline-flex items-center px-6 py-3 text-sm font-black bg-accent text-white rounded-2xl shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all hover:-translate-y-0.5">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
              Journal Print
            </button>
          </div>
        </div>
        
        {/* Print header */}
        <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
          <h1 className="text-3xl font-bold mb-2">{experiment.title || 'Untitled Session'}</h1>
          <p className="text-sm text-slate-600">ID: {experiment.experiment_id} | {experiment.date} {experiment.start_time} | {experiment.researcher}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:block">
          <div className="md:col-span-2 space-y-8">
            {/* Scientific Context */}
            <div className="bg-white/70 print:bg-transparent backdrop-blur-xl print:backdrop-blur-none shadow-sm print:shadow-none border border-white print:border-none rounded-[2.5rem] print:rounded-none p-10 print:p-0 print:mb-8 break-inside-avoid animate-in fade-in slide-in-from-bottom-8 duration-700">
              <h3 className="text-2xl font-black mb-8 text-[#1F2937] tracking-tight flex items-center print:text-xl print:mb-4">
                <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mr-4 text-accent print:hidden">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </span>
                Research Narrative
              </h3>
              <div className="space-y-8 text-base text-text-primary">
                <div>
                   <strong className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF] mb-3">Primary Objective</strong> 
                   <p className="text-lg font-medium text-[#374151] leading-relaxed">{experiment.objective_short}</p>
                </div>
                {experiment.research_question && (
                  <div>
                    <strong className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF] mb-3">Research Inquiry</strong> 
                    <p className="font-medium text-[#4B5563] leading-relaxed italic">{experiment.research_question}</p>
                  </div>
                )}
                <div>
                  <strong className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF] mb-3">Motivating Context</strong> 
                  <p className="text-[#4B5563] leading-relaxed">{experiment.motivation}</p>
                </div>
                {experiment.expected_outcome && (
                  <div>
                    <strong className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#9CA3AF] mb-3">Hypothesized Result</strong> 
                    <p className="text-[#4B5563] leading-relaxed">{experiment.expected_outcome}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Session Notes & Images */}
            <div className="bg-white/70 print:bg-transparent backdrop-blur-xl print:backdrop-blur-none shadow-sm print:shadow-none border border-white print:border-none rounded-[2.5rem] print:rounded-none p-10 print:p-0 print:mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              <h3 className="text-2xl font-black mb-8 text-[#1F2937] tracking-tight flex items-center print:text-xl print:mb-4">
                <span className="w-8 h-8 rounded-lg bg-secondary-accent/10 flex items-center justify-center mr-4 text-secondary-accent print:hidden">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </span>
                Event Timeline
              </h3>
              {experiment.timeline_entries && experiment.timeline_entries.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 pl-8">
                  {experiment.timeline_entries.map((tl, idx) => (
                    <div key={idx} className="relative text-base text-text-primary p-6 bg-white/50 print:bg-transparent rounded-2xl print:rounded-none border border-white/50 print:border-none print:border-l-4 print:border-l-slate-300 shadow-sm print:shadow-none break-inside-avoid">
                      <div className="absolute -left-[27px] top-7 w-3 h-3 rounded-full bg-accent border-2 border-white shadow-sm font-bold print:hidden"></div>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-accent/10 rounded-lg text-[10px] font-black tracking-widest text-accent border border-accent/10 uppercase">{tl.entry_type}</span>
                        <span className="text-[#9CA3AF] font-mono text-[10px] font-black uppercase tracking-widest">{tl.timestamp.replace('T', ' ')}</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed text-[#374151] font-medium">{tl.text}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-base text-text-secondary italic">No timeline entries recorded.</p>}
              
              <ImageGrid category="note_image" title="Chronicle Media" />

              {/* Session Reflection */}
              <div className="mt-12 pt-10 border-t border-slate-100">
                <h3 className="text-xl font-black mb-8 text-accent uppercase tracking-widest">Final Reflection</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <strong className="block text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-3">Setup Details</strong>
                    <p className="text-base text-[#4B5563] whitespace-pre-wrap bg-slate-50/50 p-5 rounded-2xl border border-slate-100 italic">{experiment.general_setup_notes || 'None recorded.'}</p>
                  </div>
                  <div>
                    <strong className="block text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-3">Initial Thesis</strong>
                    <p className="text-base text-[#4B5563] whitespace-pre-wrap font-medium">{experiment.preliminary_impression || 'None recorded.'}</p>
                  </div>
                  <div>
                    <strong className="block text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-3">Experimental Hurdles</strong>
                    <p className="text-base text-[#4B5563] whitespace-pre-wrap font-medium">{experiment.challenges_faced || 'None recorded.'}</p>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div>
                      <strong className="block text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-3">Optimization Points</strong>
                      <p className="text-base text-[#4B5563] whitespace-pre-wrap font-medium">{experiment.things_to_improve || 'None recorded.'}</p>
                    </div>
                    <div>
                      <strong className="block text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-3">Operational Successes</strong>
                      <p className="text-base text-[#4B5563] whitespace-pre-wrap font-medium">{experiment.things_that_worked_nicely || 'None recorded.'}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 border-t border-slate-100 mt-4 pt-8">
                    <strong className="block text-[10px] font-black uppercase tracking-widest text-accent mb-4">Scientific Conclusions</strong>
                    <p className="text-lg text-[#111827] font-black whitespace-pre-wrap bg-accent/5 p-8 rounded-3xl border border-accent/10 leading-relaxed">{experiment.conclusions || 'No final conclusions documented yet.'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <strong className="block text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-3">Executive Summary</strong>
                    <p className="text-base text-[#4B5563] whitespace-pre-wrap leading-relaxed">{experiment.final_summary || 'No summary recorded.'}</p>
                  </div>
                </div>
                <ImageGrid category="reflection_image" title="Post-Session Analytics" />
              </div>
            </div>

            {/* Datasets */}
            <div className="bg-white/70 print:bg-transparent backdrop-blur-xl print:backdrop-blur-none shadow-sm print:shadow-none border border-white print:border-none rounded-[2.5rem] print:rounded-none p-10 print:p-0 print:mb-8 break-inside-avoid animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <h3 className="text-2xl font-black mb-8 text-[#1F2937] tracking-tight flex items-center print:text-xl print:mb-4">
                <span className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center mr-4 text-green-600 print:hidden">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 7v10c0 1.105 2.239 2 5 2s5-.895 5-2V7M4 7c0 1.105 2.239 2 5 2s5-.895 5-2M4 7c0-1.105 2.239-2 5-2s5 .895 5 2m0 5c0 1.105-2.239 2-5 2s-5-.895-5-2"></path></svg>
                </span>
                Raw Datasets
              </h3>
              {experiment.datasets && experiment.datasets.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
                    {experiment.datasets.map((ds, idx) => (
                      <div key={idx} className="text-sm p-6 bg-white shadow-sm rounded-2xl border border-slate-100 group hover:border-accent/30 transition-colors">
                        <div className="font-black text-[#1F2937] flex justify-between items-start mb-4">
                          <span className="truncate pr-2">{ds.file_name}</span>
                          {ds.dataset_group_name && <span className="bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 text-[9px] uppercase tracking-widest text-[#9CA3AF]">{ds.dataset_group_name}</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
                          {ds.integration_time_s && <div><span className="text-accent/50 mr-1.5">•</span>Int {ds.integration_time_s}s</div>}
                          {ds.accumulations && <div><span className="text-accent/50 mr-1.5">•</span>Acc {ds.accumulations}</div>}
                          {ds.laser_power_mW && <div><span className="text-accent/50 mr-1.5">•</span>Pwr {ds.laser_power_mW}mW</div>}
                          {ds.temperature_K && <div><span className="text-accent/50 mr-1.5">•</span>Temp {ds.temperature_K}K</div>}
                        </div>
                        {ds.comments && <div className="mt-4 text-[11px] font-medium text-[#4B5563] italic border-t border-slate-50 pt-3">{ds.comments}</div>}
                      </div>
                    ))}
                  </div>
                  {/* Print Table */}
                  <div className="hidden print:block w-full overflow-hidden text-sm border border-slate-300 rounded-lg">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 border-b-2 border-slate-300">
                        <tr>
                          <th className="py-2 px-3 font-bold text-xs uppercase tracking-wider text-slate-700">Filename</th>
                          <th className="py-2 px-3 font-bold text-xs uppercase tracking-wider text-slate-700">Group</th>
                          <th className="py-2 px-3 font-bold text-xs uppercase tracking-wider text-slate-700">Int (s)</th>
                          <th className="py-2 px-3 font-bold text-xs uppercase tracking-wider text-slate-700">Acc</th>
                          <th className="py-2 px-3 font-bold text-xs uppercase tracking-wider text-slate-700">Pwr (mW)</th>
                          <th className="py-2 px-3 font-bold text-xs uppercase tracking-wider text-slate-700">Temp (K)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {experiment.datasets.map((ds, idx) => (
                           <tr key={idx} className="bg-white">
                             <td className="py-2 px-3 font-mono text-xs">{ds.file_name}</td>
                             <td className="py-2 px-3">{ds.dataset_group_name || '-'}</td>
                             <td className="py-2 px-3">{ds.integration_time_s || '-'}</td>
                             <td className="py-2 px-3">{ds.accumulations || '-'}</td>
                             <td className="py-2 px-3">{ds.laser_power_mW || '-'}</td>
                             <td className="py-2 px-3">{ds.temperature_K || '-'}</td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : <p className="text-base text-text-secondary italic">No datasets attached yet.</p>}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 print:space-y-4">
            {/* Sample */}
            <div className="bg-white/70 print:bg-transparent backdrop-blur-xl print:backdrop-blur-none shadow-sm print:shadow-none border border-white print:border-none rounded-[2.5rem] print:rounded-none p-10 print:p-0 print:mb-8 break-inside-avoid animate-in fade-in slide-in-from-right-8 duration-1000">
              <h3 className="text-xl font-black mb-8 text-[#1F2937] tracking-tight flex items-center print:text-xl print:mb-4">
                <span className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mr-4 text-orange-600 print:hidden">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                </span>
                Material
              </h3>
              {experiment.sample ? (
                <div className="space-y-6">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-2">Designation</span>
                    <p className="text-xl font-black text-[#1F2937]">{experiment.sample.sample_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-2">Formula</span>
                      <p className="font-bold text-[#374151]">{experiment.sample.chemical_formula || '-'}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-2">Phase</span>
                      <p className="font-bold text-[#374151]">{experiment.sample.sample_type || '-'}</p>
                    </div>
                  </div>
                  {experiment.sample.mounting_notes && (
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mb-2">Mounting</span>
                      <p className="text-xs font-medium text-[#4B5563] leading-relaxed">{experiment.sample.mounting_notes}</p>
                    </div>
                  )}
                </div>
              ) : <p className="text-base text-text-secondary italic">No sample linked.</p>}
              <ImageGrid category="sample_image" title="Visual Reference" />
            </div>

            {/* Instrument Setup */}
            <div className="bg-white/40 print:bg-transparent backdrop-blur-md print:backdrop-blur-none shadow-sm print:shadow-none border border-white/50 print:border-none rounded-[2.5rem] print:rounded-none p-10 print:p-0 print:mb-8 break-inside-avoid animate-in fade-in slide-in-from-right-8 duration-1000 delay-100">
              <h3 className="text-xl font-black mb-8 text-[#1F2937] tracking-tight print:mb-4">System Modules</h3>
              
              <div className="space-y-6">
                {experiment.laser_optics_module && (
                  <div className="bg-white/80 p-5 rounded-3xl border border-white shadow-sm">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-accent flex items-center">
                       Optics Base
                    </h4>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                      <div><span className="text-[#9CA3AF] block mb-1">λ</span><span className="font-black text-[#1F2937]">{experiment.laser_optics_module.laser_wavelength_nm}nm</span></div>
                      <div><span className="text-[#9CA3AF] block mb-1">Power</span><span className="font-black text-[#1F2937]">{experiment.laser_optics_module.laser_power_mW || 'N/A'}mW</span></div>
                      <div className="col-span-2 pt-2 border-t border-slate-50 flex justify-between">
                         <div><span className="text-[#9CA3AF] block mb-1">Objective</span><span className="font-black text-[#1F2937]">{experiment.laser_optics_module.objective}</span></div>
                         <div className="text-right"><span className="text-[#9CA3AF] block mb-1">Grating</span><span className="font-black text-[#1F2937]">{experiment.laser_optics_module.grating}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {experiment.temperature_module && (
                  <div className="bg-orange-50/30 p-5 rounded-3xl border border-orange-100">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-orange-600">Thermal Control</h4>
                    <div className="text-xs font-black text-orange-900 leading-relaxed">
                      {experiment.temperature_module.scan_direction === 'cooling' ? 'Cooling' : 'Heating'} Session<br/>
                      <span className="text-lg">{experiment.temperature_module.start_temperature_K}K → {experiment.temperature_module.end_temperature_K}K</span>
                    </div>
                  </div>
                )}

                {experiment.pressure_module && (
                  <div className="bg-blue-50/30 p-5 rounded-3xl border border-blue-100">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-blue-600">Pressure System</h4>
                    <div className="space-y-3 text-xs">
                      <div className="font-black text-blue-900 text-lg">{experiment.pressure_module.start_pressure_GPa} → {experiment.pressure_module.end_pressure_GPa} GPa</div>
                      <div className="pt-2 border-t border-blue-100/50 space-y-2">
                        <div className="flex justify-between"><span className="text-blue-700/70 font-bold">Cell</span><span className="font-black text-blue-900">{experiment.pressure_module.cell_type}</span></div>
                        <div className="flex justify-between"><span className="text-blue-700/70 font-bold">Medium</span><span className="font-black text-blue-900">{experiment.pressure_module.pressure_medium}</span></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
