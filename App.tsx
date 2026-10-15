import React, { useState } from 'react';
import { PropertyDetails, RenovationPlan, ImageAsset } from './types';
import Moodboard from './components/Moodboard';
import Button from './components/Button';
import Dashboard from './components/Dashboard';
import PricingComparison from './components/PricingComparison';
import CaseStudies from './components/CaseStudies';
import InquiryModal from './components/InquiryModal';
import { analyzeRenovation } from './services/geminiService';

const PRESET_PROPERTIES = [
  {
    name: 'Giesebrechtstr. 12, Charlottenburg',
    label: '1905 Altbau Stucco',
    sqm: 1420,
    budget: 740000,
    currentEfficiency: 'F',
    imgUrl: '/src/assets/images/berlin_altbau_facade_1792074483636.jpg',
  },
  {
    name: 'Karl-Marx-Allee 84, Friedrichshain',
    label: '1974 Plattenbau Prefab',
    sqm: 2840,
    budget: 1350000,
    currentEfficiency: 'G',
    imgUrl: '/src/assets/images/berlin_plattenbau_retrofit_1792074484532.jpg',
  },
  {
    name: 'Bergmannstraße 28, Kreuzberg',
    label: '1912 Mixed-Use Courtyard',
    sqm: 1950,
    budget: 920000,
    currentEfficiency: 'E',
    imgUrl: '/src/assets/images/berlin_courtyard_modern_1792074485327.jpg',
  },
];

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [details, setDetails] = useState<PropertyDetails>({
    address: 'Giesebrechtstraße 12, 10629 Berlin',
    sqm: 1420,
    budget: 740000,
    currentEfficiency: 'F',
  });
  const [plan, setPlan] = useState<RenovationPlan | null>(null);

  // Modal State
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState('Portfolio Retrofit');

  const handleApplyPreset = (preset: typeof PRESET_PROPERTIES[0]) => {
    setDetails({
      address: preset.name,
      sqm: preset.sqm,
      budget: preset.budget,
      currentEfficiency: preset.currentEfficiency,
    });

    // Attach sample photo if images empty
    if (images.length === 0) {
      setImages([
        {
          id: 'preset-' + Math.random().toString(36).substring(2, 7),
          file: new File([], `${preset.label}.jpg`, { type: 'image/jpeg' }),
          previewUrl: preset.imgUrl,
          base64: '',
          type: 'image/jpeg',
        },
      ]);
    }
  };

  const handleSelectCaseStudyProperty = (
    address: string,
    sqm: number,
    budget: number,
    efficiency: string
  ) => {
    setDetails({ address, sqm, budget, currentEfficiency: efficiency });
    const plannerEl = document.getElementById('planner-form');
    if (plannerEl) {
      plannerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAnalysis = async () => {
    if (!details.address) {
      setError('Please enter a property address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generatedPlan = await analyzeRenovation(details, images);
      setPlan(generatedPlan);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setPlan(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openInquiryModal = (planName = 'Portfolio Retrofit') => {
    setSelectedPlanForModal(planName);
    setIsInquiryModalOpen(true);
  };

  const scrollToPlanner = () => {
    if (step === 3) {
      setStep(1);
    }
    setTimeout(() => {
      const el = document.getElementById('planner-form');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-white selection:bg-primary selection:text-primary-foreground font-sans">
      
      {/* Top Bar Contract: 1-line wordmark - 4-5 single line links - 1 primary action */}
      <header className="sticky top-0 z-40 bg-[#15171C]/90 backdrop-blur-md border-b border-[#2B251D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          
          {/* Zone 1: Single element brand wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
          >
            <div className="w-8 h-8 rounded-[6px] bg-primary text-[#15171C] flex items-center justify-center font-display font-bold text-lg shadow-[0_0_12px_rgba(185,138,69,0.3)]">
              R
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-[#FFE8B8] transition-colors">
              Reno
            </span>
          </a>

          {/* Zone 2: 4–5 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-mono font-medium text-zinc-400">
            <a href="#overview" className="hover:text-[#FFE8B8] transition-colors whitespace-nowrap shrink-0">
              Platform
            </a>
            <button
              onClick={scrollToPlanner}
              className="hover:text-[#FFE8B8] transition-colors whitespace-nowrap shrink-0 text-left"
            >
              Planner
            </button>
            <a href="#case-studies" className="hover:text-[#FFE8B8] transition-colors whitespace-nowrap shrink-0">
              Case Studies
            </a>
            <a href="#pricing" className="hover:text-[#FFE8B8] transition-colors whitespace-nowrap shrink-0">
              Pricing & Plans
            </a>
            <button
              onClick={() => openInquiryModal('Direct Consultation')}
              className="hover:text-[#FFE8B8] transition-colors whitespace-nowrap shrink-0 text-left"
            >
              Consulting Desk
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={scrollToPlanner}
              variant="primary"
              size="sm"
              className="text-xs font-mono"
            >
              Launch Planner <i className="fas fa-arrow-right text-[10px] ml-1"></i>
            </Button>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow">
        
        {step === 1 ? (
          <div>
            
            {/* Hero Section (Matching Auralis first-screen composition & density) */}
            <section id="overview" className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden paper-grid">
              
              {/* Subtle ambient lighting */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                  
                  {/* Loved by / Editorial kicker */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#221D17] border border-[#3E3426] text-[11px] font-mono text-[#FFE8B8] mb-6 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Loved by 120+ Berlin property funds & private owners
                  </div>

                  {/* Display Headline */}
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-semibold text-white tracking-tight leading-[1.06] text-balance">
                    Build seamless renovation plans with intelligent precision.
                  </h1>

                  {/* Editorial Subtitle in Instrument Serif */}
                  <p className="mt-6 text-lg sm:text-xl md:text-2xl font-serif-editorial text-[#FFE8B8]/90 max-w-3xl mx-auto leading-relaxed">
                    Transform chaotic Berlin multifamily retrofits, complex KfW subsidy regulations, and decarbonization timelines into unified, audit-ready roadmaps.
                  </p>

                  {/* Hero CTAs */}
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                    <Button
                      onClick={scrollToPlanner}
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto text-sm font-mono"
                    >
                      Configure Asset Retrofit <i className="fas fa-arrow-down text-xs ml-1.5"></i>
                    </Button>
                    <button
                      onClick={() => {
                        const el = document.getElementById('case-studies');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-[8px] bg-[#1E2027] border border-[#322A1F] hover:border-primary text-sm font-mono text-[#FFE8B8] hover:text-white transition-colors"
                    >
                      Review Berlin Proof Cases
                    </button>
                  </div>

                </div>

                {/* Hero Proof Metrics Strip */}
                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-[8px] bg-[#1A1C22]/90 border border-[#322A1F] backdrop-blur-sm max-w-5xl mx-auto">
                  <div className="border-r border-[#2B2D35] last:border-0 pr-4">
                    <p className="text-2xl sm:text-3xl font-display font-bold text-primary tabular-nums">
                      €380,000
                    </p>
                    <p className="text-xs font-mono text-zinc-400 mt-1">
                      Avg. KfW subsidy secured / asset
                    </p>
                  </div>
                  <div className="border-r border-[#2B2D35] md:last:border-0 pr-4">
                    <p className="text-2xl sm:text-3xl font-display font-bold text-[#FFE8B8] tabular-nums">
                      -64% CO₂
                    </p>
                    <p className="text-xs font-mono text-zinc-400 mt-1">
                      Primary energy cut (GEG 2024)
                    </p>
                  </div>
                  <div className="border-r border-[#2B2D35] last:border-0 pr-4">
                    <p className="text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                      +11.8%
                    </p>
                    <p className="text-xs font-mono text-zinc-400 mt-1">
                      Unlevered IRR expansion
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-display font-bold text-primary tabular-nums">
                      14 Days
                    </p>
                    <p className="text-xs font-mono text-zinc-400 mt-1">
                      Fast contractor tender package
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* Interactive Reno Planner Engine Section */}
            <section id="planner-form" className="py-16 md:py-24 border-t border-[#2B251D] relative">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Planner Lead-in */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25211B] border border-[#3E3426] text-[11px] font-mono text-[#FFE8B8] mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    AI Architectural Intelligence
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-display font-semibold text-white tracking-tight">
                    Audit your Berlin property now.
                  </h2>
                  <p className="mt-2 text-sm sm:text-base font-serif-editorial text-[#FFE8B8]/80 max-w-xl mx-auto">
                    Input your property parameters or select a representative Berlin typology to simulate timelines, cashflows, and statutory subsidies.
                  </p>
                </div>

                {/* 1-Click Typology Preset Switcher */}
                <div className="mb-6 p-4 rounded-[8px] bg-[#181A20] border border-[#2B251D]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                      Representative Berlin Benchmarks
                    </span>
                    <span className="text-[11px] font-mono text-primary">1-click populate</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PRESET_PROPERTIES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`p-3 rounded-[6px] text-left border transition-all flex items-center gap-3 ${
                          details.address === preset.name
                            ? 'bg-[#29231B] border-primary shadow-sm'
                            : 'bg-[#1F2229] border-[#322A1F] hover:border-[#4B3E2D]'
                        }`}
                      >
                        <img
                          src={preset.imgUrl}
                          alt={preset.label}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-[4px] object-cover shrink-0 border border-[#443828]"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-display font-semibold text-white truncate">
                            {preset.label}
                          </p>
                          <p className="text-[11px] font-mono text-zinc-400 truncate">
                            {preset.sqm} m² · Class {preset.currentEfficiency}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Interactive Form Card */}
                <div className="bg-[#1A1C22] p-6 sm:p-8 md:p-10 rounded-[8px] border border-[#322A1F] shadow-xl space-y-8">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Address Field */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                        Property Address & Cadastral Location (Berlin)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={details.address}
                          onChange={(e) => setDetails({ ...details, address: e.target.value })}
                          placeholder="e.g. Torstraße 45, 10119 Berlin-Mitte"
                          className="w-full pl-10 pr-4 py-3 rounded-[6px] bg-[#14151A] border border-[#322A1F] focus:border-primary focus:outline-none text-sm font-mono text-white placeholder:text-zinc-600 transition-colors"
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                          <i className="fas fa-location-dot"></i>
                        </div>
                      </div>
                    </div>

                    {/* Total Floor Area */}
                    <div>
                      <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                        Gross Floor Area (GFA / m²)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={50}
                          max={50000}
                          value={details.sqm}
                          onChange={(e) => setDetails({ ...details, sqm: Number(e.target.value) })}
                          className="w-full pl-10 pr-4 py-3 rounded-[6px] bg-[#14151A] border border-[#322A1F] focus:border-primary focus:outline-none text-sm font-mono text-white transition-colors"
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">
                          m²
                        </div>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 mt-1">
                        Est. ~{Math.max(1, Math.round(details.sqm / 65))} residential units
                      </p>
                    </div>

                    {/* Investment Budget Est */}
                    <div>
                      <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                        Target Capex Budget (€)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step={10000}
                          value={details.budget}
                          onChange={(e) => setDetails({ ...details, budget: Number(e.target.value) })}
                          className="w-full pl-10 pr-4 py-3 rounded-[6px] bg-[#14151A] border border-[#322A1F] focus:border-primary focus:outline-none text-sm font-mono text-white transition-colors"
                        />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-mono">
                          €
                        </div>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 mt-1">
                        €{Math.round(details.budget / (details.sqm || 1))} / m² capex allocation
                      </p>
                    </div>

                    {/* Current Efficiency Class */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                        Current Energy Performance Certificate (Energieausweis)
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((rating) => {
                          const isSelected = details.currentEfficiency === rating;
                          return (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setDetails({ ...details, currentEfficiency: rating })}
                              className={`py-2 px-3 rounded-[6px] text-xs font-mono font-bold transition-all border ${
                                isSelected
                                  ? 'bg-primary text-[#15171C] border-primary shadow-sm scale-105'
                                  : 'bg-[#15171C] border-[#2A2D35] text-zinc-300 hover:border-[#3E3426]'
                              }`}
                            >
                              Class {rating}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Moodboard Photos Component */}
                  <div>
                    <label className="block text-xs font-mono text-zinc-300 mb-2">
                      Property Elevation Photos (Architectural Context)
                    </label>
                    <Moodboard images={images} setImages={setImages} />
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <div className="p-3.5 bg-red-950/60 border border-red-800/80 rounded-[6px] text-xs font-mono text-red-200 flex items-center gap-2">
                      <i className="fas fa-circle-exclamation text-red-400"></i>
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit CTA */}
                  <div className="pt-2">
                    <Button
                      onClick={handleAnalysis}
                      isLoading={isLoading}
                      variant="primary"
                      size="lg"
                      className="w-full text-sm font-mono tracking-wide"
                      disabled={!details.address}
                    >
                      Generate Institutional Renovation Plan
                      <i className="fas fa-wand-magic-sparkles ml-2 text-xs"></i>
                    </Button>
                    <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-zinc-500 mt-4">
                      <span>Certified German Energy Codes (GEG 2024)</span>
                      <span>·</span>
                      <span>DIN V 18599 Verified</span>
                      <span>·</span>
                      <span>No PII Retained</span>
                    </div>
                  </div>

                </div>

              </div>
            </section>

            {/* Realized Berlin Case Studies */}
            <CaseStudies onSelectProperty={handleSelectCaseStudyProperty} />

            {/* Auralis Clean Pricing & Plan Comparison Section */}
            <PricingComparison onSelectPlan={openInquiryModal} />

            {/* Architectural Assurance Banner */}
            <section className="py-16 bg-[#16181D] border-t border-[#2B251D]">
              <div className="max-w-5xl mx-auto px-4 text-center">
                <h3 className="text-2xl sm:text-3xl font-display font-semibold text-white">
                  Ready to audit your multifamily portfolio?
                </h3>
                <p className="mt-2 text-sm sm:text-base font-serif-editorial text-[#FFE8B8]/90 max-w-xl mx-auto">
                  Our Berlin-based team of structural engineers, energy auditors, and subsidy lawyers prepares institutional-grade dossiers within 48 hours.
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <Button
                    onClick={() => openInquiryModal('Direct Consultation')}
                    variant="primary"
                    size="md"
                    className="text-xs font-mono"
                  >
                    Schedule Property Consultation
                  </Button>
                </div>
              </div>
            </section>

          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {plan && (
              <Dashboard
                plan={plan}
                details={details}
                onReset={handleReset}
                onRequestConsultation={() => openInquiryModal(`Property Dossier: ${details.address}`)}
              />
            )}
          </div>
        )}

      </main>

      {/* Refined Dark Paper Footer */}
      <footer className="bg-[#111216] border-t border-[#22252C] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#22252C]">
            
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-[4px] bg-primary text-[#15171C] flex items-center justify-center font-display font-bold text-sm">
                  R
                </div>
                <span className="font-display font-bold text-lg text-white">Reno</span>
              </div>
              <p className="text-xs font-serif-editorial text-[#FFE8B8]/70 max-w-sm leading-relaxed">
                Accelerating sustainable multifamily retrofits and KfW subsidy execution for institutional investors and building owners across Berlin.
              </p>
              <p className="text-[11px] font-mono text-zinc-500 mt-4">
                Krausenstraße 9–10, 10117 Berlin-Mitte · Registered with AG Charlottenburg HRB 241982
              </p>
            </div>

            <div>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">Capabilities</p>
              <ul className="space-y-2 text-xs font-mono text-zinc-400">
                <li><a href="#overview" className="hover:text-primary transition-colors">KfW 261 Calculation</a></li>
                <li><a href="#overview" className="hover:text-primary transition-colors">Photovoltaic Feasibility</a></li>
                <li><a href="#overview" className="hover:text-primary transition-colors">Tenant Apportionment §559</a></li>
                <li><a href="#overview" className="hover:text-primary transition-colors">DIN V 18599 Modeling</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">Advisory</p>
              <ul className="space-y-2 text-xs font-mono text-zinc-400">
                <li>
                  <button onClick={() => openInquiryModal('Contact Sales')} className="hover:text-primary transition-colors text-left">
                    Contact Advisory Desk
                  </button>
                </li>
                <li>
                  <button onClick={() => openInquiryModal('iSFP Roadmaps')} className="hover:text-primary transition-colors text-left">
                    iSFP Roadmaps
                  </button>
                </li>
                <li>
                  <button onClick={() => openInquiryModal('Engineer Certification')} className="hover:text-primary transition-colors text-left">
                    DENA Certification
                  </button>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-primary transition-colors">
                    Institutional Pricing
                  </a>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-500 gap-4">
            <p>&copy; 2026 Reno Technologies GmbH. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Datenschutz</span>
              <span>·</span>
              <span>Impressum</span>
              <span>·</span>
              <span>AGB (Allgemeine Geschäftsbedingungen)</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Inquiry & Consultation Booking Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        selectedPlanName={selectedPlanForModal}
        propertyAddress={details.address}
      />

    </div>
  );
};

export default App;