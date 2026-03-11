import { useCallback, useEffect } from "react";
import { ImagePreview } from "./ImagePreview";

interface ImageDropzoneProps {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  label: string;
}

export function ImageDropzone({ images, setImages, label }: ImageDropzoneProps) {
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setImages(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  }, [setImages]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Basic check: only capture if focus is not in an input, or if user is interacting with this area
      // To simplify: we add it globally, but only if they paste image data
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const pFiles = Array.from(e.clipboardData.files).filter(f => f.type.startsWith('image/'));
        if (pFiles.length > 0) {
           setImages(prev => [...prev, ...pFiles]);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [setImages]);

  return (
    <div className="flex flex-col gap-3 mt-2">
       <label className="block text-sm font-semibold text-label mb-2">{label}</label>
       <div 
         onDrop={onDrop}
         onDragOver={onDragOver}
         className="border-2 border-dashed border-indigo-200 rounded-xl p-6 flex flex-col items-center justify-center bg-indigo-50/20 hover:bg-indigo-50/50 transition-colors cursor-pointer w-full text-center"
       >
         <input 
           type="file" 
           multiple 
           accept="image/*"
           className="hidden" 
           id={`file-upload-${label.replace(/\s+/g, '-')}`}
           onChange={(e) => { 
             if(e.target.files) setImages(prev => [...prev, ...Array.from(e.target.files!)]); 
             e.target.value = ''; 
           }} 
         />
         <label htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`} className="cursor-pointer text-indigo-600 font-medium hover:text-indigo-800 flex items-center mb-2">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Click to upload, drag and drop, or Ctrl+V to paste
         </label>
         <p className="text-xs text-slate-400">PNG, JPG, GIF up to 10MB</p>
       </div>
       
       {images.length > 0 && (
         <div className="flex gap-4 flex-wrap mt-4 bg-white p-4 border border-slate-100 rounded-xl">
           {images.map((img, i) => (
             <div key={i} className="relative group">
               <ImagePreview 
                 file={img} 
                 alt={`Uploaded image ${i+1}`} 
                 className="h-28 w-28 object-cover rounded-lg border border-slate-200 shadow-sm transition-transform group-hover:scale-105"
               />
               <button 
                 type="button" 
                 onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} 
                 title="Delete Image"
                 className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 z-10"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
             </div>
           ))}
         </div>
       )}
    </div>
  );
}
