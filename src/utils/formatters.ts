// Number formatting utilities
export const formatNumber = (num: number): string => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatPercentage = (num: number): string => {
  return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
};

export const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// Date formatting utilities
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatHour = (hour: number): string => {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Trend utilities
export const getTrendColor = (change: number): string => {
  if (change > 0) return '#52c41a'; // green
  if (change < 0) return '#ff4d4f'; // red
  return '#faad14'; // yellow
};

export const getTrendIcon = (change: number): string => {
  if (change > 0) return '↗';
  if (change < 0) return '↘';
  return '→';
};

// Data transformation utilities
export const calculateWeekOverWeekChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const getWeekLabel = (weekOffset: number): string => {
  const labels = ['Current', 'Wo1W', 'Wo2W', 'Wo3W', 'Wo4W'];
  return labels[weekOffset] || `Wo${weekOffset}W`;
};

// Export utilities
export const downloadFile = (data: string, filename: string, mimeType: string = 'application/octet-stream'): void => {
  const blob = new Blob([atob(data)], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Validation utilities
export const isValidMetricType = (type: string): boolean => {
  const validTypes = ['sessions_daily', 'revenue_daily', 'users_daily', 'sessions_hourly', 'revenue_hourly', 'users_hourly'];
  return validTypes.includes(type);
};

export const isValidDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate <= endDate && endDate <= new Date();
};

// Color utilities for charts
export const getChartColors = (count: number): string[] => {
  const colors = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
    '#13c2c2', '#eb2f96', '#fa541c', '#a0d911', '#2f54eb'
  ];
  
  if (count <= colors.length) {
    return colors.slice(0, count);
  }
  
  // Generate additional colors if needed
  const additionalColors = [];
  for (let i = colors.length; i < count; i++) {
    const hue = (i * 137.508) % 360; // Golden angle approximation
    additionalColors.push(`hsl(${hue}, 70%, 50%)`);
  }
  
  return [...colors, ...additionalColors];
}; 