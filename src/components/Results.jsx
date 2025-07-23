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
      
      // Estrategia para voz consistente: usar la primera voz en español disponible
      let selectedVoice = voices.find(voice => voice.lang.includes('es'));
      
      // Si no hay voces en español, usar la primera disponible
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.pitch = 1.0; // Pitch estándar para consistencia
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
    const topAreas = results.topAreas;
    const areaNames = topAreas.map(area => getAreaName(area.area));
    
    // Crear mensaje personalizado basado en las áreas (evitando duplicados)
    const uniqueAreaNames = [...new Set(areaNames)];
    let speechText;
    
    if (uniqueAreaNames.length === 1) {
      speechText = `Basándome en tus respuestas, te recomiendo visitar el ${uniqueAreaNames[0]}. Este pabellón tiene los productos que mejor se adaptan a tus necesidades. ¡Disfruta tu visita al evento!`;
    } else if (uniqueAreaNames.length === 2) {
      speechText = `Basándome en tus respuestas, te recomiendo visitar principalmente el ${uniqueAreaNames[0]}. También te sugiero el ${uniqueAreaNames[1]}. Estos pabellones tienen los productos que mejor se adaptan a tus necesidades. ¡Disfruta tu visita al evento!`;
    } else {
      speechText = `Basándome en tus respuestas, te recomiendo visitar principalmente el ${uniqueAreaNames[0]}. También te sugiero el ${uniqueAreaNames[1]}. Y finalmente, considera el ${uniqueAreaNames[2]}. Estos pabellones tienen los productos que mejor se adaptan a tus necesidades. ¡Disfruta tu visita al evento!`;
    }
    
    // Usar Web Speech API con selección inteligente de voz
    speakWithTTS(speechText);
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
          fontFamily: 'Arial, sans-serif',
          maxWidth: '100%',
          margin: '0 auto'
        }}>
          <div className="header" style={{
            textAlign: 'center',
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '15px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '800px',
            margin: '0 auto 30px auto'
          }}>
            <h1 style={{
              color: '#333',
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              marginBottom: '10px',
              wordWrap: 'break-word'
            }}>
              🔍 Te podría interesar
            </h1>
            <p style={{
              color: '#666',
              fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
              margin: '0',
              lineHeight: '1.4'
            }}>
              Descubre otros sectores fascinantes de la exposición
            </p>
          </div>

          <div className="sections-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 10px'
          }}>
            {sections.map((section) => (
              <div key={section.id} className="section-card" style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                borderLeft: `5px solid ${section.color}`,
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
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
                  fontSize: 'clamp(2rem, 6vw, 3rem)',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  {section.icon}
                </div>
                <h3 style={{
                  color: '#333',
                  fontSize: 'clamp(1rem, 3vw, 1.3rem)',
                  marginBottom: '10px',
                  textAlign: 'center',
                  wordWrap: 'break-word'
                }}>
                  {section.title}
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
                  lineHeight: '1.5',
                  textAlign: 'center',
                  margin: '0',
                  flex: '1'
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
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            maxWidth: '800px',
            margin: '40px auto 0 auto'
          }}>
            <p style={{
              color: '#666',
              fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
              margin: '0 0 15px 0',
              lineHeight: '1.4'
            }}>
              💡 Explora todos los sectores para encontrar inspiración y productos únicos
            </p>
            <button 
              onClick={backToRecommendations}
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                padding: 'clamp(10px, 2.5vw, 12px) clamp(20px, 4vw, 25px)',
                borderRadius: '25px',
                fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                whiteSpace: 'nowrap'
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
      <div className="result-container" style={{
        maxWidth: '100%',
        margin: '0 auto',
        padding: '20px'
      }}>
        <h1 className="result-title" style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          textAlign: 'center',
          marginBottom: '30px',
          wordWrap: 'break-word'
        }}>🎯 Tus Recomendaciones Personalizadas</h1>
        
        <div className="recommendations">
          <h2 style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
            textAlign: 'center',
            marginBottom: '20px'
          }}>📍 Áreas Recomendadas para Visitar:</h2>
          
          {/* Mostrar solo pabellones únicos */}
          {(() => {
            const uniqueAreas = results.topAreas.filter((area, index, self) => 
              index === self.findIndex(a => getAreaName(a.area) === getAreaName(area.area))
            );
            
            return uniqueAreas.map((area, index) => (
              <div key={area.area} className="recommendation-item" style={{
                marginBottom: '20px'
              }}>
                <div className="area-card" style={{
                  backgroundColor: 'white',
                  borderRadius: '15px',
                  padding: '20px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  flexWrap: 'wrap'
                }}>
                  <div className="area-icon" style={{
                    fontSize: 'clamp(2rem, 6vw, 3rem)',
                    flexShrink: '0'
                  }}>{getAreaIcon(area.area)}</div>
                  <div className="area-content" style={{
                    flex: '1',
                    minWidth: '250px'
                  }}>
                    <h3 className="area-title" style={{
                      fontSize: 'clamp(1rem, 3vw, 1.3rem)',
                      marginBottom: '10px',
                      wordWrap: 'break-word'
                    }}>
                      {index + 1}. {getAreaName(area.area)}
                    </h3>
                    <p className="area-description" style={{
                      fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
                      lineHeight: '1.4',
                      marginBottom: '10px'
                    }}>
                      {getAreaDescription(area.area)}
                    </p>
                    <div className="area-score" style={{
                      fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
                      fontWeight: 'bold',
                      color: '#2196F3'
                    }}>
                      Puntuación: {area.score} puntos
                    </div>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>

        <div className="voice-controls" style={{
          textAlign: 'center',
          margin: '30px 0'
        }}>
          <button 
            className={`btn ${isSpeaking ? 'speaking' : ''}`}
            onClick={isSpeaking ? stopSpeaking : speakRecommendations}
            style={{
              backgroundColor: isSpeaking ? '#ff6b6b' : '#4CAF50',
              margin: '10px',
              padding: 'clamp(12px, 3vw, 15px) clamp(25px, 5vw, 30px)',
              fontSize: 'clamp(0.9rem, 2.5vw, 16px)',
              fontWeight: 'bold',
              borderRadius: '25px',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
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

        <div className="survey-summary" style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '20px',
          margin: '20px 0',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            marginBottom: '15px',
            textAlign: 'center'
          }}>📋 Resumen de tus Respuestas:</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px'
          }}>
            <p style={{
              fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
              margin: '5px 0'
            }}><strong>Tipo de vivienda:</strong> {surveyData.tipoVivienda}</p>
            <p style={{
              fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
              margin: '5px 0'
            }}><strong>Estilo preferido:</strong> {surveyData.estilo}</p>
            <p style={{
              fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
              margin: '5px 0'
            }}><strong>Presupuesto:</strong> {surveyData.presupuesto}</p>
            <p style={{
              fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
              margin: '5px 0'
            }}><strong>Prioridad:</strong> {surveyData.prioridad}</p>
          </div>
        </div>

        <div className="result-footer" style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '20px',
          margin: '20px 0',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p className="result-note" style={{
            fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
            lineHeight: '1.4',
            margin: '10px 0'
          }}>
            💡 Estas recomendaciones están basadas en un algoritmo inteligente que analiza tus preferencias y necesidades específicas.
          </p>
          <p className="result-note" style={{
            fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
            lineHeight: '1.4',
            margin: '10px 0'
          }}>
            🎉 ¡Disfruta explorando estas áreas y encuentra los productos perfectos para tu hogar!
          </p>
        </div>

        <div className="restart-section" style={{
          textAlign: 'center',
          margin: '30px 0'
        }}>
          <button 
            className="btn restart-btn"
            onClick={showTePodriaInteresarSection}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              margin: '10px',
              padding: 'clamp(12px, 3vw, 15px) clamp(25px, 5vw, 30px)',
              fontSize: 'clamp(0.9rem, 2.5vw, 16px)',
              fontWeight: 'bold',
              borderRadius: '25px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
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