'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { InstrumentModule } from '@/components/InstrumentModule';
import { ConditionModules } from '@/components/ConditionModules';
import { TimelineNotes } from '@/components/TimelineNotes';
import { DatasetUploader } from '@/components/DatasetUploader';
import { PolarizationModule } from '@/components/PolarizationModule';
import { createExperiment, saveFile } from '@/lib/experimentStore';
import { db } from '@/lib/db';
import { ImageDropzone } from '@/components/ImageDropzone';

export default function NewExperimentV2() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Metadata & Scientific Context
  const [metadata, setMetadata] = useState({
    experiment_id: `EXP-V2-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    title: '',
    date: new Date().toISOString().split('T')[0],
    start_time: new Date().toTimeString().split(' ')[0].substring(0, 5) + ":00",
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

  const [sample, setSample] = useState({
    sample_id: `SAMP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    sample_name: '',
    chemical_formula: '',
    sample_type: '',
    dimensions: '',
    preparation_notes: '',
    mounting_notes: ''
  });
  
  const [isNewSample] = useState(true);

  // 3. Module Selection State
  const [modules, setModules] = useState({
    temperature_enabled: false,
    pressure_enabled: false,
    polarization_enabled: false,
    mapping_enabled: false
  });

  // 4. Module Data States
  const [tempData, setTempData] = useState({ enabled: true, start_temperature_K: '', end_temperature_K: '', temperature_step_K: '', scan_direction: 'cooling' });
  const [pressureData, setPressureData] = useState({ enabled: true, start_pressure_GPa: '', end_pressure_GPa: '', pressure_step_GPa: '', cell_type: '', pressure_medium: '', pressure_calibration_method: '' });
  const [opticsData, setOpticsData] = useState({ laser_wavelength_nm: '532', laser_power_mW: '1', objective: '50x', grating: '1800', spectrometer: 'LabRAM HR' });
  const [polarData, setPolarData] = useState({ selected_polarizations: '', custom_polarization_optional: '', crystal_orientation_reference: '', alignment_notes: '' });
  
  // 5. Timeline
  const [timeline, setTimeline] = useState([{
    entry_id: `TL-${Date.now()}`,
    timestamp: new Date().toISOString().slice(0, 19),
    author: '',
    entry_type: 'preparation',
    text: ''
  }]);
  
  // 6. Datasets
  const [datasets, setDatasets] = useState<any[]>([]);

  // 7. Reflection
  const [reflection, setReflection] = useState({
    general_setup_notes: '',
    preliminary_impression: '',
    challenges_faced: '',
    things_to_improve: '',
    things_that_worked_nicely: '',
    final_summary: '',
    conclusions: ''
  });

  // 8. Physical Files State
  const [sampleImages, setSampleImages] = useState<File[]>([]);
  const [reflectionImages, setReflectionImages] = useState<File[]>([]);
  const [timelineImages, setTimelineImages] = useState<File[]>([]);

  const handleMetadataChange = (e: any) => setMetadata({ ...metadata, [e.target.name]: e.target.value });
  const handleSampleChange = (e: any) => setSample({ ...sample, [e.target.name]: e.target.value });
  const handleReflectionChange = (e: any) => setReflection({ ...reflection, [e.target.name]: e.target.value });
  const toggleModule = (modName: string) => setModules({ ...modules, [modName]: !modules[modName as keyof typeof modules] });

  // Autosave Draft
  useEffect(() => {
    if (!user) return;
    const saveDraft = async () => {
      const draftData = {
        metadata,
        sample,
        modules,
        tempData,
        pressureData,
        opticsData,
        polarData,
        timeline,
        reflection,
        // (files/images omitted from quick draft, stored separately)
      };
      // Keep it simple, purely using LocalStorage for the quick form draft. 
      // Saving files in real-time is too heavy, we save the text state.
      localStorage.setItem(`raman-draft-${user.id}`, JSON.stringify(draftData));
    };

    const timer = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timer);
  }, [metadata, sample, modules, tempData, pressureData, opticsData, polarData, timeline, reflection, user]);

  // Load Draft on Mount
  useEffect(() => {
    if (!user) return;
    const savedDraft = localStorage.getItem(`raman-draft-${user.id}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.metadata) setMetadata(parsed.metadata);
        if (parsed.sample) setSample(parsed.sample);
        if (parsed.modules) setModules(parsed.modules);
        if (parsed.tempData) setTempData(parsed.tempData);
        if (parsed.pressureData) setPressureData(parsed.pressureData);
        if (parsed.opticsData) setOpticsData(parsed.opticsData);
        if (parsed.polarData) setPolarData(parsed.polarData);
        if (parsed.timeline) setTimeline(parsed.timeline);
        if (parsed.reflection) setReflection(parsed.reflection);
      } catch (e) {
        console.error("Failed to load draft form data", e);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      // Build experiment record for IndexedDB
      const experimentData = {
        experiment_id: metadata.experiment_id,
        userId: String(user.id),
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
        ...(modules.temperature_enabled && {
          temperature_module: {
            enabled: true,
            start_temperature_K: Number(tempData.start_temperature_K) || 0,
            end_temperature_K: Number(tempData.end_temperature_K) || 0,
            temperature_step_K: Number(tempData.temperature_step_K) || 0,
            scan_direction: tempData.scan_direction || 'cooling',
          }
        }),
        ...(modules.pressure_enabled && {
          pressure_module: {
            enabled: true,
            start_pressure_GPa: Number(pressureData.start_pressure_GPa) || 0,
            end_pressure_GPa: Number(pressureData.end_pressure_GPa) || 0,
            pressure_step_GPa: Number(pressureData.pressure_step_GPa) || null,
            cell_type: pressureData.cell_type || '',
            pressure_medium: pressureData.pressure_medium || '',
            pressure_calibration_method: pressureData.pressure_calibration_method || '',
          }
        }),
        ...(modules.polarization_enabled && {
          polarization_module: {
            enabled: true,
            selected_polarizations: polarData.selected_polarizations || '',
            custom_polarization_optional: polarData.custom_polarization_optional || null,
            crystal_orientation_reference: polarData.crystal_orientation_reference || '',
          }
        }),
        laser_optics_module: {
          laser_wavelength_nm: Number(opticsData.laser_wavelength_nm) || 532,
          objective: opticsData.objective || '50x',
          grating: opticsData.grating || '1800',
          spectrometer: opticsData.spectrometer || 'LabRAM HR',
        },
        timeline_entries: timeline.filter(t => t.text.trim() !== '').map(t => ({
          entry_id: t.entry_id,
          timestamp: t.timestamp,
          author: t.author,
          entry_type: t.entry_type,
          text: t.text,
        })),
        datasets: datasets.map(d => {
          const { fileObj, ...rest } = d;
          return rest;
        }),
        ...reflection,
      };

      // Save to IndexedDB
      const expId = await createExperiment(experimentData);

      // Save files to IndexedDB
      for (const file of sampleImages) {
        await saveFile(expId, metadata.experiment_id, 'sample_image', file);
      }
      for (const file of reflectionImages) {
        await saveFile(expId, metadata.experiment_id, 'reflection_image', file);
      }
      for (const file of timelineImages) {
        await saveFile(expId, metadata.experiment_id, 'note_image', file);
      }
      // Save dataset files
      for (const d of datasets) {
        if (d.fileObj) {
          await saveFile(expId, metadata.experiment_id, 'dataset', d.fileObj);
        }
      }

      // Clear draft on successful save
      localStorage.removeItem(`raman-draft-${user.id}`);

      router.push('/');
      router.refresh();
      
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to save experiment');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 relative px-4 sm:px-6 lg:px-8">
      {/* Mesh Background for Form Page */}
      <div className="absolute inset-x-0 -top-24 -bottom-24 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full animate-blob"></div>
        <div className="absolute top-[30%] right-[-10%] w-[45%] h-[45%] bg-secondary-accent/5 blur-[100px] rounded-full animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[10%] left-[15%] w-[40%] h-[40%] bg-tertiary-accent/5 blur-[80px] rounded-full animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 pt-12">
        <div className="md:flex md:items-end md:justify-between mb-16 pb-12 border-b border-white/40">
          <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-left-4 duration-1000">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-accent/20">
              New Session Initiation
            </span>
            <h2 className="text-5xl sm:text-7xl font-black leading-[0.9] text-[#1F2937] sm:truncate tracking-tight">
              Raman <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary-accent">Experiment</span>
            </h2>
            <p className="mt-8 text-xl text-[#6B7280] font-medium max-w-xl">
              Configure your campaign, modular conditions, and session context. <span className="text-accent underline decoration-accent/30 underline-offset-8">All data is local.</span>
            </p>
          </div>
        </div>

      {error && (
        <div className="rounded-xl bg-red-50/50 p-4 mb-6 border border-red-200">
          <h3 className="text-sm font-semibold text-red-800">Error saving session</h3>
          <div className="mt-2 text-sm text-red-700 whitespace-pre-wrap"><p>{error}</p></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Metadata Card */}
        <div className="bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-white rounded-[2.5rem] p-10 mb-10 transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(77,166,255,0.1)]">
          <h3 className="text-2xl font-black leading-none text-[#1F2937] border-b border-white/40 pb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary-accent w-fit">Experiment Overview</h3>
          <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-4 sm:gap-x-6">
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-label">Project Title</label>
              <input required type="text" name="title" value={metadata.title} onChange={handleMetadataChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-label">Date</label>
              <input required type="date" name="date" value={metadata.date} onChange={handleMetadataChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-label">Time</label>
              <input required type="time" name="start_time" step="1" value={metadata.start_time} onChange={handleMetadataChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-label">Lead Researcher</label>
              <input required type="text" name="researcher" value={metadata.researcher} onChange={handleMetadataChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-label">Research Categories (comma separated)</label>
              <input type="text" name="tags" value={metadata.tags} onChange={handleMetadataChange} placeholder="high-pressure, DAC, raman"
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-label">Technique</label>
              <input required type="text" name="technique" value={metadata.technique} onChange={handleMetadataChange} placeholder="Raman Spectroscopy"
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-label">Session Status</label>
              <select name="status" value={metadata.status} onChange={handleMetadataChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white">
                <option value="planned">Planned</option>
                <option value="ongoing">Ongoing / In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-sm font-semibold text-label">Collaborators</label>
              <input type="text" name="collaborators" value={metadata.collaborators} onChange={handleMetadataChange} placeholder="Dr. Smith, Prof. X"
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-sm font-semibold text-label">Lab / System</label>
              <input required type="text" name="lab_system" value={metadata.lab_system} onChange={handleMetadataChange} placeholder="LabRAM HR Evolution"
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div className="sm:col-span-4">
               <label className="block text-sm font-semibold text-label">Short Objective</label>
               <input required type="text" name="objective_short" value={metadata.objective_short} onChange={handleMetadataChange}
                 className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-sm font-semibold text-label">Scientific Motivation / Research Question</label>
              <textarea required rows={3} name="motivation" value={metadata.motivation} onChange={handleMetadataChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-white" />
            </div>
          </div>
        </div>

        {/* Sample Card */}
        <div className="bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-white rounded-[2.5rem] p-10 mb-10 transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(77,166,255,0.1)]">
          <div className="flex justify-between items-center border-b border-white/40 pb-6 mb-8">
            <h3 className="text-2xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary-accent">Sample Information</h3>
          </div>

          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-6">
            <div>
              <label className="block text-sm font-semibold text-label">Sample Name</label>
              <input required={isNewSample} type="text" name="sample_name" value={sample.sample_name} onChange={handleSampleChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-label">Formula</label>
              <input type="text" name="chemical_formula" value={sample.chemical_formula} onChange={handleSampleChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-label">Type</label>
              <select name="sample_type" value={sample.sample_type} onChange={handleSampleChange}
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white">
                <option value="">Select...</option>
                <option value="single crystal">Single Crystal</option>
                <option value="thin film">Thin Film</option>
                <option value="powder">Powder</option>
                <option value="pellet">Pellet</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-label">Dimensions</label>
              <input type="text" name="dimensions" value={sample.dimensions || ''} onChange={handleSampleChange} placeholder="e.g. 2x2x0.5 mm"
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-label">Preparation Notes</label>
              <input type="text" name="preparation_notes" value={sample.preparation_notes || ''} onChange={handleSampleChange} placeholder="e.g. Cleaved in glovebox"
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-label">Mounting, Cell & Storage Notes</label>
              <input type="text" name="mounting_notes" value={sample.mounting_notes || ''} onChange={handleSampleChange} placeholder="e.g. Loaded in symmetric DAC with Argon"
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>
            
            <div className="sm:col-span-3">
               <ImageDropzone images={sampleImages} setImages={setSampleImages} label="Sample Images (Microscope / Loading)" />
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-white rounded-[2.5rem] p-10 mb-10 transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(77,166,255,0.1)]">
          <h3 className="text-2xl font-black leading-none text-[#1F2937] border-b border-white/40 pb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary-accent w-fit">Experimental Setup Modules</h3>
          <p className="text-lg text-[#6B7280] font-medium mt-4 mb-8">Enable the conditional modules relevant for this session to unhide their fields.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <label className="flex items-center space-x-3 bg-white p-3.5 rounded-lg shadow-sm border border-border-custom cursor-pointer hover:border-accent hover:shadow-md transition-all">
              <input type="checkbox" checked={modules.temperature_enabled} onChange={() => toggleModule('temperature_enabled')} className="form-checkbox h-5 w-5 text-accent rounded border-border-custom focus:ring-accent" />
              <span className="text-text-primary font-semibold">Temperature</span>
            </label>
            <label className="flex items-center space-x-3 bg-white p-3.5 rounded-lg shadow-sm border border-border-custom cursor-pointer hover:border-accent hover:shadow-md transition-all">
              <input type="checkbox" checked={modules.pressure_enabled} onChange={() => toggleModule('pressure_enabled')} className="form-checkbox h-5 w-5 text-accent rounded border-border-custom focus:ring-accent" />
              <span className="text-text-primary font-semibold">Pressure</span>
            </label>
            <label className="flex items-center space-x-3 bg-white p-3.5 rounded-lg shadow-sm border border-border-custom cursor-pointer hover:border-accent hover:shadow-md transition-all">
               <input type="checkbox" checked={modules.polarization_enabled} onChange={() => toggleModule('polarization_enabled')} className="form-checkbox h-5 w-5 text-accent rounded border-border-custom focus:ring-accent" />
               <span className="text-text-primary font-semibold">Polarization</span>
            </label>
            <label className="flex items-center space-x-3 bg-white p-3.5 rounded-lg shadow-sm border border-border-custom cursor-pointer hover:bg-slate-50 transition opacity-50">
               <input disabled type="checkbox" className="form-checkbox h-5 w-5 rounded border-border-custom" />
               <span className="text-text-secondary">Mapping (Soon)</span>
            </label>
          </div>

          <div className="space-y-6">
            <InstrumentModule opticsData={opticsData} setOpticsData={setOpticsData} />
            <ConditionModules 
              modules={modules} 
              tempData={tempData} setTempData={setTempData}
              pressureData={pressureData} setPressureData={setPressureData} 
            />
            <PolarizationModule modules={modules} polarData={polarData} setPolarData={setPolarData} />
          </div>
        </div>

        {/* Experimental Datasets */}
        <div className="bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-white rounded-[2.5rem] p-10 mb-10 transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(77,166,255,0.1)]">
           <h3 className="text-2xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary-accent border-b border-white/40 pb-6 mb-8">Attach Spectroscopic Scans</h3>
           <p className="text-lg text-[#6B7280] font-medium mb-8">Upload data files — stored locally in your browser.</p>
           <DatasetUploader datasets={datasets} setDatasets={setDatasets} />
        </div>

        {/* Timeline Notes */}
        <div className="bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-white rounded-[2.5rem] p-10 mb-10 transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(77,166,255,0.1)]">
           <h3 className="text-2xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary-accent border-b border-white/40 pb-6 mb-8">Session Notes & Images</h3>
           <div className="mt-4">
               <TimelineNotes 
                 timeline={timeline} 
                 setTimeline={setTimeline} 
                 researcher={metadata.researcher}
                 timelineImages={timelineImages}
                 setTimelineImages={setTimelineImages}
               />
           </div>
        </div>

        {/* Reflections */}
        <div className="bg-white/70 backdrop-blur-xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-white rounded-[2.5rem] p-10 mb-10 transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(77,166,255,0.1)]">
          <h3 className="text-2xl font-black leading-none text-[#1F2937] border-b border-white/40 pb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary-accent w-fit">Session Reflection</h3>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
               <label className="block text-sm font-semibold text-label">General Setup Details</label>
               <textarea rows={2} name="general_setup_notes" value={reflection.general_setup_notes || ''} onChange={handleReflectionChange}
                 className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">Preliminary Impressions</label>
              <textarea rows={3} name="preliminary_impression" value={reflection.preliminary_impression} onChange={handleReflectionChange}
                className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">Challenges Faced</label>
              <textarea rows={3} name="challenges_faced" value={reflection.challenges_faced} onChange={handleReflectionChange}
                className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">Things That Worked Nicely</label>
              <textarea rows={3} name="things_that_worked_nicely" value={reflection.things_that_worked_nicely || ''} onChange={handleReflectionChange}
                className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">Areas for Improvement Next Time</label>
              <textarea rows={3} name="things_to_improve" value={reflection.things_to_improve || ''} onChange={handleReflectionChange}
                className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-white" />
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-semibold text-label">Final Conclusions</label>
               <textarea rows={4} name="conclusions" value={reflection.conclusions || ''} onChange={handleReflectionChange} placeholder="What did we learn? Does it confirm the research question?"
                 className="mt-1 block w-full rounded-md border-indigo-200 focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-indigo-50/20" />
            </div>
            <div className="md:col-span-2">
               <label className="block text-sm font-semibold text-label">Final Summary</label>
               <textarea rows={3} name="final_summary" value={reflection.final_summary || ''} onChange={handleReflectionChange} placeholder="Brief summary of the entire session..."
                 className="mt-1 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-3 border bg-white" />
            </div>
            <div className="md:col-span-2 mt-2">
               <ImageDropzone images={reflectionImages} setImages={setReflectionImages} label="Final Session Images (e.g. Sample post-measurement)" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-x-6 sticky bottom-8 z-50 bg-white/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] mt-12 animate-in slide-in-from-bottom-8 duration-700">
          <button type="button" onClick={() => router.push('/')}
            className="rounded-xl bg-white/50 py-3.5 px-8 text-sm font-black text-[#1F2937] uppercase tracking-widest border border-white hover:bg-white transition-all">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="rounded-xl bg-gradient-to-r from-accent to-secondary-accent py-3.5 px-10 text-sm font-black text-white uppercase tracking-widest shadow-[0_10px_30px_-5px_rgba(77,166,255,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(77,166,255,0.5)] transform hover:-translate-y-1 transition-all active:scale-95">
            {loading ? 'Saving Session...' : 'Save Raman Session'}
          </button>
        </div>

      </form>
      </div>
    </div>
  );
}
