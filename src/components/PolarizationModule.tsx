export function PolarizationModule({ modules, polarData, setPolarData }: any) {
  const options = ["XX", "XY", "X'X'", "X'Y'", "RR", "RL", "LR", "LL", "Custom"];
  
  const handleToggle = (opt: string) => {
    let current = polarData.selected_polarizations ? polarData.selected_polarizations.split(',').filter(Boolean) : [];
    if (current.includes(opt)) {
      current = current.filter((x: string) => x !== opt);
    } else {
      current.push(opt);
    }
    setPolarData({ ...polarData, selected_polarizations: current.join(',') });
  };

  const currentSelection = polarData.selected_polarizations ? polarData.selected_polarizations.split(',').filter(Boolean) : [];

  if (!modules.polarization_enabled) return null;

  return (
    <div className="bg-purple-50/50 p-6 rounded-xl border border-purple-200 mt-6 animate-in fade-in zoom-in duration-300 shadow-sm">
      <h4 className="text-lg font-semibold text-purple-900 mb-5 border-b border-purple-200/50 pb-2 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        Polarization Config
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-label mb-2">Selected Geometries</label>
          <div className="flex flex-wrap gap-2">
            {options.map(opt => {
              const active = currentSelection.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleToggle(opt)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    active ? 'bg-purple-600 text-white border-purple-600 shadow-sm' : 'bg-white text-text-secondary border-border-custom hover:border-purple-300 hover:text-purple-700'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
        
        {currentSelection.includes('Custom') && (
          <div className="md:col-span-2 animate-in slide-in-from-top-2">
            <label className="block text-sm font-semibold text-label">Custom Polarization</label>
            <input type="text" name="custom_polarization_optional" placeholder="e.g. HH, VV, Cross" value={polarData.custom_polarization_optional || ''} onChange={(e) => setPolarData({...polarData, custom_polarization_optional: e.target.value})} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-label">Crystal Orientation Reference</label>
          <textarea required rows={2} name="crystal_orientation_reference" placeholder="e.g. c-axis along z, laser incident on ab plane" value={polarData.crystal_orientation_reference || ''} onChange={(e) => setPolarData({...polarData, crystal_orientation_reference: e.target.value})} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent resize-none"></textarea>
        </div>
        <div>
          <label className="block text-sm font-semibold text-label">Alignment Notes</label>
          <textarea rows={2} name="alignment_notes" placeholder="e.g. Birefringence checked, max intensity verified" value={polarData.alignment_notes || ''} onChange={(e) => setPolarData({...polarData, alignment_notes: e.target.value})} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent resize-none"></textarea>
        </div>
      </div>
    </div>
  );
}
