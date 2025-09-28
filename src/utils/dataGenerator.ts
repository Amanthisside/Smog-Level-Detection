import { AirQualityData, SmogLevel } from '../types';

// Realistic air quality data generator based on actual patterns from polluted cities
export const generateRealisticAirQualityData = (samples: number = 2000): AirQualityData[] => {
  const cities = [
    { name: 'Beijing', basePM25: 85, baseTemp: 12, pollution: 'high' },
    { name: 'Delhi', basePM25: 95, baseTemp: 25, pollution: 'very_high' },
    { name: 'Los Angeles', basePM25: 35, baseTemp: 20, pollution: 'moderate' },
    { name: 'Mexico City', basePM25: 65, baseTemp: 18, pollution: 'high' },
    { name: 'Bangkok', basePM25: 55, baseTemp: 28, pollution: 'moderate' },
    { name: 'Lahore', basePM25: 105, baseTemp: 22, pollution: 'very_high' },
  ];
  
  const data: AirQualityData[] = [];
  
  for (let i = 0; i < samples; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const hour = date.getHours();
    
    // Seasonal patterns (winter pollution is higher)
    const month = date.getMonth();
    const winterMultiplier = (month >= 10 || month <= 2) ? 1.4 : 0.8;
    
    // Daily patterns (rush hours have higher pollution)
    const rushHourMultiplier = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1.3 : 
                               (hour >= 22 || hour <= 6) ? 0.7 : 1.0;
    
    // Generate correlated environmental variables
    const temperature = city.baseTemp + (Math.random() - 0.5) * 20 + 
                       10 * Math.sin((month - 6) * Math.PI / 6); // Seasonal temp
    
    const humidity = 30 + Math.random() * 60; // 30-90%
    const windSpeed = Math.random() * 15 + 2; // 2-17 m/s
    const pressure = 980 + Math.random() * 60; // 980-1040 hPa
    
    // PM2.5 with realistic correlations
    let pm25 = city.basePM25 * winterMultiplier * rushHourMultiplier;
    pm25 *= (1 - windSpeed / 25); // Wind disperses pollution
    pm25 *= (1 + (humidity - 50) / 200); // Humidity affects particle formation
    pm25 *= (1 + (1040 - pressure) / 1000); // Low pressure traps pollution
    pm25 += (Math.random() - 0.5) * 30; // Random variation
    pm25 = Math.max(5, pm25); // Minimum realistic value
    
    // PM10 is typically 1.5-2x PM2.5
    const pm10 = pm25 * (1.5 + Math.random() * 0.5);
    
    // Visibility inversely correlated with pollution
    const visibility = Math.max(0.5, 25 - pm25 / 5 + (Math.random() - 0.5) * 5);
    
    // Calculate AQI based on PM2.5 (US EPA standard)
    const aqi = calculateAQI(pm25);
    const smogLevel = getSmogLevel(aqi);
    
    data.push({
      id: `${i}`,
      timestamp: date,
      city: city.name,
      pm25: Math.round(pm25 * 10) / 10,
      pm10: Math.round(pm10 * 10) / 10,
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity * 10) / 10,
      windSpeed: Math.round(windSpeed * 10) / 10,
      visibility: Math.round(visibility * 10) / 10,
      pressure: Math.round(pressure * 10) / 10,
      smogLevel,
      aqi: Math.round(aqi)
    });
  }
  
  return data.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Calculate AQI based on PM2.5 concentration (US EPA standard)
const calculateAQI = (pm25: number): number => {
  const breakpoints = [
    { low: 0, high: 12, aqiLow: 0, aqiHigh: 50 },
    { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
    { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
    { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
    { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
    { low: 250.5, high: 500, aqiLow: 301, aqiHigh: 500 }
  ];
  
  for (const bp of breakpoints) {
    if (pm25 >= bp.low && pm25 <= bp.high) {
      return Math.round(
        ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (pm25 - bp.low) + bp.aqiLow
      );
    }
  }
  
  return 500; // Hazardous
};

// Convert AQI to smog level
const getSmogLevel = (aqi: number): SmogLevel => {
  if (aqi <= 50) {
    return {
      level: 'Good',
      value: 0,
      color: '#10B981',
      description: 'Air quality is satisfactory'
    };
  } else if (aqi <= 100) {
    return {
      level: 'Moderate',
      value: 1,
      color: '#F59E0B',
      description: 'Air quality is acceptable for most people'
    };
  } else if (aqi <= 150) {
    return {
      level: 'Unhealthy for Sensitive Groups',
      value: 2,
      color: '#F97316',
      description: 'Members of sensitive groups may experience health effects'
    };
  } else if (aqi <= 200) {
    return {
      level: 'Unhealthy',
      value: 3,
      color: '#EF4444',
      description: 'Everyone may begin to experience health effects'
    };
  } else if (aqi <= 300) {
    return {
      level: 'Very Unhealthy',
      value: 4,
      color: '#7C3AED',
      description: 'Health alert: everyone may experience serious health effects'
    };
  } else {
    return {
      level: 'Hazardous',
      value: 5,
      color: '#7F1D1D',
      description: 'Health warnings of emergency conditions'
    };
  }
};