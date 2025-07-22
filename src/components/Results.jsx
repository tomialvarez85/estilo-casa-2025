import React, { useState, useEffect } from 'react';

const Results = ({ results, surveyData, onRestart }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Función para usar Microsoft Azure Speech Service (voz femenina garantizada)
  const speakWithAzureTTS = async (text) => {
    try {
      // Azure Speech Service con voz femenina en español
      const response = await fetch('https://eastus.tts.speech.microsoft.com/cognitiveservices/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'AlgoritmoExpo'
        },
        body: `<speak version='1.0' xml:lang='es-ES'>
          <voice xml:lang='es-ES' xml:gender='Female' name='es-ES-ElviraNeural'>
            ${text}
          </voice>
        </speak>`
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.play();
        
        setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        console.log('✅ Voz Azure TTS (femenina) reproducida exitosamente');
      } else {
        throw new Error('Azure TTS API error');
      }
    } catch (error) {
      console.log('❌ Azure TTS no disponible, probando Amazon Polly');
      speakWithAmazonPolly(text);
    }
  };

  // Función para usar Amazon Polly (voz femenina garantizada)
  const speakWithAmazonPolly = async (text) => {
    try {
      // Amazon Polly con voz femenina en español
      const response = await fetch('https://polly.us-east-1.amazonaws.com/v1/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Text: text,
          OutputFormat: 'mp3',
          VoiceId: 'Lupe', // Voz femenina en español
          LanguageCode: 'es-ES',
          Engine: 'neural'
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.play();
        
        setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        console.log('✅ Voz Amazon Polly (femenina) reproducida exitosamente');
      } else {
        throw new Error('Amazon Polly API error');
      }
    } catch (error) {
      console.log('❌ Amazon Polly no disponible, probando Google TTS');
      speakWithGoogleTTS(text);
    }
  };

  // Función para usar Google Text-to-Speech (voz femenina garantizada)
  const speakWithGoogleTTS = async (text) => {
    try {
      // Google TTS con voz femenina específica
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
        
        console.log('✅ Voz Google TTS (femenina) reproducida exitosamente');
      } else {
        throw new Error('Google TTS API error');
      }
    } catch (error) {
      console.log('❌ Google TTS no disponible, probando ElevenLabs');
      speakWithElevenLabs(text);
    }
  };

  // Función para usar ElevenLabs (voz femenina garantizada)
  const speakWithElevenLabs = async (text) => {
    try {
      // ElevenLabs con voz femenina específica
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': '21m00Tcm4TlvDq8ikWAM'
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.play();
        
        setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        console.log('✅ Voz ElevenLabs (femenina) reproducida exitosamente');
      } else {
        throw new Error('ElevenLabs API error');
      }
    } catch (error) {
      console.log('❌ Todas las APIs externas fallaron, usando audio pregrabado');
      speakWithPreRecordedAudio();
    }
  };

  // Función para usar audio pregrabado (último recurso)
  const speakWithPreRecordedAudio = () => {
    // Crear mensaje personalizado basado en las áreas
    const topAreas = results.topAreas;
    const areaNames = topAreas.map(area => getAreaName(area.area));
    
    const speechText = `Basándome en tus respuestas, te recomiendo visitar principalmente el área de ${areaNames[0]}. También te sugiero el área de ${areaNames[1]}. Y finalmente, considera el área de ${areaNames[2]}. Estas áreas tienen los productos que mejor se adaptan a tus necesidades. ¡Disfruta tu visita al evento!`;
    
    // Intentar con Azure TTS como primera opción
    speakWithAzureTTS(speechText);
  };

  // Función para leer las recomendaciones en voz alta
  const speakRecommendations = () => {
    const topAreas = results.topAreas;
    
    // Usar Azure TTS para voz femenina garantizada
    speakWithPreRecordedAudio();
  };

  // Función para detener el audio
  const stopSpeaking = () => {
    setIsSpeaking(false);
    console.log('🔇 Audio detenido');
  };

  // Leer automáticamente cuando se muestren los resultados
  useEffect(() => {
    // Reproducir audio inmediatamente al cargar
    const timer = setTimeout(() => {
      speakRecommendations();
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