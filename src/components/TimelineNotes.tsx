import { ImagePreview } from './ImagePreview';

export function TimelineNotes({ timeline, setTimeline, researcher, timelineImages = [], setTimelineImages = () => {} }: any) {
  
  const addEntry = () => {
    setTimeline([
      ...timeline, 
      {
        entry_id: `TL-${Date.now()}`,
        timestamp: new Date().toISOString().slice(0, 19),
        author: researcher || 'Researcher',
        entry_type: 'Observation',
        text: '',
        image_attachments: ''
      }
    ]);
  };

  const updateEntry = (index: number, field: string, value: string) => {
    const newTl = [...timeline];
    newTl[index] = { ...newTl[index], [field]: value };
    setTimeline(newTl);
  }

  const removeEntry = (index: number) => {
    if (timeline.length === 1) return;
    const newTl = [...timeline];
    newTl.splice(index, 1);
    setTimeline(newTl);
  }

  const handleImageUpload = (index: number, e: any) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Convert FileList to Array
    const filesArray = Array.from(e.target.files) as File[];
    
    // Add to physical files state (in parent)
    setTimelineImages((prev: File[]) => [...prev, ...filesArray]);

    // Add string names to the timeline entry payload so the UI knows what was attached to *this* note
    const fileNames = filesArray.map(f => f.name);
    const newTl = [...timeline];
    const currentImgs = newTl[index].image_attachments ? newTl[index].image_attachments.split(',').filter(Boolean) : [];
    
    newTl[index] = { 
      ...newTl[index], 
      image_attachments: [...currentImgs, ...fileNames].join(',') 
    };
    
    setTimeline(newTl);
  }

  const removeAttachedImage = (index: number, imgName: string) => {
    // Remove from text representation in this specific note
    const newTl = [...timeline];
    const currentImgs = newTl[index].image_attachments.split(',').filter((x: string) => x !== imgName);
    newTl[index] = { ...newTl[index], image_attachments: currentImgs.join(',') };
    setTimeline(newTl);

    // Also remove from physical files array in parent
    setTimelineImages((prev: File[]) => prev.filter(f => f.name !== imgName));
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-text-secondary">Log time-stamped notes, errors, and observations during the experiment session.</p>
        <button type="button" onClick={addEntry} className="text-sm font-semibold text-accent hover:text-white bg-indigo-50 hover:bg-accent px-4 py-2 rounded-md transition-colors flex items-center shadow-sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Note Entry
        </button>
      </div>

      <div className="space-y-6 border-l-[3px] border-border-custom pl-6 ml-3">
        {timeline.map((entry: any, index: number) => {
          const attachments = entry.image_attachments ? entry.image_attachments.split(',').filter(Boolean) : [];
          return (
          <div key={entry.entry_id} className="relative bg-card-bg border border-border-custom p-5 rounded-xl shadow-sm group transition-all hover:border-slate-300">
             
            {/* Timeline dot */}
            <div className="absolute w-4 h-4 bg-accent rounded-full -left-[35px] top-6 border-[3px] border-card-bg shadow-sm"></div>
            
            <div className="flex justify-between items-start mb-4 gap-4">
               
               <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="text-[11px] font-bold text-label uppercase tracking-wider mb-1 block">Time</label>
                    <input type="datetime-local" step="1" value={entry.timestamp} onChange={(e) => updateEntry(index, 'timestamp', e.target.value)} 
                           className="w-full text-base border border-border-custom rounded-md focus:ring-accent focus:border-accent p-2 bg-white text-text-primary shadow-sm" />
                 </div>
                 <div>
                    <label className="text-[11px] font-bold text-label uppercase tracking-wider mb-1 block">Type</label>
                    <select value={entry.entry_type} onChange={(e) => updateEntry(index, 'entry_type', e.target.value)} 
                           className="w-full text-base border border-border-custom rounded-md focus:ring-accent focus:border-accent p-2 bg-white text-text-primary shadow-sm">
                        <option value="Preparation">Preparation</option>
                        <option value="Observation">Observation</option>
                        <option value="Issue">Issue</option>
                        <option value="Improvement Idea">Improvement Idea</option>
                        <option value="Success">Success</option>
                        <option value="Post-analysis">Post-analysis</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[11px] font-bold text-label uppercase tracking-wider mb-1 block">Author</label>
                    <input type="text" value={entry.author} onChange={(e) => updateEntry(index, 'author', e.target.value)} 
                           className="w-full text-base border border-border-custom rounded-md focus:ring-accent focus:border-accent p-2 bg-white text-text-primary shadow-sm" />
                 </div>
               </div>

               <button type="button" onClick={() => removeEntry(index)} className="text-slate-400 hover:text-red-500 p-2 mt-4 opacity-30 group-hover:opacity-100 transition-opacity bg-slate-50 rounded-md hover:bg-red-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
               </button>
            </div>
            
            <textarea rows={3} placeholder="Log your observations..." value={entry.text} onChange={(e) => updateEntry(index, 'text', e.target.value)} 
                      className="w-full border-border-custom rounded-md shadow-sm focus:border-accent focus:ring-accent text-base p-3 resize-y bg-white text-text-primary" />
            
            {/* Attachment Area */}
            <div className="mt-4 border-t border-border-custom pt-4">
               <div className="flex items-center gap-4">
                 <label className="cursor-pointer text-sm font-medium text-accent hover:text-indigo-800 flex items-center bg-indigo-50/50 px-3 py-1.5 rounded border border-indigo-100 transition-colors">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Attach Image
                    <input type="file" multiple className="hidden" onChange={(e) => handleImageUpload(index, e)} />
                 </label>
                  {attachments.length > 0 && (
                    <div className="flex gap-2 flex-wrap overflow-hidden">
                      {attachments.map((imgName: string, i: number) => {
                        // Find the actual File object in timelineImages state
                        const fileObj = timelineImages.find((f: File) => f.name === imgName);
                        return (
                          <div key={i} className="inline-block relative group/img">
                            {fileObj ? (
                              <ImagePreview 
                                file={fileObj} 
                                alt={imgName} 
                                className="h-10 w-10 rounded border border-slate-200 object-cover shadow-sm" 
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] text-slate-400 overflow-hidden" title={imgName}>
                                {imgName.split('.').pop()?.toUpperCase() || 'FILE'}
                              </div>
                            )}
                            <button onClick={() => removeAttachedImage(index, imgName)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover/img:opacity-100 shadow-sm border border-white">×</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
               </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
