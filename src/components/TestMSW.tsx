import React from "react";

const TestMSW: React.FC = () => {
  // Log environment variables to show how .env is read
  console.log("Environment Variables Demo:");
  console.log("NODE_ENV:", import.meta.env.MODE);
  console.log("DEV:", import.meta.env.DEV);
  console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
  console.log("All environment variables:", import.meta.env);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f0f0f0",
        margin: "20px",
        borderRadius: "8px",
      }}
    >
      <h2>Environment Variables Test</h2>
      <p>
        <strong>NODE_ENV:</strong> {import.meta.env.MODE}
      </p>
      <p>
        <strong>VITE_API_BASE_URL:</strong>{" "}
        {import.meta.env.VITE_API_BASE_URL || "Not set"}
      </p>
      <p>
        <strong>Note:</strong> In Vite, environment variables must be prefixed with VITE_ to be accessible in the browser
      </p>
      <p>Check the browser console for more environment variable details!</p>
    </div>
  );
};

export default TestMSW;
