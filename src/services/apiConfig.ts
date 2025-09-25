import { ApiConfig } from '../types';

export const API_CONFIG: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 180000, // 3 minutes for most endpoints
  endpoints: {
    algorithm: '/root-cause-analysis/rca/',
    available: '/root-cause-analysis/available/',
    available_hourly_all: '/root-cause-analysis/available_hourly_all/',
    dynamic: '/root-cause-analysis/dynamic/',
    dynamic_hourly: '/root-cause-analysis/dynamic_hourly/',
    history: '/root-cause-analysis/history/',
    metric: '/root-cause-analysis/metric/',
    metric_hourly_all: '/root-cause-analysis/metric_hourly_all/',
  },
};

// Timeout configurations for different endpoints
export const ENDPOINT_TIMEOUTS = {
  available: 60000, // 1 minute
  metric: 180000, // 3 minutes
  dynamic: 180000, // 3 minutes
  history: 180000, // 3 minutes
  algorithm: 180000, // 3 minutes
  available_hourly_all: 60000, // 1 minute
  dynamic_hourly: 180000, // 3 minutes
  metric_hourly_all: 180000, // 3 minutes
};

// Default request parameters
export const DEFAULT_PARAMS = {
  hierarchy: true,
  wow: 4,
  days: 7,
  summary_size: 5,
  aggregate: 'daily',
  weight_function: 'AbsChange',
}; 