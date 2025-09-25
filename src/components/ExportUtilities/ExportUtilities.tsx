import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Select,
  Space,
  message,
  Table,
  Tag,
  DatePicker,
  Checkbox,
  Progress,
  Divider,
} from "antd";
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  SettingOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import {
  mockMetricData,
  mockHistoryData,
  mockRCAResults,
} from "../../services/mockData";
import { downloadFile } from "../../utils/formatters";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

interface ExportConfig {
  format: "excel" | "csv" | "pdf" | "png";
  dataType: "metrics" | "history" | "rca" | "all";
  dateRange: any;
  includeCharts: boolean;
  includeSummary: boolean;
  includeRawData: boolean;
  compression: boolean;
}

const ExportUtilities: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [config, setConfig] = useState<ExportConfig>({
    format: "excel",
    dataType: "metrics",
    dateRange: [dayjs().subtract(7, "days"), dayjs()],
    includeCharts: true,
    includeSummary: true,
    includeRawData: true,
    compression: false,
  });

  const exportData = async () => {
    try {
      setLoading(true);
      setExportProgress(0);

      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 20;
        });
      }, 300);

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      let exportData: any = {};
      let filename = "";

      // Prepare data based on type
      switch (config.dataType) {
        case "metrics":
          exportData = mockMetricData;
          filename = `root-cause_metrics_${dayjs().format("YYYY-MM-DD")}`;
          break;
        case "history":
          exportData = mockHistoryData;
          filename = `root-cause-analysis_history_${dayjs().format(
            "YYYY-MM-DD"
          )}`;
          break;
        case "rca":
          exportData = mockRCAResults;
          filename = `root-cause-analysis_rca_${dayjs().format("YYYY-MM-DD")}`;
          break;
        case "all":
          exportData = {
            metrics: mockMetricData,
            history: mockHistoryData,
            rca: mockRCAResults,
          };
          filename = `root-cause-analysis_complete_${dayjs().format(
            "YYYY-MM-DD"
          )}`;
          break;
      }

      // Generate export content based on format
      let content: string;
      let mimeType: string;
      let extension: string;

      switch (config.format) {
        case "excel":
          content = generateExcelContent(exportData);
          mimeType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          extension = "xlsx";
          break;
        case "csv":
          content = generateCSVContent(exportData);
          mimeType = "text/csv";
          extension = "csv";
          break;
        case "pdf":
          content = generatePDFContent(exportData);
          mimeType = "application/pdf";
          extension = "pdf";
          break;
        case "png":
          content = generateImageContent(exportData);
          mimeType = "image/png";
          extension = "png";
          break;
        default:
          throw new Error("Unsupported format");
      }

      setExportProgress(100);
      clearInterval(progressInterval);

      // Download file
      downloadFile(content, `${filename}.${extension}`, mimeType);

      message.success(
        `Data exported successfully as ${config.format.toUpperCase()}`
      );
    } catch (error) {
      message.error("Export failed");
    } finally {
      setLoading(false);
      setTimeout(() => setExportProgress(0), 2000);
    }
  };

  const generateExcelContent = (data: any): string => {
    // Mock Excel content (base64 encoded)
    return "UEsDBBQAAAAIABkAAABkZXRlY3RpdmVfZXhwb3J0Lnhsc3g=";
  };

  const generateCSVContent = (data: any): string => {
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      const rows = data.map((item) =>
        headers.map((header) => item[header]).join(",")
      );
      return [headers.join(","), ...rows].join("\n");
    }
    return JSON.stringify(data, null, 2);
  };

  const generatePDFContent = (data: any): string => {
    // Mock PDF content (base64 encoded)
    return "JVBERi0xLjQKJcOkw7zDtsOgCjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0=";
  };

  const generateImageContent = (data: any): string => {
    // Mock PNG content (base64 encoded)
    return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  };

  const getEstimatedFileSize = (): string => {
    let baseSize = 0;

    switch (config.dataType) {
      case "metrics":
        baseSize = 50;
        break;
      case "history":
        baseSize = 30;
        break;
      case "rca":
        baseSize = 20;
        break;
      case "all":
        baseSize = 100;
        break;
    }

    if (config.includeCharts) baseSize += 200;
    if (config.includeSummary) baseSize += 50;
    if (config.includeRawData) baseSize += 100;

    switch (config.format) {
      case "excel":
        baseSize *= 1.5;
        break;
      case "pdf":
        baseSize *= 2;
        break;
      case "png":
        baseSize *= 0.5;
        break;
    }

    if (config.compression) baseSize *= 0.7;

    return baseSize > 1000
      ? `${(baseSize / 1000).toFixed(1)} MB`
      : `${Math.round(baseSize)} KB`;
  };

  const exportTemplates = [
    {
      name: "Daily Report",
      description: "Standard daily metrics report with charts",
      config: {
        format: "excel",
        dataType: "metrics",
        includeCharts: true,
        includeSummary: true,
      },
    },
    {
      name: "Historical Analysis",
      description: "Historical data trends and patterns",
      config: {
        format: "csv",
        dataType: "history",
        includeCharts: false,
        includeSummary: false,
      },
    },
    {
      name: "RCA Summary",
      description: "Root cause analysis results",
      config: {
        format: "pdf",
        dataType: "rca",
        includeCharts: true,
        includeSummary: true,
      },
    },
    {
      name: "Complete Dataset",
      description: "All data with comprehensive analysis",
      config: {
        format: "excel",
        dataType: "all",
        includeCharts: true,
        includeSummary: true,
      },
    },
  ];

  const utilityFunctions = [
    {
      name: "Data Validation",
      description: "Validate data integrity and completeness",
      action: () => {
        message.info("Data validation completed - No issues found");
      },
    },
    {
      name: "Cache Clear",
      description: "Clear application cache and temporary data",
      action: () => {
        localStorage.clear();
        message.success("Cache cleared successfully");
      },
    },
    {
      name: "Format Converter",
      description: "Convert between different data formats",
      action: () => {
        message.info("Format converter opened");
      },
    },
    {
      name: "Data Compression",
      description: "Compress large datasets for storage",
      action: () => {
        message.info("Data compression utility opened");
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2}>
          <CloudDownloadOutlined className="mr-2" />
          Export & Utilities
        </Title>
        <Paragraph>
          Export data in various formats and access utility functions for data
          processing.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Export Configuration" className="mb-6">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <Select
                  value={config.format}
                  onChange={(value) =>
                    setConfig((prev) => ({ ...prev, format: value }))
                  }
                  style={{ width: "100%" }}
                  options={[
                    {
                      value: "excel",
                      label: "Excel (.xlsx)",
                      icon: <FileExcelOutlined />,
                    },
                    {
                      value: "csv",
                      label: "CSV (.csv)",
                      icon: <DownloadOutlined />,
                    },
                    {
                      value: "pdf",
                      label: "PDF (.pdf)",
                      icon: <FilePdfOutlined />,
                    },
                    {
                      value: "png",
                      label: "Image (.png)",
                      icon: <FileImageOutlined />,
                    },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Type
                </label>
                <Select
                  value={config.dataType}
                  onChange={(value) =>
                    setConfig((prev) => ({ ...prev, dataType: value }))
                  }
                  style={{ width: "100%" }}
                  options={[
                    { value: "metrics", label: "Metrics Data" },
                    { value: "history", label: "Historical Data" },
                    { value: "rca", label: "RCA Results" },
                    { value: "all", label: "All Data" },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={12}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <RangePicker
                  value={config.dateRange}
                  onChange={(dates) =>
                    setConfig((prev) => ({ ...prev, dateRange: dates }))
                  }
                  style={{ width: "100%" }}
                />
              </Col>
            </Row>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Checkbox
                  checked={config.includeCharts}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      includeCharts: e.target.checked,
                    }))
                  }
                >
                  Include Charts
                </Checkbox>
              </Col>
              <Col xs={24} sm={8}>
                <Checkbox
                  checked={config.includeSummary}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      includeSummary: e.target.checked,
                    }))
                  }
                >
                  Include Summary
                </Checkbox>
              </Col>
              <Col xs={24} sm={8}>
                <Checkbox
                  checked={config.includeRawData}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      includeRawData: e.target.checked,
                    }))
                  }
                >
                  Include Raw Data
                </Checkbox>
              </Col>
            </Row>

            <Row gutter={[16, 16]} className="mt-4">
              <Col xs={24} sm={8}>
                <Checkbox
                  checked={config.compression}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      compression: e.target.checked,
                    }))
                  }
                >
                  Enable Compression
                </Checkbox>
              </Col>
              <Col xs={24} sm={16}>
                <div className="text-sm text-gray-500">
                  Estimated file size: <strong>{getEstimatedFileSize()}</strong>
                </div>
              </Col>
            </Row>

            <Divider />

            <div className="flex justify-between items-center">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportData}
                loading={loading}
                size="large"
              >
                Export Data
              </Button>

              {loading && (
                <div className="flex-1 ml-4">
                  <Progress
                    percent={exportProgress}
                    status={exportProgress === 100 ? "success" : "active"}
                    size="small"
                  />
                </div>
              )}
            </div>
          </Card>

          <Card title="Export Templates">
            <Row gutter={[16, 16]}>
              {exportTemplates.map((template, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Card size="small" className="h-full">
                    <div className="flex justify-between items-start mb-2">
                      <Title level={5} className="mb-0">
                        {template.name}
                      </Title>
                      <Button
                        size="small"
                        type="link"
                        onClick={() =>
                          setConfig((prev) => ({
                            ...prev,
                            ...(template.config as any),
                          }))
                        }
                      >
                        Use Template
                      </Button>
                    </div>
                    <Paragraph className="text-sm text-gray-600 mb-0">
                      {template.description}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Data Processing Utilities" className="mb-6">
            <Space direction="vertical" style={{ width: "100%" }}>
              {utilityFunctions.map((utility, index) => (
                <Card
                  size="small"
                  key={index}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div onClick={utility.action}>
                    <div className="flex items-center justify-between mb-2">
                      <Title level={5} className="mb-0">
                        {utility.name}
                      </Title>
                      <SettingOutlined />
                    </div>
                    <Paragraph className="text-sm text-gray-600 mb-0">
                      {utility.description}
                    </Paragraph>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>

          <Card title="Export History">
            <Table
              size="small"
              pagination={false}
              dataSource={[
                {
                  key: 1,
                  file: "metrics_2024-06-14.xlsx",
                  size: "2.3 MB",
                  date: "2024-06-14 10:30",
                },
                {
                  key: 2,
                  file: "rca_results_2024-06-13.pdf",
                  size: "1.8 MB",
                  date: "2024-06-13 15:45",
                },
                {
                  key: 3,
                  file: "history_data_2024-06-12.csv",
                  size: "856 KB",
                  date: "2024-06-12 09:15",
                },
              ]}
              columns={[
                {
                  title: "File",
                  dataIndex: "file",
                  key: "file",
                  render: (file: string) => (
                    <div className="text-xs">
                      <div className="font-medium">{file}</div>
                    </div>
                  ),
                },
                {
                  title: "Size",
                  dataIndex: "size",
                  key: "size",
                  render: (size: string) => <Tag>{size}</Tag>,
                },
                {
                  title: "Date",
                  dataIndex: "date",
                  key: "date",
                  render: (date: string) => (
                    <div className="text-xs text-gray-500">{date}</div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ExportUtilities;
