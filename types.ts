
export interface HealthReport {
  id: string;
  dogId: string; // Associated dog ID
  date: string;
  score: number; // 1-7 scale (Purina Fecal Score)
  consistency: string;
  color: string;
  findings: string[];
  analysis: string;
  imageUrl: string;
  recommendation: string;
}

export interface DogProfile {
  id: string;
  name: string;
  breed: string;
  avatarSeed: string;
  birthDate?: string;
  weight?: string; // e.g. "15kg"
  customAvatarUrl?: string; // Base64 or URL for custom photo
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
