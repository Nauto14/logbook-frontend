import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* ===== HERO SECTION ===== */}
      <div className="min-h-[85vh] flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#EEF2F6] to-[#E3F2FD] -mt-8 pt-8">
        
        {/* Soft overlay particles/glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[100px] opacity-60 mix-blend-multiply"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-accent/5 blur-[120px] opacity-70 mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] rounded-full bg-tertiary-accent/10 blur-[80px] opacity-40 mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 z-10 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center pt-8 pb-16">
          
          {/* Left Column: Hero Text */}
          <div className="max-w-2xl space-y-8 text-center lg:text-left mx-auto lg:mx-0 order-2 lg:order-1">
            <h1 className="text-5xl sm:text-7xl font-extrabold text-[#1F2937] tracking-tight leading-[1.15]">
              AI Lab Logbook for<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-secondary-accent to-tertiary-accent pb-2 block">Experimental Physics</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-[#6B7280] font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Capture, organize, and recall your experiments with AI. Built specifically for complex research environments.
            </p>
            
            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
              <Link 
                href="/new" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-lg
                           bg-gradient-to-r from-accent to-secondary-accent 
                           shadow-[0_8px_20px_rgba(77,166,255,0.3)] 
                           hover:shadow-[0_12px_25px_rgba(77,166,255,0.4)]
                           hover:-translate-y-1 transform transition-all duration-300"
              >
                Get Started
              </Link>
              {/* Removed "Learn More" per spec */}
            </div>
          </div>

          {/* Right Column: Crystal Lattice Visual */}
          <div className="relative w-full flex justify-center lg:justify-end order-1 lg:order-2 h-[450px] sm:h-[550px] lg:h-[700px] z-10 transition-transform duration-1000 ease-out hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-white/10 mix-blend-overlay pointer-events-none rounded-[100px]"></div>
            
            <img 
              src="/hero-lattice-v2.png" 
              alt="3D Crystal Lattice Spectroscopy Illustration" 
              className="w-full h-full object-cover mix-blend-multiply opacity-90 drop-shadow-[0_0_80px_rgba(77,166,255,0.2)]"
              style={{ 
                // Radial gradient mask to completely soften all outer edges and blend into background
                maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
                WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 75%)'
              }}
            />
          </div>

        </div>
      </div>

      {/* ===== SECTION 1: Why Gravity? ===== */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">Why Gravity?</h2>
              <div className="w-16 h-1 bg-accent rounded-full"></div>
              <p className="text-lg text-text-secondary leading-relaxed">
                Gravity is an AI-assisted lab logbook designed exclusively for experimental physicists.
              </p>
              <p className="text-lg text-text-secondary leading-relaxed">
                It helps researchers organize complex experiments, automatically extract parameters, store instrument data, and recall important historical experimental details instantly using local intelligence.
              </p>
            </div>
            
            {/* Visual Placeholder (A clean layout block) */}
            <div className="relative h-80 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden shadow-sm flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50"></div>
              
              <div className="relative z-10 grid grid-cols-2 gap-4 p-8 w-full h-full">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="h-2 bg-slate-100 rounded-full w-3/4"></div>
                    <div className="h-2 bg-slate-100 rounded-full w-1/2"></div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col justify-between translate-y-8">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                     <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="h-2 bg-slate-100 rounded-full w-full"></div>
                    <div className="h-2 bg-slate-100 rounded-full w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: What Can You Do? ===== */}
      <section className="py-24 bg-slate-50 relative border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight mb-4">What Can You Do With Gravity?</h2>
            <p className="text-lg text-text-secondary">A complete toolkit for managing physical science data.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Log Experiments</h3>
              <p className="text-text-secondary leading-relaxed">
                Record experimental parameters, physical conditions, and observations in a highly structured, easily readable format.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Organize Samples</h3>
              <p className="text-text-secondary leading-relaxed">
                Automatically build a beautiful visual library of your crystals, materials, and compounds tracked across all sessions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">Search Your Research</h3>
              <p className="text-text-secondary leading-relaxed">
                Quickly retrieve past experiments, parameters, and correlated results using the built-in natural language AI assistant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: Designed for Workflows ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl overflow-hidden shadow-2xl relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[80px] mix-blend-screen"></div>
            
            <div className="grid lg:grid-cols-2">
              <div className="p-12 lg:p-16 flex flex-col justify-center text-white z-10">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Designed for Research Workflows</h2>
                <p className="text-lg text-slate-300 leading-relaxed max-w-md">
                  Gravity is built specifically for complex experimental workflows in physics laboratories, helping researchers systematically manage data, track samples over time, and recall exhaustive experimental history efficiently.
                </p>
                
                <div className="mt-10">
                  <Link 
                    href="/new" 
                    className="inline-flex items-center px-6 py-3 rounded-lg font-bold text-slate-900 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Start Logging
                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                </div>
              </div>
              
              {/* Graphic Side */}
              <div className="hidden lg:flex items-center justify-center relative bg-gradient-to-t from-transparent to-white/5 opacity-80 mix-blend-luminosity">
                   <div className="w-full h-full min-h-[400px]" style={{
                     backgroundImage: 'radial-gradient(circle at center, rgba(77, 166, 255, 0.2) 0%, transparent 70%)',
                     backgroundSize: '100% 100%'
                   }}>
                     {/* Decorative grid lines */}
                     <div className="absolute inset-0 z-0" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                     }}></div>
                   </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
