import React, { useState, useEffect } from 'react';
import { AirQualityData, ModelMetrics, PredictionInput } from '../types';
import { generateRealisticAirQualityData } from '../utils/dataGenerator';
import { smogPredictor } from '../utils/logisticRegression';
import { PredictionForm } from './PredictionForm';
import { ModelMetricsDisplay } from './ModelMetricsDisplay';
import { DataVisualization } from './DataVisualization';
import { FeatureImportance } from './FeatureImportance';
import { Activity, BarChart3, Brain, Database, TrendingUp } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<AirQualityData[]>([]);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [activeTab, setActiveTab] = useState('predict');
  const [modelTrained, setModelTrained] = useState(false);

  useEffect(() => {
    // Generate realistic dataset
    const generatedData = generateRealisticAirQualityData(2000);
    setData(generatedData);
    
    // Auto-train the model
    trainModel(generatedData);
  }, []);

  const trainModel = async (trainingData: AirQualityData[]) => {
    setIsTraining(true);
    
    // Simulate training delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Split data for training and testing
    const trainSize = Math.floor(trainingData.length * 0.8);
    const trainData = trainingData.slice(0, trainSize);
    const testData = trainingData.slice(trainSize);
    
    // Train the model
    smogPredictor.train(trainData);
    
    // Evaluate performance
    const modelMetrics = smogPredictor.evaluate(testData);
    setMetrics(modelMetrics);
    setModelTrained(true);
    setIsTraining(false);
  };

  const tabs = [
    { id: 'predict', name: 'Predict', icon: Brain },
    { id: 'data', name: 'Data Analysis', icon: BarChart3 },
    { id: 'metrics', name: 'Model Performance', icon: TrendingUp },
    { id: 'features', name: 'Feature Analysis', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Database className="h-12 w-12 text-emerald-400 mr-4" />
            <h1 className="text-5xl font-bold text-white">SmogCast Predictor</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Advanced smog level forecasting using logistic regression machine learning
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>{data.length} data samples</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>6 feature variables</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Multi-class classification</span>
            </div>
          </div>
        </div>

        {/* Training Status */}
        {isTraining && (
          <div className="mb-8 bg-blue-800/50 border border-blue-600 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
              <div>
                <h3 className="text-white font-medium">Training Logistic Regression Model</h3>
                <p className="text-gray-300">Processing {data.length} samples with gradient descent optimization...</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-gray-800/50 p-2 rounded-xl backdrop-blur-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'predict' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <PredictionForm modelTrained={modelTrained} />
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Measurements</h3>
                <div className="space-y-3">
                  {data.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                    >
                      <div>
                        <div className="text-white font-medium">{item.city}</div>
                        <div className="text-sm text-gray-400">PM2.5: {item.pm25} µg/m³</div>
                      </div>
                      <div className="text-right">
                        <div
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: item.smogLevel.color + '20', color: item.smogLevel.color }}
                        >
                          {item.smogLevel.level}
                        </div>
                        <div className="text-sm text-gray-400 mt-1">AQI: {item.aqi}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && <DataVisualization data={data} />}

          {activeTab === 'metrics' && metrics && (
            <ModelMetricsDisplay metrics={metrics} />
          )}

          {activeTab === 'features' && modelTrained && (
            <FeatureImportance />
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400">
          <p>Built with logistic regression • Multi-class classification • Real-world patterns</p>
          <p className="text-sm mt-2">Data includes PM2.5, temperature, humidity, wind speed, visibility, and pressure</p>
        </div>
      </div>
    </div>
  );
};