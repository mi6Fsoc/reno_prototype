export interface RenovationPhase {
  name: string;
  durationWeeks: number;
  costEstimate: number;
  description: string;
}

export interface RoiMetric {
  year: number;
  value: number; // Accumulated ROI percentage or value
}

export interface Co2Metric {
  category: string;
  savingTons: number;
  description: string;
}

export interface FundingBadge {
  name: string; // e.g., "KfW 261"
  amount: string; // e.g., "Max €150k"
  description: string;
}

export interface RenovationPlan {
  summary: string;
  buildingStyle: string;
  phases: RenovationPhase[];
  roiProjection: RoiMetric[];
  co2Savings: Co2Metric[];
  funding: FundingBadge[];
  totalCost: number;
  totalDuration: number;
}

export interface PropertyDetails {
  address: string;
  sqm: number;
  budget: number;
  currentEfficiency: string;
}

export interface ImageAsset {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
  type: string; // mime type
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}