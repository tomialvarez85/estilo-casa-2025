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
        
        <div className="area-card">
          <h2 className="area-title">Encuentra tu camino perfecto</h2>
          <p className="area-description">
            Con más de 200 expositores y miles de productos, sabemos que puede ser abrumador 
            encontrar exactamente lo que necesitas. Nuestra encuesta inteligente te ayudará 
            a descubrir las áreas del evento más relevantes para tu proyecto.
          </p>
        </div>

        <div className="recommendations">
          <div className="recommendation-item">
            <h3 className="recommendation-title">🎯 Personalizado</h3>
            <p className="recommendation-description">
              Respuestas adaptadas a tu tipo de vivienda, estilo y presupuesto
            </p>
          </div>
          
          <div className="recommendation-item">
            <h3 className="recommendation-title">⚡ Rápido</h3>
            <p className="recommendation-description">
              Solo 5 preguntas para obtener recomendaciones precisas
            </p>
          </div>
          
          <div className="recommendation-item">
            <h3 className="recommendation-title">🗺️ Orientación</h3>
            <p className="recommendation-description">
              Mapa detallado de las áreas que debes visitar en el evento
            </p>
          </div>
        </div>

        <button className="btn" onClick={onStart}>
          Comenzar Encuesta
        </button>
      </div>
    </div>
  );
};

export default Welcome; 