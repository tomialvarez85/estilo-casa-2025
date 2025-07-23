import React, { useState } from 'react';

const VoiceRecognition = ({ onComplete, onBack }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

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
  const analyzeVoiceInput = (text) => {
    const lowerText = text.toLowerCase();
    
    // Palabras clave para cada área
    const keywords = {
      cocina: ['cocina', 'electrodomésticos', 'hornos', 'heladeras', 'microondas', 'cocinar', 'comida', 'utensilios', 'cocina integral', 'isla de cocina'],
      living: ['living', 'comedor', 'sala', 'sofá', 'mesa', 'sillas', 'decoración', 'muebles', 'sala de estar', 'comedor diario'],
      dormitorio: ['dormitorio', 'cama', 'colchón', 'ropa de cama', 'armario', 'ropero', 'descanso', 'dormir', 'habitación', 'cuarto'],
      bano: ['baño', 'sanitarios', 'ducha', 'grifería', 'toilet', 'lavatorio', 'accesorios', 'baño completo', 'baño principal'],
      oficina: ['oficina', 'escritorio', 'silla', 'computadora', 'trabajo', 'estudio', 'muebles de oficina', 'home office', 'espacio de trabajo'],
      exterior: ['jardín', 'exterior', 'terraza', 'balcón', 'muebles de jardín', 'plantas', 'decoración exterior', 'patio', 'terraza']
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
    
    // Crear resultados
    const results = {
      topAreas,
      allScores: scores
    };
    
    // Reproducir confirmación de voz
    const confirmationText = `Perfecto, he entendido que buscas ${text}. Te voy a mostrar las mejores recomendaciones para ti.`;
    
    // Usar Web Speech API para la confirmación
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(confirmationText);
      utterance.lang = 'es-ES';
      utterance.rate = 0.85;
      utterance.volume = 1;
      
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = voices.find(voice => voice.lang.includes('es')) || voices[0];
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.pitch = 1.0;
      }
      
      utterance.onend = () => {
        // Mostrar resultados inmediatamente después de la confirmación
        onComplete(results);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      // Si no hay speech synthesis, mostrar resultados inmediatamente
      onComplete(results);
    }
  };

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
              onClick={onBack}
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
              ← Volver
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