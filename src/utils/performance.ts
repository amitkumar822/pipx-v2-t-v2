import React from 'react';
import { InteractionManager, Platform } from 'react-native';

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Run after interactions for better performance
export const runAfterInteractions = (callback: () => void): void => {
  InteractionManager.runAfterInteractions(callback);
};

// Memory optimization utilities
export const optimizeImageSize = (uri: string, width: number, height: number): string => {
  if (Platform.OS === 'web') {
    return uri;
  }
  
  // For React Native, you might want to use a service like Cloudinary
  // or implement image resizing on your backend
  return uri;
};

// Lazy loading utility for components (React Native compatible)
export const createLazyComponent = <T extends React.ComponentType<any>>(
  component: T
): T => {
  // In React Native, we don't use React.lazy as it's not supported
  // Instead, we return the component directly or use a wrapper
  return component;
};

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(key: string): void {
    this.metrics.set(key, Date.now());
  }

  endTimer(key: string): number {
    const startTime = this.metrics.get(key);
    if (!startTime) {
      console.warn(`Timer ${key} was not started`);
      return 0;
    }
    
    const duration = Date.now() - startTime;
    this.metrics.delete(key);
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${key} took ${duration}ms`);
    }
    
    return duration;
  }

  measureAsync<T>(key: string, asyncFunc: () => Promise<T>): Promise<T> {
    this.startTimer(key);
    return asyncFunc().finally(() => {
      this.endTimer(key);
    });
  }
}

// Bundle size optimization - dynamic imports (React Native compatible)
export const dynamicImport = async <T>(
  importFunction: () => Promise<T>
): Promise<T> => {
  try {
    const module = await importFunction();
    return module;
  } catch (error) {
    console.error('Failed to dynamically import module:', error);
    throw error;
  }
};

// Memory cleanup utility
export const cleanupResources = (resources: Array<() => void>): void => {
  resources.forEach(cleanup => {
    try {
      cleanup();
    } catch (error) {
      console.error('Error during resource cleanup:', error);
    }
  });
};