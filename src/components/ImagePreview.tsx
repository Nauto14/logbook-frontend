'use client';

import { useState, useEffect } from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface ImagePreviewProps {
  file: File | Blob;
  className?: string;
  alt?: string;
}

/**
 * Reusable component to display a thumbnail for a File or Blob.
 * Handles URL.createObjectURL and ensures URL.revokeObjectURL is called on unmount.
 * Supports click-to-zoom using react-medium-image-zoom.
 */
export function ImagePreview({ file, className = "h-24 w-24 object-cover rounded-lg border border-slate-200 shadow-sm", alt }: ImagePreviewProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!url) return <div className={className + " bg-slate-100 animate-pulse"} />;

  return (
    <Zoom>
      <img 
        src={url} 
        alt={alt || "Image preview"} 
        className={className}
      />
    </Zoom>
  );
}
