import React, { useState, useEffect } from 'react';

const Results = ({ results, surveyData, onRestart }) => {
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onRestart();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRestart]);

  const getAreaName = (area) => {
    const names = {
      cocina: 'Cocina',
      living: 'Living y Comedor',
      dormitorio: 'Dormitorio',
      bano: 'Baño',
      oficina: 'Oficina en Casa',
      exterior: 'Exterior y Jardín'
    };
    return names[area] || area;
  };

  const getAreaIcon = (area) => {
    const icons = {
      cocina: '🍳',
      living: '🛋️',
      dormitorio: '🛏️',
      bano: '🚿',
      oficina: '💼',
      exterior: '🌳'
    };
    return icons[area] || '📍';
  };

  const getAreaDescription = (area) => {
    const descriptions = {
      cocina: 'Electrodomésticos, muebles de cocina, islas centrales y soluciones de almacenamiento',
      living: 'Sofás, mesas de centro, iluminación y decoración para espacios sociales',
      dormitorio: 'Camas, roperos, textiles y accesorios para el descanso',
      bano: 'Sanitarios, grifería, muebles de baño y accesorios',
      oficina: 'Escritorios, sillas ergonómicas y soluciones de almacenamiento para trabajo',
      exterior: 'Muebles de jardín, parrillas y decoración exterior'
    };
    return descriptions[area] || 'Productos especializados para esta área';
  };

  return (
    <div className="card">
      <div className="result-container">
        <div className="timer">
          ⏰ Reinicio automático en {timeLeft}s
        </div>

        <h1 className="result-title">🎯 Tus Áreas Recomendadas</h1>
        <p className="result-description">
          Basándonos en tus respuestas, te recomendamos visitar estas áreas del evento 
          donde encontrarás los productos más relevantes para tu proyecto.
        </p>

        <div className="recommendations">
          {results.topAreas.map(({ area, score }, index) => (
            <div key={area} className="area-card" style={{ 
              background: index === 0 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : index === 1 
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            }}>
              <div className="option-icon">{getAreaIcon(area)}</div>
              <h2 className="area-title">
                {index + 1}. {getAreaName(area)}
              </h2>
              <p className="area-description">
                {getAreaDescription(area)}
              </p>
              <div style={{ 
                marginTop: '15px',
                fontSize: '14px',
                opacity: 0.8
              }}>
                Relevancia: {Math.round((score / 15) * 100)}%
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '40px' }}>
          <h2 className="question-title">📋 Productos Específicos Recomendados</h2>
          
          <div className="recommendations">
            {results.recommendations.map((rec, index) => (
              <div key={index} className="recommendation-item">
                <h3 className="recommendation-title">{rec.title}</h3>
                <p className="recommendation-description">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="area-card" style={{ marginTop: '40px' }}>
          <h2 className="area-title">🗺️ Plan de Visita Sugerido</h2>
          <p className="area-description">
            Te recomendamos visitar las áreas en el siguiente orden para maximizar tu experiencia:
          </p>
          
          <div style={{ marginTop: '20px' }}>
            {results.topAreas.map(({ area }, index) => (
              <div key={area} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                margin: '10px 0',
                padding: '10px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px'
              }}>
                <span style={{ 
                  fontSize: '24px', 
                  marginRight: '15px' 
                }}>
                  {getAreaIcon(area)}
                </span>
                <div>
                  <strong>{index + 1}. {getAreaName(area)}</strong>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>
                    {getAreaDescription(area)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button className="btn" onClick={onRestart}>
            Realizar Nueva Encuesta
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results; 