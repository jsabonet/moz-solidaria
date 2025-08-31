import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'red', fontSize: '24px' }}>🔥 REACT IS WORKING! 🔥</h1>
      <p style={{ fontSize: '18px', margin: '20px 0' }}>This is a simple test component to verify React rendering.</p>
      <div style={{ backgroundColor: 'white', padding: '15px', border: '1px solid #ccc', marginTop: '20px' }}>
        <h2>Environment Variables:</h2>
        <ul>
          <li><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'NOT_SET'}</li>
          <li><strong>VITE_FRONTEND_URL:</strong> {import.meta.env.VITE_FRONTEND_URL || 'NOT_SET'}</li>
          <li><strong>MODE:</strong> {import.meta.env.MODE}</li>
          <li><strong>DEV:</strong> {import.meta.env.DEV ? 'true' : 'false'}</li>
          <li><strong>PROD:</strong> {import.meta.env.PROD ? 'true' : 'false'}</li>
        </ul>
      </div>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: 'lightblue' }}>
        <p>Current time: {new Date().toLocaleString()}</p>
        <p>If you can see this, React is successfully rendering components!</p>
      </div>
    </div>
  );
};

export default TestComponent;
