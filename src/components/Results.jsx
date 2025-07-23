import React, { useState, useEffect } from 'react';

const Results = ({ results, surveyData, onRestart }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTePodriaInteresar, setShowTePodriaInteresar] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

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
    // Verificar si el navegador soporta reconocimiento de voz
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz. Por favor, usa la encuesta.');
      return;
    }

    // Verificar si estamos en HTTPS o localhost (requerido para móviles)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      alert('El reconocimiento de voz requiere HTTPS o localhost para funcionar en móviles. Por favor, usa la encuesta.');
      return;
    }

    // Solicitar permisos de micrófono explícitamente
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          // Permisos concedidos, iniciar reconocimiento
          initializeSpeechRecognition();
        })
        .catch((error) => {
          console.log('❌ Error al solicitar permisos de micrófono:', error);
          if (error.name === 'NotAllowedError') {
            alert('Se requieren permisos de micrófono para usar esta función. Por favor, permite el acceso al micrófono y recarga la página.');
          } else if (error.name === 'NotFoundError') {
            alert('No se encontró ningún micrófono. Por favor, conecta un micrófono y vuelve a intentar.');
          } else {
            alert('Error al acceder al micrófono: ' + error.message + '. Por favor, usa la encuesta.');
          }
        });
    } else {
      // Fallback para navegadores que no soportan getUserMedia
      initializeSpeechRecognition();
    }
  };

  // Función para inicializar el reconocimiento de voz
  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configuración optimizada para móviles
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // Configuraciones específicas para móviles
    if (window.innerWidth <= 768) {
      recognition.continuous = false;
      recognition.interimResults = false;
    }
    
    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      console.log('🎤 Reconocimiento de voz iniciado');
      
      // Mostrar indicador visual para móviles
      if (window.innerWidth <= 768) {
        document.body.style.backgroundColor = '#e8f5e8';
      }
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
      
      // Restaurar color de fondo
      document.body.style.backgroundColor = '';
      
      let errorMessage = 'Error en el reconocimiento de voz. Por favor, intenta de nuevo.';
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Permisos de micrófono denegados. Por favor, permite el acceso al micrófono en la configuración del navegador.';
          break;
        case 'no-speech':
          errorMessage = 'No se detectó voz. Por favor, habla más cerca del micrófono.';
          break;
        case 'audio-capture':
          errorMessage = 'No se pudo acceder al micrófono. Verifica que el micrófono esté conectado y funcionando.';
          break;
        case 'network':
          errorMessage = 'Error de red. Verifica tu conexión a internet.';
          break;
        case 'service-not-allowed':
          errorMessage = 'El servicio de reconocimiento de voz no está disponible.';
          break;
      }
      
      alert(errorMessage);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      console.log('🎤 Reconocimiento de voz finalizado');
      
      // Restaurar color de fondo
      document.body.style.backgroundColor = '';
    };
    
    // Intentar iniciar el reconocimiento
    try {
      recognition.start();
    } catch (error) {
      console.log('❌ Error al iniciar reconocimiento:', error);
      alert('Error al iniciar el reconocimiento de voz. Por favor, usa la encuesta.');
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
    
    // Reproducir confirmación de voz
    const confirmationText = `Perfecto, he entendido que buscas ${text}. Te voy a mostrar las mejores recomendaciones para ti.`;
    speakWithTTS(confirmationText);
    
    // Esperar 2 segundos antes de mostrar los resultados
    setTimeout(() => {
      setShowVoiceInput(false);
    }, 2000);
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
      utterance.lang = 'es-MX'; // Cambiar a español de México
      utterance.rate = 0.9; // Velocidad ligeramente más rápida
      utterance.volume = 1;
      utterance.pitch = 1.1; // Pitch ligeramente más alto para voz más clara

      // Obtener todas las voces disponibles
      const voices = window.speechSynthesis.getVoices();
      console.log('🎤 Voces disponibles:', voices.map(v => `${v.name} (${v.lang})`));
      
      // Detectar si es móvil
      const isMobile = window.innerWidth <= 768;
      console.log('📱 Es dispositivo móvil:', isMobile);
      
      let selectedVoice = null;
      
      if (isMobile) {
        // Estrategia específica para móviles - priorizar voces femeninas en español
        console.log('📱 Aplicando estrategia móvil para voces femeninas en español');
        
        // 1. Buscar voces femeninas específicas en español
        const femaleSpanishVoices = [
          'Google español (México)', 'Google español (Mexico)',
          'Microsoft Sabina - Spanish (Mexico)', 'Microsoft Helena - Spanish (Spain)',
          'Samantha', 'Victoria', 'Ana', 'Maria', 'Carmen', 'Isabel', 'Rosa'
        ];
        
        for (const voiceName of femaleSpanishVoices) {
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes(voiceName.toLowerCase()) &&
            (voice.lang.includes('es') || voice.lang.includes('ES'))
          );
          if (selectedVoice) {
            console.log('📱 Voz femenina en español encontrada:', selectedVoice.name);
            break;
          }
        }
        
        // 2. Si no se encuentra, buscar cualquier voz femenina en español
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            (voice.lang.includes('es') || voice.lang.includes('ES')) &&
            (voice.name.toLowerCase().includes('female') || 
             voice.name.toLowerCase().includes('woman') ||
             voice.name.toLowerCase().includes('girl') ||
             voice.name.toLowerCase().includes('samantha') ||
             voice.name.toLowerCase().includes('victoria') ||
             voice.name.toLowerCase().includes('ana') ||
             voice.name.toLowerCase().includes('maria'))
          );
          console.log('📱 Voz femenina genérica en español encontrada:', selectedVoice?.name);
        }
        
        // 3. Si no hay voces femeninas en español, buscar cualquier voz en español
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.includes('es') || voice.lang.includes('ES')
          );
          console.log('📱 Cualquier voz en español encontrada:', selectedVoice?.name);
        }
        
        // 4. Como último recurso, usar la primera voz disponible (pero evitar inglés)
        if (!selectedVoice && voices.length > 0) {
          selectedVoice = voices.find(voice => 
            !voice.lang.includes('en') && !voice.lang.includes('EN')
          );
          if (!selectedVoice) {
            selectedVoice = voices[0]; // Solo si no hay otra opción
          }
          console.log('📱 Voz de último recurso:', selectedVoice?.name);
        }
        
      } else {
        // Estrategia para desktop - mantener la lógica original
        console.log('🖥️ Aplicando estrategia desktop');
        
        // Priorizar específicamente la voz de Google México
        const preferredVoices = [
          'Google español (México)', 'Google español (Mexico)',
          'Microsoft Sabina - Spanish (Mexico)', 'Microsoft Raul - Spanish (Mexico)',
          'Google español', 'Google español (España)', 'Google español (Spain)',
          'Microsoft Helena - Spanish (Spain)', 'Microsoft Pablo - Spanish (Spain)',
          'Samantha', 'Alex', 'Victoria', 'Diego', 'Carlos', 'Ana', 'Maria'
        ];
        
        // Buscar primero la voz de Google México específicamente
        selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('google') && 
          (voice.name.toLowerCase().includes('méxico') || voice.name.toLowerCase().includes('mexico'))
        );
        
        if (selectedVoice) {
          console.log('🖥️ Voz de Google México encontrada:', selectedVoice.name);
        } else {
          // Si no se encuentra Google México, buscar otras voces preferidas
          for (const preferredName of preferredVoices) {
            selectedVoice = voices.find(voice => 
              voice.name.toLowerCase().includes(preferredName.toLowerCase())
            );
            if (selectedVoice) {
              console.log('🖥️ Voz preferida encontrada:', selectedVoice.name);
              break;
            }
          }
        }
        
        // Si no se encuentra una voz preferida, buscar cualquier voz en español de México
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.includes('es-MX') || voice.lang.includes('es-MX')
          );
          console.log('🖥️ Voz en español de México encontrada:', selectedVoice?.name);
        }
        
        // Si no hay voces en español de México, buscar cualquier voz en español
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.includes('es') || voice.lang.includes('ES')
          );
          console.log('🖥️ Voz en español encontrada:', selectedVoice?.name);
        }
        
        // Si no hay voces en español, usar la primera voz femenina disponible
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.name.toLowerCase().includes('female') || 
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('girl')
          );
          console.log('🖥️ Voz femenina encontrada:', selectedVoice?.name);
        }
        
        // Si no hay voces femeninas, usar la primera disponible
        if (!selectedVoice && voices.length > 0) {
          selectedVoice = voices[0];
          console.log('🖥️ Primera voz disponible:', selectedVoice.name);
        }
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
    // Verificar compatibilidad móvil
    const isMobile = window.innerWidth <= 768;
    const isSecureContext = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
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
            padding: isMobile ? '30px 20px' : '40px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            textAlign: 'center',
            maxWidth: '600px',
            width: '100%'
          }}>
            <div className="voice-icon" style={{
              fontSize: isMobile ? 'clamp(3rem, 8vw, 4rem)' : 'clamp(4rem, 10vw, 6rem)',
              marginBottom: '20px',
              animation: isListening ? 'pulse 1.5s infinite' : 'none'
            }}>
              {isListening ? '🎤' : '🎙️'}
            </div>
            
            <h1 style={{
              fontSize: isMobile ? 'clamp(1.2rem, 3vw, 1.8rem)' : 'clamp(1.5rem, 4vw, 2.5rem)',
              color: '#333',
              marginBottom: '20px'
            }}>
              {isListening ? 'Te estoy escuchando...' : 'Dime qué buscas'}
            </h1>
            
            {/* Advertencia para móviles */}
            {isMobile && !isSecureContext && (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '10px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <p style={{
                  fontSize: 'clamp(0.8rem, 2.5vw, 1rem)',
                  color: '#856404',
                  margin: '0',
                  fontWeight: 'bold'
                }}>
                  ⚠️ Para usar el micrófono en móviles, la aplicación debe estar en HTTPS o localhost
                </p>
              </div>
            )}
            
            <p style={{
              fontSize: isMobile ? 'clamp(0.9rem, 2.5vw, 1.1rem)' : 'clamp(1rem, 2.5vw, 1.2rem)',
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
              gap: isMobile ? '10px' : '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={startVoiceRecognition}
                disabled={isListening || (isMobile && !isSecureContext)}
                style={{
                  backgroundColor: isListening || (isMobile && !isSecureContext) ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: isMobile ? 'clamp(12px, 3vw, 16px) clamp(20px, 4vw, 30px)' : 'clamp(15px, 3vw, 20px) clamp(30px, 5vw, 40px)',
                  borderRadius: '50px',
                  fontSize: isMobile ? 'clamp(0.9rem, 2.5vw, 1.1rem)' : 'clamp(1rem, 2.5vw, 1.2rem)',
                  fontWeight: 'bold',
                  cursor: isListening || (isMobile && !isSecureContext) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                  minWidth: isMobile ? '120px' : '150px'
                }}
                onMouseOver={(e) => {
                  if (!isListening && !(isMobile && !isSecureContext)) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isListening && !(isMobile && !isSecureContext)) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
                  }
                }}
              >
                {isListening ? '🎤 Escuchando...' : (isMobile && !isSecureContext) ? '🔒 No disponible' : '🎤 Hablar'}
              </button>
              
              <button 
                onClick={backToSurvey}
                style={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  padding: isMobile ? 'clamp(12px, 3vw, 16px) clamp(20px, 4vw, 30px)' : 'clamp(15px, 3vw, 20px) clamp(30px, 5vw, 40px)',
                  borderRadius: '50px',
                  fontSize: isMobile ? 'clamp(0.9rem, 2.5vw, 1.1rem)' : 'clamp(1rem, 2.5vw, 1.2rem)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                  minWidth: isMobile ? '120px' : '150px'
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
              padding: isMobile ? '15px' : '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '15px'
            }}>
              <h3 style={{
                fontSize: isMobile ? 'clamp(0.9rem, 2.5vw, 1.1rem)' : 'clamp(1rem, 2.5vw, 1.2rem)',
                color: '#333',
                marginBottom: '15px'
              }}>
                💡 Ejemplos de lo que puedes decir:
              </h3>
              <ul style={{
                textAlign: 'left',
                fontSize: isMobile ? 'clamp(0.7rem, 2.5vw, 0.9rem)' : 'clamp(0.8rem, 2.5vw, 1rem)',
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