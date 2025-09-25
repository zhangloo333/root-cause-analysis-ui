import { rest } from 'msw';
import { 
  mockAvailableResponse, 
  mockMetricData, 
  mockHistoryData, 
  mockRCAResults, 
  mockHourlyData 
} from '../services/mockData';

const API_BASE_URL = 'http://localhost:8000';

export const handlers = [
  // GET /root-cause-analysis/available/ - Get latest data dates
  rest.get(`${API_BASE_URL}/root-cause-analysis/available/`, (req, res, ctx) => {
    console.log('MSW: Intercepted /root-cause-analysis/available/ request');
    return res(
      ctx.status(200),
      ctx.json(mockAvailableResponse)
    );
  }),

  // GET /root-cause-analysis/metric/ - Get detailed metric data
  rest.get(`${API_BASE_URL}/root-cause-analysis/metric/`, (req, res, ctx) => {
    const metricType = req.url.searchParams.get('metric_type');
    const date = req.url.searchParams.get('date');
    
    console.log(`MSW: Intercepted /root-cause-analysis/metric/ request - metric_type: ${metricType}, date: ${date}`);
    
    return res(
      ctx.status(200),
      ctx.json(mockMetricData)
    );
  }),

  // GET /root-cause-analysis/dynamic/ - Dynamic breakdown data
  rest.get(`${API_BASE_URL}/root-cause-analysis/dynamic/`, (req, res, ctx) => {
    const metricType = req.url.searchParams.get('metric_type');
    const date = req.url.searchParams.get('date');
    const breakdown = req.url.searchParams.get('breakdown');
    
    console.log(`MSW: Intercepted /root-cause-analysis/dynamic/ request - metric_type: ${metricType}, date: ${date}, breakdown: ${breakdown}`);
    
    return res(
      ctx.status(200),
      ctx.json(mockMetricData)
    );
  }),

  // GET /root-cause-analysis/history/ - Historical data
  rest.get(`${API_BASE_URL}/root-cause-analysis/history/`, (req, res, ctx) => {
    const metricType = req.url.searchParams.get('metric_type');
    const startDate = req.url.searchParams.get('start_date');
    const endDate = req.url.searchParams.get('end_date');
    
    console.log(`MSW: Intercepted /root-cause-analysis/history/ request - metric_type: ${metricType}, start_date: ${startDate}, end_date: ${endDate}`);
    
    return res(
      ctx.status(200),
      ctx.json(mockHistoryData)
    );
  }),

  // GET /root-cause-analysis/rca/ - Root Cause Analysis
  rest.get(`${API_BASE_URL}/root-cause-analysis/rca/`, (req, res, ctx) => {
    const metricType = req.url.searchParams.get('metric_type');
    const date = req.url.searchParams.get('date');
    const threshold = req.url.searchParams.get('threshold');
    
    console.log(`MSW: Intercepted /root-cause-analysis/rca/ request - metric_type: ${metricType}, date: ${date}, threshold: ${threshold}`);
    
    return res(
      ctx.status(200),
      ctx.json(mockRCAResults)
    );
  }),

  // GET /root-cause-analysis/available_hourly_all/ - Hourly availability
  rest.get(`${API_BASE_URL}/root-cause-analysis/available_hourly_all/`, (req, res, ctx) => {
    const date = req.url.searchParams.get('date');
    
    console.log(`MSW: Intercepted /root-cause-analysis/available_hourly_all/ request - date: ${date}`);
    
    return res(
      ctx.status(200),
      ctx.json(mockAvailableResponse)
    );
  }),

  // GET /root-cause-analysis/dynamic_hourly/ - Hourly dynamic data
  rest.get(`${API_BASE_URL}/root-cause-analysis/dynamic_hourly/`, (req, res, ctx) => {
    const metricType = req.url.searchParams.get('metric_type');
    const date = req.url.searchParams.get('date');
    const breakdown = req.url.searchParams.get('breakdown');
    
    console.log(`MSW: Intercepted /root-cause-analysis/dynamic_hourly/ request - metric_type: ${metricType}, date: ${date}, breakdown: ${breakdown}`);
    
    return res(
      ctx.status(200),
      ctx.json(mockHourlyData)
    );
  }),

  // GET /root-cause-analysis/metric_hourly_all/ - All hourly metrics
  rest.get(`${API_BASE_URL}/root-cause-analysis/metric_hourly_all/`, (req, res, ctx) => {
    const metricType = req.url.searchParams.get('metric_type');
    const date = req.url.searchParams.get('date');
    
    console.log(`MSW: Intercepted /root-cause-analysis/metric_hourly_all/ request - metric_type: ${metricType}, date: ${date}`);
    
    return res(
      ctx.status(200),
      ctx.json(mockHourlyData)
    );
  }),

  // Fallback handler for unmatched requests
  rest.get('*', (req, res, ctx) => {
    console.warn(`MSW: Unhandled ${req.method} request to ${req.url.href}`);
    return res(
      ctx.status(404),
      ctx.json({ error: 'Endpoint not found' })
    );
  }),
]; 