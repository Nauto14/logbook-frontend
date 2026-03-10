'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getExperiments, getFilesForExperiment } from '@/lib/experimentStore';
import type { ExperimentRecord, FileRecord } from '@/lib/db';

interface SampleSummary {
  sample_name: string;
  chemical_formula: string;
  sample_type: string;
  experimentCount: number;
  recentExperimentId: string;
  coverImageBlob?: Blob;
}

export default function SamplesLibrary() {
  const { user } = useAuth();
  const [samples, setSamples] = useState<SampleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadSamples() {
      if (!user) return;
      try {
        const exps = await getExperiments(String(user.id));
        
        // Group by sample name
        const sampleMap = new Map<string, SampleSummary>();
        
        for (const exp of exps) {
          if (!exp.sample?.sample_name) continue;
          
          const name = exp.sample.sample_name.trim();
          if (!sampleMap.has(name)) {
            sampleMap.set(name, {
              sample_name: name,
              chemical_formula: exp.sample.chemical_formula || '',
              sample_type: exp.sample.sample_type || 'Unknown Type',
              experimentCount: 1,
              recentExperimentId: exp.experiment_id,
            });
            
            // Try to fetch a sample image if one isn't attached yet
            if (exp.id) {
              const files = await getFilesForExperiment(exp.id);
              const sampleImg = files.find(f => f.category === 'sample_image');
              if (sampleImg?.blob) {
                const summary = sampleMap.get(name)!;
                summary.coverImageBlob = sampleImg.blob;
              }
            }
          } else {
            const summary = sampleMap.get(name)!;
            summary.experimentCount += 1;
            
            // Still try to find an image if we don't have one
            if (!summary.coverImageBlob && exp.id) {
              const files = await getFilesForExperiment(exp.id);
              const sampleImg = files.find(f => f.category === 'sample_image');
              if (sampleImg?.blob) {
                summary.coverImageBlob = sampleImg.blob;
              }
            }
          }
        }
        
        const sortedSamples = Array.from(sampleMap.values())
            .sort((a,b) => b.experimentCount - a.experimentCount);
            
        setSamples(sortedSamples);
        
        // Generate Object URLs
        const generatedUrls: Record<string, string> = {};
        for (const s of sortedSamples) {
          if (s.coverImageBlob) {
            generatedUrls[s.sample_name] = URL.createObjectURL(s.coverImageBlob);
          }
        }
        setImageUrls(generatedUrls);
        
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load samples');
      } finally {
        setLoading(false);
      }
    }
    
    loadSamples();
    
    return () => {
      // Cleanup Object URLs on unmount
      Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="md:flex md:items-center md:justify-between mb-8 pb-4 border-b border-border-custom">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-bold leading-7 text-text-primary sm:truncate sm:tracking-tight">
            Samples Library
          </h2>
          <p className="mt-2 text-base text-text-secondary">
            Visual index of all materials measured across your sessions.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24">
           <svg className="animate-spin mx-auto h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-6 border border-red-200">
           <h3 className="text-base font-semibold text-red-800">Error loading samples</h3>
           <div className="mt-2 text-sm text-red-700"><p>{error}</p></div>
        </div>
      ) : samples.length === 0 ? (
        <div className="text-center rounded-2xl border-2 border-dashed border-border-custom bg-white py-20 px-6">
           <h3 className="mt-2 text-base font-semibold text-text-primary">No samples logged</h3>
           <p className="mt-2 text-sm text-text-secondary">Any samples you document in your experiments will summarize here.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
           {samples.map((sample) => (
             <div key={sample.sample_name} className="relative group overflow-hidden rounded-2xl border border-border-custom bg-white shadow-sm hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1 transition-all duration-300 flex flex-col">
               
               {/* Image Header */}
               <div className="w-full h-48 bg-app-bg border-b border-border-custom relative overflow-hidden flex items-center justify-center">
                 {imageUrls[sample.sample_name] ? (
                   <img 
                      src={imageUrls[sample.sample_name]} 
                      alt={sample.sample_name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform" 
                   />
                 ) : (
                   <div className="flex flex-col items-center justify-center text-text-muted">
                     <svg className="w-12 h-12 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                     <span className="text-xs font-medium tracking-wide uppercase">No Image Logged</span>
                   </div>
                 )}
                 <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-slate-200/50 flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-accent"></div>
                   <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">{sample.experimentCount} Sessions</span>
                 </div>
               </div>

               {/* Meta Body */}
               <div className="px-5 py-5 flex flex-col flex-1">
                 <h3 className="text-lg font-bold text-text-primary mb-1">{sample.sample_name}</h3>
                 <p className="text-sm font-semibold text-secondary-accent mb-4">{sample.chemical_formula || sample.sample_type}</p>
                 
                 <div className="mt-auto">
                   <Link href={`/experiment/${sample.recentExperimentId}`} className="inline-flex w-full items-center justify-center rounded-lg bg-app-bg border border-border-custom px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-slate-100 transition-colors">
                     View Last Measurement
                   </Link>
                 </div>
               </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
