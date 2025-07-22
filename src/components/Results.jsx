import React, { useState, useEffect } from 'react';

const Results = ({ results, surveyData, onRestart }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Función para usar audio pregrabado con voz femenina (solución práctica)
  const speakWithPreRecordedAudio = () => {
    const topAreas = results.topAreas;
    const areaNames = topAreas.map(area => getAreaName(area.area));
    
    // Crear mensaje personalizado basado en las áreas
    const speechText = `Basándome en tus respuestas, te recomiendo visitar principalmente el área de ${areaNames[0]}. También te sugiero el área de ${areaNames[1]}. Y finalmente, considera el área de ${areaNames[2]}. Estas áreas tienen los productos que mejor se adaptan a tus necesidades. ¡Disfruta tu visita al evento!`;
    
    // Usar Web Speech API con configuración optimizada para voz femenina
    speakWithOptimizedTTS(speechText);
  };

  // Función para usar Web Speech API optimizada para voz femenina
  const speakWithOptimizedTTS = (text) => {
    if ('speechSynthesis' in window) {
      // Cancelar cualquier reproducción anterior
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.85; // Velocidad ligeramente más lenta
      utterance.pitch = 1.3; // Pitch alto para sonar más femenino
      utterance.volume = 1;

      // Intentar seleccionar una voz femenina
      const voices = window.speechSynthesis.getVoices();
      console.log('🎤 Voces disponibles:', voices.map(v => `${v.name} (${v.lang})`));
      
      // Buscar voces que suenen más femeninas
      const femaleVoiceNames = [
        'maria', 'mujer', 'female', 'woman', 'girl', 'sara', 'ana', 'lucia',
        'sofia', 'carmen', 'isabel', 'elena', 'patricia', 'monica', 'laura',
        'helena', 'nuria', 'paula', 'claudia', 'diana', 'julia', 'rosa',
        'teresa', 'angela', 'beatriz', 'cristina', 'dolores', 'victoria',
        'adriana', 'silvia', 'marta', 'irene', 'raquel', 'elena'
      ];
      
      // Buscar voz femenina en español
      let selectedVoice = voices.find(voice => 
        voice.lang.includes('es') && 
        femaleVoiceNames.some(name => 
          voice.name.toLowerCase().includes(name)
        )
      );
      
      // Si no encuentra, buscar cualquier voz en español
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.includes('es'));
      }
      
      // Si no hay voces en español, buscar cualquier voz femenina
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          femaleVoiceNames.some(name => 
            voice.name.toLowerCase().includes(name)
          )
        );
      }
      
      // Si no hay voces femeninas, usar la primera disponible
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('🎤 Voz seleccionada:', selectedVoice.name, selectedVoice.lang);
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('🔊 Iniciando reproducción de voz');
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('✅ Reproducción de voz completada');
      };
      
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        console.log('❌ Error en reproducción de voz:', event.error);
      };

      // Forzar la reproducción
      window.speechSynthesis.speak(utterance);
      
      // Verificar si se está reproduciendo después de un momento
      setTimeout(() => {
        if (!window.speechSynthesis.speaking) {
          console.log('⚠️ La voz no se reprodujo, intentando de nuevo...');
          window.speechSynthesis.speak(utterance);
        }
      }, 100);
      
    } else {
      console.log('❌ Speech Synthesis no soportado en este navegador');
      // Mostrar el texto como alternativa
      alert(`Recomendaciones: ${text}`);
    }
  };

  // Función para leer las recomendaciones en voz alta
  const speakRecommendations = () => {
    speakWithPreRecordedAudio();
  };

  // Función para detener el audio
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    console.log('🔇 Audio detenido');
  };

  // Leer automáticamente cuando se muestren los resultados
  useEffect(() => {
    // Esperar a que las voces estén disponibles
    const loadVoicesAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('🎤 Voces cargadas:', voices.map(v => `${v.name} (${v.lang})`));
        
        // Reproducir audio inmediatamente
        speakRecommendations();
      } else {
        // Si las voces no están disponibles, esperar un poco más
        setTimeout(loadVoicesAndSpeak, 200);
      }
    };

    // Intentar cargar voces inmediatamente
    loadVoicesAndSpeak();

    // También intentar después de un delay para asegurar que las voces estén cargadas
    const timer = setTimeout(() => {
      loadVoicesAndSpeak();
    }, 500);

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

        <div className="restart-section">
          <button 
            className="btn restart-btn"
            onClick={onRestart}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              margin: '20px 10px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '25px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#1976D2';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(33, 150, 243, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#2196F3';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 8px rgba(33, 150, 243, 0.3)';
            }}
          >
            🔄 Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results; 