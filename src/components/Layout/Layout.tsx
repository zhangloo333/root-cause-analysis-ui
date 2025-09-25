import React from "react";
import { Layout as AntLayout, Menu, Typography } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChartOutlined,
  ClockCircleOutlined,
  NodeExpandOutlined,
  ExperimentOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import logo from "../../icon/logo.svg";

const { Header, Content } = AntLayout;
const { Title } = Typography;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/daily",
      icon: <BarChartOutlined />,
      label: "Daily Metrics",
    },
    {
      key: "/hourly",
      icon: <ClockCircleOutlined />,
      label: "Hourly Metrics",
    },
    {
      key: "/graph",
      icon: <NodeExpandOutlined />,
      label: "Graph Exploration",
    },
    {
      key: "/rca",
      icon: <ExperimentOutlined />,
      label: "Root Cause Analysis",
    },
    {
      key: "/export",
      icon: <CloudDownloadOutlined />,
      label: "Export & Utilities",
    },
  ];

  const handleMenuClick = (e: any) => {
    navigate(e.key);
  };

  return (
    <AntLayout className="rca-layout">
      <Header className="rca-header">
        <div className="flex items-center h-full">
          <div 
            className="flex items-center gap-2 mr-8 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <img src={logo} alt="RCA" className="w-8 h-8" />
            <span className="text-white text-xl font-semibold">RCA</span>
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="bg-transparent border-none flex-1"
            style={{ lineHeight: '56px' }}
          />
        </div>
      </Header>
      <Content className="rca-content">{children}</Content>
    </AntLayout>
  );
};

export default Layout;
