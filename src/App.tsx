import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import Layout from "./components/Layout/Layout";
import HomeView from "./components/HomeView/HomeView";
import MetricsView from "./components/MetricsView/MetricsView";
import HourlyView from "./components/HourlyView/HourlyView";
import GraphExploration from "./components/GraphExploration/GraphExploration";
import RootCauseAnalysis from "./components/RootCauseAnalysis/RootCauseAnalysis";
import ExportUtilities from "./components/ExportUtilities/ExportUtilities";
import TestMSW from "./components/TestMSW";
import "./App.css";

// Start MSW in development
if (import.meta.env.DEV) {
  import("./mocks/browser").then(({ worker }) => {
    worker
      .start({
        onUnhandledRequest: "warn",
      })
      .then(() => {
        console.log("🔶 MSW: Mock Service Worker started");
      })
      .catch((error: any) => {
        console.error("❌ MSW: Failed to start Mock Service Worker", error);
      });
  });
}

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/daily" element={<MetricsView />} />
            <Route path="/hourly" element={<HourlyView />} />
            <Route path="/graph" element={<GraphExploration />} />
            <Route path="/rca" element={<RootCauseAnalysis />} />
            <Route path="/export" element={<ExportUtilities />} />
            <Route path="/env-test" element={<TestMSW />} />
          </Routes>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App;
