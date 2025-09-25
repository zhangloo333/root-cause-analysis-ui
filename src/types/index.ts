// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// Metric Types
export interface MetricData {
  total: {
    Wo4W: number;
    Wo3W: number;
    Wo2W: number;
    Wo1W: number;
    baseline: number;
    T7D?: number;
  };
  [dimension: string]: any;
}

export interface DimensionData {
  dimension: string;
  dataset: string;
  metric: string;
  anomaly: boolean;
  data: any[];
}

export interface AvailableResponse {
  latest: number;
  data: MetricData;
}

export interface ExportResponse {
  filename: string;
  data: string; // base64 encoded
}

// API Request Parameters
export interface MetricRequest {
  type: string;
  date?: number;
  wow?: number;
  days?: number;
  hierarchy?: boolean;
  export?: boolean;
}

export interface DynamicRequest extends MetricRequest {
  dataset: string;
  metric: string;
  [key: string]: any; // for dynamic breakdown parameters
}

export interface HistoryRequest {
  type: string;
  dataset: string;
  metric: string;
  hierarchy?: boolean;
  [key: string]: any; // for breakdown parameters
}

export interface RCARequest {
  type: string;
  dataset: string;
  metric: string;
  summary_size?: number;
  aggregate?: string;
  weight_function?: string;
  current: number;
  baseline: number;
  hierarchy?: boolean;
}

// Component Props Types
export interface ChartProps {
  data: any[];
  width?: number;
  height?: number;
  className?: string;
}

export interface MetricCardProps {
  title: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  loading?: boolean;
}

// Navigation Types
export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  endpoints: {
    algorithm: string;
    available: string;
    available_hourly_all: string;
    dynamic: string;
    dynamic_hourly: string;
    history: string;
    metric: string;
    metric_hourly_all: string;
  };
} 