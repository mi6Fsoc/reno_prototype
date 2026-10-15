import React, { useState } from 'react';

interface CaseStudy {
  id: string;
  title: string;
  district: string;
  builtYear: string;
  sqm: number;
  subsidySecured: string;
  co2Reduction: string;
  irrBoost: string;
  image: string;
  summary: string;
  tags: string[];
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'altbau-charlottenburg',
    title: 'Giesebrechtstraße 12',
    district: 'Berlin-Charlottenburg',
    builtYear: '1905 Gründerzeit',
    sqm: 1420,
    subsidySecured: '€375,000',
    co2Reduction: '-71% CO₂',
    irrBoost: '+12.4% IRR',
    image: '/src/assets/images/berlin_altbau_facade_1792074483636.jpg',
    summary: 'Historic stucco facade restoration with interior mineral insulation, wood triple-glazing, and decentralized heat pump switchboard. Preserved heritage monument status while achieving KfW Effizienzhaus 70 standard.',
    tags: ['Monument Protection', 'KfW 261', '14 Units'],
  },
  {
    id: 'plattenbau-friedrichshain',
    title: 'Karl-Marx-Allee Ensemble',
    district: 'Berlin-Friedrichshain',
    builtYear: '1974 Industrial Prefab',
    sqm: 2840,
    subsidySecured: '€680,000',
    co2Reduction: '-64% CO₂',
    irrBoost: '+14.1% IRR',
    image: '/src/assets/images/berlin_plattenbau_retrofit_1792074484532.jpg',
    summary: 'Full-building thermal envelope overhaul with integrated photovoltaic loggia balconies and rooftop retention green roof. Tenant energy bills slashed by €180/month per apartment.',
    tags: ['Solar Balconies', 'KfW 458', '36 Units'],
  },
  {
    id: 'courtyard-kreuzberg',
    title: 'Bergmannkiez Hinterhof Oasis',
    district: 'Berlin-Kreuzberg',
    builtYear: '1912 Mixed-Use',
    sqm: 1950,
    subsidySecured: '€440,000',
    co2Reduction: '-58% CO₂',
    irrBoost: '+10.8% IRR',
    image: '/src/assets/images/berlin_courtyard_modern_1792074485327.jpg',
    summary: 'Transformative inner courtyard greening with geothermal vertical probes, timber frame rear balconies, and central rainwater recycling for multi-generational living.',
    tags: ['Geothermal Heat', 'IBB Greening', '22 Units'],
  },
];

interface CaseStudiesProps {
  onSelectProperty?: (address: string, sqm: number, budget: number, efficiency: string) => void;
}

const CaseStudies: React.FC<CaseStudiesProps> = ({ onSelectProperty }) => {
  const [activeTab, setActiveTab] = useState<string>('altbau-charlottenburg');
  const activeStudy = CASE_STUDIES.find((s) => s.id === activeTab) || CASE_STUDIES[0];

  return (
    <section id="case-studies" className="py-20 border-t border-[#2B251D] relative bg-[#131519]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25211B] border border-[#3E3426] text-[11px] font-mono text-[#FFE8B8] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Realized Berlin Case Studies
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-semibold text-white tracking-tight">
              Tested across Berlin's building stock.
            </h2>
            <p className="mt-2 text-sm sm:text-base font-serif-editorial text-[#FFE8B8]/80 max-w-xl">
              Concrete financial execution, verifiable KfW subsidy payouts, and proven tenant satisfaction in Charlottenburg, Friedrichshain, and Kreuzberg.
            </p>
          </div>

          {/* Interactive Property Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CASE_STUDIES.map((study) => (
              <button
                key={study.id}
                type="button"
                onClick={() => setActiveTab(study.id)}
                className={`px-3 py-2 rounded-[6px] text-xs font-mono transition-all whitespace-nowrap border ${
                  activeTab === study.id
                    ? 'bg-[#2B251D] border-primary text-[#FFE8B8] font-semibold'
                    : 'bg-[#1A1C22] border-[#322A1F] text-zinc-400 hover:text-white'
                }`}
              >
                {study.title}
              </button>
            ))}
          </div>
        </div>

        {/* Marquee Featured Case Study Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-[8px] bg-[#1A1C22] border border-[#322A1F] overflow-hidden p-6 sm:p-8">
          
          {/* Left Column: Visual Asset */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-[6px] overflow-hidden border border-[#3E3426]">
              <img
                src={activeStudy.image}
                alt={activeStudy.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded text-[11px] font-mono text-[#FFE8B8] border border-[#3E3426]">
                {activeStudy.district} · {activeStudy.builtYear}
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/70 backdrop-blur-md px-3 py-1.5 rounded text-[11px] font-mono text-zinc-300 border border-[#322A1F]">
                <span>{activeStudy.sqm} m² GFA</span>
                <span className="text-primary">{activeStudy.subsidySecured} Secured</span>
              </div>
            </div>

            {/* Tags Strip */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {activeStudy.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-[#24201A] border border-[#352D21] text-[11px] font-mono text-[#FFE8B8]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Architectural Dossier & Metrics */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-primary">
                Executive Project Dossier
              </span>
              <h3 className="text-2xl font-display font-semibold text-white mt-1">
                {activeStudy.title}
              </h3>
              <p className="mt-3 text-sm font-serif-editorial text-[#FFE8B8]/90 leading-relaxed">
                {activeStudy.summary}
              </p>
            </div>

            {/* Quantified Metrics Box */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-[6px] bg-[#15171C] border border-[#322A1F]">
              <div>
                <p className="text-[10px] font-mono text-zinc-400">KfW Subsidy</p>
                <p className="text-lg font-display font-bold text-primary mt-0.5">
                  {activeStudy.subsidySecured}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-400">Carbon Abatement</p>
                <p className="text-lg font-display font-bold text-[#FFE8B8] mt-0.5">
                  {activeStudy.co2Reduction}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-zinc-400">IRR Expansion</p>
                <p className="text-lg font-display font-bold text-white mt-0.5">
                  {activeStudy.irrBoost}
                </p>
              </div>
            </div>

            {/* Quick-Load Button into Planner */}
            {onSelectProperty && (
              <button
                type="button"
                onClick={() =>
                  onSelectProperty(
                    activeStudy.title + ', ' + activeStudy.district,
                    activeStudy.sqm,
                    Math.round(activeStudy.sqm * 520),
                    'F'
                  )
                }
                className="w-full py-3 px-4 rounded-[6px] bg-[#2A241C] border border-primary/60 hover:border-primary text-xs font-mono font-medium text-[#FFE8B8] hover:text-white flex items-center justify-center gap-2 transition-colors"
              >
                <i className="fas fa-sliders text-primary"></i>
                Load {activeStudy.title} Into Planner
              </button>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

export default CaseStudies;
