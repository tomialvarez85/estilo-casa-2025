import React from 'react';

const Welcome = ({ onStart }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="card">
      <div className="result-container">
        <h1 className="result-title">🏠 Estilo Casa {currentYear}</h1>
        <p className="result-description">
          ¡Bienvenido a la Expo de Equipamiento Interior más grande del año!
        </p>
        <p className="result-description">
          Completa esta breve encuesta para recibir recomendaciones personalizadas 
          sobre qué áreas del evento visitar según tus necesidades.
        </p>
        <button className="btn" onClick={onStart}>
          🚀 Comenzar Encuesta
        </button>
      </div>
    </div>
  );
};

export default Welcome; 