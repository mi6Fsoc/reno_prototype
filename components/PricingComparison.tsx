import React, { useState } from 'react';
import Button from './Button';

interface PricingComparisonProps {
  onSelectPlan: (planName: string) => void;
}

const PricingComparison: React.FC<PricingComparisonProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'single' | 'annual'>('single');

  const plans = [
    {
      id: 'single',
      name: 'Single Asset Audit',
      badge: null,
      price: billingCycle === 'single' ? '€1,450' : '€1,190',
      period: billingCycle === 'single' ? 'per building' : 'per building / billed annually',
      description: 'Ideal for private multifamily owners seeking instant KfW subsidy clarity, energy certificates, and contractor-ready tender roadmaps.',
      highlight: false,
      features: [
        'Single building 3D digital twin & photorealistic AI phase renders',
        'KfW 261 & 458 German subsidy calculation & application checklist',
        '10-year cumulative ROI & cash flow expansion model',
        'DIN V 18599 energy balance & primary CO2 decarbonization curve',
        'Official PDF export ready for banking & loan committee presentation',
        'Standard email support (48h turnaround)',
      ],
      cta: 'Audit Single Asset',
      ctaVariant: 'outline' as const,
    },
    {
      id: 'portfolio',
      name: 'Portfolio Retrofit',
      badge: 'Recommended',
      price: billingCycle === 'single' ? '€3,800' : '€3,200',
      period: billingCycle === 'single' ? 'per quarter' : 'per quarter / billed annually',
      description: 'For active Berlin property investors and family offices managing 3 to 15 assets requiring coordinated tenant apportionment and tender staging.',
      highlight: true,
      features: [
        'Up to 10 buildings managed concurrently in unified workspace',
        'Complete iSFP (individueller Sanierungsfahrplan) documentation',
        'Statutory tenant rent modernization apportionment calculator (§ 559 BGB)',
        'Priority contractor trade allocation & Berlin artisan price benchmarks',
        'High-resolution 4K architectural phase renders & blueprints',
        'Dedicated senior Berlin renovation civil engineer liaison',
        'Instant live parameter adjustment & scenario modeling',
      ],
      cta: 'Choose Portfolio Plan',
      ctaVariant: 'primary' as const,
    },
    {
      id: 'institutional',
      name: 'Institutional Capital',
      badge: 'Enterprise',
      price: 'Custom',
      period: 'tailored portfolio SLA',
      description: 'Engineered for real estate investment trusts (REITs), private equity funds, and municipal housing corporations (Wohnungsbaugesellschaften).',
      highlight: false,
      features: [
        'Unlimited building portfolio scanning & GIS rooftop solar audits',
        'Direct REST API access & ERP integration (SAP, RealEstate Core)',
        'Full ESG Taxonomy & SFDR Article 8/9 sustainability reporting dossier',
        'Custom contractor framework agreements & tendering platform',
        'On-site drone elevation scans & thermographic validation partner network',
        'Custom legal & heritage monument compliance (Denkmalschutz) advisory',
      ],
      cta: 'Contact Advisory Desk',
      ctaVariant: 'secondary' as const,
    },
  ];

  return (
    <section id="pricing" className="py-20 border-t border-[#2B251D] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25211B] border border-[#3E3426] text-[11px] font-mono text-[#FFE8B8] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Transparent Institutional Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-white tracking-tight">
            Predictable investment in certainty.
          </h2>
          <p className="mt-4 text-base sm:text-lg font-serif-editorial text-[#FFE8B8]/90 max-w-2xl mx-auto">
            From single Gründerzeit Altbau properties to institutional multifamily holdings across Berlin, unlock guaranteed KfW subsidies and accelerated capital returns.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-8 inline-flex items-center p-1 bg-[#1A1C22] rounded-[8px] border border-[#322A1F]">
            <button
              type="button"
              onClick={() => setBillingCycle('single')}
              className={`px-4 py-1.5 text-xs font-mono font-medium rounded-[6px] transition-all whitespace-nowrap ${
                billingCycle === 'single'
                  ? 'bg-primary text-[#15171C] font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Standard Engagement
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 text-xs font-mono font-medium rounded-[6px] transition-all whitespace-nowrap flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-primary text-[#15171C] font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Annual Retainer</span>
              <span className="text-[10px] bg-[#15171C] text-primary px-1.5 py-0.2 rounded font-mono">
                Save 15%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                relative flex flex-col rounded-[8px] p-6 sm:p-8 transition-all duration-300
                ${
                  plan.highlight
                    ? 'bg-[#221D17] border-2 border-primary shadow-[0_8px_32px_rgba(185,138,69,0.18)]'
                    : 'bg-[#1A1C22] border border-[#322A1F] hover:border-[#4B3E2D]'
                }
              `}
            >
              {/* Highlight Tag */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-[#15171C] px-3 py-0.5 rounded-full text-[11px] font-mono font-semibold tracking-wide uppercase">
                  {plan.badge}
                </div>
              )}

              {/* Title & Description */}
              <div className="mb-6">
                <h3 className="text-xl font-display font-semibold text-white">{plan.name}</h3>
                <p className="text-xs font-serif-editorial text-[#FFE8B8]/80 mt-2 min-h-[48px] leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Pricing Display */}
              <div className="mb-6 pb-6 border-b border-[#322A1F]">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">{plan.period}</span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="flex-grow space-y-3 mb-8">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">
                  Included Capabilities
                </span>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <span className="text-primary mt-0.5 shrink-0 text-sm">
                      <i className="fas fa-check-circle"></i>
                    </span>
                    <span className="leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <Button
                variant={plan.ctaVariant}
                onClick={() => onSelectPlan(plan.name)}
                className="w-full text-xs font-mono py-3"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* Advisory Trust Strip */}
        <div className="mt-12 p-6 rounded-[8px] bg-[#181A20] border border-[#322A1F] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#25211B] border border-[#3E3426] flex items-center justify-center text-primary shrink-0">
              <i className="fas fa-shield-halved text-base"></i>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Full Baustein BAFA & KfW Guarantee</h4>
              <p className="text-xs font-mono text-zinc-400">
                All digital roadmaps are prepared by certified DENA energy efficiency experts in Berlin.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectPlan('Energy Advisory Q&A')}
            className="text-xs font-mono text-[#FFE8B8] hover:text-white underline underline-offset-4 whitespace-nowrap"
          >
            Review Certification Credentials →
          </button>
        </div>

      </div>
    </section>
  );
};

export default PricingComparison;
