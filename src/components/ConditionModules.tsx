export function ConditionModules({ modules, tempData, setTempData, pressureData, setPressureData }: any) {
  
  const handleTemp = (e: any) => setTempData({ ...tempData, [e.target.name]: e.target.value });
  const handlePress = (e: any) => setPressureData({ ...pressureData, [e.target.name]: e.target.value });

  return (
    <>
      {modules.temperature_enabled && (
        <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-200 mt-6 animate-in fade-in zoom-in duration-300 shadow-sm">
          <h4 className="text-lg font-semibold text-orange-900 mb-5 border-b border-orange-200/50 pb-2">
            Temperature Module
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold text-label">Start Temp (K)</label>
              <input type="number" step="0.1" name="start_temperature_K" value={tempData.start_temperature_K || ''} onChange={handleTemp} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">End Temp (K)</label>
              <input type="number" step="0.1" name="end_temperature_K" value={tempData.end_temperature_K || ''} onChange={handleTemp} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">Step (K)</label>
              <input type="number" step="0.1" name="temperature_step_K" value={tempData.temperature_step_K || ''} onChange={handleTemp} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">Direction</label>
              <select name="scan_direction" value={tempData.scan_direction || ''} onChange={handleTemp} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent">
                <option value="cooling">Cooling</option>
                <option value="warming">Warming</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {modules.pressure_enabled && (
        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-200 mt-6 animate-in fade-in zoom-in duration-300 shadow-sm">
          <h4 className="text-lg font-semibold text-blue-900 mb-5 border-b border-blue-200/50 pb-2">
            High Pressure Module (DAC)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-label">Start Pressure (GPa)</label>
              <input required type="number" step="0.01" name="start_pressure_GPa" value={pressureData.start_pressure_GPa || ''} onChange={handlePress} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">End Pressure (GPa)</label>
              <input required type="number" step="0.01" name="end_pressure_GPa" value={pressureData.end_pressure_GPa || ''} onChange={handlePress} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">Cell Type</label>
              <input required type="text" name="cell_type" placeholder="e.g. Symmetric DAC" value={pressureData.cell_type || ''} onChange={handlePress} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">Pressure Medium</label>
              <input required type="text" name="pressure_medium" placeholder="e.g. Argon, Ruby" value={pressureData.pressure_medium || ''} onChange={handlePress} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-label">Calibration Method</label>
              <input required type="text" name="pressure_calibration_method" placeholder="e.g. Ruby R1" value={pressureData.pressure_calibration_method || ''} onChange={handlePress} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
            </div>
            
            {/* V2.1 Sample Dimensions Subsection */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 pt-5 border-t border-blue-200/60">
                <h5 className="font-semibold text-blue-900 mb-4 block text-base flex items-center">
                   <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                   Sample Dimensions (Inside DAC)
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/60 p-4 rounded-lg border border-blue-100">
                    <div>
                        <label className="block text-sm font-medium text-label">Length (µm)</label>
                        <input type="number" step="1" name="sample_length_um" value={pressureData.sample_length_um || ''} onChange={handlePress} className="mt-1 w-full rounded border-border-custom text-sm text-text-primary p-2 border bg-white focus:border-accent focus:ring-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-label">Width (µm)</label>
                        <input type="number" step="1" name="sample_width_um" value={pressureData.sample_width_um || ''} onChange={handlePress} className="mt-1 w-full rounded border-border-custom text-sm text-text-primary p-2 border bg-white focus:border-accent focus:ring-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-label">Thickness (µm)</label>
                        <input type="number" step="1" name="sample_thickness_um" value={pressureData.sample_thickness_um || ''} onChange={handlePress} className="mt-1 w-full rounded border-border-custom text-sm text-text-primary p-2 border bg-white focus:border-accent focus:ring-accent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-label">Shape</label>
                        <input type="text" name="sample_shape" placeholder="e.g. rectangular" value={pressureData.sample_shape || ''} onChange={handlePress} className="mt-1 w-full rounded border-border-custom text-sm text-text-primary p-2 border bg-white focus:border-accent focus:ring-accent" />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-label">Dimensions Notes</label>
                        <input type="text" name="sample_dimensions_notes" placeholder="e.g. Cleaved perfectly, loaded flat" value={pressureData.sample_dimensions_notes || ''} onChange={handlePress} className="mt-1 w-full rounded border-border-custom text-sm text-text-primary p-2 border bg-white focus:border-accent focus:ring-accent" />
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
