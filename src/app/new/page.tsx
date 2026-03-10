import Link from 'next/link';

// Array of experiment techniques defined by the user
const techniques = [
  {
    name: "Raman Spectroscopy",
    full_name: "Raman Spectroscopy",
    status: "active",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 20a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    ),
    actionUrl: "/new/raman"
  },
  {
    name: "XAS",
    full_name: "X-ray Absorption Spectroscopy",
    status: "coming_soon"
  },
  {
    name: "REXS",
    full_name: "Resonant Elastic X-ray Scattering",
    status: "coming_soon"
  },
  {
    name: "RIXS",
    full_name: "Resonant Inelastic X-ray Scattering",
    status: "coming_soon"
  },
  {
    name: "INS",
    full_name: "Inelastic Neutron Scattering",
    status: "coming_soon"
  },
  {
    name: "XRD",
    full_name: "X-ray Diffraction",
    status: "coming_soon"
  },
  {
    name: "MuSR",
    full_name: "Muon Spin Rotation",
    status: "coming_soon"
  },
  {
    name: "STEM",
    full_name: "Scanning Transmission Electron Microscopy",
    status: "coming_soon"
  },
  {
    name: "Transport Measurements",
    full_name: "Transport Measurements",
    status: "coming_soon"
  },
  {
    name: "SQUID Magnetometry",
    full_name: "SQUID Magnetometry",
    status: "coming_soon"
  },
  {
    name: "AC Susceptibility",
    full_name: "AC Susceptibility",
    status: "coming_soon"
  },
  {
    name: "Crystal Growth",
    full_name: "Crystal Growth",
    status: "coming_soon"
  }
];

export default function NewSessionSelectionPage() {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-3">Select Experiment Type</h1>
        <p className="text-text-secondary text-lg">Choose the experiment technique to start a new session.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techniques.map((tech, idx) => {
          const isActive = tech.status === 'active';
          
          const CardContent = (
            <div className={`
              h-full rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden
              ${isActive 
                ? 'bg-white border-slate-200 shadow-sm hover:shadow-lg hover:border-accent/40 hover:-translate-y-1 cursor-pointer group' 
                : 'bg-slate-50 border-slate-100 opacity-80 cursor-not-allowed'}
            `}>
              
              {isActive && (
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              )}

              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200/50 text-slate-400'}`}>
                     {tech.icon ? tech.icon : (
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                     )}
                  </div>
                  
                  {!isActive && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFD166]/10 text-[#D9A01C] border border-[#FFD166]/40 uppercase tracking-widest mt-1">
                      Coming Soon
                    </span>
                  )}
                </div>

                <div className="mt-auto">
                  <h3 className={`text-xl font-bold mb-1 ${isActive ? 'text-text-primary group-hover:text-accent transition-colors' : 'text-slate-500'}`}>
                    {tech.name}
                  </h3>
                  {tech.full_name && tech.full_name !== tech.name && (
                    <p className="text-sm text-text-secondary line-clamp-2">
                       {tech.full_name}
                    </p>
                  )}
                </div>
              </div>
              
              {isActive && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-secondary-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              )}
            </div>
          );

          if (isActive && tech.actionUrl) {
            return (
              <Link key={idx} href={tech.actionUrl} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-2xl">
                {CardContent}
              </Link>
            );
          }

          return (
            <div key={idx} title={!isActive ? "This experiment module will be available soon." : ""} className="h-full">
              {CardContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
