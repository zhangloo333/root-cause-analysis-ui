import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  DatePicker,
  Select,
  Space,
  Spin,
  message,
} from "antd";
import {
  BarChartOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { BarChart, LineChart, PieChart } from "../charts";
import {
  mockAvailableResponse,
  mockMetricData,
  mockHistoryData,
} from "../../services/mockData";
import { formatDate, downloadFile } from "../../utils/formatters";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;

const MetricsView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [metricType, setMetricType] = useState("sessions_daily");
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [weekComparison, setWeekComparison] = useState(4);
  const [metricData, setMetricData] = useState<any>(null);
  const [availableDate, setAvailableDate] = useState<number | null>(null);
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");

  useEffect(() => {
    // Load available date on component mount
    loadAvailableDate();
  }, [metricType]);

  const loadAvailableDate = async () => {
    try {
      setLoading(true);
      // For demo purposes, use mock data
      const response = mockAvailableResponse;
      setAvailableDate(response.latest);
      setSelectedDate(dayjs(response.latest));
    } catch (error) {
      message.error("Failed to load available dates");
    } finally {
      setLoading(false);
    }
  };

  const buildGraph = async () => {
    try {
      setLoading(true);
      // For demo purposes, use mock data
      const response = mockMetricData;
      setMetricData(response);
      message.success("Graph built successfully");
    } catch (error) {
      message.error("Failed to build graph");
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);
      // For demo purposes, simulate export
      const exportData = {
        filename: "rca_metrics_export.xlsx",
        data: "UEsDBBQAAAAIABkAAABkZXRlY3RpdmVfbWV0cmljc19leHBvcnQueGxzeA==",
      };
      downloadFile(
        exportData.data,
        exportData.filename,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      message.success("Data exported successfully");
    } catch (error) {
      message.error("Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  const getBarChartData = () => {
    if (!metricData) return [];
    return Object.entries(metricData)
      .filter(([key]) => key !== "total")
      .map(([key, value]: [string, any]) => ({
        name: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        value: value.data?.[0]?.value || 0,
        change: value.data?.[0]?.change || 0,
      }));
  };

  const getLineChartData = () => {
    return mockHistoryData.map((d) => ({
      date: d.date,
      value: d.value,
    }));
  };

  const getPieChartData = () => {
    if (!metricData) return [];
    return Object.entries(metricData)
      .filter(([key]) => key !== "total")
      .map(([key, value]: [string, any]) => ({
        name: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        value: value.data?.[0]?.value || 0,
      }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2}>
          <BarChartOutlined className="mr-2" />
          Daily Metrics
        </Title>
        <Paragraph>
          Explore daily business metrics with interactive visualizations and
          week-over-week comparisons.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card title="Metric Configuration" className="mb-6">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={4}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metric Type
                </label>
                <Select
                  value={metricType}
                  onChange={setMetricType}
                  style={{ width: "100%" }}
                  options={[
                    { value: "sessions_daily", label: "Daily Sessions" },
                    { value: "revenue_daily", label: "Daily Revenue" },
                    { value: "users_daily", label: "Daily Users" },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Week Comparison
                </label>
                <Select
                  value={weekComparison}
                  onChange={setWeekComparison}
                  style={{ width: "100%" }}
                  options={[
                    { value: 1, label: "1 Week" },
                    { value: 2, label: "2 Weeks" },
                    { value: 3, label: "3 Weeks" },
                    { value: 4, label: "4 Weeks" },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chart Type
                </label>
                <Select
                  value={chartType}
                  onChange={setChartType}
                  style={{ width: "100%" }}
                  options={[
                    { value: "bar", label: "Bar Chart" },
                    { value: "line", label: "Line Chart" },
                    { value: "pie", label: "Pie Chart" },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actions
                </label>
                <Space>
                  <Button
                    type="primary"
                    icon={<BarChartOutlined />}
                    onClick={buildGraph}
                    loading={loading}
                  >
                    Build Graph
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={exportData}
                    disabled={!metricData}
                    loading={loading}
                  >
                    Export
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadAvailableDate}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {availableDate && (
          <Col xs={24}>
            <Card title="Latest Available Data" size="small" className="mb-4">
              <p>
                Latest data available for:{" "}
                <strong>{formatDate(availableDate)}</strong>
              </p>
            </Card>
          </Col>
        )}

        <Col xs={24}>
          <Card title="Metrics Dashboard" className="chart-container">
            {loading ? (
              <div className="text-center py-12">
                <Spin size="large" />
                <p className="text-gray-500 mt-4">Loading data...</p>
              </div>
            ) : metricData ? (
              <div>
                {chartType === "bar" && (
                  <BarChart
                    data={getBarChartData()}
                    width={800}
                    height={400}
                    onBarClick={(data) => message.info(`Clicked: ${data.name}`)}
                  />
                )}
                {chartType === "line" && (
                  <LineChart
                    data={getLineChartData()}
                    width={800}
                    height={400}
                    onPointClick={(data) =>
                      message.info(`Clicked: ${data.date}`)
                    }
                  />
                )}
                {chartType === "pie" && (
                  <PieChart
                    data={getPieChartData()}
                    width={600}
                    height={400}
                    onSliceClick={(data) =>
                      message.info(`Clicked: ${data.name}`)
                    }
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChartOutlined
                  style={{ fontSize: "48px", color: "#d9d9d9" }}
                />
                <p className="text-gray-500 mt-4">
                  Select metric configuration and click "Build Graph" to
                  visualize data
                </p>
              </div>
            )}
          </Card>
        </Col>

        {metricData && (
          <Col xs={24}>
            <Card title="Week-over-Week Comparison" className="chart-container">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {metricData.total.baseline.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Current Week</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center p-4 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {metricData.total.Wo1W.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">1 Week Ago</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center p-4 bg-yellow-50 rounded">
                    <div className="text-2xl font-bold text-yellow-600">
                      {metricData.total.Wo2W.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">2 Weeks Ago</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div className="text-center p-4 bg-purple-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      {metricData.total.Wo4W.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">4 Weeks Ago</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default MetricsView;
