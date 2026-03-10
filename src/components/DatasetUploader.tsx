'use client';

import { useState } from 'react';

export function DatasetUploader({ datasets, setDatasets }: any) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const processFiles = (files: FileList) => {
    setUploading(true);
    // In a real app we'd upload these via FormData to the backend.
    // For MVP frontend we mock the fast upload & metadata extraction
    
    setTimeout(() => {
       const newDatasets = Array.from(files).map((f) => ({
          dataset_id: `DS-${Math.floor(Math.random() * 10000)}`,
          run_name: f.name.replace(/\.[^/.]+$/, ""),
          file_name: f.name,
          file_type: f.name.split('.').pop() || 'unknown',
          quality_flag: 'review',
          fileObj: f
       }));
       
       setDatasets([...datasets, ...newDatasets]);
       setUploading(false);
    }, 800);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFiles(e.dataTransfer.files);
  };

  const handleChange = (e: any) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) processFiles(e.target.files);
  };
  
  const removeDataset = (id: string) => {
     setDatasets(datasets.filter((d:any) => d.dataset_id !== id));
  }
  
  const updateDataset = (id: string, field: string, val: string) => {
     setDatasets(datasets.map((d:any) => d.dataset_id === id ? { ...d, [field]: val } : d));
  }

  return (
    <div className="space-y-6">
      <div 
         onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
         className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50'}`}
      >
         <input type="file" multiple onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
         <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
         <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
             <span className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                <span>Upload a spectroscopic profile</span>
             </span>
             <p className="pl-1">or drag and drop</p>
         </div>
         <p className="text-xs leading-5 text-slate-500">TXT, CSV, DPT, SPC up to 50MB</p>
         
         {uploading && (
           <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center backdrop-blur-sm">
             <div className="flex items-center space-x-2 text-indigo-600 font-medium">
               <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               <span>Processing files...</span>
             </div>
           </div>
         )}
      </div>

      {datasets.length > 0 && (
        <div className="space-y-4 mt-6">
           <h4 className="text-sm font-semibold text-label border-b border-border-custom pb-2">Uploaded Datasets</h4>
           {datasets.map((ds: any) => (
              <div key={ds.dataset_id} className="bg-card-bg border border-border-custom rounded-xl p-5 shadow-sm relative transition hover:border-accent/40">
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <input type="text" placeholder="Run Name" value={ds.run_name || ''} onChange={(e) => updateDataset(ds.dataset_id, 'run_name', e.target.value)}
                            className="font-semibold text-text-primary border-b border-transparent hover:border-slate-300 focus:border-accent focus:outline-none focus:ring-0 bg-transparent px-1 py-0.5 text-lg" />
                     <p className="text-xs text-text-secondary mt-1 ml-1 font-mono">{ds.file_name}</p>
                   </div>
                   <button type="button" onClick={() => removeDataset(ds.dataset_id)} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                   </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                   <div>
                     <label className="block text-[11px] font-semibold uppercase tracking-wider text-label mb-1">Group</label>
                     <input type="text" placeholder="e.g. Temp Series" value={ds.dataset_group_name || ''} onChange={(e) => updateDataset(ds.dataset_id, 'dataset_group_name', e.target.value)} className="w-full text-sm border border-border-custom rounded-md p-1.5 focus:border-accent focus:ring-accent" />
                   </div>
                   <div>
                     <label className="block text-[11px] font-semibold uppercase tracking-wider text-label mb-1">Time (s)</label>
                     <input type="number" step="0.1" value={ds.integration_time_s || ''} onChange={(e) => updateDataset(ds.dataset_id, 'integration_time_s', e.target.value)} className="w-full text-sm border border-border-custom rounded-md p-1.5 focus:border-accent focus:ring-accent" />
                   </div>
                   <div>
                     <label className="block text-[11px] font-semibold uppercase tracking-wider text-label mb-1">Accums</label>
                     <input type="number" step="1" value={ds.accumulations || ''} onChange={(e) => updateDataset(ds.dataset_id, 'accumulations', e.target.value)} className="w-full text-sm border border-border-custom rounded-md p-1.5 focus:border-accent focus:ring-accent" />
                   </div>
                   <div>
                     <label className="block text-[11px] font-semibold uppercase tracking-wider text-label mb-1">Power (mW)</label>
                     <input type="number" step="0.1" value={ds.laser_power_mW || ''} onChange={(e) => updateDataset(ds.dataset_id, 'laser_power_mW', e.target.value)} className="w-full text-sm border border-border-custom rounded-md p-1.5 focus:border-accent focus:ring-accent" />
                   </div>
                   <div>
                     <label className="block text-[11px] font-semibold uppercase tracking-wider text-label mb-1">Polarization</label>
                     <input type="text" placeholder="e.g. XX" value={ds.polarization || ''} onChange={(e) => updateDataset(ds.dataset_id, 'polarization', e.target.value)} className="w-full text-sm border border-border-custom rounded-md p-1.5 focus:border-accent focus:ring-accent" />
                   </div>
                   <div>
                     <label className="block text-[11px] font-semibold uppercase tracking-wider text-label mb-1">Temp (K)</label>
                     <input type="number" step="0.1" value={ds.temperature_K || ''} onChange={(e) => updateDataset(ds.dataset_id, 'temperature_K', e.target.value)} className="w-full text-sm border border-border-custom rounded-md p-1.5 focus:border-accent focus:ring-accent" />
                   </div>
                   <div>
                     <label className="block text-[11px] font-semibold uppercase tracking-wider text-label mb-1">Press (GPa)</label>
                     <input type="number" step="0.01" value={ds.pressure_GPa || ''} onChange={(e) => updateDataset(ds.dataset_id, 'pressure_GPa', e.target.value)} className="w-full text-sm border border-border-custom rounded-md p-1.5 focus:border-accent focus:ring-accent" />
                   </div>
                   <div className="lg:col-span-2">
                     <label className="block text-[11px] font-semibold uppercase tracking-wider text-label mb-1">Comments</label>
                     <input type="text" value={ds.comments || ''} onChange={(e) => updateDataset(ds.dataset_id, 'comments', e.target.value)} className="w-full text-sm border border-border-custom rounded-md p-1.5 focus:border-accent focus:ring-accent" />
                   </div>
                   <div>
                     <label className="block text-[11px] font-semibold uppercase tracking-wider text-label mb-1">Quality</label>
                     <select value={ds.quality_flag || 'review'} onChange={(e) => updateDataset(ds.dataset_id, 'quality_flag', e.target.value)} className="w-full text-sm border border-border-custom bg-white rounded-md p-1.5 focus:border-accent focus:ring-accent cursor-pointer">
                        <option value="good">Good</option>
                        <option value="review">Needs Review</option>
                        <option value="bad">Bad Data</option>
                        <option value="calibration">Calibration</option>
                     </select>
                   </div>
                </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
}
