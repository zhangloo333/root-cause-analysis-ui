import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Select,
  Space,
  Spin,
  message,
  Table,
  Progress,
  Tag,
  InputNumber,
  DatePicker,
  Slider,
} from 'antd';
import {
  ExperimentOutlined,
  PlayCircleOutlined,
  StopOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { BarChart } from '../charts';
import { mockRCAResults } from '../../services/mockData';
import { apiService } from '../../services/apiService';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

interface RCAResult {
  dimension: string;
  value: string;
  impact: number;
  confidence: number;
  change_percent: number;
}

interface RCAConfig {
  metricType: string;
  date: dayjs.Dayjs | null;
  threshold: number;
  minConfidence: number;
  maxResults: number;
  weightFunction: string;
  analysisDepth: number;
}

const RootCauseAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rcaResults, setRcaResults] = useState<RCAResult[]>([]);
  const [config, setConfig] = useState<RCAConfig>({
    metricType: 'sessions_daily',
    date: dayjs(),
    threshold: 5.0,
    minConfidence: 0.6,
    maxResults: 10,
    weightFunction: 'AbsChange',
    analysisDepth: 3,
  });

  const runRCAAnalysis = async () => {
    try {
      setAnalyzing(true);
      setProgress(0);
      setRcaResults([]);

      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Use mock data for now
      const results = mockRCAResults
        .filter(
          result =>
            result.confidence >= config.minConfidence && Math.abs(result.change_percent) >= config.threshold
        )
        .slice(0, config.maxResults);

      setRcaResults(results);
      setProgress(100);
      clearInterval(progressInterval);
      message.success(`RCA analysis completed. Found ${results.length} significant factors.`);
    } catch (error) {
      message.error('RCA analysis failed');
    } finally {
      setAnalyzing(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const stopAnalysis = () => {
    setAnalyzing(false);
    setProgress(0);
    message.info('RCA analysis stopped');
  };

  const exportResults = () => {
    if (rcaResults.length === 0) {
      message.warning('No results to export');
      return;
    }

    const csvContent = [
      ['Dimension', 'Value', 'Impact', 'Confidence', 'Change %'].join(','),
      ...rcaResults.map(result =>
        [result.dimension, result.value, result.impact, result.confidence, result.change_percent].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rca_results_${config.metricType}_${config.date?.format('YYYY-MM-DD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('RCA results exported successfully');
  };

  const resetAnalysis = () => {
    setRcaResults([]);
    setProgress(0);
    setAnalyzing(false);
    message.info('Analysis reset');
  };

  const getChartData = () => {
    return rcaResults.map(result => ({
      name: `${result.dimension}: ${result.value}`,
      value: result.impact,
      change: result.change_percent,
      confidence: result.confidence,
    }));
  };

  const columns = [
    {
      title: 'Rank',
      key: 'rank',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <Tag color={index < 3 ? 'red' : index < 6 ? 'orange' : 'blue'}>#{index + 1}</Tag>
      ),
    },
    {
      title: 'Dimension',
      dataIndex: 'dimension',
      key: 'dimension',
      render: (dimension: string) => <Tag color="geekblue">{dimension.replace('_', ' ').toUpperCase()}</Tag>,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: string) => <strong>{value}</strong>,
    },
    {
      title: 'Impact',
      dataIndex: 'impact',
      key: 'impact',
      render: (impact: number) => <span className="font-mono">{impact.toLocaleString()}</span>,
      sorter: (a: RCAResult, b: RCAResult) => b.impact - a.impact,
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (confidence: number) => (
        <div className="flex items-center space-x-2">
          <Progress
            percent={confidence * 100}
            size="small"
            status={confidence > 0.8 ? 'success' : confidence > 0.6 ? 'normal' : 'exception'}
            showInfo={false}
            style={{ width: '60px' }}
          />
          <span className="text-xs">{(confidence * 100).toFixed(0)}%</span>
        </div>
      ),
      sorter: (a: RCAResult, b: RCAResult) => b.confidence - a.confidence,
    },
    {
      title: 'Change %',
      dataIndex: 'change_percent',
      key: 'change_percent',
      render: (change: number) => (
        <Tag color={change > 0 ? 'green' : 'red'}>
          {change > 0 ? '+' : ''}
          {change.toFixed(1)}%
        </Tag>
      ),
      sorter: (a: RCAResult, b: RCAResult) => Math.abs(b.change_percent) - Math.abs(a.change_percent),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2}>
          <ExperimentOutlined className="mr-2" />
          Root Cause Analysis
        </Title>
        <Paragraph>
          Automated root cause analysis to identify the most significant factors contributing to metric
          changes.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card title="Analysis Configuration" className="mb-6">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metric Type</label>
                <Select
                  value={config.metricType}
                  onChange={value => setConfig(prev => ({ ...prev, metricType: value }))}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'sessions_daily', label: 'Daily Sessions' },
                    { value: 'revenue_daily', label: 'Daily Revenue' },
                    { value: 'users_daily', label: 'Daily Users' },
                    { value: 'conversion_daily', label: 'Daily Conversion' },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Date</label>
                <DatePicker
                  value={config.date}
                  onChange={date => setConfig(prev => ({ ...prev, date }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Change Threshold (%)</label>
                <InputNumber
                  value={config.threshold}
                  onChange={value => setConfig(prev => ({ ...prev, threshold: value || 5 }))}
                  min={0.1}
                  max={50}
                  step={0.1}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight Function</label>
                <Select
                  value={config.weightFunction}
                  onChange={value => setConfig(prev => ({ ...prev, weightFunction: value }))}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'AbsChange', label: 'Absolute Change' },
                    { value: 'RelChange', label: 'Relative Change' },
                    { value: 'Impact', label: 'Impact Score' },
                  ]}
                />
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-4">
              <Col xs={24} sm={12}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Confidence: {(config.minConfidence * 100).toFixed(0)}%
                </label>
                <Slider
                  value={config.minConfidence}
                  onChange={value => setConfig(prev => ({ ...prev, minConfidence: value }))}
                  min={0.1}
                  max={1}
                  step={0.05}
                  marks={{
                    0.1: '10%',
                    0.5: '50%',
                    0.8: '80%',
                    1: '100%',
                  }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Results: {config.maxResults}
                </label>
                <Slider
                  value={config.maxResults}
                  onChange={value => setConfig(prev => ({ ...prev, maxResults: value }))}
                  min={5}
                  max={50}
                  step={5}
                  marks={{
                    5: '5',
                    15: '15',
                    30: '30',
                    50: '50',
                  }}
                />
              </Col>
            </Row>

            <div className="mt-6">
              <Space wrap>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={runRCAAnalysis}
                  loading={analyzing}
                  disabled={analyzing}
                >
                  Run Analysis
                </Button>
                <Button icon={<StopOutlined />} onClick={stopAnalysis} disabled={!analyzing}>
                  Stop
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={exportResults}
                  disabled={rcaResults.length === 0}
                >
                  Export Results
                </Button>
                <Button icon={<ReloadOutlined />} onClick={resetAnalysis}>
                  Reset
                </Button>
              </Space>
            </div>

            {analyzing && (
              <div className="mt-4">
                <div className="flex items-center space-x-4">
                  <Progress
                    percent={progress}
                    status={progress === 100 ? 'success' : 'active'}
                    style={{ flex: 1 }}
                  />
                  <span className="text-sm text-gray-500">
                    {progress < 30
                      ? 'Collecting data...'
                      : progress < 60
                      ? 'Analyzing patterns...'
                      : progress < 90
                      ? 'Computing impact scores...'
                      : 'Finalizing results...'}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </Col>

        {rcaResults.length > 0 && (
          <>
            <Col xs={24} lg={16}>
              <Card title="RCA Results Table" className="mb-6">
                <Table
                  columns={columns}
                  dataSource={rcaResults.map((result, index) => ({ ...result, key: index }))}
                  pagination={{ pageSize: 10 }}
                  size="small"
                  scroll={{ x: 800 }}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Impact Visualization" className="mb-6">
                <BarChart
                  data={getChartData()}
                  width={350}
                  height={400}
                  onBarClick={data => message.info(`Selected: ${data.name}`)}
                />
              </Card>
            </Col>

            <Col xs={24}>
              <Card title="Analysis Summary">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={6}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{rcaResults.length}</div>
                      <div className="text-sm text-gray-500">Factors Found</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={6}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {rcaResults.filter(r => r.confidence > 0.8).length}
                      </div>
                      <div className="text-sm text-gray-500">High Confidence</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={6}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {Math.max(...rcaResults.map(r => r.impact)).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Max Impact</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={6}>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(
                          (rcaResults.reduce((sum, r) => sum + r.confidence, 0) / rcaResults.length) *
                          100
                        ).toFixed(0)}
                        %
                      </div>
                      <div className="text-sm text-gray-500">Avg Confidence</div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </>
        )}

        {!analyzing && rcaResults.length === 0 && (
          <Col xs={24}>
            <Card className="text-center py-12">
              <ExperimentOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
              <Title level={4} className="text-gray-400">
                No Analysis Results
              </Title>
              <Paragraph className="text-gray-500">
                Configure your analysis parameters and click "Run Analysis" to identify root causes.
              </Paragraph>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default RootCauseAnalysis;
