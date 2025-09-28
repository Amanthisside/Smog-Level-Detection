import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { smogPredictor } from '../utils/logisticRegression';
import { TrendingUp, Info } from 'lucide-react';

export const FeatureImportance: React.FC = () => {
  const featureImportance = useMemo(() => {
    return smogPredictor.getFeatureImportance();
  }, []);

  const chartData = {
    labels: featureImportance.map(item => item.feature),
    datasets: [{
      label: 'Feature Importance',
      data: featureImportance.map(item => item.importance),
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 1,
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)'
        }
      },
      y: {
        ticks: {
          color: 'rgb(156, 163, 175)'
        },
        grid: {
          display: false
        }
      }
    }
  };

  const featureDescriptions = {
    'PM2.5': 'Particulate matter with diameter ≤ 2.5 micrometers. Primary indicator of air pollution.',
    'Temperature': 'Ambient air temperature. Affects chemical reactions and pollutant dispersion.',
    'Humidity': 'Relative humidity percentage. Influences particle formation and visibility.',
    'Wind Speed': 'Wind velocity. Higher speeds disperse pollutants more effectively.',
    'Visibility': 'Atmospheric visibility distance. Inversely correlated with pollution levels.',
    'Pressure': 'Atmospheric pressure. Low pressure can trap pollutants near the surface.'
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Feature Importance Chart */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h3 className="text-xl font-semibold text-white">Feature Importance</h3>
          </div>
          <div className="h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
          <p className="text-sm text-gray-400 mt-4">
            Based on logistic regression coefficient magnitudes across all classes
          </p>
        </div>

        {/* Feature Rankings */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Ranking & Impact</h3>
          <div className="space-y-4">
            {featureImportance.map((item, index) => (
              <div key={item.feature} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-emerald-600 text-white rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{item.feature}</h4>
                    <p className="text-sm text-gray-400">
                      Impact Score: {(item.importance * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="w-20 h-2 bg-gray-600 rounded-full">
                  <div
                    className="h-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                    style={{ width: `${item.importance * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Explanations */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Info className="h-5 w-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Feature Explanations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureImportance.map((item) => (
            <div key={item.feature} className="p-4 bg-gray-700/30 rounded-lg">
              <h4 className="text-emerald-400 font-medium mb-2">{item.feature}</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {featureDescriptions[item.feature as keyof typeof featureDescriptions]}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-400">Predictive Power:</span>
                <div className="flex-1 bg-gray-600 rounded-full h-1">
                  <div
                    className="h-1 bg-emerald-500 rounded-full"
                    style={{ width: `${item.importance * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{(item.importance * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Methodology</h3>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed mb-4">
            Feature importance is calculated using the magnitude of logistic regression coefficients. 
            In our one-vs-all approach, we train separate binary classifiers for each smog level category, 
            then average the absolute coefficient values across all classifiers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h4 className="text-white font-medium mb-2">Coefficient Analysis</h4>
              <p className="text-sm text-gray-400">
                Larger coefficients indicate stronger influence on the prediction decision
              </p>
            </div>
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h4 className="text-white font-medium mb-2">Multi-class Averaging</h4>
              <p className="text-sm text-gray-400">
                Importance scores are averaged across all 6 binary classifiers
              </p>
            </div>
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <h4 className="text-white font-medium mb-2">Normalization</h4>
              <p className="text-sm text-gray-400">
                Scores are normalized to show relative importance between features
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};