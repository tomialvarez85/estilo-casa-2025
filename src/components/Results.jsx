import React, { useState, useEffect } from 'react';

const Results = ({ results, surveyData, onRestart }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTePodriaInteresar, setShowTePodriaInteresar] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showVoiceInput, setShowVoiceInput] = useState(false);

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

  // Función para iniciar reconocimiento de voz
  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        console.log('🎤 Reconocimiento de voz iniciado');
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        console.log('🎤 Texto reconocido:', transcript);
        
        // Analizar el texto y generar recomendaciones
        analyzeVoiceInput(transcript);
      };
      
      recognition.onerror = (event) => {
        console.log('❌ Error en reconocimiento de voz:', event.error);
        setIsListening(false);
        alert('Error en el reconocimiento de voz. Por favor, intenta de nuevo.');
      };
      
      recognition.onend = () => {
        setIsListening(false);
        console.log('🎤 Reconocimiento de voz finalizado');
      };
      
      recognition.start();
    } else {
      alert('Tu navegador no soporta reconocimiento de voz. Por favor, usa la encuesta.');
    }
  };

  // Función para analizar el texto de voz y generar recomendaciones
  const analyzeVoiceInput = (text) => {
    const lowerText = text.toLowerCase();
    
    // Palabras clave para cada área
    const keywords = {
      cocina: ['cocina', 'electrodomésticos', 'hornos', 'heladeras', 'microondas', 'cocinar', 'comida', 'utensilios'],
      living: ['living', 'comedor', 'sala', 'sofá', 'mesa', 'sillas', 'decoración', 'muebles'],
      dormitorio: ['dormitorio', 'cama', 'colchón', 'ropa de cama', 'armario', 'ropero', 'descanso', 'dormir'],
      bano: ['baño', 'sanitarios', 'ducha', 'grifería', 'toilet', 'lavatorio', 'accesorios'],
      oficina: ['oficina', 'escritorio', 'silla', 'computadora', 'trabajo', 'estudio', 'muebles de oficina'],
      exterior: ['jardín', 'exterior', 'terraza', 'balcón', 'muebles de jardín', 'plantas', 'decoración exterior']
    };
    
    // Calcular puntuaciones basadas en palabras clave
    const scores = {};
    Object.keys(keywords).forEach(area => {
      scores[area] = keywords[area].filter(keyword => 
        lowerText.includes(keyword)
      ).length;
    });
    
    // Crear recomendaciones basadas en las puntuaciones
    const topAreas = Object.entries(scores)
      .filter(([area, score]) => score > 0)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([area, score]) => ({ area, score }));
    
    // Si no hay coincidencias específicas, usar recomendaciones por defecto
    if (topAreas.length === 0) {
      topAreas.push(
        { area: 'cocina', score: 3 },
        { area: 'living', score: 2 },
        { area: 'dormitorio', score: 1 }
      );
    }
    
    // Crear datos de encuesta simulados
    const simulatedSurveyData = {
      tipoVivienda: 'Detectado por voz',
      estilo: 'Basado en tu consulta',
      presupuesto: 'Variado',
      prioridad: 'Personalizada'
    };
    
    // Actualizar los resultados
    results.topAreas = topAreas;
    surveyData = simulatedSurveyData;
    
    // Mostrar los resultados
    setShowVoiceInput(false);
    
    // Reproducir confirmación de voz
    const confirmationText = `Perfecto, he entendido que buscas ${text}. Te voy a mostrar las mejores recomendaciones para ti.`;
    speakWithTTS(confirmationText);
  };

  // Función para mostrar la opción de entrada por voz
  const showVoiceInputOption = () => {
    setShowVoiceInput(true);
  };

  // Función para volver a la encuesta
  const backToSurvey = () => {
    setShowVoiceInput(false);
    onRestart();
  };

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
    if (!showTePodriaInteresar && !showVoiceInput) {
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
  }, [showTePodriaInteresar, showVoiceInput]);

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

  // Mostrar interfaz de entrada por voz
  if (showVoiceInput) {
    return (
      <div className="card">
        <div className="voice-input-container" style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          padding: '20px',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div className="voice-input-card" style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            textAlign: 'center',
            maxWidth: '600px',
            width: '100%'
          }}>
            <div className="voice-icon" style={{
              fontSize: 'clamp(4rem, 10vw, 6rem)',
              marginBottom: '20px',
              animation: isListening ? 'pulse 1.5s infinite' : 'none'
            }}>
              {isListening ? '🎤' : '🎙️'}
            </div>
            
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              color: '#333',
              marginBottom: '20px'
            }}>
              {isListening ? 'Te estoy escuchando...' : 'Dime qué buscas'}
            </h1>
            
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: '#666',
              marginBottom: '30px',
              lineHeight: '1.5'
            }}>
              {isListening 
                ? 'Habla claramente sobre lo que vienes a buscar al evento'
                : 'Puedes decirme cosas como: "busco muebles para la cocina", "necesito decoración para el living", etc.'
              }
            </p>
            
            {transcript && (
              <div style={{
                backgroundColor: '#e3f2fd',
                padding: '15px',
                borderRadius: '10px',
                marginBottom: '20px',
                border: '2px solid #2196F3'
              }}>
                <p style={{
                  fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                  color: '#1976D2',
                  margin: '0',
                  fontWeight: 'bold'
                }}>
                  🎯 Entendí: "{transcript}"
                </p>
              </div>
            )}
            
            <div className="voice-controls" style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={startVoiceRecognition}
                disabled={isListening}
                style={{
                  backgroundColor: isListening ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: 'clamp(15px, 3vw, 20px) clamp(30px, 5vw, 40px)',
                  borderRadius: '50px',
                  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                  fontWeight: 'bold',
                  cursor: isListening ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                }}
                onMouseOver={(e) => {
                  if (!isListening) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isListening) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
                  }
                }}
              >
                {isListening ? '🎤 Escuchando...' : '🎤 Hablar'}
              </button>
              
              <button 
                onClick={backToSurvey}
                style={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  padding: 'clamp(15px, 3vw, 20px) clamp(30px, 5vw, 40px)',
                  borderRadius: '50px',
                  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(255, 152, 0, 0.3)';
                }}
              >
                📝 Hacer Encuesta
              </button>
            </div>
            
            <div style={{
              marginTop: '30px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '15px'
            }}>
              <h3 style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                color: '#333',
                marginBottom: '15px'
              }}>
                💡 Ejemplos de lo que puedes decir:
              </h3>
              <ul style={{
                textAlign: 'left',
                fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
                color: '#666',
                lineHeight: '1.6'
              }}>
                <li>"Busco muebles para la cocina"</li>
                <li>"Necesito decoración para el living"</li>
                <li>"Quiero renovar el dormitorio"</li>
                <li>"Busco electrodomésticos"</li>
                <li>"Necesito muebles para el jardín"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
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
              
              <button 
                onClick={onRestart}
                style={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  padding: 'clamp(10px, 2.5vw, 12px) clamp(20px, 4vw, 25px)',
                  borderRadius: '25px',
                  fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f57c00'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ff9800'}
              >
                🏠 Volver al Inicio
              </button>
            </div>
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
      </div>
    </div>
  );
};

export default Results; 