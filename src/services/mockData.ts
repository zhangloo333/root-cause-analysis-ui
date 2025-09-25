import { AvailableResponse, MetricData, ExportResponse } from '../types';

// Mock data for development
export const mockAvailableResponse: AvailableResponse = {
  latest: 1591081200000,
  data: {
    total: {
      Wo4W: 141970078,
      Wo3W: 144330070,
      Wo2W: 145112166,
      Wo1W: 143715436,
      baseline: 142587262,
      T7D: 878955918
    },
    transactionVsOrganic: {
      dimension: "attribution_type",
      dataset: "sess_attr_v2_additive",
      metric: "micro_sessions",
      anomaly: false,
      data: [
        { name: "organic", value: 85000000, change: 2.5 },
        { name: "transaction", value: 57587262, change: -1.2 }
      ]
    },
    country: {
      dimension: "country",
      dataset: "sess_attr_v2_additive", 
      metric: "micro_sessions",
      anomaly: true,
      data: [
        { name: "United States", value: 45000000, change: 3.2 },
        { name: "India", value: 32000000, change: 5.8 },
        { name: "China", value: 28000000, change: -2.1 },
        { name: "Brazil", value: 15000000, change: 1.5 },
        { name: "United Kingdom", value: 12000000, change: 0.8 }
      ]
    }
  }
};

export const mockMetricData: MetricData = {
  total: {
    Wo4W: 141970078,
    Wo3W: 144330070,
    Wo2W: 145112166,
    Wo1W: 143715436,
    baseline: 142587262
  },
  transactionVsOrganic: {
    dimension: "attribution_type",
    dataset: "sess_attr_v2_additive",
    metric: "micro_sessions",
    anomaly: false,
    data: [
      { name: "organic", value: 85000000, change: 2.5, trend: "up" },
      { name: "transaction", value: 57587262, change: -1.2, trend: "down" }
    ]
  },
  deviceType: {
    dimension: "device_type",
    dataset: "sess_attr_v2_additive",
    metric: "micro_sessions", 
    anomaly: false,
    data: [
      { name: "mobile", value: 95000000, change: 4.2, trend: "up" },
      { name: "desktop", value: 42000000, change: -0.8, trend: "down" },
      { name: "tablet", value: 5587262, change: -3.5, trend: "down" }
    ]
  }
};

export const mockExportResponse: ExportResponse = {
  filename: "detective_metrics_export.xlsx",
  data: "UEsDBBQAAAAIABkAAABkZXRlY3RpdmVfbWV0cmljc19leHBvcnQueGxzeA==" // Mock base64
};

export const mockHistoryData = [
  { date: "2023-01-01", value: 140000000 },
  { date: "2023-01-02", value: 142000000 },
  { date: "2023-01-03", value: 138000000 },
  { date: "2023-01-04", value: 145000000 },
  { date: "2023-01-05", value: 143000000 },
  { date: "2023-01-06", value: 147000000 },
  { date: "2023-01-07", value: 142587262 }
];

export const mockRCAResults = [
  {
    dimension: "country",
    value: "United States", 
    impact: 2500000,
    confidence: 0.85,
    change_percent: 3.2
  },
  {
    dimension: "device_type",
    value: "mobile",
    impact: 1800000,
    confidence: 0.78,
    change_percent: 4.2
  },
  {
    dimension: "attribution_type", 
    value: "organic",
    impact: 1200000,
    confidence: 0.72,
    change_percent: 2.5
  },
  {
    dimension: "traffic_source",
    value: "search",
    impact: 950000,
    confidence: 0.68,
    change_percent: 1.8
  },
  {
    dimension: "user_segment",
    value: "premium",
    impact: 750000,
    confidence: 0.65,
    change_percent: 2.1
  }
];

// Hourly mock data
export const mockHourlyData = {
  total: {
    Wo4W: 5915420,
    Wo3W: 6012920,
    Wo2W: 6129672,
    Wo1W: 5988143,
    baseline: 5942802
  },
  hourlyBreakdown: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    value: Math.floor(Math.random() * 500000) + 200000,
    change: (Math.random() - 0.5) * 10
  }))
};

// Utility function to simulate API delay
export const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}; 