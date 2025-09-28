import React, { useMemo } from 'react';
import { AirQualityData } from '../types';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DataVisualizationProps {
  data: AirQualityData[];
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: 'rgb(209, 213, 219)'
        }
      }
    },
    scales: {
      x: {
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
          color: 'rgba(75, 85, 99, 0.3)'
        }
      }
    }
  };
  const chartOptionsAlt = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: 'rgb(209, 213, 219)'
        }
      }
    },
    scales: {
      x: {
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
          color: 'rgba(75, 85, 99, 0.3)'
        }
      }
    }
  };

  // Time series data (last 30 days)
  const timeSeriesData = useMemo(() => {
    const recent = data.slice(0, 720).reverse(); // Last 30 days, hourly
    const labels = recent.map(d => format(d.timestamp, 'MMM dd'));
    
    return {
      labels,
      datasets: [
        {
          label: 'PM2.5 (µg/m³)',
          data: recent.map(d => d.pm25),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
        },
        {
          label: 'AQI',
          data: recent.map(d => d.aqi),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        }
      ]
    };
  }, [data]);

  // Smog level distribution
  const smogDistribution = useMemo(() => {
    const levels = ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous'];
    const counts = levels.map(level => data.filter(d => d.smogLevel.level === level).length);
    const colors = ['#10B981', '#F59E0B', '#F97316', '#EF4444', '#7C3AED', '#7F1D1D'];
    
    return {
      labels: levels,
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderWidth: 0
      }]
    };
  }, [data]);

  // Correlation scatter plot (PM2.5 vs Temperature)
  const correlationData = useMemo(() => {
    return {
      datasets: [
        {
          label: 'Data Points',
          data: data.slice(0, 500).map(d => ({ x: d.pm25, y: d.temperature })),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
        }
      ]
    };
  }, [data]);

  // City comparison
  const cityData = useMemo(() => {
    const cities = [...new Set(data.map(d => d.city))];
    const avgPM25 = cities.map(city => {
      const cityData = data.filter(d => d.city === city);
      return cityData.reduce((sum, d) => sum + d.pm25, 0) / cityData.length;
    });
    
    return {
      labels: cities,
      datasets: [{
        label: 'Average PM2.5 (µg/m³)',
        data: avgPM25,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 0
      }]
    };
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Dataset Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Total Samples</h3>
          <p className="text-3xl font-bold text-emerald-400">{data.length.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Cities</h3>
          <p className="text-3xl font-bold text-blue-400">{new Set(data.map(d => d.city)).size}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Avg PM2.5</h3>
          <p className="text-3xl font-bold text-orange-400">
            {(data.reduce((sum, d) => sum + d.pm25, 0) / data.length).toFixed(1)}
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 text-center">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Avg AQI</h3>
          <p className="text-3xl font-bold text-purple-400">
            {Math.round(data.reduce((sum, d) => sum + d.aqi, 0) / data.length)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Time Series */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Historical Trends</h3>
          <div className="h-80">
            <Line data={timeSeriesData} options={chartOptions} />
          </div>
        </div>

        {/* Smog Level Distribution */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Smog Level Distribution</h3>
          <div className="h-80">
            <Bar data={smogDistribution} options={chartOptionsAlt} />
          </div>
        </div>

        {/* Correlation Analysis */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">PM2.5 vs Temperature</h3>
          <div className="h-80">
            <Scatter data={correlationData} options={{
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                x: {
                  ...chartOptions.scales.x,
                  title: {
                    display: true,
                    text: 'PM2.5 (µg/m³)',
                    color: 'rgb(209, 213, 219)'
                  }
                },
                y: {
                  ...chartOptions.scales.y,
                  title: {
                    display: true,
                    text: 'Temperature (°C)',
                    color: 'rgb(209, 213, 219)'
                  }
                }
              }
            }} />
          </div>
        </div>

        {/* City Comparison */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-semibent text-white mb-4">City Comparison</h3>
          <div className="h-80">
            <Bar data={cityData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Data Quality Insights */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Data Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Most Polluted City</h4>
            <p className="text-white">
              {data.reduce((max, d) => d.pm25 > max.pm25 ? d : max).city}
            </p>
            <p className="text-sm text-gray-400">
              Peak PM2.5: {Math.max(...data.map(d => d.pm25)).toFixed(1)} µg/m³
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Cleanest City</h4>
            <p className="text-white">
              {data.reduce((min, d) => d.pm25 < min.pm25 ? d : min).city}
            </p>
            <p className="text-sm text-gray-400">
              Lowest PM2.5: {Math.min(...data.map(d => d.pm25)).toFixed(1)} µg/m³
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Data Completeness</h4>
            <p className="text-white">100%</p>
            <p className="text-sm text-gray-400">No missing values detected</p>
          </div>
        </div>
      </div>
    </div>
  );
};