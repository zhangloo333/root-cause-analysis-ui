import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Row, Col, DatePicker, Select, Space, Spin, message } from 'antd';
import { ClockCircleOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { LineChart, BarChart } from '../charts';
import { mockHourlyData } from '../../services/mockData';
import { formatHour } from '../../utils/formatters';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

const HourlyView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [metricType, setMetricType] = useState('sessions_hourly');
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  const [hourlyData, setHourlyData] = useState<any>(null);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  useEffect(() => {
    // Set default date to today
    setSelectedDate(dayjs());
  }, []);

  const analyzeHourlyData = async () => {
    try {
      setLoading(true);
      // For demo purposes, use mock data
      const response = mockHourlyData;
      setHourlyData(response);
      message.success('Hourly analysis completed');
    } catch (error) {
      message.error('Failed to analyze hourly data');
    } finally {
      setLoading(false);
    }
  };

  const exportHourlyData = async () => {
    try {
      setLoading(true);
      // For demo purposes, simulate export
      message.success('Hourly data exported successfully');
    } catch (error) {
      message.error('Failed to export hourly data');
    } finally {
      setLoading(false);
    }
  };

  const getHourlyChartData = () => {
    if (!hourlyData) return [];
    return hourlyData.hourlyBreakdown.map((item: any) => ({
      date: `${item.hour}:00`,
      value: item.value,
      hour: item.hour,
    }));
  };

  const getHourlyBarData = () => {
    if (!hourlyData) return [];
    return hourlyData.hourlyBreakdown.map((item: any) => ({
      name: formatHour(item.hour),
      value: item.value,
      change: item.change,
    }));
  };

  const getPeakHours = () => {
    if (!hourlyData) return [];
    return hourlyData.hourlyBreakdown
      .sort((a: any, b: any) => b.value - a.value)
      .slice(0, 5)
      .map((item: any) => ({
        hour: formatHour(item.hour),
        value: item.value,
        change: item.change,
      }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2}>
          <ClockCircleOutlined className="mr-2" />
          Hourly Metrics
        </Title>
        <Paragraph>
          Analyze hourly business metrics with time-based visualizations and trend analysis.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card title="Hourly Metric Configuration" className="mb-6">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={5}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metric Type</label>
                <Select
                  value={metricType}
                  onChange={setMetricType}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'sessions_hourly', label: 'Hourly Sessions' },
                    { value: 'revenue_hourly', label: 'Hourly Revenue' },
                    { value: 'users_hourly', label: 'Hourly Users' },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={5}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <DatePicker value={selectedDate} onChange={setSelectedDate} style={{ width: '100%' }} />
              </Col>
              <Col xs={24} sm={12} md={5}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                <Select
                  value={chartType}
                  onChange={setChartType}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'line', label: 'Line Chart' },
                    { value: 'bar', label: 'Bar Chart' },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={9}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
                <Space>
                  <Button
                    type="primary"
                    icon={<ClockCircleOutlined />}
                    onClick={analyzeHourlyData}
                    loading={loading}
                  >
                    Analyze
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={exportHourlyData}
                    disabled={!hourlyData}
                    loading={loading}
                  >
                    Export
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={() => setHourlyData(null)}>
                    Reset
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Hourly Trends" className="chart-container">
            {loading ? (
              <div className="text-center py-12">
                <Spin size="large" />
                <p className="text-gray-500 mt-4">Analyzing hourly data...</p>
              </div>
            ) : hourlyData ? (
              <div>
                {chartType === 'line' && (
                  <LineChart
                    data={getHourlyChartData()}
                    width={800}
                    height={400}
                    onPointClick={data => message.info(`Hour: ${data.date}, Value: ${data.value}`)}
                  />
                )}
                {chartType === 'bar' && (
                  <BarChart
                    data={getHourlyBarData()}
                    width={800}
                    height={400}
                    onBarClick={data => message.info(`Hour: ${data.name}, Value: ${data.value}`)}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <ClockCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                <p className="text-gray-500 mt-4">
                  Configure hourly metrics and click "Analyze" to view time-based trends
                </p>
              </div>
            )}
          </Card>
        </Col>

        {hourlyData && (
          <>
            <Col xs={24} lg={12}>
              <Card title="Peak Hours Analysis" className="h-full">
                <div className="space-y-4">
                  {getPeakHours().map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-semibold">{item.hour}</div>
                        <div className="text-sm text-gray-600">Rank #{index + 1}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{item.value.toLocaleString()}</div>
                        <div className={`text-sm ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.change >= 0 ? '+' : ''}
                          {item.change.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Hourly Summary" className="h-full">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div className="text-center p-4 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {hourlyData.total.baseline.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Current Day</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div className="text-center p-4 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {hourlyData.total.Wo1W.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Same Day Last Week</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div className="text-center p-4 bg-yellow-50 rounded">
                      <div className="text-2xl font-bold text-yellow-600">
                        {Math.max(...hourlyData.hourlyBreakdown.map((h: any) => h.value)).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Peak Hour Value</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div className="text-center p-4 bg-purple-50 rounded">
                      <div className="text-2xl font-bold text-purple-600">
                        {(
                          hourlyData.hourlyBreakdown.reduce((sum: number, h: any) => sum + h.value, 0) / 24
                        ).toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-600">Average per Hour</div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
};

export default HourlyView;
