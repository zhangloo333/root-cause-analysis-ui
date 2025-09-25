import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  MetricRequest, 
  DynamicRequest, 
  HistoryRequest, 
  RCARequest,
  AvailableResponse,
  MetricData,
  ExportResponse
} from '../types';
import { API_CONFIG, ENDPOINT_TIMEOUTS, DEFAULT_PARAMS } from './apiConfig';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseUrl,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status}`, response.data);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error);
        return Promise.reject(error);
      }
    );
  }

  private async makeRequest<T>(
    endpoint: string, 
    params: any = {}, 
    timeout?: number
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client.get(endpoint, {
        params: { ...DEFAULT_PARAMS, ...params },
        timeout: timeout || API_CONFIG.timeout,
      });

      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      console.error(`API Error for ${endpoint}:`, error);
      return {
        error: error.response?.data?.message || error.message || 'Unknown error',
        status: error.response?.status || 500,
      };
    }
  }

  /**
   * Get the most recent date with data for a specific daily metric
   */
  async getAvailable(type: string, hierarchy: boolean = true): Promise<ApiResponse<AvailableResponse>> {
    return this.makeRequest<AvailableResponse>(
      API_CONFIG.endpoints.available,
      { type, hierarchy },
      ENDPOINT_TIMEOUTS.available
    );
  }

  /**
   * Get detailed metric data for a specific date and metric type
   */
  async getMetric(request: MetricRequest): Promise<ApiResponse<MetricData>> {
    return this.makeRequest<MetricData>(
      API_CONFIG.endpoints.metric,
      request,
      ENDPOINT_TIMEOUTS.metric
    );
  }

  /**
   * Export metric data to Excel
   */
  async exportMetric(request: MetricRequest): Promise<ApiResponse<ExportResponse>> {
    return this.makeRequest<ExportResponse>(
      API_CONFIG.endpoints.metric,
      { ...request, export: true },
      ENDPOINT_TIMEOUTS.metric
    );
  }

  /**
   * Get dynamic breakdown data for graph exploration drill-downs
   */
  async getDynamic(request: DynamicRequest): Promise<ApiResponse<MetricData>> {
    return this.makeRequest<MetricData>(
      API_CONFIG.endpoints.dynamic,
      request,
      ENDPOINT_TIMEOUTS.dynamic
    );
  }

  /**
   * Get historical data for a specific metric and dimension combination
   */
  async getHistory(request: HistoryRequest): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(
      API_CONFIG.endpoints.history,
      request,
      ENDPOINT_TIMEOUTS.history
    );
  }

  /**
   * Run Root Cause Analysis (RCA) algorithm
   */
  async runRCA(request: RCARequest): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(
      API_CONFIG.endpoints.algorithm,
      request,
      ENDPOINT_TIMEOUTS.algorithm
    );
  }

  /**
   * Get the most recent date with data for hourly metrics
   */
  async getAvailableHourlyAll(type: string, hierarchy: boolean = true): Promise<ApiResponse<AvailableResponse>> {
    return this.makeRequest<AvailableResponse>(
      API_CONFIG.endpoints.available_hourly_all,
      { type, hierarchy },
      ENDPOINT_TIMEOUTS.available_hourly_all
    );
  }

  /**
   * Get dynamic hourly breakdown data
   */
  async getDynamicHourly(request: DynamicRequest): Promise<ApiResponse<MetricData>> {
    return this.makeRequest<MetricData>(
      API_CONFIG.endpoints.dynamic_hourly,
      request,
      ENDPOINT_TIMEOUTS.dynamic_hourly
    );
  }

  /**
   * Get all hourly metrics data
   */
  async getMetricHourlyAll(request: MetricRequest): Promise<ApiResponse<MetricData>> {
    return this.makeRequest<MetricData>(
      API_CONFIG.endpoints.metric_hourly_all,
      request,
      ENDPOINT_TIMEOUTS.metric_hourly_all
    );
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService; 