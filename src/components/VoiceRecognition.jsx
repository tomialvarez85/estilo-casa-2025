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

  // Función para limpiar el texto de voz removiendo palabras innecesarias
  const cleanVoiceText = (text) => {
    const wordsToRemove = [
      'busco', 'necesito', 'quiero', 'deseo', 'me gustaría', 'me gustaria',
      'estoy buscando', 'vengo a buscar', 'vengo por', 'necesito encontrar',
      'quiero encontrar', 'buscar', 'necesitar', 'desear', 'querer',
      'por favor', 'porfavor', 'gracias', 'hola', 'buenos días', 'buenas tardes',
      'buenas noches', 'saludos', 'hey', 'hi', 'hello',
      'me interesa', 'me interesan', 'estoy interesado', 'estoy interesada',
      'vengo a ver', 'vengo a conocer', 'quiero ver', 'deseo ver',
      'me gusta', 'me gustan', 'prefiero', 'prefiero ver'
    ];
    
    let cleanedText = text.toLowerCase().trim();
    
    // Remover palabras innecesarias
    wordsToRemove.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleanedText = cleanedText.replace(regex, '').trim();
    });
    
    // Limpiar espacios múltiples
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
    
    console.log('🧹 Texto original:', text);
    console.log('🧹 Texto limpio:', cleanedText);
    
    return cleanedText;
  };

  // Función para analizar el texto de voz y buscar en la base de datos
  const analyzeVoiceInput = async (text) => {
    console.log('🎯 Analizando texto de voz:', text);
    
    // Limpiar el texto removiendo palabras innecesarias
    const cleanedText = cleanVoiceText(text);
    
    // Si el texto queda muy corto después de limpiar, usar el texto original
    const searchText = cleanedText.length < 3 ? text : cleanedText;
    
    try {
      // Buscar empresas que coincidan con el texto limpio en las columnas "activity" y "name"
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .or(`activity.ilike.%${searchText}%,name.ilike.%${searchText}%`);
      
      if (error) {
        console.error('❌ Error al buscar en la base de datos:', error);
        // Fallback: usar búsqueda más amplia
        const { data: fallbackCompanies } = await supabase
          .from('companies')
          .select('*')
          .limit(10);
        
        if (fallbackCompanies) {
          const results = {
            topAreas: [
              { area: 'general', score: 3 }
            ],
            allScores: { general: 3 },
            companies: fallbackCompanies
          };
          
          const surveyData = {
            categoria: 'muebles_decoracion',
            estiloProyecto: 'estandar',
            espacio: 'living_dormitorio',
            inversion: 'medio',
            source: 'voice',
            transcript: text
          };
          
          setVoiceResults(results);
          setVoiceSurveyData(surveyData);
          setIsProcessing(false);
          return;
        }
      }
      
      if (companies && companies.length > 0) {
        console.log('✅ Encontradas empresas coincidentes:', companies.length);
        
        // Crear resultados basados en las empresas encontradas
        const results = {
          topAreas: [
            { area: 'voice_search', score: companies.length }
          ],
          allScores: { voice_search: companies.length },
          companies: companies
        };
        
        const surveyData = {
          categoria: 'muebles_decoracion',
          estiloProyecto: 'estandar',
          espacio: 'living_dormitorio',
          inversion: 'medio',
          source: 'voice',
          transcript: text
        };
        
        console.log('🎯 Voz detectada y analizada...');
        console.log('📊 Resultados:', results);
        console.log('📋 Datos de encuesta:', surveyData);
        
        setVoiceResults(results);
        setVoiceSurveyData(surveyData);
        setIsProcessing(false);
      } else {
        console.log('⚠️ No se encontraron empresas coincidentes');
        
        // No mostrar nada si no hay coincidencias
        const results = {
          topAreas: [],
          allScores: {},
          companies: []
        };
        
        const surveyData = {
          categoria: 'muebles_decoracion',
          estiloProyecto: 'estandar',
          espacio: 'living_dormitorio',
          inversion: 'medio',
          source: 'voice',
          transcript: text
        };
        
        setVoiceResults(results);
        setVoiceSurveyData(surveyData);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('❌ Error en la búsqueda:', error);
      
      // No mostrar nada en caso de error
      const results = {
        topAreas: [],
        allScores: {},
        companies: []
      };
      
      const surveyData = {
        categoria: 'muebles_decoracion',
        estiloProyecto: 'estandar',
        espacio: 'living_dormitorio',
        inversion: 'medio',
        source: 'voice',
        transcript: text
      };
      
      setVoiceResults(results);
      setVoiceSurveyData(surveyData);
      setIsProcessing(false);
    }
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
              <li>"Busco amoblamientos de cocina"</li>
              <li>"Necesito muebles de madera"</li>
              <li>"Busco aberturas de aluminio"</li>
              <li>"Necesito muebles de jardín"</li>
              <li>"Busco carpintería a medida"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecognition; 