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

  // 2. Sample
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
    things_that_worked_nicely: ''
  });

  // 8. Physical Files State
  const [sampleImages, setSampleImages] = useState<File[]>([]);
  const [reflectionImages, setReflectionImages] = useState<File[]>([]);
  const [timelineImages, setTimelineImages] = useState<File[]>([]);

  const handleMetadataChange = (e: any) => setMetadata({ ...metadata, [e.target.name]: e.target.value });
  const handleSampleChange = (e: any) => setSample({ ...sample, [e.target.name]: e.target.value });
  const handleReflectionChange = (e: any) => setReflection({ ...reflection, [e.target.name]: e.target.value });
  const toggleModule = (modName: string) => setModules({ ...modules, [modName]: !modules[modName as keyof typeof modules] });

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

      router.push('/');
      router.refresh();
      
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to save experiment');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">
            New Raman Experiment Session
          </h2>
          <p className="mt-2 text-base text-text-secondary">Configure your campaign, modular conditions, and session context. Data saved locally.</p>
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
        <div className="bg-card-bg shadow-sm border border-border-custom sm:rounded-2xl p-8 transition-colors">
          <h3 className="text-xl font-semibold leading-6 text-text-primary border-b border-border-custom pb-4 text-accent">Experiment Overview</h3>
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
        <div className="bg-card-bg shadow-sm border border-border-custom sm:rounded-2xl p-8 transition-colors">
          <div className="flex justify-between items-center border-b border-border-custom pb-4 mb-6">
            <h3 className="text-xl font-semibold leading-6 text-text-primary text-accent">Sample Information</h3>
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
            
            <div className="sm:col-span-3">
              <label className="block text-sm font-semibold text-label">Mounting, Cell & Storage Notes</label>
              <input type="text" name="mounting_notes" value={sample.mounting_notes || ''} onChange={handleSampleChange} placeholder="e.g. Loaded in symmetric DAC with Argon"
                className="mt-2 block w-full rounded-md border-border-custom focus:border-accent focus:ring-accent text-base text-text-primary p-2.5 border bg-white" />
            </div>
            
            <div className="sm:col-span-3">
               <label className="block text-sm font-semibold text-label mb-2">Sample Images (Microscope / Loading)</label>
               <div className="flex flex-col gap-3">
                 <label className="cursor-pointer text-sm font-medium text-accent hover:text-indigo-800 flex items-center bg-indigo-50/50 px-4 py-2 rounded-md border border-indigo-100 transition-colors w-fit">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Upload Images
                    <input type="file" multiple className="hidden" onChange={(e) => { if(e.target.files) setSampleImages(prev => [...prev, ...Array.from(e.target.files!)]); e.target.value = ''; }} />
                 </label>
                 {sampleImages.length > 0 && (
                   <div className="flex gap-4 flex-wrap mt-2">
                     {sampleImages.map((img, i) => {
                       const objectUrl = URL.createObjectURL(img);
                       return (
                         <div key={i} className="relative group">
                           <img 
                             src={objectUrl} 
                             alt={`Sample upload ${i+1}`} 
                             className="h-24 w-24 object-cover rounded-lg border border-slate-200 shadow-sm transition-transform group-hover:scale-105"
                             onLoad={() => URL.revokeObjectURL(objectUrl)} // Clean up memory
                           />
                           <button 
                             type="button" 
                             onClick={() => setSampleImages(prev => prev.filter((_, idx) => idx !== i))} 
                             className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                           >
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                           </button>
                         </div>
                       );
                     })}
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="bg-slate-50/50 shadow-inner border border-slate-200 sm:rounded-2xl p-8">
          <h3 className="text-xl font-semibold leading-6 text-text-primary border-b border-border-custom pb-4">Experimental Setup Modules</h3>
          <p className="text-base text-text-secondary mt-2 mb-6">Enable the conditional modules relevant for this session to unhide their fields.</p>
          
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
        <div className="bg-card-bg shadow-sm border border-border-custom sm:rounded-2xl p-8">
           <h3 className="text-xl font-semibold leading-6 text-text-primary border-b border-border-custom pb-4">Attach Spectroscopic Scans</h3>
           <p className="text-base text-text-secondary mt-2 mb-6">Upload data files — stored locally in your browser.</p>
           <DatasetUploader datasets={datasets} setDatasets={setDatasets} />
        </div>

        {/* Timeline Notes */}
        <div className="bg-card-bg shadow-sm border border-border-custom sm:rounded-2xl p-8">
           <h3 className="text-xl font-semibold leading-6 text-text-primary border-b border-border-custom pb-4">Session Notes & Images</h3>
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
        <div className="bg-slate-50/50 shadow-sm border border-border-custom sm:rounded-2xl p-8">
          <h3 className="text-xl font-semibold leading-6 text-text-primary border-b border-border-custom pb-4 text-accent">Session Reflection</h3>
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
            <div className="md:col-span-2 mt-2">
               <label className="block text-sm font-semibold text-label mb-2">Final Session Images (e.g. Sample post-measurement)</label>
               <div className="flex flex-col gap-3 mt-2">
                 <label className="cursor-pointer text-sm font-medium text-accent hover:text-indigo-800 flex items-center bg-indigo-50/50 px-4 py-2 rounded-md border border-indigo-100 transition-colors w-fit">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Upload Session Images
                    <input type="file" multiple className="hidden" onChange={(e) => { if(e.target.files) setReflectionImages(prev => [...prev, ...Array.from(e.target.files!)]); e.target.value = ''; }} />
                 </label>
                 {reflectionImages.length > 0 && (
                   <div className="flex gap-4 flex-wrap mt-2">
                     {reflectionImages.map((img, i) => {
                       const objectUrl = URL.createObjectURL(img);
                       return (
                         <div key={i} className="relative group">
                           <img 
                             src={objectUrl} 
                             alt={`Session upload ${i+1}`} 
                             className="h-24 w-24 object-cover rounded-lg border border-slate-200 shadow-sm transition-transform group-hover:scale-105"
                             onLoad={() => URL.revokeObjectURL(objectUrl)} // Clean up memory
                           />
                           <button 
                             type="button" 
                             onClick={() => setReflectionImages(prev => prev.filter((_, idx) => idx !== i))} 
                             className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                           >
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                           </button>
                         </div>
                       );
                     })}
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-x-4 sticky bottom-4 z-10 bg-white/90 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button type="button" onClick={() => router.push('/')}
            className="rounded-lg bg-white py-2.5 px-6 text-sm font-semibold text-text-primary shadow-sm border border-border-custom hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="rounded-lg bg-accent py-2.5 px-8 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors">
            {loading ? 'Saving Session...' : 'Save Raman Session'}
          </button>
        </div>

      </form>
    </div>
  );
}
