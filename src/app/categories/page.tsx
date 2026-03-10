'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getExperiments } from '@/lib/experimentStore';
import type { ExperimentRecord } from '@/lib/db';

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Record<string, ExperimentRecord[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAndGroupExperiments() {
      if (!user) return;
      try {
        const data = await getExperiments(String(user.id));
        const grouped: Record<string, ExperimentRecord[]> = {};

        data.forEach(exp => {
          if (exp.tags) {
            const tagsList = exp.tags.split(',').map(tag => tag.trim()).filter(Boolean);
            tagsList.forEach(tag => {
              if (!grouped[tag]) grouped[tag] = [];
              grouped[tag].push(exp);
            });
          } else {
            // Group uncategorized experiments 
            if (!grouped['Uncategorized']) grouped['Uncategorized'] = [];
            grouped['Uncategorized'].push(exp);
          }
        });

        // Sort tags alphabetically
        const sortedGroups: Record<string, ExperimentRecord[]> = {};
        Object.keys(grouped).sort().forEach(key => {
          // Sort the experiments inside each tag by recency
          sortedGroups[key] = grouped[key].sort((a,b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        });

        setCategories(sortedGroups);
        const keys = Object.keys(sortedGroups);
        if (keys.length > 0) setSelectedCategory(keys[0]);
        
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    }
    fetchAndGroupExperiments();
  }, [user]);

  const activeExperiments = selectedCategory ? categories[selectedCategory] : [];

  return (
    <div className="max-w-7xl mx-auto pb-12 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar: Category List */}
      <div className="w-full md:w-64 lg:w-80 flex-shrink-0">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Research Categories</h2>
        
        {loading ? (
           <div className="animate-pulse space-y-3">
             {[1,2,3,4].map(i => <div key={i} className="h-10 bg-slate-200 rounded-lg"></div>)}
           </div>
        ) : error ? (
           <div className="text-red-500 text-sm">{error}</div>
        ) : Object.keys(categories).length === 0 ? (
           <p className="text-text-secondary text-sm">No categories found. Add tags to your experiments to see them here.</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(categories).map(([category, exps]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm border
                  ${selectedCategory === category 
                    ? 'bg-accent/10 border-accent/20 text-accent shadow-sm' 
                    : 'bg-white border-transparent text-text-secondary hover:bg-slate-50 hover:border-slate-200'}`}
              >
                <span className="truncate pr-2">{category}</span>
                <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold
                  ${selectedCategory === category ? 'bg-accent text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {exps.length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content: Experiment List */}
      <div className="flex-1 min-w-0">
        {selectedCategory && (
          <div className="bg-white rounded-2xl border border-border-custom shadow-sm overflow-hidden mb-6">
             <div className="px-6 py-5 border-b border-border-custom bg-slate-50/50 flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                     <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                     {selectedCategory}
                   </h3>
                   <p className="text-sm text-text-secondary mt-1">Showing {activeExperiments.length} session{activeExperiments.length !== 1 ? 's' : ''}</p>
                </div>
             </div>
             
             <ul className="divide-y divide-border-custom">
               {activeExperiments.map((exp) => (
                  <li key={exp.experiment_id} className="hover:bg-slate-50 transition-colors">
                     <Link href={`/experiment/${exp.experiment_id}`} className="block px-6 py-5">
                        <div className="flex items-center justify-between mb-2">
                           <p className="text-lg font-bold text-accent truncate group-hover:underline">
                             {exp.title || 'Untitled Session'}
                           </p>
                           <div className="ml-2 flex flex-shrink-0">
                             <p className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-text-secondary border border-slate-200">
                               {exp.date}
                             </p>
                           </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                           <div className="sm:flex">
                             <p className="flex items-center text-sm text-text-secondary">
                               <svg className="mr-1.5 h-4 w-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                               </svg>
                               {exp.technique}
                             </p>
                             <p className="mt-2 flex items-center text-sm text-text-secondary sm:mt-0 sm:ml-6">
                               <svg className="mr-1.5 h-4 w-4 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                               </svg>
                               {exp.sample?.sample_name || 'No Sample'}
                             </p>
                           </div>
                        </div>
                        <p className="mt-3 text-sm text-text-muted line-clamp-2 leading-relaxed">{exp.objective_short}</p>
                     </Link>
                  </li>
               ))}
             </ul>
          </div>
        )}
      </div>
    </div>
  );
}
