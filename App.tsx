import React, { useState } from 'react';
import { PropertyDetails, RenovationPlan, ImageAsset } from './types';
import Moodboard from './components/Moodboard';
import Button from './components/Button';
import Dashboard from './components/Dashboard';
import { analyzeRenovation } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [details, setDetails] = useState<PropertyDetails>({
    address: '',
    sqm: 500,
    budget: 250000,
    currentEfficiency: 'E'
  });
  const [plan, setPlan] = useState<RenovationPlan | null>(null);

  const handleAnalysis = async () => {
    if (images.length === 0) {
        setError("Please upload at least one image.");
        return;
    }
    if (!details.address) {
        setError("Please enter an address.");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generatedPlan = await analyzeRenovation(details, images);
      setPlan(generatedPlan);
      setStep(3);
    } catch (err) {
      setError("Failed to generate plan. Please try again or check your API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setImages([]);
    setPlan(null);
    setDetails({ address: '', sqm: 500, budget: 250000, currentEfficiency: 'E' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-mono">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xl shadow-sm">R</div>
            <span className="font-bold text-xl text-foreground">Reno</span>
          </div>
          <div className="flex items-center gap-4">
             {step < 3 && <span className="text-sm text-muted-foreground hidden sm:block">Step {step} of 3</span>}
             <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Contact Sales</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {step === 1 && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  Renovate with Confidence
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Upload photos of your Berlin property. AI generates your timeline, ROI, and funding options instantly.
                </p>
              </div>

              <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border space-y-8">
                {/* Form Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg border border-input focus:ring-2 focus:ring-ring focus:border-input transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                            placeholder="e.g. Torstraße 45, Berlin"
                            value={details.address}
                            onChange={(e) => setDetails({...details, address: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Total Floor Area (m²)</label>
                        <input 
                            type="number" 
                            className="w-full px-4 py-2 rounded-lg border border-input focus:ring-2 focus:ring-ring focus:border-input transition-colors bg-background text-foreground"
                            value={details.sqm}
                            onChange={(e) => setDetails({...details, sqm: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Budget Est. (€)</label>
                        <input 
                            type="number" 
                            className="w-full px-4 py-2 rounded-lg border border-input focus:ring-2 focus:ring-ring focus:border-input transition-colors bg-background text-foreground"
                            value={details.budget}
                            onChange={(e) => setDetails({...details, budget: Number(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Current Efficiency</label>
                        <select 
                            className="w-full px-4 py-2 rounded-lg border border-input focus:ring-2 focus:ring-ring focus:border-input transition-colors bg-background text-foreground"
                            value={details.currentEfficiency}
                            onChange={(e) => setDetails({...details, currentEfficiency: e.target.value})}
                        >
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(c => (
                                <option key={c} value={c}>Class {c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Moodboard */}
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Property Photos (Context for AI)</label>
                    <Moodboard images={images} setImages={setImages} />
                </div>

                {error && (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2 border border-destructive/20">
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                )}

                <div className="pt-4">
                    <Button 
                        onClick={handleAnalysis} 
                        isLoading={isLoading} 
                        className="w-full text-lg"
                        disabled={!details.address || images.length === 0}
                    >
                        Generate Plan <i className="fas fa-magic ml-2"></i>
                    </Button>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                        Powered by Gemini 2.5 Flash • No personal data stored
                    </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && plan && (
            <Dashboard plan={plan} details={details} onReset={handleReset} />
          )}

        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="mb-2 font-semibold">Reno</p>
            <p className="text-sm opacity-80">Accelerating sustainable living in Berlin.</p>
            <p className="text-xs mt-8 opacity-50">&copy; 2024 Reno GmbH. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;