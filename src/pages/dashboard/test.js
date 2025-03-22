import React, { useEffect, useRef, useState } from 'react';
import ChartsEmbedSDK from '@mongodb-js/charts-embed-dom';

const Test = () => {
  const chartRef = useRef(null);
  const dashboardRef = useRef(null);
  const sdkRef = useRef(null);
  const chartInstance = useRef(null);
  const dashboardInstance = useRef(null);
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
        setInitializationError('Failed to initialize ChartsEmbedSDK. Check your base URL and network connection.');
        setLoading(false);
        return;
      }
    }

    const sdk = sdkRef.current;

    const initializeCharts = async() => {
      try {
        // embed a chart
        const chart = sdk.createChart({
          chartId: 'a68230ec-5393-4c3a-9b42-ef407c39c7e4',
        });

        chartInstance.current = chart;

        if (chartRef.current) {
          await chart.render(chartRef.current);
        } else {
          console.error('Chart container not found');
        }

        // embed a dashboard
        const dashboard = sdk.createDashboard({
          dashboardId: '6b9c8eb5-d173-4a6f-ac40-40f69190de3b',
        });

        dashboardInstance.current = dashboard;

        if (dashboardRef.current) {
          await dashboard.render(dashboardRef.current);
        } else {
          console.error('Dashboard container not found');
        }

        // refresh the chart (example with timeout to avoid immediate refresh)
        setTimeout(() => {
          chartInstance.current?.refresh();
        }, 5000);

      } catch (error) {
        console.error('Failed to initialize chart or dashboard:', error);
        let errorMessage = `Failed to initialize chart or dashboard. Check your chart and dashboard IDs. `;
     
        setInitializationError(errorMessage);
      } finally {
        setLoading(false); // Ensure loading is set to false regardless of success or failure
      }
    };

    if (sdk) {
      initializeCharts();
    }

    return () => {
      if (chartInstance.current && typeof chartInstance.current.destroy === 'function') {
        chartInstance.current.destroy();
      }

      if (dashboardInstance.current && typeof dashboardInstance.current.destroy === 'function') {
        dashboardInstance.current.destroy();
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

      <div id="chart" ref={chartRef} style={{ display: loading ? 'none' : 'block' }}></div>
      <div id="fb_dashboard" ref={dashboardRef} style={{ display: loading ? 'none' : 'block' }}></div>
    </div>
  );
};

export default Test;