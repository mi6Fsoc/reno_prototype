import React, { useState, useEffect } from 'react';
import { RenovationPlan, PropertyDetails } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from './Button';
import jsPDF from 'jspdf';
import { generateRenovationImage, generateBlueprintImage } from '../services/geminiService';

interface DashboardProps {
  plan: RenovationPlan;
  details: PropertyDetails;
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ plan, details, onReset }) => {
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [phaseImages, setPhaseImages] = useState<{ [key: number]: string }>({});
  const [generatingPhase, setGeneratingPhase] = useState<{ [key: number]: boolean }>({});
  
  // Blueprint State
  const [blueprints, setBlueprints] = useState<{ [key: number]: string }>({});
  const [generatingBlueprint, setGeneratingBlueprint] = useState<{ [key: number]: boolean }>({});

  const [animateCharts, setAnimateCharts] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setAnimateCharts(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleExport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(171, 35, 124); // Primary approximation
    doc.text("Reno | Renovation Plan", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Address: ${details.address}`, 20, 30);
    doc.text(`Est. Cost: €${plan.totalCost.toLocaleString()}`, 20, 38);
    doc.text(`Duration: ${plan.totalDuration} Weeks`, 20, 46);

    // Summary
    doc.setFontSize(14);
    doc.text("Executive Summary", 20, 60);
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(plan.summary, 170);
    doc.text(summaryLines, 20, 70);

    let yPos = 70 + (summaryLines.length * 5) + 10;

    // Phases
    doc.setFontSize(14);
    doc.text("Project Phases", 20, yPos);
    yPos += 10;
    
    plan.phases.forEach((phase, i) => {
        doc.setFontSize(11);
        doc.text(`${i + 1}. ${phase.name} (${phase.durationWeeks} weeks)`, 20, yPos);
        doc.setFontSize(9);
        doc.text(`Est: €${phase.costEstimate.toLocaleString()}`, 150, yPos);
        yPos += 5;
        doc.setTextColor(100);
        const descLines = doc.splitTextToSize(phase.description, 160);
        doc.text(descLines, 25, yPos);
        doc.setTextColor(60);
        yPos += (descLines.length * 4) + 6;
    });

    // Funding
    yPos += 10;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Eligible Funding", 20, yPos);
    yPos += 10;
    
    plan.funding.forEach(fund => {
        doc.setFontSize(11);
        doc.setTextColor(171, 35, 124);
        doc.text(`[${fund.name}] ${fund.amount}`, 20, yPos);
        doc.setTextColor(60);
        yPos += 6;
    });

    doc.save("reno-plan.pdf");
  };

  const checkApiKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            try {
                await window.aistudio.openSelectKey();
                return true;
            } catch (e) {
                console.error("Failed to select key", e);
                return false;
            }
        }
        return true;
    }
    return true; // Assume true if not in AI Studio env or helpers missing
  };

  const handleGenerateImage = async (index: number, description: string) => {
    if (!await checkApiKey()) return;

    setGeneratingPhase(prev => ({ ...prev, [index]: true }));
    try {
        const imageUrl = await generateRenovationImage(description, plan.buildingStyle, imageSize);
        setPhaseImages(prev => ({ ...prev, [index]: imageUrl }));
    } catch (error) {
        console.error("Failed to generate image", error);
        alert("Could not generate image. Please ensure you have a valid paid API key selected.");
    } finally {
        setGeneratingPhase(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleGenerateBlueprint = async (index: number, name: string, description: string) => {
    if (!await checkApiKey()) return;

    setGeneratingBlueprint(prev => ({ ...prev, [index]: true }));
    try {
        const imageUrl = await generateBlueprintImage(name, description, plan.buildingStyle);
        setBlueprints(prev => ({ ...prev, [index]: imageUrl }));
    } catch (error) {
        console.error("Failed to generate blueprint", error);
        alert("Could not generate blueprint.");
    } finally {
        setGeneratingBlueprint(prev => ({ ...prev, [index]: false }));
    }
  };

  const maxCost = Math.max(...plan.phases.map(p => p.costEstimate));

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <p className="text-sm text-muted-foreground">Total Budget</p>
          <p className="text-2xl font-bold text-card-foreground">€{plan.totalCost.toLocaleString()}</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <p className="text-sm text-muted-foreground">Duration</p>
          <p className="text-2xl font-bold text-card-foreground">{plan.totalDuration} Weeks</p>
        </div>
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <p className="text-sm text-muted-foreground">Style Detected</p>
          <p className="text-xl font-bold text-card-foreground capitalize">{plan.buildingStyle}</p>
        </div>
         <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-center">
          <Button onClick={handleExport} variant="outline" className="w-full">
            <i className="fas fa-file-pdf"></i> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visuals & Timeline */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Cost/Timeline Analysis - Animated Bar Chart */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-baseline mb-6">
                   <h3 className="text-lg font-bold text-card-foreground">Construction Cost & Timeline</h3>
                   <span className="text-xs text-muted-foreground">Est. Cost vs Phase</span>
                </div>
                <div className="space-y-5">
                    {plan.phases.map((phase, idx) => {
                        const widthPercentage = (phase.costEstimate / maxCost) * 100;
                        return (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center group">
                                {/* Y-Axis: Labels */}
                                <div className="md:col-span-4 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end md:text-right pr-2">
                                    <span className="font-semibold text-card-foreground text-sm leading-tight flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] md:hidden">{idx+1}</span>
                                      {phase.name}
                                    </span>
                                    <span className="text-muted-foreground text-xs font-mono">{phase.durationWeeks} wks</span>
                                </div>

                                {/* X-Axis: Animated Bar */}
                                <div className="md:col-span-8 relative h-9 bg-secondary/10 rounded-md overflow-hidden flex items-center border border-border/50">
                                    <div 
                                        className="h-full bg-chart-1 opacity-90 rounded-r-sm transition-all duration-[1500ms] ease-out shadow-sm relative group-hover:bg-chart-1/80 group-hover:shadow-md"
                                        style={{ width: animateCharts ? `${widthPercentage}%` : '0%' }}
                                    >
                                    </div>
                                    <span className="absolute left-3 text-xs font-mono font-medium text-foreground z-10 drop-shadow-sm bg-background/30 px-1 rounded backdrop-blur-[1px]">
                                        €{phase.costEstimate.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detailed Phases */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-card-foreground">Phase Details</h3>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground font-medium">Image Quality:</label>
                        <select 
                            className="bg-background border border-input text-foreground text-xs rounded px-2 py-1 focus:ring-2 focus:ring-ring focus:border-input"
                            value={imageSize}
                            onChange={(e) => setImageSize(e.target.value as '1K' | '2K' | '4K')}
                        >
                            <option value="1K">1K (Fast)</option>
                            <option value="2K">2K (High)</option>
                            <option value="4K">4K (Ultra)</option>
                        </select>
                    </div>
                </div>
                <div className="space-y-6">
                    {plan.phases.map((phase, idx) => (
                        <div key={idx} className="border-b border-border last:border-0 pb-6 last:pb-0">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold text-card-foreground">{phase.name}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-2 text-xs font-medium text-muted-foreground mb-3">
                                        <span><i className="far fa-clock"></i> {phase.durationWeeks} weeks</span>
                                        <span><i className="fas fa-euro-sign"></i> {phase.costEstimate.toLocaleString()} est.</span>
                                    </div>
                                    
                                    {/* Image Generation Section */}
                                    <div className="mt-3">
                                        {phaseImages[idx] ? (
                                            <div className="relative rounded-lg overflow-hidden shadow-sm aspect-video group">
                                                <img src={phaseImages[idx]} alt={phase.name} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <a href={phaseImages[idx]} download={`reno-phase-${idx+1}.png`} className="bg-card/90 text-card-foreground px-2 py-1 rounded text-xs font-medium shadow hover:bg-card">
                                                        Download
                                                     </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <Button 
                                                variant="secondary" 
                                                onClick={() => handleGenerateImage(idx, phase.description)}
                                                isLoading={generatingPhase[idx]}
                                                className="text-xs py-2 px-3"
                                            >
                                                <i className="fas fa-image"></i> Visualize Phase ({imageSize})
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Blueprints Section */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                 <h3 className="text-lg font-bold text-card-foreground mb-4">Architectural Blueprints</h3>
                 <p className="text-sm text-muted-foreground mb-6">Generate technical schematic drawings for each construction phase.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.phases.map((phase, idx) => (
                        <div key={idx} className="border border-border rounded-lg p-3 bg-background/50 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-bold text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">{idx + 1}</span>
                                <span className="text-sm font-semibold text-card-foreground truncate">{phase.name}</span>
                            </div>
                            
                            <div className="flex-grow min-h-[160px] bg-secondary/5 rounded-md border border-dashed border-border flex items-center justify-center overflow-hidden relative group">
                                {blueprints[idx] ? (
                                    <>
                                        <img src={blueprints[idx]} alt={`${phase.name} Blueprint`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <a href={blueprints[idx]} download={`blueprint-${idx+1}.png`} className="bg-card/90 text-card-foreground px-2 py-1 rounded text-xs font-medium shadow hover:bg-card">
                                                <i className="fas fa-download"></i>
                                             </a>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <i className="fas fa-drafting-compass text-3xl text-muted-foreground/30 mb-3"></i>
                                        <div className="flex justify-center">
                                            <Button 
                                                variant="outline"
                                                onClick={() => handleGenerateBlueprint(idx, phase.name, phase.description)}
                                                isLoading={generatingBlueprint[idx]}
                                                className="text-[10px] h-8 px-3"
                                            >
                                                Generate Blueprint
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                 </div>
            </div>

        </div>

        {/* Right Column: Financials & ESG */}
        <div className="space-y-8">
            
            {/* ROI Chart */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <h3 className="text-lg font-bold text-card-foreground mb-6">ROI Projection</h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={plan.roiProjection}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="year" fontSize={12} stroke="var(--muted-foreground)" />
                            <YAxis unit="%" fontSize={12} stroke="var(--muted-foreground)" />
                            <Tooltip 
                                contentStyle={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--card-foreground)', boxShadow: 'var(--shadow-lg)' }}
                            />
                            <Line type="monotone" dataKey="value" stroke="var(--chart-2)" strokeWidth={3} dot={{r: 4, fill: 'var(--chart-2)'}} activeDot={{r: 6}} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">Projected cumulative ROI over 10 years</p>
            </div>

            {/* CO2 Savings */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <h3 className="text-lg font-bold text-card-foreground mb-4">CO₂ Impact</h3>
                <div className="space-y-5">
                    {plan.co2Savings.map((item, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-card-foreground font-medium">{item.category}</span>
                                <span className="font-semibold text-primary">{item.savingTons}t saved</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2 mb-1.5">
                                <div 
                                    className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: animateCharts ? `${Math.min((item.savingTons / 10) * 100, 100)}%` : '0%' }}
                                ></div>
                            </div>
                            {item.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Funding Badges */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <h3 className="text-lg font-bold text-card-foreground mb-4"><i className="fas fa-award text-chart-4 mr-2"></i> Eligible Funding</h3>
                <div className="space-y-3">
                    {plan.funding.map((fund, idx) => (
                        <div key={idx} className="bg-muted p-3 rounded-lg border border-border">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-chart-5">{fund.name}</span>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{fund.amount}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{fund.description}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="pt-8 text-center">
                 <button onClick={onReset} className="text-muted-foreground hover:text-primary text-sm underline">Start New Project</button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;