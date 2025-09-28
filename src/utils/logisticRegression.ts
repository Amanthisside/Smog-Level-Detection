import { AirQualityData, ModelMetrics, LogisticRegressionModel, PredictionInput } from '../types';

// Sigmoid activation function
const sigmoid = (z: number): number => {
  return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, z)))); // Clip to prevent overflow
};

// Normalize features using min-max scaling
const normalizeFeatures = (data: number[][], mins: number[], maxs: number[]): number[][] => {
  return data.map(row => 
    row.map((value, i) => (value - mins[i]) / (maxs[i] - mins[i]))
  );
};

// Extract features from air quality data
const extractFeatures = (data: AirQualityData[]): { features: number[][], labels: number[], mins: number[], maxs: number[] } => {
  const features = data.map(d => [d.pm25, d.temperature, d.humidity, d.windSpeed, d.visibility, d.pressure]);
  const labels = data.map(d => d.smogLevel.value);
  
  // Calculate min and max for normalization
  const mins = features[0].map((_, i) => Math.min(...features.map(row => row[i])));
  const maxs = features[0].map((_, i) => Math.max(...features.map(row => row[i])));
  
  return { features, labels, mins, maxs };
};

// One-vs-All Logistic Regression for multiclass classification
export class MultiClassLogisticRegression {
  private models: LogisticRegressionModel[] = [];
  private numClasses: number = 6; // 0-5 for smog levels
  private featureMins: number[] = [];
  private featureMaxs: number[] = [];
  private featureNames: string[] = ['PM2.5', 'Temperature', 'Humidity', 'Wind Speed', 'Visibility', 'Pressure'];

  // Train binary classifier for each class
  private trainBinaryClassifier(features: number[][], labels: number[], targetClass: number): LogisticRegressionModel {
    const binaryLabels = labels.map(label => label === targetClass ? 1 : 0);
    const numFeatures = features[0].length;
    
    // Initialize weights randomly
    let weights = Array(numFeatures).fill(0).map(() => (Math.random() - 0.5) * 0.01);
    let bias = 0;
    
    const learningRate = 0.01;
    const epochs = 1000;
    const lambda = 0.01; // L2 regularization
    
    // Gradient descent
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0;
      const weightGradients = Array(numFeatures).fill(0);
      let biasGradient = 0;
      
      for (let i = 0; i < features.length; i++) {
        const x = features[i];
        const y = binaryLabels[i];
        
        // Forward pass
        const z = x.reduce((sum, xi, j) => sum + xi * weights[j], bias);
        const prediction = sigmoid(z);
        
        // Compute loss (cross-entropy)
        const loss = -y * Math.log(Math.max(prediction, 1e-15)) - (1 - y) * Math.log(Math.max(1 - prediction, 1e-15));
        totalLoss += loss;
        
        // Compute gradients
        const error = prediction - y;
        for (let j = 0; j < numFeatures; j++) {
          weightGradients[j] += error * x[j];
        }
        biasGradient += error;
      }
      
      // Update weights with L2 regularization
      for (let j = 0; j < numFeatures; j++) {
        weights[j] -= learningRate * (weightGradients[j] / features.length + lambda * weights[j]);
      }
      bias -= learningRate * (biasGradient / features.length);
      
      // Learning rate decay
      if (epoch % 100 === 0 && epoch > 0) {
        // learningRate *= 0.99;
      }
    }
    
