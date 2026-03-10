'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getExperiment } from '@/lib/experimentStore';
import { getFilesForExperiment, deleteFile as deleteFileRecord } from '@/lib/experimentStore';
import type { ExperimentRecord, FileRecord } from '@/lib/db';

export default function ExperimentDetail() {
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
        const expFiles = await getFilesForExperiment(exp.id);
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
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-label mb-2">{title}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categoryFiles.map((f) => (
            <div key={f.id} className="relative group rounded-lg overflow-hidden border border-slate-200">
              {f.id && fileUrls[f.id] && (
                <img src={fileUrls[f.id]} alt={f.fileName} className="w-full h-32 object-cover" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-start justify-end p-1.5">
                <button
                  onClick={() => f.id && handleDeleteFile(f.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-lg"
                  title="Delete image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="px-2 py-1 bg-slate-50 text-xs text-text-secondary truncate">{f.fileName}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 print:max-w-none print:pb-0">
      <div className="mb-6 flex justify-between items-end pb-4 border-b border-border-custom print:hidden">
        <div>
          <Link href="/" className="text-sm font-semibold text-text-secondary hover:text-accent mb-2 inline-block transition-colors">&larr; Dashboard</Link>
          <h2 className="text-3xl font-bold leading-7 text-text-primary sm:truncate sm:tracking-tight">
            {experiment.title || 'Untitled Session'}
          </h2>
          <p className="mt-2 text-sm text-text-secondary flex items-center gap-4 font-medium">
            <span>ID: <span className="font-mono text-accent">{experiment.experiment_id}</span></span>
            <span className="text-border-custom">|</span>
            <span>{experiment.date} {experiment.start_time}</span>
            <span className="text-border-custom">|</span>
            <span>{experiment.researcher}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/experiment/${id}/edit`} className="px-4 py-2 text-sm font-semibold bg-white border border-border-custom text-text-primary rounded-lg shadow-sm hover:bg-slate-50 transition-colors">Edit</Link>
          <button onClick={() => window.print()} className="px-4 py-2 text-sm font-semibold bg-accent text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">Export Print</button>
        </div>
      </div>
      
      {/* Print header */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
        <h1 className="text-3xl font-bold mb-2">{experiment.title || 'Untitled Session'}</h1>
        <p className="text-sm text-slate-600">ID: {experiment.experiment_id} | {experiment.date} {experiment.start_time} | {experiment.researcher}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Scientific Context */}
          <div className="bg-card-bg shadow-sm border border-border-custom rounded-2xl p-8">
            <h3 className="text-xl font-semibold border-b border-border-custom pb-3 mb-5 text-accent">Scientific Context</h3>
            <div className="space-y-5 text-base text-text-primary">
              <div><strong className="block text-sm text-label mb-1">Objective</strong> {experiment.objective_short}</div>
              {experiment.research_question && <div><strong className="block text-sm text-label mb-1">Research Question</strong> {experiment.research_question}</div>}
              <div><strong className="block text-sm text-label mb-1">Motivation</strong> {experiment.motivation}</div>
              {experiment.expected_outcome && <div><strong className="block text-sm text-label mb-1">Expected Outcome</strong> {experiment.expected_outcome}</div>}
            </div>
          </div>

          {/* Session Notes & Images */}
          <div className="bg-card-bg shadow-sm border border-border-custom rounded-2xl p-8">
            <h3 className="text-xl font-semibold border-b border-border-custom pb-3 mb-5 text-accent">Session Notes & Images</h3>
            {experiment.timeline_entries && experiment.timeline_entries.length > 0 ? (
              <div className="space-y-6">
                {experiment.timeline_entries.map((tl, idx) => (
                  <div key={idx} className="text-base text-text-primary bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div className="mb-2">
                      <span className="text-text-secondary font-mono text-xs mr-3">{tl.timestamp.replace('T', ' ')}</span>
                      <span className="px-2 py-0.5 bg-indigo-100/50 rounded text-[10px] font-bold tracking-wider text-accent border border-indigo-200/50 mr-2 uppercase">{tl.entry_type}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{tl.text}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-base text-text-secondary italic">No timeline entries recorded.</p>}
            
            <ImageGrid category="note_image" title="Note Images" />

            {/* Session Reflection */}
            <div className="mt-8 pt-6 border-t border-border-custom bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-accent border-b border-border-custom pb-2">Session Reflection</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-label mb-1">Preliminary Impressions</h4>
                  <p className="text-base text-text-primary whitespace-pre-wrap">{experiment.preliminary_impression || 'None'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-label mb-1">Challenges</h4>
                  <p className="text-base text-text-primary whitespace-pre-wrap">{experiment.challenges_faced || 'None'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-label mb-1">Things That Worked</h4>
                  <p className="text-base text-text-primary whitespace-pre-wrap">{experiment.things_that_worked_nicely || 'None'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-label mb-1">Areas for Improvement</h4>
                  <p className="text-base text-text-primary whitespace-pre-wrap">{experiment.things_to_improve || 'None'}</p>
                </div>
              </div>
              <ImageGrid category="reflection_image" title="Reflection Images" />
            </div>
          </div>

          {/* Datasets */}
          <div className="bg-card-bg shadow-sm border border-border-custom rounded-2xl p-8">
            <h3 className="text-xl font-semibold border-b border-border-custom pb-3 mb-5 text-accent">Datasets</h3>
            {experiment.datasets && experiment.datasets.length > 0 ? (
              <div className="space-y-4">
                {experiment.datasets.map((ds, idx) => (
                  <div key={idx} className="text-sm p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="font-semibold text-text-primary flex justify-between items-center mb-2">
                      <span>{ds.file_name}</span>
                      {ds.dataset_group_name && <span className="bg-white px-2 py-0.5 rounded-full border border-slate-200 text-xs text-text-secondary">{ds.dataset_group_name}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                      {ds.integration_time_s && <div><span className="font-semibold text-label">Int Time:</span> {ds.integration_time_s}s</div>}
                      {ds.accumulations && <div><span className="font-semibold text-label">Accums:</span> {ds.accumulations}</div>}
                      {ds.laser_power_mW && <div><span className="font-semibold text-label">Power:</span> {ds.laser_power_mW}mW</div>}
                      {ds.temperature_K && <div><span className="font-semibold text-label">Temp:</span> {ds.temperature_K}K</div>}
                      {ds.pressure_GPa && <div><span className="font-semibold text-label">Press:</span> {ds.pressure_GPa}GPa</div>}
                    </div>
                    {ds.comments && <div className="mt-2 text-text-primary italic border-t border-slate-200 pt-2">{ds.comments}</div>}
                  </div>
                ))}
              </div>
            ) : <p className="text-base text-text-secondary italic">No datasets attached yet.</p>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sample */}
          <div className="bg-card-bg shadow-sm border border-border-custom rounded-2xl p-8">
            <h3 className="text-xl font-semibold border-b border-border-custom pb-3 mb-5 text-accent">Sample</h3>
            {experiment.sample ? (
              <dl className="text-base space-y-4">
                <div><dt className="text-sm font-semibold text-label">Name</dt><dd className="font-medium text-text-primary">{experiment.sample.sample_name}</dd></div>
                <div><dt className="text-sm font-semibold text-label">Formula</dt><dd className="font-medium text-text-primary">{experiment.sample.chemical_formula || '-'}</dd></div>
                <div><dt className="text-sm font-semibold text-label">Type</dt><dd className="font-medium text-text-primary">{experiment.sample.sample_type || '-'}</dd></div>
                {experiment.sample.mounting_notes && <div><dt className="text-sm font-semibold text-label">Mounting Notes</dt><dd className="font-medium text-text-primary bg-slate-50 p-2 rounded mt-1 border border-slate-100">{experiment.sample.mounting_notes}</dd></div>}
                {experiment.sample.preparation_notes && <div><dt className="text-sm font-semibold text-label">Prep Notes</dt><dd className="font-medium text-text-primary">{experiment.sample.preparation_notes}</dd></div>}
              </dl>
            ) : <p className="text-base text-text-secondary italic">No sample linked.</p>}
            <ImageGrid category="sample_image" title="Sample Images" />
          </div>

          {/* Instrument Setup */}
          <div className="bg-slate-50/80 shadow-inner border border-border-custom rounded-2xl p-8">
            <h3 className="text-xl font-semibold border-b border-border-custom pb-3 mb-5 text-text-primary">Instrument Setup</h3>
            
            {experiment.laser_optics_module && (
              <div className="mb-4 bg-white p-4 rounded-xl shadow-sm text-base border border-slate-200">
                <h4 className="font-semibold mb-3 text-indigo-900 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  Laser Optics
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-label font-semibold block uppercase text-[10px] tracking-wider">&lambda;</span>{String(experiment.laser_optics_module.laser_wavelength_nm)} nm</div>
                  <div><span className="text-label font-semibold block uppercase text-[10px] tracking-wider">Default Power</span>{String(experiment.laser_optics_module.laser_power_mW || 'N/A')} mW</div>
                  <div><span className="text-label font-semibold block uppercase text-[10px] tracking-wider">Obj</span>{String(experiment.laser_optics_module.objective)}</div>
                  <div><span className="text-label font-semibold block uppercase text-[10px] tracking-wider">Grating</span>{String(experiment.laser_optics_module.grating)}</div>
                </div>
              </div>
            )}

            {experiment.temperature_module && (
              <div className="mb-4 bg-orange-50/80 p-4 rounded-xl shadow-sm text-base border border-orange-200/60">
                <h4 className="font-semibold mb-2 text-orange-900 border-b border-orange-200/50 pb-1">Temperature</h4>
                <div className="text-sm text-orange-800 font-medium">
                  {String(experiment.temperature_module.scan_direction)}: {String(experiment.temperature_module.start_temperature_K)}K &rarr; {String(experiment.temperature_module.end_temperature_K)}K <span className="opacity-75 font-normal">(step: {String(experiment.temperature_module.temperature_step_K)}K)</span>
                </div>
              </div>
            )}

            {experiment.pressure_module && (
              <div className="mb-4 bg-blue-50/80 p-4 rounded-xl shadow-sm text-base border border-blue-200/60">
                <h4 className="font-semibold mb-2 text-blue-900 border-b border-blue-200/50 pb-1">High Pressure (DAC)</h4>
                <div className="text-sm text-blue-800 space-y-1.5 font-medium">
                  <div>Range: {String(experiment.pressure_module.start_pressure_GPa)} &rarr; {String(experiment.pressure_module.end_pressure_GPa)} GPa</div>
                  <div className="font-normal opacity-90"><strong className="font-semibold">Cell:</strong> {String(experiment.pressure_module.cell_type)}</div>
                  <div className="font-normal opacity-90"><strong className="font-semibold">Medium:</strong> {String(experiment.pressure_module.pressure_medium)}</div>
                  <div className="font-normal opacity-90"><strong className="font-semibold">Calib:</strong> {String(experiment.pressure_module.pressure_calibration_method)}</div>
                </div>
              </div>
            )}

            {experiment.polarization_module && (
              <div className="mb-4 bg-purple-50/80 p-4 rounded-xl shadow-sm text-base border border-purple-200/60">
                <h4 className="font-semibold mb-2 text-purple-900 border-b border-purple-200/50 pb-1">Polarization</h4>
                <div className="text-sm text-purple-800 space-y-1.5 font-medium">
                  <div>Config: {String(experiment.polarization_module.selected_polarizations)}</div>
                  {experiment.polarization_module.crystal_orientation_reference && <div className="font-normal opacity-90"><strong className="font-semibold">Context:</strong> {String(experiment.polarization_module.crystal_orientation_reference)}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
