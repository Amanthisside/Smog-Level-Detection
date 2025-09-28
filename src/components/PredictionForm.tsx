import React, { useState } from 'react';
import { PredictionInput } from '../types';
import { smogPredictor } from '../utils/logisticRegression';
import { Wind, Thermometer, Droplets, Eye, Gauge, CloudSnow } from 'lucide-react';

interface PredictionFormProps {
  modelTrained: boolean;
}

const smogLevelColors = ['#10B981', '#F59E0B', '#F97316', '#EF4444', '#7C3AED', '#7F1D1D'];
const smogLevelNames = ['Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];

export const PredictionForm: React.FC<PredictionFormProps> = ({ modelTrained }) => {
  const [input, setInput] = useState<PredictionInput>({
    pm25: 45,
    temperature: 22,
    humidity: 65,
    windSpeed: 8,
    visibility: 15,
    pressure: 1013
  });

  const [prediction, setPrediction] = useState<{
    prediction: number;
    probabilities: number[];
    confidence: number;
  } | null>(null);

  const handleInputChange = (field: keyof PredictionInput, value: number) => {
    const newInput = { ...input, [field]: value };
    setInput(newInput);
    
    if (modelTrained) {
      const result = smogPredictor.predict(newInput);
      setPrediction(result);
    }
  };

  const inputFields = [
    { key: 'pm25' as keyof PredictionInput, label: 'PM2.5', unit: 'µg/m³', icon: CloudSnow, min: 0, max: 300 },
    { key: 'temperature' as keyof PredictionInput, label: 'Temperature', unit: '°C', icon: Thermometer, min: -20, max: 50 },
    { key: 'humidity' as keyof PredictionInput, label: 'Humidity', unit: '%', icon: Droplets, min: 0, max: 100 },
    { key: 'windSpeed' as keyof PredictionInput, label: 'Wind Speed', unit: 'm/s', icon: Wind, min: 0, max: 25 },
    { key: 'visibility' as keyof PredictionInput, label: 'Visibility', unit: 'km', icon: Eye, min: 0.1, max: 50 },
    { key: 'pressure' as keyof PredictionInput, label: 'Pressure', unit: 'hPa', icon: Gauge, min: 950, max: 1050 }
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Smog Level Prediction</h2>
      
      <div className="space-y-4">
        {inputFields.map(({ key, label, unit, icon: Icon, min, max }) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-emerald-400" />
              <label className="text-sm font-medium text-gray-300">{label}</label>
              <span className="text-xs text-gray-500">({unit})</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={min}
                max={max}
                step={key === 'visibility' ? 0.1 : 1}
                value={input[key]}
                onChange={(e) => handleInputChange(key, parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <input
                type="number"
                min={min}
                max={max}
                step={key === 'visibility' ? 0.1 : 1}
                value={input[key]}
                onChange={(e) => handleInputChange(key, parseFloat(e.target.value))}
                className="w-20 px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {prediction && modelTrained && (
        <div className="mt-8 space-y-6">
          {/* Main Prediction */}
          <div className="text-center p-6 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl">
            <h3 className="text-lg font-medium text-gray-300 mb-2">Predicted Smog Level</h3>
            <div
              className="text-3xl font-bold mb-2"
              style={{ color: smogLevelColors[prediction.prediction] }}
            >
              {smogLevelNames[prediction.prediction]}
            </div>
            <div className="text-sm text-gray-400">
              Confidence: {(prediction.confidence * 100).toFixed(1)}%
            </div>
          </div>

          {/* Probability Distribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Probability Distribution</h4>
            <div className="space-y-2">
              {prediction.probabilities.map((prob, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-gray-400 truncate">
                    {smogLevelNames[index]}
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${prob * 100}%`,
                        backgroundColor: smogLevelColors[index]
                      }}
                    />
                  </div>
                  <div className="w-12 text-xs text-gray-400 text-right">
                    {(prob * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!modelTrained && (
        <div className="mt-8 p-4 bg-yellow-800/20 border border-yellow-600 rounded-lg">
          <p className="text-yellow-300 text-sm">
            Model is currently training. Predictions will be available once training is complete.
          </p>
        </div>
      )}
    </div>
  );
};