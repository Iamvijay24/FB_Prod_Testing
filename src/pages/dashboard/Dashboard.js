import React, { useEffect, useRef, useState } from 'react';
import ChartsEmbedSDK from '@mongodb-js/charts-embed-dom';

const Dashboard = () => {
  const dashboardRef = useRef(null); // Renamed chartRef to dashboardRef
  const sdkRef = useRef(null);
  const dashboardInstance = useRef(null); // Renamed chartInstance to dashboardInstance
  const [initializationError, setInitializationError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sdkRef.current) {
      try {
        sdkRef.current = new ChartsEmbedSDK({
          baseUrl: 'https://charts.mongodb.com/charts-project-0-ufymlzu',
        });
      } catch (error) {
        console.error('Failed to initialize ChartsEmbedSDK:', error);
        setInitializationError('Failed to initialize ChartsEmbedSDK.');
        setLoading(false);
        return;
      }
    }

    const sdk = sdkRef.current;

    const initializeDashboard = async() => { // Renamed initializeCharts to initializeDashboard
      try {
        // embed a dashboard
        const dashboard = sdk.createDashboard({ // Changed sdk.createChart to sdk.createDashboard
          dashboardId: '6b9c8eb5-d173-4a6f-ac40-40f69190de3b', // Ensure this is your dashboard ID
        });

        dashboardInstance.current = dashboard; // Updated chartInstance to dashboardInstance

        if (dashboardRef.current) { // Updated chartRef to dashboardRef
          await dashboard.render(dashboardRef.current); // Updated chartRef to dashboardRef
        } else {
          console.error('Dashboard container not found');
        }

        // refresh the dashboard every 5 seconds (if dashboard supports refresh)
        setTimeout(() => {
          dashboardInstance.current?.refresh(); // Updated chartInstance to dashboardInstance
        }, 5000);

      } catch (error) {
        console.error('Failed to initialize dashboard:', error); // More specific error message
        let errorMessage = `Failed to initialize dashboard. Check your dashboard ID. `;

        setInitializationError(errorMessage);
      } finally {
        setLoading(false); // Ensure loading is set to false regardless of success or failure
      }
    };

    if (sdk) {
      initializeDashboard(); // Updated initializeCharts to initializeDashboard
    }

    return () => {
      if (dashboardInstance.current && typeof dashboardInstance.current.destroy === 'function') { // Updated chartInstance to dashboardInstance
        dashboardInstance.current.destroy(); // Updated chartInstance to dashboardInstance
      }
    };
  }, []);

  return (
    <div>
      {initializationError && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {initializationError}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          Loading...
        </div>
      )}

      {/* Renamed chart to dashboard, and updated ref and styles */}
      <div
        id="dashboard"
        ref={dashboardRef}
        style={{
          display: loading ? 'none' : 'block',
          width: '', // Adjust as needed for a dashboard
          height: '100vh', // Adjust as needed for a dashboard
        }}
      ></div>
    </div>
  );
};

export default Dashboard;