import React, { useState, useEffect } from 'react';

const Results = ({ results, surveyData, onRestart }) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  // Función para leer las recomendaciones en voz alta
  const speakRecommendations = () => {
    if ('speechSynthesis' in window) {
      // Detener cualquier audio previo
      window.speechSynthesis.cancel();

      const topAreas = results.topAreas;
      let speechText = `Basándome en tus respuestas, te recomiendo visitar: `;
      
      topAreas.forEach((area, index) => {
        const areaName = getAreaName(area.area);
        if (index === 0) {
          speechText += `principalmente el área de ${areaName}. `;
        } else if (index === 1) {
          speechText += `También te sugiero el área de ${areaName}. `;
        } else {
          speechText += `Y finalmente, considera el área de ${areaName}. `;
        }
      });

      speechText += `Estas áreas tienen los productos que mejor se adaptan a tus necesidades. ¡Disfruta tu visita al evento!`;

      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Función para detener el audio
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Leer automáticamente cuando se muestren los resultados
  useEffect(() => {
    // Esperar 1 segundo antes de leer para que el usuario vea los resultados
    const timer = setTimeout(() => {
      speakRecommendations();
    }, 1000);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, []);

  const getAreaName = (area) => {
    const areaNames = {
      cocina: 'Cocina y Electrodomésticos',
      living: 'Living y Comedor',
      dormitorio: 'Dormitorio y Descanso',
      bano: 'Baño y Sanitarios',
      oficina: 'Oficina y Trabajo',
      exterior: 'Exterior y Jardín'
    };
    return areaNames[area] || area;
  };

  const getAreaIcon = (area) => {
    const areaIcons = {
      cocina: '🍳',
      living: '🛋️',
      dormitorio: '🛏️',
      bano: '🚿',
      oficina: '💼',
      exterior: '🌿'
    };
    return areaIcons[area] || '🏠';
  };

  const getAreaDescription = (area) => {
    const areaDescriptions = {
      cocina: 'Encuentra todo para tu cocina: electrodomésticos, muebles y accesorios.',
      living: 'Muebles, decoración y elementos para crear el living de tus sueños.',
      dormitorio: 'Camas, roperos y todo para un dormitorio confortable y elegante.',
      bano: 'Sanitarios, grifería y accesorios para renovar tu baño.',
      oficina: 'Muebles y equipamiento para crear tu espacio de trabajo ideal.',
      exterior: 'Muebles de jardín, plantas y decoración para exteriores.'
    };
    return areaDescriptions[area] || 'Productos especializados para esta área.';
  };

  return (
    <div className="card">
      <div className="result-container">
        <div className="timer">
          ⏰ Reinicio automático en {timeLeft}s
        </div>
        
        <h1 className="result-title">🎯 Tus Recomendaciones Personalizadas</h1>
        
        <div className="recommendations">
          <h2>📍 Áreas Recomendadas para Visitar:</h2>
          
          {results.topAreas.map((area, index) => (
            <div key={area.area} className="recommendation-item">
              <div className="area-card">
                <div className="area-icon">{getAreaIcon(area.area)}</div>
                <div className="area-content">
                  <h3 className="area-title">
                    {index + 1}. {getAreaName(area.area)}
                  </h3>
                  <p className="area-description">
                    {getAreaDescription(area.area)}
                  </p>
                  <div className="area-score">
                    Puntuación: {area.score} puntos
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="voice-controls">
          <button 
            className={`btn ${isSpeaking ? 'speaking' : ''}`}
            onClick={isSpeaking ? stopSpeaking : speakRecommendations}
            style={{
              backgroundColor: isSpeaking ? '#ff6b6b' : '#4CAF50',
              margin: '10px'
            }}
          >
            {isSpeaking ? '🔇 Detener Audio' : '🔊 Escuchar Recomendaciones'}
          </button>
        </div>

        <div className="survey-summary">
          <h3>📋 Resumen de tus Respuestas:</h3>
          <p><strong>Tipo de vivienda:</strong> {surveyData.tipoVivienda}</p>
          <p><strong>Estilo preferido:</strong> {surveyData.estilo}</p>
          <p><strong>Presupuesto:</strong> {surveyData.presupuesto}</p>
          <p><strong>Prioridad:</strong> {surveyData.prioridad}</p>
        </div>

        <div className="result-footer">
          <p className="result-note">
            💡 Estas recomendaciones están basadas en un algoritmo inteligente que analiza tus preferencias y necesidades específicas.
          </p>
          <p className="result-note">
            🎉 ¡Disfruta explorando estas áreas y encuentra los productos perfectos para tu hogar!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Results; 