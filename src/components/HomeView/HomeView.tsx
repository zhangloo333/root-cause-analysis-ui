import React from "react";
import { Card, Typography, Row, Col, Divider, List } from "antd";
import {
  InfoCircleOutlined,
  BookOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import MetricCard from "../common/MetricCard";

const { Title, Paragraph, Text } = Typography;

const HomeView: React.FC = () => {
  const features = [
    "Visualize daily and hourly business metrics",
    "Support for week-over-week comparisons",
    "Interactive graph exploration capabilities",
    "Root Cause Analysis (RCA) algorithm",
    "Data export to Excel functionality",
    "Real-time metric monitoring",
  ];

  const resources = [
    {
      title: "API Documentation",
      description: "Complete API endpoint documentation",
    },
    { title: "User Guide", description: "Step-by-step usage instructions" },
    {
      title: "Technical Architecture",
      description: "System design and architecture overview",
    },
    {
      title: "Troubleshooting Guide",
      description: "Common issues and solutions",
    },
  ];

  // return (
  //   <div>
  //     <div className="text-center mb-8">
  //       <Title level={1}>RCA Frontend</Title>
  //       <Paragraph className="text-lg text-gray-600">
  //         Visualization tool for understanding and troubleshooting systems
  //       </Paragraph>
  //     </div>
  //     <Row gutter={[24, 24]}>
  //       <Col xs={24}>
  //         <Card title="Sample Metrics Overview">
  //           <Row gutter={[16, 16]}>
  //             <Col xs={24} sm={12} md={6}>
  //               <MetricCard
  //                 title="Daily Sessions"
  //                 value={142587262}
  //                 change={2.5}
  //                 trend="up"
  //               />
  //             </Col>
  //             <Col xs={24} sm={12} md={6}>
  //               <MetricCard
  //                 title="Weekly Revenue"
  //                 value={8759234}
  //                 change={-1.2}
  //                 trend="down"
  //               />
  //             </Col>
  //             <Col xs={24} sm={12} md={6}>
  //               <MetricCard
  //                 title="Active Users"
  //                 value={45892341}
  //                 change={0.8}
  //                 trend="up"
  //               />
  //             </Col>
  //             <Col xs={24} sm={12} md={6}>
  //               <MetricCard
  //                 title="Conversion Rate"
  //                 value={3.45}
  //                 change={0.0}
  //                 trend="stable"
  //               />
  //             </Col>
  //           </Row>
  //         </Card>
  //       </Col>
  //     </Row>
  //   </div>
  // );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <Title level={1}>RCA Frontend</Title>
        <Paragraph className="text-lg text-gray-600">
          Visualization tool for understanding and troubleshooting systems
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        
        {/* <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <InfoCircleOutlined className="mr-2" />
                Project Overview
              </span>
            }
            className="h-full"
          >
            <Paragraph>
              RCA is a comprehensive visualization tool designed to help
              understand and troubleshoot complex systems. It provides powerful
              visualizations for the Triceratops platform, focusing on ecosystem
              dependencies of business metrics.
            </Paragraph>
            <Paragraph>
              The application offers both daily and hourly metric analysis with
              advanced features like graph exploration, root cause analysis, and
              comprehensive data export capabilities.
            </Paragraph>
          </Card>
        </Col> */}

        {/* <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                <ToolOutlined className="mr-2" />
                Core Features
              </span>
            }
            className="h-full"
          >
            <List
              dataSource={features}
              renderItem={(item) => (
                <List.Item>
                  <Text>{item}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col> */}

        {/* <Col xs={24}>
          <Card
            title={
              <span>
                <BookOutlined className="mr-2" />
                Documentation & Resources
              </span>
            }
          >
            <Row gutter={[16, 16]}>
              {resources.map((resource, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Card size="small" className="h-full">
                    <Title level={5}>{resource.title}</Title>
                    <Paragraph className="text-sm text-gray-600 mb-0">
                      {resource.description}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col> */}

        <Col xs={24}>
          <Card title="Sample Metrics Overview">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <MetricCard
                  title="Daily Sessions"
                  value={142587262}
                  change={2.5}
                  trend="up"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <MetricCard
                  title="Weekly Revenue"
                  value={8759234}
                  change={-1.2}
                  trend="down"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <MetricCard
                  title="Active Users"
                  value={45892341}
                  change={0.8}
                  trend="up"
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <MetricCard
                  title="Conversion Rate"
                  value={3.45}
                  change={0.0}
                  trend="stable"
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24}>
          <Divider />
          <div className="text-center">
            <Title level={3}>Get Started</Title>
            <Paragraph>
              Navigate to <Text strong>Daily Metrics</Text> to explore daily
              business metrics with interactive visualizations, or visit{" "}
              <Text strong>Hourly Metrics</Text> for time-based analysis of
              hourly data.
            </Paragraph>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default HomeView;
