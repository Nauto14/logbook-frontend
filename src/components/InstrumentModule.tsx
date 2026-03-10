export function InstrumentModule({ opticsData, setOpticsData }: any) {
  const handleChange = (e: any) => setOpticsData({ ...opticsData, [e.target.name]: e.target.value });

  return (
    <div className="bg-card-bg p-8 rounded-xl border border-border-custom shadow-sm mb-6">
      <h3 className="text-xl font-semibold leading-6 text-text-primary border-b border-border-custom pb-3 mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        Raman Optics Configuration
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-semibold text-label">Spectrometer</label>
          <input type="text" name="spectrometer" value={opticsData.spectrometer || ''} onChange={handleChange} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-label">Laser &lambda; (nm)</label>
          <input type="number" step="0.1" name="laser_wavelength_nm" value={opticsData.laser_wavelength_nm || ''} onChange={handleChange} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-label">Objective</label>
          <input type="text" name="objective" value={opticsData.objective || ''} onChange={handleChange} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-label">Grating (g/mm)</label>
          <input type="text" name="grating" value={opticsData.grating || ''} onChange={handleChange} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-label">Slit Size (&mu;m)</label>
          <input type="text" name="slit_size" placeholder="Optional" value={opticsData.slit_size || ''} onChange={handleChange} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-label">Spectral Range (cm⁻¹)</label>
          <input type="text" name="spectral_range_cm_1" placeholder="e.g. 100-3000" value={opticsData.spectral_range_cm_1 || ''} onChange={handleChange} className="mt-1 w-full rounded-md border-border-custom text-base text-text-primary p-2.5 border bg-white focus:border-accent focus:ring-accent" />
        </div>
        <div className="col-span-1 md:col-span-2">
            <p className="text-sm italic text-text-secondary mt-1">Note: Integration time and accumulations are set per dataset during upload.</p>
        </div>
      </div>
    </div>
  );
}
