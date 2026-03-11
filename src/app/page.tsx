import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col bg-gradient-to-b from-white via-blue-50/50 via-indigo-50/30 via-slate-50/20 to-white min-h-screen">
      {/* ===== HERO SECTION ===== */}
      <div className="min-h-[90vh] flex items-center justify-center relative overflow-hidden -mt-8 pt-12 pb-20">
        
        {/* Cinematic Mesh Gradient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/20 blur-[120px] opacity-60 mix-blend-multiply animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-accent/10 blur-[140px] opacity-70 mix-blend-multiply animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-tertiary-accent/15 blur-[100px] opacity-40 mix-blend-multiply animate-blob animation-delay-4000"></div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4d8cff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 z-10 grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          
          {/* Left Column: Hero Text */}
          <div className="max-w-2xl space-y-10 text-center lg:text-left mx-auto lg:mx-0 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-6 border border-accent/20">
                Precision Research Tools
              </span>
              <h1 className="text-6xl sm:text-8xl font-black text-[#1F2937] tracking-tight leading-[0.95]">
                AI Lab <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-secondary-accent to-tertiary-accent">Logbook</span>
              </h1>
            </div>
            
            <p className="text-xl sm:text-2xl text-[#4B5563] font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-90">
              The modern standard for experimental physics. Seamlessly capture data, organize complex samples, and recall results with local intelligence.
            </p>
            
            {/* Action Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
              <Link 
                href="/new" 
                className="w-full sm:w-auto px-10 py-5 rounded-2xl text-white font-black text-xl
                           bg-gradient-to-r from-accent to-secondary-accent 
                           shadow-[0_10px_30px_-5px_rgba(77,166,255,0.4)] 
                           hover:shadow-[0_15px_35px_-5px_rgba(77,166,255,0.5)]
                           hover:-translate-y-1.5 transform transition-all duration-300 active:scale-95"
              >
                Start New Session
              </Link>
              <Link 
                href="/experiments" 
                className="w-full sm:w-auto px-10 py-5 rounded-2xl text-accent font-black text-xl
                           bg-white border-2 border-accent/10 hover:border-accent/30
                           shadow-sm hover:shadow-xl hover:shadow-accent/5
                           hover:-translate-y-1 transform transition-all duration-300"
              >
                Dashboard
              </Link>
            </div>
          </div>

          {/* Right Column: Abstract Physics Visualization */}
          <div className="relative w-full flex justify-center lg:justify-end h-[450px] sm:h-[550px] lg:h-[650px] z-10 animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="relative w-full h-full max-w-lg">
               {/* 3D-feeling glass card */}
               <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl rounded-[4rem] border border-white/30 shadow-2xl rotate-3"></div>
               
               <div className="absolute inset-0 flex items-center justify-center -rotate-3">
                 <div className="relative w-64 h-64">
                    {/* Pulsing Core */}
                    <div className="absolute inset-0 bg-gradient-to-br from-accent to-secondary-accent rounded-full blur-[60px] opacity-40 animate-pulse"></div>
                    <div className="absolute inset-4 bg-white/20 backdrop-blur-xl rounded-full border border-white/40 shadow-inner flex items-center justify-center">
                       <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform cursor-pointer">
                          <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                       </div>
                    </div>
                    
                    {/* Orbiting Elements */}
                    <div className="absolute inset-[-40px] border border-accent/20 rounded-full animate-spin-slow">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/80 backdrop-blur-md rounded-lg shadow-lg border border-white/50"></div>
                    </div>
                    <div className="absolute inset-[-100px] border border-secondary-accent/10 rounded-full animate-reverse-spin-slow">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-secondary-accent/40 backdrop-blur-md rounded-full border border-white/20"></div>
                    </div>
                 </div>
               </div>
               
               {/* Floating Stats / Widgets */}
               <div className="absolute top-20 -right-10 px-6 py-4 bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl animate-float">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">System Load</p>
                  <p className="text-xl font-black text-[#1F2937]">98.2% Nominal</p>
               </div>
               <div className="absolute bottom-20 -left-10 px-6 py-4 bg-white/70 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl animate-float animation-delay-2000">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Data Capture</p>
                  <p className="text-xl font-black text-accent">Real-time Opt-In</p>
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* ===== SECTION 1: Why Gravity? ===== */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-accent/20">
                Foundational Intelligence
              </span>
              <h2 className="text-5xl md:text-7xl font-black text-[#1F2937] tracking-tight leading-[0.95]">Why Gravity?</h2>
              <div className="w-24 h-2.5 bg-accent rounded-full mb-10 shadow-[0_5px_15px_-5px_rgba(77,166,255,0.4)]"></div>
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
      <section className="py-32 bg-slate-50 relative overflow-hidden border-y border-slate-200/60">
        {/* Subtle mesh background for feature section */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-blue-100/30 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-100/30 blur-[120px] rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-4xl md:text-5xl font-black text-[#1F2937] tracking-tight mb-6">Built for Modern Physics</h2>
            <p className="text-xl text-[#6B7280] font-medium leading-relaxed">Everything you need to manage complex research data with unprecedented efficiency.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="group bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-accent flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-[#1F2937] mb-4">Structured Logging</h3>
              <p className="text-[#6B7280] font-medium leading-relaxed pb-4">
                Record experimental parameters and physical conditions in high-fidelity schemas designed for physics.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-2xl hover:shadow-secondary-accent/5 transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-secondary-accent flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                 <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-[#1F2937] mb-4">Sample Library</h3>
              <p className="text-[#6B7280] font-medium leading-relaxed pb-4">
                Automatically organize material data and crystal images into a curated library accessible across time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:shadow-2xl hover:shadow-emerald-accent/5 transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-[#1F2937] mb-4">Semantic Search</h3>
              <p className="text-[#6B7280] font-medium leading-relaxed pb-4">
                Zero friction retrieval of past data. Find that one laser setting from 3 months ago in seconds.
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
              <div className="p-16 lg:p-24 flex flex-col justify-center text-white z-10">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-white/20 w-fit">
                  Enterprise Grade
                </span>
                <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-10 leading-[0.95]">Designed for <br /><span className="text-accent">Workflows</span></h2>
                <p className="text-xl text-slate-300 leading-relaxed max-w-md font-medium">
                  Gravity is built specifically for complex experimental physics laboratories, helping researchers systematically manage data, track samples over time, and recall exhaustive history.
                </p>
                
                <div className="mt-12">
                  <Link 
                    href="/new" 
                    className="inline-flex items-center px-10 py-5 rounded-2xl font-black text-slate-900 bg-white hover:bg-slate-50 transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.15)] hover:shadow-[0_25px_50px_-10px_rgba(255,255,255,0.2)] hover:-translate-y-1"
                  >
                    Start Logging
                    <svg className="ml-3 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
