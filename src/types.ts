export interface AirQualityData {
  id: string;
  timestamp: Date;
  city: string;
  pm25: number;
  pm10: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  smogLevel: SmogLevel;
  aqi: number;
}

export interface SmogLevel {
  level: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  value: number; // 0-5 for logistic regression
  color: string;
  description: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  rocCurve: { fpr: number; tpr: number }[];
}

export interface PredictionInput {
  pm25: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
}

export interface LogisticRegressionModel {
  weights: number[];
  bias: number;
  trained: boolean;
}