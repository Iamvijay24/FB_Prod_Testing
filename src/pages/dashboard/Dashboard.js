import React, { useEffect, useRef, useState } from 'react';
import ChartsEmbedSDK from '@mongodb-js/charts-embed-dom';
import { useParams } from 'react-router-dom';

const Dashboard = () => {
  const dashboardRef = useRef(null);
  const sdkRef = useRef(null);
  const dashboardInstance = useRef(null);
  const [initializationError, setInitializationError] = useState(null);
  const [loading, setLoading] = useState(true);

  const {dashboardID} = useParams();

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

    const DASHBOARDID = dashboardID? dashboardID : "6b9c8eb5-d173-4a6f-ac40-40f69190de3b";

    const sdk = sdkRef.current;

    const initializeDashboard = async() => {
      try {
        const dashboard = sdk.createDashboard({
          dashboardId: DASHBOARDID,
        });

        dashboardInstance.current = dashboard;

        if (dashboardRef.current) {
          await dashboard.render(dashboardRef.current);
        } else {
          console.error('Dashboard container not found');
        }

        setTimeout(() => {
          dashboardInstance.current?.refresh();
        }, 5000);

      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        let errorMessage = `Failed to initialize dashboard. Check your dashboard ID. `;

        setInitializationError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (sdk) {
      initializeDashboard();
    }

    return () => {
      if (dashboardInstance.current && typeof dashboardInstance.current.destroy === 'function') {
        dashboardInstance.current.destroy();
      }
    };
  }, [dashboardID]);

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

      <div
        id="dashboard"
        ref={dashboardRef}
        style={{
          display: loading ? 'none' : 'block',
          width: '',
          height: '100vh',
        }}
      ></div>
    </div>
  );
};

export default Dashboard;