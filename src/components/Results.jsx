import React, { useState, useEffect } from 'react';

const Results = ({ results, surveyData, onRestart }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Función para usar Google Text-to-Speech (voz femenina de alta calidad)
  const speakWithGoogleTTS = async (text) => {
    try {
      // Usar la API de Google Text-to-Speech
      const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'es-ES',
            name: 'es-ES-Standard-A', // Voz femenina en español
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.9,
            pitch: 1.2
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const audioContent = data.audioContent;
        const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.play();
        
        setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        console.log('✅ Voz Google TTS reproducida exitosamente');
      } else {
        throw new Error('Google TTS API error');
      }
    } catch (error) {
      console.log('❌ Google TTS no disponible, usando voz del navegador');
      speakWithBrowserTTS(text);
    }
  };

  // Función para usar audio pregrabado (más confiable)
  const speakWithPreRecordedAudio = (topAreas) => {
    // Crear mensaje personalizado basado en las áreas
    const areaNames = topAreas.map(area => getAreaName(area.area));
    
    const speechText = `Basándome en tus respuestas, te recomiendo visitar principalmente el área de ${areaNames[0]}. También te sugiero el área de ${areaNames[1]}. Y finalmente, considera el área de ${areaNames[2]}. Estas áreas tienen los productos que mejor se adaptan a tus necesidades. ¡Disfruta tu visita al evento!`;
    
    // Intentar primero con Google TTS, luego fallback al navegador
    speakWithGoogleTTS(speechText);
  };

  // Función para seleccionar voz de mujer en el navegador (mejorada)
  const selectFemaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    
    // Lista de nombres de voces femeninas comunes
    const femaleVoiceNames = [
      'maria', 'mujer', 'female', 'woman', 'girl', 'sara', 'ana', 'lucia',
      'sofia', 'carmen', 'isabel', 'elena', 'patricia', 'monica', 'laura',
      'helena', 'monica', 'nuria', 'paula', 'claudia', 'diana', 'elena',
      'julia', 'rosa', 'teresa', 'angela', 'beatriz', 'cristina', 'dolores'
    ];
    
    // Buscar voz femenina en español
    let femaleVoice = voices.find(voice => 
      voice.lang.includes('es') && 
      femaleVoiceNames.some(name => 
        voice.name.toLowerCase().includes(name)
      )
    );
    
    // Si no encuentra, buscar cualquier voz en español
    if (!femaleVoice) {
      femaleVoice = voices.find(voice => voice.lang.includes('es'));
    }
    
    // Si no hay voces en español, buscar cualquier voz femenina
    if (!femaleVoice) {
      femaleVoice = voices.find(voice => 
        femaleVoiceNames.some(name => 
          voice.name.toLowerCase().includes(name)
        )
      );
    }
    
    // Si no hay voces femeninas, usar la primera disponible
    if (!femaleVoice && voices.length > 0) {
      femaleVoice = voices[0];
    }
    
    return femaleVoice;
  };

  // Función para leer con voz del navegador (fallback mejorado)
  const speakWithBrowserTTS = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.85; // Un poco más lento para mejor claridad
      utterance.pitch = 1.3; // Pitch alto para sonar más femenino
      utterance.volume = 1;

      // Seleccionar voz de mujer
      const femaleVoice = selectFemaleVoice();
      if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log('🎤 Voz del navegador seleccionada:', femaleVoice.name, femaleVoice.lang);
      } else {
        console.log('⚠️ No se encontró voz específica, usando voz por defecto');
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

      window.speechSynthesis.speak(utterance);
    } else {
      console.log('❌ Speech Synthesis no soportado en este navegador');
    }
  };

  // Función para leer las recomendaciones en voz alta
  const speakRecommendations = () => {
    const topAreas = results.topAreas;
    
    // Usar Google TTS para mejor calidad de voz femenina
    speakWithPreRecordedAudio(topAreas);
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
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('🎤 Voces disponibles:', voices.map(v => `${v.name} (${v.lang})`));
        
        // Esperar 1 segundo antes de leer para que el usuario vea los resultados
        const timer = setTimeout(() => {
          speakRecommendations();
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Si las voces no están disponibles, esperar un poco más
        setTimeout(loadVoices, 100);
      }
    };

    loadVoices();

    return () => {
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
      </div>
    </div>
  );
};

export default Results; 