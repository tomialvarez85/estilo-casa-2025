import React, { useState, useEffect } from 'react';

const Results = ({ results, surveyData, onRestart }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Función para leer las recomendaciones en voz alta
  const speakRecommendations = () => {
    const topAreas = results.topAreas;
    const areaNames = topAreas.map(area => getAreaName(area.area));
    
    // Crear mensaje personalizado basado en las áreas
    const speechText = `Basándome en tus respuestas, te recomiendo visitar principalmente el ${areaNames[0]}. También te sugiero el ${areaNames[1]}. Y finalmente, considera el ${areaNames[2]}. Estos pabellones tienen los productos que mejor se adaptan a tus necesidades. ¡Disfruta tu visita al evento!`;
    
    // Usar Web Speech API con selección inteligente de voz
    speakWithTTS(speechText);
  };

  // Función para usar Web Speech API con selección inteligente de voz
  const speakWithTTS = (text) => {
    if ('speechSynthesis' in window) {
      // Cancelar cualquier reproducción anterior
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.85; // Velocidad ligeramente más lenta
      utterance.volume = 1;

      // Obtener todas las voces disponibles
      const voices = window.speechSynthesis.getVoices();
      console.log('🎤 Voces disponibles:', voices.map(v => `${v.name} (${v.lang})`));
      
      // Lista de nombres de voces femeninas
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
      
      // Si no encuentra voz femenina, buscar cualquier voz en español
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang.includes('es'));
        console.log('🔍 Voz en español encontrada:', selectedVoice?.name);
      }
      
      // Si no hay voces en español, buscar cualquier voz femenina
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          femaleVoiceNames.some(name => 
            voice.name.toLowerCase().includes(name)
          )
        );
        console.log('🔍 Voz femenina encontrada:', selectedVoice?.name);
      }
      
      // Si no hay voces femeninas, usar la primera disponible (puede ser masculina)
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
        console.log('🔍 Usando primera voz disponible:', selectedVoice?.name);
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        
        // Ajustar pitch según el tipo de voz
        if (femaleVoiceNames.some(name => selectedVoice.name.toLowerCase().includes(name))) {
          utterance.pitch = 1.3; // Pitch alto para voz femenina
          console.log('🎤 Voz femenina seleccionada:', selectedVoice.name, selectedVoice.lang);
        } else {
          utterance.pitch = 1.0; // Pitch normal para voz masculina
          console.log('🎤 Voz masculina seleccionada:', selectedVoice.name, selectedVoice.lang);
        }
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
    // Función para cargar voces y reproducir audio
    const loadVoicesAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('🎤 Voces cargadas:', voices.map(v => `${v.name} (${v.lang})`));
        
        // Reproducir audio inmediatamente
        speakRecommendations();
      } else {
        // Si las voces no están disponibles, esperar un poco más
        setTimeout(loadVoicesAndSpeak, 100);
      }
    };

    // Intentar cargar voces inmediatamente
    loadVoicesAndSpeak();

    // Intentar múltiples veces para asegurar que las voces estén cargadas
    const timers = [
      setTimeout(() => loadVoicesAndSpeak(), 200),
      setTimeout(() => loadVoicesAndSpeak(), 500),
      setTimeout(() => loadVoicesAndSpeak(), 1000),
      setTimeout(() => loadVoicesAndSpeak(), 2000)
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
      stopSpeaking();
    };
  }, []);

  const getAreaName = (area) => {
    const areaNames = {
      cocina: 'Centro de Convenciones de Córdoba',
      living: 'Pabellón Azul',
      dormitorio: 'Pabellón Amarillo',
      bano: 'Centro de Convenciones de Córdoba',
      oficina: 'Pabellón Azul',
      exterior: 'Pabellón Amarillo'
    };
    return areaNames[area] || area;
  };

  const getAreaIcon = (area) => {
    const areaIcons = {
      cocina: '🏢',
      living: '🔵',
      dormitorio: '🟡',
      bano: '🏢',
      oficina: '🔵',
      exterior: '🟡'
    };
    return areaIcons[area] || '🏠';
  };

  const getAreaDescription = (area) => {
    const areaDescriptions = {
      cocina: 'El Centro de Convenciones de Córdoba alberga las principales exposiciones y stands del evento.',
      living: 'El Pabellón Azul presenta una amplia variedad de productos y servicios especializados.',
      dormitorio: 'El Pabellón Amarillo ofrece las últimas tendencias y novedades del sector.',
      bano: 'El Centro de Convenciones de Córdoba alberga las principales exposiciones y stands del evento.',
      oficina: 'El Pabellón Azul presenta una amplia variedad de productos y servicios especializados.',
      exterior: 'El Pabellón Amarillo ofrece las últimas tendencias y novedades del sector.'
    };
    return areaDescriptions[area] || 'Productos especializados para esta área.';
  };

  // Función para abrir nueva pestaña con "Te podría interesar"
  const openTePodriaInteresar = () => {
    const url = 'https://estilo-casa-2025.vercel.app/te-podria-interesar';
    window.open(url, '_blank');
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
              margin: '10px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '25px',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(76, 175, 80, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 8px rgba(76, 175, 80, 0.3)';
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
            onClick={openTePodriaInteresar}
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
            🔍 Te podría interesar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results; 