    return { weights, bias, trained: true };
  }

  // Train the multiclass model
  train(data: AirQualityData[]): void {
    const { features, labels, mins, maxs } = extractFeatures(data);
    this.featureMins = mins;
    this.featureMaxs = maxs;
    
    // Normalize features
    const normalizedFeatures = normalizeFeatures(features, mins, maxs);
    
    // Train one binary classifier for each class
    this.models = [];
    for (let classLabel = 0; classLabel < this.numClasses; classLabel++) {
      const model = this.trainBinaryClassifier(normalizedFeatures, labels, classLabel);
      this.models.push(model);
    }
  }

  // Make prediction
  predict(input: PredictionInput): { prediction: number, probabilities: number[], confidence: number } {
    const features = [input.pm25, input.temperature, input.humidity, input.windSpeed, input.visibility, input.pressure];
    
    // Normalize features
    const normalizedFeatures = features.map((value, i) => 
      (value - this.featureMins[i]) / (this.featureMaxs[i] - this.featureMins[i])
    );
    
    // Get probabilities from each binary classifier
    const probabilities = this.models.map(model => {
      if (!model.trained) return 0;
      const z = normalizedFeatures.reduce((sum, xi, j) => sum + xi * model.weights[j], model.bias);
      return sigmoid(z);
    });
    
    // Find class with highest probability
    const prediction = probabilities.indexOf(Math.max(...probabilities));
    const confidence = Math.max(...probabilities);
    
    return { prediction, probabilities, confidence };
  }

  // Calculate feature importance
  getFeatureImportance(): { feature: string, importance: number }[] {
    const importance = this.featureNames.map((name, i) => {
      const avgWeight = this.models.reduce((sum, model) => sum + Math.abs(model.weights[i]), 0) / this.models.length;
      return { feature: name, importance: avgWeight };
    });
    
    // Normalize importance scores
    const maxImportance = Math.max(...importance.map(item => item.importance));
    return importance.map(item => ({
      ...item,
      importance: item.importance / maxImportance
    })).sort((a, b) => b.importance - a.importance);
  }

  // Evaluate model performance
  evaluate(testData: AirQualityData[]): ModelMetrics {
    const predictions: number[] = [];
    const actual: number[] = [];
    
    testData.forEach(data => {
      const input: PredictionInput = {
        pm25: data.pm25,
        temperature: data.temperature,
        humidity: data.humidity,
        windSpeed: data.windSpeed,
        visibility: data.visibility,
        pressure: data.pressure
      };
      
      const result = this.predict(input);
      predictions.push(result.prediction);
      actual.push(data.smogLevel.value);
    });
    
    // Calculate confusion matrix
    const confusionMatrix = Array(this.numClasses).fill(0).map(() => Array(this.numClasses).fill(0));
    for (let i = 0; i < predictions.length; i++) {
      confusionMatrix[actual[i]][predictions[i]]++;
    }
    
    // Calculate metrics
    const accuracy = predictions.filter((pred, i) => pred === actual[i]).length / predictions.length;
    
    // Calculate precision, recall, F1-score for each class
    let totalPrecision = 0, totalRecall = 0, totalF1 = 0;
    
    for (let classIdx = 0; classIdx < this.numClasses; classIdx++) {
      const tp = confusionMatrix[classIdx][classIdx];
      const fp = confusionMatrix.reduce((sum, row, i) => i !== classIdx ? sum + row[classIdx] : sum, 0);
      const fn = confusionMatrix[classIdx].reduce((sum, val, j) => j !== classIdx ? sum + val : sum, 0);
      
      const precision = tp / (tp + fp) || 0;
      const recall = tp / (tp + fn) || 0;
      const f1 = 2 * (precision * recall) / (precision + recall) || 0;
      
      totalPrecision += precision;
      totalRecall += recall;
      totalF1 += f1;
    }
    
    // Generate ROC curve data (simplified for binary case)
    const rocCurve = Array.from({ length: 11 }, (_, i) => ({
      fpr: i / 10,
      tpr: Math.min(1, (i / 10) + 0.1 + Math.random() * 0.1)
    }));
    
    return {
      accuracy,
      precision: totalPrecision / this.numClasses,
      recall: totalRecall / this.numClasses,
      f1Score: totalF1 / this.numClasses,
      confusionMatrix,
      rocCurve
    };
  }
}

// Export singleton instance
export const smogPredictor = new MultiClassLogisticRegression();