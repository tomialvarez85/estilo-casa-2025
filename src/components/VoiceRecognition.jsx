import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const VoiceRecognition = ({ onComplete, onBack }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceResults, setVoiceResults] = useState(null);
  const [voiceSurveyData, setVoiceSurveyData] = useState(null);

  // Función para continuar a los resultados
  const handleContinue = async () => {
    console.log('🚀 handleContinue llamado');
    console.log('📊 voiceResults:', voiceResults);
    console.log('📋 voiceSurveyData:', voiceSurveyData);
    
    if (voiceResults && voiceSurveyData) {
      // Persistir en Supabase antes de continuar
      let saved = false;
      try {
        if (supabase) {
          const { error } = await supabase
            .from('surveys')
            .insert([{ 
              answers: voiceSurveyData, 
              results: voiceResults,
              source: 'voice',
              transcript: transcript 
            }]);
          if (error) {
            console.warn('⚠️ No se pudo guardar en Supabase:', error.message);
          } else {
            saved = true;
            console.log('✅ Encuesta de voz guardada en Supabase');
          }
        }
      } catch (e) {
        console.warn('⚠️ Error al usar Supabase:', e.message);
      }

      // Fallback al backend si no se guardó en Supabase
      if (!saved) {
        try {
          const response = await fetch('/api/voice-results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              ...voiceSurveyData, 
              results: voiceResults,
              source: 'voice',
              transcript: transcript 
            })
          });
          const data = await response.json();
          if (!response.ok || !data.success) {
            console.warn('⚠️ No se pudo guardar en backend:', data?.message);
          } else {
            console.log('✅ Encuesta de voz guardada (backend)');
          }
        } catch (err) {
          console.warn('⚠️ Error de red al guardar en backend:', err.message);
        }
      }

      console.log('✅ Llamando a onComplete directamente...');
      onComplete(voiceResults, voiceSurveyData);
    }
  };

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
        setError('');
        setIsProcessing(false);
        console.log('🎤 Reconocimiento de voz iniciado');
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        setIsProcessing(true);
        console.log('🎤 Texto reconocido:', transcript);
        
        // Analizar el texto y generar recomendaciones
        analyzeVoiceInput(transcript);
      };
      
      recognition.onerror = (event) => {
        console.log('❌ Error en reconocimiento de voz:', event.error);
        setIsListening(false);
        setIsProcessing(false);
        setError('Error en el reconocimiento de voz. Por favor, intenta de nuevo.');
      };
      
      recognition.onend = () => {
        setIsListening(false);
        console.log('🎤 Reconocimiento de voz finalizado');
      };
      
      recognition.start();
    } else {
      setError('Tu navegador no soporta reconocimiento de voz. Por favor, usa la encuesta.');
    }
  };

  // Función para analizar el texto de voz y generar recomendaciones
  const analyzeVoiceInput = async (text) => {
    console.log('🎯 Analizando texto de voz:', text);
    
    const lowerText = text.toLowerCase();
    
    // Palabras clave más específicas para cada área
    const keywords = {
      cocina: [
        'cocina', 'electrodomésticos', 'hornos', 'heladeras', 'microondas', 'cocinar', 'comida', 
        'utensilios', 'vajilla', 'cubiertos', 'platos', 'ollas', 'sartenes', 'horno', 'heladera',
        'cafetera', 'tostadora', 'licuadora', 'procesadora', 'cocina', 'mesada', 'bajo mesada'
      ],
      living: [
        'living', 'comedor', 'sala', 'sofá', 'mesa', 'sillas', 'decoración', 'muebles',
        'sillón', 'sillon', 'mesa de centro', 'rack', 'tv', 'televisión', 'entretenimiento',
        'relax', 'descanso', 'social', 'reuniones', 'familia'
      ],
      dormitorio: [
        'dormitorio', 'cama', 'colchón', 'colchon', 'sommier', 'somier', 'ropa de cama',
        'armario', 'ropero', 'descanso', 'dormir', 'almohadas', 'sábanas', 'cubrecamas',
        'noche', 'descanso', 'relax', 'sueño'
      ],
      bano: [
        'baño', 'bano', 'sanitarios', 'ducha', 'grifería', 'griferia', 'toilet', 'lavatorio',
        'accesorios', 'toallas', 'espejos', 'mampara', 'bañera', 'bañadera', 'higiene'
      ],
      oficina: [
        'oficina', 'escritorio', 'silla', 'computadora', 'trabajo', 'estudio', 'muebles de oficina',
        'silla ergonómica', 'silla ergonomica', 'escritorio', 'estantería', 'estanteria',
        'archivo', 'organización', 'organizacion', 'productividad'
      ],
      exterior: [
        'jardín', 'jardin', 'exterior', 'terraza', 'balcón', 'balcon', 'muebles de jardín',
        'plantas', 'decoración exterior', 'decoracion exterior', 'parrilla', 'asador',
        'piscina', 'piletas', 'outdoor', 'aire libre'
      ]
    };
    
    // Calcular puntuaciones basadas en palabras clave
    const scores = {};
    Object.keys(keywords).forEach(area => {
      scores[area] = keywords[area].filter(keyword => 
        lowerText.includes(keyword)
      ).length;
    });
    
    // Crear recomendaciones basadas en las puntuaciones
    let topAreas = Object.entries(scores)
      .filter(([area, score]) => score > 0)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([area, score]) => ({ area, score }));
    
    // Si no hay coincidencias específicas, usar recomendaciones por defecto
    if (topAreas.length === 0) {
      topAreas = [
        { area: 'cocina', score: 3 },
        { area: 'living', score: 2 },
        { area: 'dormitorio', score: 1 }
      ];
    }
    
    // Crear resultados
    const results = {
      topAreas,
      allScores: scores
    };
    
    // Crear datos de encuesta más específicos basados en el análisis
    const surveyData = {
      categoria: getCategoryFromVoice(lowerText),
      estiloProyecto: getStyleFromVoice(lowerText),
      espacio: getSpaceFromVoice(lowerText),
      inversion: getBudgetFromVoice(lowerText),
      source: 'voice',
      transcript: text
    };
    
    console.log('🎯 Voz detectada y analizada...');
    console.log('📊 Resultados:', results);
    console.log('📋 Datos de encuesta:', surveyData);
    
    // Guardar resultados para el botón continuar
    setVoiceResults(results);
    setVoiceSurveyData(surveyData);
    setIsProcessing(false);
  };

  // Función auxiliar para determinar categoría
  const getCategoryFromVoice = (text) => {
    if (text.includes('mueble') || text.includes('mobiliario') || text.includes('decoración') || text.includes('decoracion')) {
      return 'muebles_decoracion';
    }
    if (text.includes('abertura') || text.includes('puerta') || text.includes('ventana') || text.includes('construcción') || text.includes('construccion')) {
      return 'aberturas_construccion';
    }
    if (text.includes('interiorismo') || text.includes('proyecto') || text.includes('integral')) {
      return 'interiorismo_integral';
    }
    return 'muebles_decoracion'; // default
  };

  // Función auxiliar para determinar estilo
  const getStyleFromVoice = (text) => {
    if (text.includes('personalizado') || text.includes('a medida') || text.includes('custom')) {
      return 'personalizado';
    }
    if (text.includes('artesanal') || text.includes('sustentable') || text.includes('ecológico') || text.includes('ecologico')) {
      return 'artesanal';
    }
    return 'estandar'; // default
  };

  // Función auxiliar para determinar espacio
  const getSpaceFromVoice = (text) => {
    if (text.includes('living') || text.includes('dormitorio') || text.includes('sala')) {
      return 'living_dormitorio';
    }
    if (text.includes('cocina') || text.includes('comedor')) {
      return 'cocina_comedor';
    }
    if (text.includes('exterior') || text.includes('jardín') || text.includes('jardin') || text.includes('terraza')) {
      return 'accesos_aberturas_exterior';
    }
    return 'living_dormitorio'; // default
  };

  // Función auxiliar para determinar presupuesto
  const getBudgetFromVoice = (text) => {
    if (text.includes('económico') || text.includes('economico') || text.includes('barato') || text.includes('bajo costo')) {
      return 'economico';
    }
    if (text.includes('premium') || text.includes('alta gama') || text.includes('lujo') || text.includes('caro')) {
      return 'premium';
    }
    return 'medio'; // default
  };

  // Si está procesando, mostrar pantalla de carga
  if (isProcessing) {
    return (
      <div className="card">
        <div className="voice-input-container" style={{
          minHeight: '80vh',
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
              animation: 'pulse 1.5s infinite'
            }}>
              ⏳
            </div>
            
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              color: '#333',
              marginBottom: '20px'
            }}>
              Procesando tu consulta...
            </h1>
            
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: '#666',
              marginBottom: '30px',
              lineHeight: '1.5'
            }}>
              Entendí: "{transcript}"
            </p>
            
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
                🎯 Generando recomendaciones personalizadas...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si hay resultados listos, mostrar pantalla con botón continuar
  if (voiceResults && voiceSurveyData) {
    return (
      <div className="card">
        <div className="voice-input-container" style={{
          minHeight: '80vh',
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
              marginBottom: '20px'
            }}>
              ✅
            </div>
            
            <h1 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              color: '#333',
              marginBottom: '20px'
            }}>
              ¡Perfecto! Entendí tu consulta
            </h1>
            
            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: '#666',
              marginBottom: '30px',
              lineHeight: '1.5'
            }}>
              Entendí: "{transcript}"
            </p>
            
            <div style={{
              backgroundColor: '#e8f5e8',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '30px',
              border: '2px solid #4CAF50'
            }}>
              <p style={{
                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                color: '#2E7D32',
                margin: '0',
                fontWeight: 'bold'
              }}>
                🎯 Recomendaciones personalizadas listas
              </p>
            </div>

            <div className="voice-controls" style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={handleContinue}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: 'clamp(15px, 3vw, 20px) clamp(30px, 5vw, 40px)',
                  borderRadius: '50px',
                  fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
                }}
              >
                🚀 Ver Mis Recomendaciones
              </button>
              
              <button 
                onClick={() => {
                  setVoiceResults(null);
                  setVoiceSurveyData(null);
                  setTranscript('');
                }}
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
                🔄 Probar de Nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="voice-input-container" style={{
        minHeight: window.innerWidth <= 768 ? '100vh' : '80vh',
        backgroundColor: '#f5f5f5',
        padding: window.innerWidth <= 768 ? '15px' : '20px',
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
          borderRadius: window.innerWidth <= 768 ? '15px' : '20px',
          padding: window.innerWidth <= 768 ? '25px' : '40px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          textAlign: 'center',
          maxWidth: '600px',
          width: '100%',
          margin: window.innerWidth <= 768 ? '0 10px' : '0'
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
          
          {error && (
            <div style={{
              backgroundColor: '#ffebee',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '20px',
              border: '2px solid #f44336'
            }}>
              <p style={{
                fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
                color: '#d32f2f',
                margin: '0',
                fontWeight: 'bold'
              }}>
                ❌ {error}
              </p>
            </div>
          )}
          
          <div className="voice-controls" style={{
            display: 'flex',
            gap: window.innerWidth <= 768 ? '10px' : '15px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            alignItems: 'center'
          }}>
            <button 
              onClick={startVoiceRecognition}
              disabled={isListening}
              style={{
                backgroundColor: isListening ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                padding: window.innerWidth <= 768 ? '12px 24px' : 'clamp(15px, 3vw, 20px) clamp(30px, 5vw, 40px)',
                borderRadius: '50px',
                fontSize: window.innerWidth <= 768 ? '0.9rem' : 'clamp(1rem, 2.5vw, 1.2rem)',
                fontWeight: 'bold',
                cursor: isListening ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                width: window.innerWidth <= 768 ? '100%' : 'auto',
                maxWidth: window.innerWidth <= 768 ? '250px' : 'none'
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
              onClick={() => {
                if (voiceResults && voiceSurveyData) {
                  // Si ya hay resultados, ir directamente a los resultados
                  console.log('🔄 Volviendo a resultados...');
                  onComplete(voiceResults, voiceSurveyData);
                } else {
                  // Si no hay resultados, volver al inicio
                  onBack();
                }
              }}
              style={{
                backgroundColor: voiceResults && voiceSurveyData ? '#4CAF50' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: window.innerWidth <= 768 ? '12px 24px' : 'clamp(15px, 3vw, 20px) clamp(30px, 5vw, 40px)',
                borderRadius: '50px',
                fontSize: window.innerWidth <= 768 ? '0.9rem' : 'clamp(1rem, 2.5vw, 1.2rem)',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: voiceResults && voiceSurveyData ? '0 4px 15px rgba(76, 175, 80, 0.3)' : '0 4px 15px rgba(108, 117, 125, 0.3)',
                width: window.innerWidth <= 768 ? '100%' : 'auto',
                maxWidth: window.innerWidth <= 768 ? '250px' : 'none'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                if (voiceResults && voiceSurveyData) {
                  e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
                } else {
                  e.target.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                if (voiceResults && voiceSurveyData) {
                  e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
                } else {
                  e.target.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
                }
              }}
            >
              {voiceResults && voiceSurveyData ? '🚀 Ver Resultados' : '← Volver'}
            </button>
          </div>
          
          <div style={{
            marginTop: window.innerWidth <= 768 ? '20px' : '30px',
            padding: window.innerWidth <= 768 ? '15px' : '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: window.innerWidth <= 768 ? '12px' : '15px',
            margin: window.innerWidth <= 768 ? '20px 10px 0 10px' : '30px auto 0 auto',
            maxWidth: '500px'
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
              <li>"Busco muebles para la oficina"</li>
              <li>"Necesito renovar el baño"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecognition; 