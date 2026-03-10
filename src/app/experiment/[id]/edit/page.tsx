'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { InstrumentModule } from '@/components/InstrumentModule';
import { ConditionModules } from '@/components/ConditionModules';
import { TimelineNotes } from '@/components/TimelineNotes';
import { DatasetUploader } from '@/components/DatasetUploader';
import { PolarizationModule } from '@/components/PolarizationModule';
import { getExperiment, updateExperiment, saveFile, getFilesForExperiment, deleteFile as deleteFileRecord } from '@/lib/experimentStore';
import type { FileRecord } from '@/lib/db';

export default function EditExperiment() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [expDbId, setExpDbId] = useState<number | null>(null);

  // 1. Metadata
  const [metadata, setMetadata] = useState({
    experiment_id: '',
    title: '',
    date: '',
    start_time: '',
    researcher: '',
    collaborators: '',
    lab_system: '',
    technique: 'Raman Spectroscopy',
    status: 'planned',
    objective_short: '',
    motivation: '',
    research_question: '',
    expected_outcome: '',
    tags: '',
  });

  // 2. Sample
  const [sample, setSample] = useState({
    sample_id: '',
    sample_name: '',
    chemical_formula: '',
    sample_type: '',
    dimensions: '',
    preparation_notes: '',
    mounting_notes: ''
  });

  // 3. Module Selection
  const [modules, setModules] = useState({
    temperature_enabled: false,
    pressure_enabled: false,
    polarization_enabled: false,
    mapping_enabled: false
  });

  // 4. Module Data
  const [tempData, setTempData] = useState<any>({ enabled: true, start_temperature_K: '', end_temperature_K: '', temperature_step_K: '', scan_direction: 'cooling' });
  const [pressureData, setPressureData] = useState<any>({ enabled: true, start_pressure_GPa: '', end_pressure_GPa: '', pressure_step_GPa: '', cell_type: '', pressure_medium: '', pressure_calibration_method: '' });
  const [opticsData, setOpticsData] = useState<any>({ laser_wavelength_nm: '532', laser_power_mW: '1', objective: '50x', grating: '1800', spectrometer: 'LabRAM HR' });
  const [polarData, setPolarData] = useState<any>({ selected_polarizations: '', custom_polarization_optional: '', crystal_orientation_reference: '', alignment_notes: '' });

  // 5. Timeline
  const [timeline, setTimeline] = useState<any[]>([]);

  // 6. Datasets
  const [datasets, setDatasets] = useState<any[]>([]);

  // 7. Reflection
  const [reflection, setReflection] = useState({
    general_setup_notes: '',
    preliminary_impression: '',
    challenges_faced: '',
    things_to_improve: '',
    things_that_worked_nicely: ''
  });

  // 8. Physical Files
  const [sampleImages, setSampleImages] = useState<File[]>([]);
  const [reflectionImages, setReflectionImages] = useState<File[]>([]);
  const [timelineImages, setTimelineImages] = useState<File[]>([]);

  // 9. Existing Files
  const [existingFiles, setExistingFiles] = useState<FileRecord[]>([]);
  const fileUrlsRef = useRef<Record<number, string>>({});

  // Load experiment from IndexedDB
  useEffect(() => {
    async function loadExp() {
      if (!id) return;
      try {
        const data = await getExperiment(id);
        if (!data) {
          setError('Experiment not found in local storage');
          setFetching(false);
          return;
        }
        if (data.id) {
          setExpDbId(data.id);
          const expFiles = await getFilesForExperiment(data.id);
          setExistingFiles(expFiles);
          const urls: Record<number, string> = {};
          for (const f of expFiles) {
            if (f.id && f.blob) urls[f.id] = URL.createObjectURL(f.blob);
          }
          fileUrlsRef.current = urls;
        } else {
          setExpDbId(null);
        }

        setMetadata({
          experiment_id: data.experiment_id,
          title: data.title,
          date: data.date,
          start_time: data.start_time,
          researcher: data.researcher,
          collaborators: data.collaborators || '',
          lab_system: data.lab_system,
          technique: data.technique,
          status: data.status,
          objective_short: data.objective_short,
          motivation: data.motivation || '',
          research_question: data.research_question || '',
          expected_outcome: data.expected_outcome || '',
          tags: data.tags || '',
        });

        if (data.sample) {
          setSample({
            sample_id: data.sample.sample_id,
            sample_name: data.sample.sample_name,
            chemical_formula: data.sample.chemical_formula || '',
            sample_type: data.sample.sample_type || '',
            dimensions: data.sample.dimensions || '',
            preparation_notes: data.sample.preparation_notes || '',
            mounting_notes: data.sample.mounting_notes || '',
          });
        }

        if (data.module_selection) {
          setModules({
            temperature_enabled: data.module_selection.temperature_enabled || false,
            pressure_enabled: data.module_selection.pressure_enabled || false,
            polarization_enabled: data.module_selection.polarization_enabled || false,
            mapping_enabled: data.module_selection.mapping_enabled || false,
          });
        }

        if (data.temperature_module) setTempData({ ...data.temperature_module });
        if (data.pressure_module) setPressureData({ ...data.pressure_module });
        if (data.laser_optics_module) setOpticsData({ ...data.laser_optics_module });
        if (data.polarization_module) setPolarData({ ...data.polarization_module });
        if (data.timeline_entries?.length > 0) setTimeline(data.timeline_entries);
        if (data.datasets?.length > 0) setDatasets(data.datasets);

        setReflection({
          general_setup_notes: data.general_setup_notes || '',
          preliminary_impression: data.preliminary_impression || '',
          challenges_faced: data.challenges_faced || '',
          things_to_improve: data.things_to_improve || '',
          things_that_worked_nicely: data.things_that_worked_nicely || '',
        });
      } catch (e) {
        console.error(e);
      } finally {
        setFetching(false);
      }
    }
    loadExp();
    return () => {
      Object.values(fileUrlsRef.current).forEach(url => URL.revokeObjectURL(url));
    };
  }, [id]);

  const handleDeleteExistingFile = async (fileId: number) => {
    if (!confirm('Delete this image permanently?')) return;
    try {
      await deleteFileRecord(fileId);
      if (fileUrlsRef.current[fileId]) URL.revokeObjectURL(fileUrlsRef.current[fileId]);
      setExistingFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  const handleMetadataChange = (e: any) => setMetadata({ ...metadata, [e.target.name]: e.target.value });
  const handleSampleChange = (e: any) => setSample({ ...sample, [e.target.name]: e.target.value });
  const handleReflectionChange = (e: any) => setReflection({ ...reflection, [e.target.name]: e.target.value });
  const toggleModule = (modName: string) => setModules({ ...modules, [modName]: !modules[modName as keyof typeof modules] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updates: any = {
        title: metadata.title,
        date: metadata.date,
        start_time: metadata.start_time,
        researcher: metadata.researcher,
        collaborators: metadata.collaborators,
        lab_system: metadata.lab_system,
        technique: metadata.technique,
        status: metadata.status,
        objective_short: metadata.objective_short,
        motivation: metadata.motivation,
        research_question: metadata.research_question,
        expected_outcome: metadata.expected_outcome,
        tags: metadata.tags,
        sample: {
          sample_id: sample.sample_id,
          sample_name: sample.sample_name,
          chemical_formula: sample.chemical_formula || undefined,
          sample_type: sample.sample_type,
          dimensions: sample.dimensions || undefined,
          preparation_notes: sample.preparation_notes || undefined,
          mounting_notes: sample.mounting_notes || undefined,
        },
        module_selection: modules,
        temperature_module: modules.temperature_enabled ? {
          enabled: true,
          start_temperature_K: Number(tempData.start_temperature_K) || 0,
          end_temperature_K: Number(tempData.end_temperature_K) || 0,
          temperature_step_K: Number(tempData.temperature_step_K) || 0,
          scan_direction: tempData.scan_direction || 'cooling',
        } : undefined,
        pressure_module: modules.pressure_enabled ? {
          enabled: true,
          start_pressure_GPa: Number(pressureData.start_pressure_GPa) || 0,
          end_pressure_GPa: Number(pressureData.end_pressure_GPa) || 0,
          pressure_step_GPa: Number(pressureData.pressure_step_GPa) || null,
          cell_type: pressureData.cell_type || '',
          pressure_medium: pressureData.pressure_medium || '',
          pressure_calibration_method: pressureData.pressure_calibration_method || '',
        } : undefined,
        polarization_module: modules.polarization_enabled ? {
          enabled: true,
          selected_polarizations: polarData.selected_polarizations || '',
          custom_polarization_optional: polarData.custom_polarization_optional || null,
          crystal_orientation_reference: polarData.crystal_orientation_reference || '',
        } : undefined,
        laser_optics_module: {
          laser_wavelength_nm: Number(opticsData.laser_wavelength_nm) || 532,
          objective: opticsData.objective || '50x',
          grating: opticsData.grating || '1800',
          spectrometer: opticsData.spectrometer || 'LabRAM HR',
        },
        timeline_entries: timeline.filter(t => t.text?.trim()),
        datasets: datasets.map(d => {
          const { fileObj, ...rest } = d;
          return rest;
        }),
        ...reflection,
      };

      await updateExperiment(metadata.experiment_id, updates);

      // Save new files if added
      if (expDbId) {
        for (const file of sampleImages) {
          await saveFile(expDbId, metadata.experiment_id, 'sample_image', file);
        }
        for (const file of reflectionImages) {
          await saveFile(expDbId, metadata.experiment_id, 'reflection_image', file);
        }
        for (const file of timelineImages) {
          await saveFile(expDbId, metadata.experiment_id, 'note_image', file);
        }
        for (const d of datasets) {
          if (d.fileObj) {
            await saveFile(expDbId, metadata.experiment_id, 'dataset', d.fileObj);
          }
        }
      }

      router.push(`/experiment/${metadata.experiment_id}`);
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to update experiment');
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="max-w-5xl mx-auto pb-12 text-center py-24">
      <svg className="animate-spin mx-auto h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="mt-4 text-slate-500">Loading experiment...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">Edit Raman Experiment Session</h2>
          <p className="mt-2 text-base text-text-secondary">Update your experiment data — saved locally.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50/50 p-4 mb-6 border border-red-200">
          <h3 className="text-sm font-semibold text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700 whitespace-pre-wrap"><p>{error}</p></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Metadata */}
        <div className="bg-card-bg shadow-sm border border-border-custom sm:rounded-2xl p-8">
          <h3 className="text-xl font-semibold leading-6 text-accent border-b border-border-custom pb-4">Experiment Overview</h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-4 sm:gap-x-6">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-label">Project Title</label>
              <input required type="text" name="title" value={metadata.title} onChange={handleMetadataChange} className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-2.5 border bg-white" />
            </div>
            <div><label className="block text-sm font-semibold text-label">Date</label><input required type="date" name="date" value={metadata.date} onChange={handleMetadataChange} className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-2.5 border bg-white" /></div>
            <div><label className="block text-sm font-semibold text-label">Time</label><input required type="time" name="start_time" step="1" value={metadata.start_time} onChange={handleMetadataChange} className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-2.5 border bg-white" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-semibold text-label">Lead Researcher</label><input required type="text" name="researcher" value={metadata.researcher} onChange={handleMetadataChange} className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-2.5 border bg-white" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-semibold text-label">Research Categories (comma separated)</label><input type="text" name="tags" value={metadata.tags} onChange={handleMetadataChange} placeholder="high-pressure, DAC, raman" className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-2.5 border bg-white" /></div>
            <div className="sm:col-span-4"><label className="block text-sm font-semibold text-label">Lab / System</label><input required type="text" name="lab_system" value={metadata.lab_system} onChange={handleMetadataChange} className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-2.5 border bg-white" /></div>
            <div className="sm:col-span-4"><label className="block text-sm font-semibold text-label">Short Objective</label><input required type="text" name="objective_short" value={metadata.objective_short} onChange={handleMetadataChange} className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-2.5 border bg-white" /></div>
            <div className="sm:col-span-4"><label className="block text-sm font-semibold text-label">Motivation</label><textarea required rows={3} name="motivation" value={metadata.motivation} onChange={handleMetadataChange} className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-3 border bg-white" /></div>
          </div>
        </div>

        {/* Sample */}
        <div className="bg-card-bg shadow-sm border border-border-custom sm:rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-accent border-b border-border-custom pb-4 mb-6">Sample Information</h3>
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-6">
            <div><label className="block text-sm font-semibold text-label">Sample Name</label><input required type="text" name="sample_name" value={sample.sample_name} onChange={handleSampleChange} className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-2.5 border bg-white" /></div>
            <div><label className="block text-sm font-semibold text-label">Formula</label><input type="text" name="chemical_formula" value={sample.chemical_formula} onChange={handleSampleChange} className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-2.5 border bg-white" /></div>
            <div><label className="block text-sm font-semibold text-label">Type</label>
              <select name="sample_type" value={sample.sample_type} onChange={handleSampleChange} className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-2.5 border bg-white">
                <option value="">Select...</option><option value="single crystal">Single Crystal</option><option value="thin film">Thin Film</option><option value="powder">Powder</option><option value="pellet">Pellet</option>
              </select>
            </div>
            <div className="sm:col-span-3"><label className="block text-sm font-semibold text-label">Notes</label><input type="text" name="mounting_notes" value={sample.mounting_notes || ''} onChange={handleSampleChange} className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-2.5 border bg-white" /></div>
            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-label mb-2">Sample Images</label>
              
              {/* Existing Sample Images */}
              {existingFiles.filter(f => f.category === 'sample_image').length > 0 && (
                <div className="mb-3 flex gap-2 flex-wrap">
                  {existingFiles.filter(f => f.category === 'sample_image').map(f => (
                    <div key={f.id} className="relative group rounded-md border border-slate-200 overflow-hidden h-16 w-16">
                      <img src={f.id ? fileUrlsRef.current[f.id] : ''} alt={f.fileName} className="object-cover h-full w-full" />
                      <button type="button" onClick={() => f.id && handleDeleteExistingFile(f.id)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <label className="cursor-pointer text-sm font-medium text-accent flex items-center bg-indigo-50/50 px-4 py-2 rounded-md border border-indigo-100 w-fit hover:bg-indigo-100 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Upload New Images
                  <input type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) setSampleImages(prev => [...prev, ...Array.from(e.target.files!)]); e.target.value = ''; }} />
                </label>
                {sampleImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {sampleImages.map((img, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-600 shadow-sm">
                        <span className="truncate max-w-[120px]">{img.name}</span>
                        <button type="button" onClick={() => setSampleImages(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="bg-slate-50/50 shadow-inner border border-slate-200 sm:rounded-2xl p-8">
          <h3 className="text-xl font-semibold border-b border-border-custom pb-4">Setup Modules</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-8">
            <label className="flex items-center space-x-3 bg-white p-3.5 rounded-lg shadow-sm border border-border-custom cursor-pointer hover:border-accent transition-all"><input type="checkbox" checked={modules.temperature_enabled} onChange={() => toggleModule('temperature_enabled')} className="form-checkbox h-5 w-5 text-accent rounded" /><span className="font-semibold">Temperature</span></label>
            <label className="flex items-center space-x-3 bg-white p-3.5 rounded-lg shadow-sm border border-border-custom cursor-pointer hover:border-accent transition-all"><input type="checkbox" checked={modules.pressure_enabled} onChange={() => toggleModule('pressure_enabled')} className="form-checkbox h-5 w-5 text-accent rounded" /><span className="font-semibold">Pressure</span></label>
            <label className="flex items-center space-x-3 bg-white p-3.5 rounded-lg shadow-sm border border-border-custom cursor-pointer hover:border-accent transition-all"><input type="checkbox" checked={modules.polarization_enabled} onChange={() => toggleModule('polarization_enabled')} className="form-checkbox h-5 w-5 text-accent rounded" /><span className="font-semibold">Polarization</span></label>
            <label className="flex items-center space-x-3 bg-white p-3.5 rounded-lg shadow-sm border opacity-50"><input disabled type="checkbox" className="form-checkbox h-5 w-5 rounded" /><span className="text-text-secondary">Mapping</span></label>
          </div>
          <div className="space-y-6">
            <InstrumentModule opticsData={opticsData} setOpticsData={setOpticsData} />
            <ConditionModules modules={modules} tempData={tempData} setTempData={setTempData} pressureData={pressureData} setPressureData={setPressureData} />
            <PolarizationModule modules={modules} polarData={polarData} setPolarData={setPolarData} />
          </div>
        </div>

        {/* Datasets */}
        <div className="bg-card-bg shadow-sm border border-border-custom sm:rounded-2xl p-8">
          <h3 className="text-xl font-semibold border-b border-border-custom pb-4">Datasets</h3>
          <p className="text-base text-text-secondary mt-2 mb-6">Manage attached data files.</p>
          <DatasetUploader datasets={datasets} setDatasets={setDatasets} />
        </div>

        {/* Timeline */}
        <div className="bg-card-bg shadow-sm border border-border-custom sm:rounded-2xl p-8">
          <h3 className="text-xl font-semibold border-b border-border-custom pb-4">Session Notes</h3>
          <div className="mt-4"><TimelineNotes timeline={timeline} setTimeline={setTimeline} researcher={metadata.researcher} timelineImages={timelineImages} setTimelineImages={setTimelineImages} /></div>
        </div>

        {/* Reflections */}
        <div className="bg-slate-50/50 shadow-sm border border-border-custom sm:rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-accent border-b border-border-custom pb-4">Reflection</h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2"><label className="block text-sm font-semibold text-label">Setup Notes</label><textarea rows={2} name="general_setup_notes" value={reflection.general_setup_notes} onChange={handleReflectionChange} className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-3 border bg-white" /></div>
            <div><label className="block text-sm font-semibold text-label">Impressions</label><textarea rows={3} name="preliminary_impression" value={reflection.preliminary_impression} onChange={handleReflectionChange} className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-3 border bg-white" /></div>
            <div><label className="block text-sm font-semibold text-label">Challenges</label><textarea rows={3} name="challenges_faced" value={reflection.challenges_faced} onChange={handleReflectionChange} className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-3 border bg-white" /></div>
            <div><label className="block text-sm font-semibold text-label">What Worked</label><textarea rows={3} name="things_that_worked_nicely" value={reflection.things_that_worked_nicely} onChange={handleReflectionChange} className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-3 border bg-white" /></div>
            <div><label className="block text-sm font-semibold text-label">Improvements</label><textarea rows={3} name="things_to_improve" value={reflection.things_to_improve} onChange={handleReflectionChange} className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base p-3 border bg-white" /></div>
            <div className="md:col-span-2 mt-2">
              <label className="block text-sm font-semibold text-label mb-2">Session Images</label>
              
              {/* Existing Reflection Images */}
              {existingFiles.filter(f => f.category === 'reflection_image').length > 0 && (
                <div className="mb-3 flex gap-2 flex-wrap">
                  {existingFiles.filter(f => f.category === 'reflection_image').map(f => (
                    <div key={f.id} className="relative group rounded-md border border-slate-200 overflow-hidden h-16 w-16">
                      <img src={f.id ? fileUrlsRef.current[f.id] : ''} alt={f.fileName} className="object-cover h-full w-full" />
                      <button type="button" onClick={() => f.id && handleDeleteExistingFile(f.id)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <label className="cursor-pointer text-sm font-medium text-accent flex items-center bg-indigo-50/50 px-4 py-2 rounded-md border border-indigo-100 w-fit hover:bg-indigo-100 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  Upload New Images
                  <input type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) setReflectionImages(prev => [...prev, ...Array.from(e.target.files!)]); e.target.value = ''; }} />
                </label>
                {reflectionImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {reflectionImages.map((img, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-600 shadow-sm">
                        <span className="truncate max-w-[120px]">{img.name}</span>
                        <button type="button" onClick={() => setReflectionImages(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-x-4 sticky bottom-4 z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button type="button" onClick={() => router.push(`/experiment/${id}`)} className="rounded-lg bg-white py-2.5 px-6 text-sm font-semibold shadow-sm border border-border-custom hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="rounded-lg bg-accent py-2.5 px-8 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors">
            {loading ? 'Saving...' : 'Update Session'}
          </button>
        </div>
      </form>
    </div>
  );
}
