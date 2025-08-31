import React from 'react';

const TestComponent = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 React está funcionando!</h1>
      <p>Se você está vendo esta mensagem, o React está carregando corretamente.</p>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Informações de Debug:</h3>
        <p>Ambiente: {import.meta.env.MODE}</p>
        <p>API URL: {import.meta.env.VITE_API_URL || 'Não definida'}</p>
        <p>Data/Hora: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default TestComponent;
