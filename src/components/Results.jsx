import React, { useState, useEffect } from 'react';

const Results = ({ results, surveyData, onRestart }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTePodriaInteresar, setShowTePodriaInteresar] = useState(false);

  const sections = [
    {
      id: 1,
      title: '🏠 Decoración y Diseño',
      description: 'Descubre las últimas tendencias en decoración para transformar tu hogar.',
      icon: '🎨',
      color: '#FF6B6B'
    },
    {
      id: 2,
      title: '🛋️ Muebles y Mobiliario',
      description: 'Encuentra muebles únicos y funcionales para cada espacio de tu casa.',
      icon: '🪑',
      color: '#4ECDC4'
    },
    {
      id: 3,
      title: '💡 Iluminación',
      description: 'Soluciones de iluminación que crean ambientes únicos y acogedores.',
      icon: '💡',
      color: '#45B7D1'
    },
    {
      id: 4,
      title: '🌿 Jardín y Exterior',
      description: 'Todo para crear espacios exteriores hermosos y funcionales.',
      icon: '🌱',
      color: '#96CEB4'
    },
    {
      id: 5,
      title: '🔧 Tecnología del Hogar',
      description: 'Los últimos avances en domótica y tecnología para el hogar.',
      icon: '📱',
      color: '#FFEAA7'
    },
    {
      id: 6,
      title: '🎯 Ofertas Especiales',
      description: 'Descuentos exclusivos y promociones únicas solo para visitantes.',
      icon: '🏷️',
      color: '#DDA0DD'
    }
  ];

  // Función para mostrar la sección "Te podría interesar"
  const showTePodriaInteresarSection = () => {
    setShowTePodriaInteresar(true);
  };

  // Función para volver a las recomendaciones
  const backToRecommendations = () => {
    setShowTePodriaInteresar(false);
  };

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
    // Solo reproducir audio si estamos en la sección de recomendaciones
    if (!showTePodriaInteresar) {
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
    }
  }, [showTePodriaInteresar]);

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

  // Mostrar sección "Te podría interesar" o recomendaciones
  if (showTePodriaInteresar) {
    return (
      <div className="card">
        <div className="te-podria-interesar-container" style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          padding: '20px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div className="header" style={{
            textAlign: 'center',
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '15px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{
              color: '#333',
              fontSize: '2.5rem',
              marginBottom: '10px'
            }}>
              🔍 Te podría interesar
            </h1>
            <p style={{
              color: '#666',
              fontSize: '1.1rem',
              margin: '0'
            }}>
              Descubre otros sectores fascinantes de la exposición
            </p>
          </div>

          <div className="sections-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {sections.map((section) => (
              <div key={section.id} className="section-card" style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                borderLeft: `5px solid ${section.color}`
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 8px 15px rgba(0,0,0,0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}>
                <div className="section-icon" style={{
                  fontSize: '3rem',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  {section.icon}
                </div>
                <h3 style={{
                  color: '#333',
                  fontSize: '1.3rem',
                  marginBottom: '10px',
                  textAlign: 'center'
                }}>
                  {section.title}
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '1rem',
                  lineHeight: '1.5',
                  textAlign: 'center',
                  margin: '0'
                }}>
                  {section.description}
                </p>
              </div>
            ))}
          </div>

          <div className="footer" style={{
            textAlign: 'center',
            marginTop: '40px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '15px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <p style={{
              color: '#666',
              fontSize: '1rem',
              margin: '0 0 15px 0'
            }}>
              💡 Explora todos los sectores para encontrar inspiración y productos únicos
            </p>
            <button 
              onClick={backToRecommendations}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '25px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1976D2'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2196F3'}
            >
              ← Volver a Recomendaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar recomendaciones (vista por defecto)
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
            onClick={showTePodriaInteresarSection}
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