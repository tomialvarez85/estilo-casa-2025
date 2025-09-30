import React, { useState } from 'react';
import Survey from './components/Survey';
import Results from './components/Results';
import VoiceRecognition from './components/VoiceRecognition';

function App() {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [surveyData, setSurveyData] = useState({});
  const [results, setResults] = useState(null);
  const [showVoiceOption, setShowVoiceOption] = useState(false);

  const handleSurveyComplete = (data, surveyResults) => {
    setSurveyData(data);
    setResults(surveyResults);
    setCurrentStep('results');
  };

  const handleRestart = () => {
    setCurrentStep('welcome');
    setSurveyData({});
    setResults(null);
    setShowVoiceOption(false);
  };

  const handleVoiceRecognition = (voiceResults, voiceSurveyData) => {
    console.log('🎯 handleVoiceRecognition llamado con:', { voiceResults, voiceSurveyData });
    console.log('🎯 Estado actual - currentStep:', currentStep);
    console.log('🎯 Función handleVoiceRecognition existe:', typeof handleVoiceRecognition);
    
    try {
      console.log('🎯 Actualizando estados...');
      setSurveyData(voiceSurveyData);
      setResults(voiceResults);
      setCurrentStep('results');
      
      console.log('🎯 Estados actualizados:');
      console.log('- surveyData:', voiceSurveyData);
      console.log('- results:', voiceResults);
      console.log('- currentStep: results');
      
      // Verificar que los estados se actualizaron correctamente
      setTimeout(() => {
        console.log('🎯 Verificación después de 100ms:');
        console.log('- currentStep debería ser "results"');
        console.log('- surveyData actual:', surveyData);
        console.log('- results actual:', results);
      }, 100);
    } catch (error) {
      console.error('❌ Error en handleVoiceRecognition:', error);
    }
  };

  const showVoiceInput = () => {
    setShowVoiceOption(true);
  };

  const backToWelcome = () => {
    setShowVoiceOption(false);
  };

  // Mostrar resultados (prioridad alta)
  if (currentStep === 'results') {
    console.log('🎯 Renderizando Results con datos:', { results, surveyData });
    return <Results results={results} surveyData={surveyData} onRestart={handleRestart} />;
  }

  // Mostrar opción de entrada por voz
  if (showVoiceOption) {
    console.log('🎯 Renderizando VoiceRecognition con onComplete:', typeof handleVoiceRecognition);
    return <VoiceRecognition onComplete={handleVoiceRecognition} onBack={backToWelcome} />;
  }

  // Mostrar pantalla de bienvenida con opciones
  if (currentStep === 'welcome') {
    return (
      <div className="container">
        <div className="card">
          <div style={{
            textAlign: 'center',
            padding: '40px 20px'
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              color: '#667eea',
              marginBottom: '20px',
              fontWeight: '700'
            }}>
              🏠 Bienvenido a Expo Estilo Casa 2025
            </h1>
            
            <p style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
              color: '#666',
              marginBottom: '40px',
              lineHeight: '1.6',
              maxWidth: '800px',
              margin: '0 auto 40px auto'
            }}>
              Descubre los stands acorde a tus necesidades. 
              Te ayudaremos a encontrar exactamente lo que buscas en nuestro evento.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: window.innerWidth <= 768 ? '20px' : '30px',
              maxWidth: '900px',
              margin: '0 auto',
              padding: window.innerWidth <= 768 ? '0 10px' : '0'
            }}>
              {/* Opción de Encuesta */}
              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: window.innerWidth <= 768 ? '15px' : '20px',
                padding: window.innerWidth <= 768 ? '20px' : '30px',
                border: '3px solid #667eea',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                minHeight: window.innerWidth <= 768 ? 'auto' : '300px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
              onClick={() => setCurrentStep('survey')}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}>
                <div style={{
                  fontSize: 'clamp(3rem, 8vw, 4rem)',
                  marginBottom: '20px'
                }}>
                  📝
                </div>
                <h2 style={{
                  fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                  color: '#333',
                  marginBottom: '15px',
                  fontWeight: '600'
                }}>
                  Hacer Encuesta
                </h2>
                <p style={{
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  color: '#666',
                  lineHeight: '1.5'
                }}>
                  Responde algunas preguntas rápidas sobre tus preferencias y te daremos recomendaciones personalizadas.
                </p>
                <div style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  borderRadius: '25px',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  Comenzar Encuesta
                </div>
              </div>

              {/* Opción de Voz */}
              <div style={{
                backgroundColor: '#f8f9fa',
                borderRadius: window.innerWidth <= 768 ? '15px' : '20px',
                padding: window.innerWidth <= 768 ? '20px' : '30px',
                border: '3px solid #9C27B0',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                minHeight: window.innerWidth <= 768 ? 'auto' : '300px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
              onClick={showVoiceInput}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 10px 25px rgba(156, 39, 176, 0.2)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}>
                <div style={{
                  fontSize: 'clamp(3rem, 8vw, 4rem)',
                  marginBottom: '20px'
                }}>
                  🎤
                </div>
                <h2 style={{
                  fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                  color: '#333',
                  marginBottom: '15px',
                  fontWeight: '600'
                }}>
                  Usar Voz
                </h2>
                <p style={{
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  color: '#666',
                  lineHeight: '1.5'
                }}>
                  Simplemente dime qué buscas y te daré recomendaciones instantáneas basadas en tus necesidades.
                </p>
                <div style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  backgroundColor: '#9C27B0',
                  color: 'white',
                  borderRadius: '25px',
                  fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  Hablar
                </div>
              </div>
            </div>

            <div style={{
              marginTop: window.innerWidth <= 768 ? '30px' : '40px',
              padding: window.innerWidth <= 768 ? '15px' : '20px',
              backgroundColor: '#e3f2fd',
              borderRadius: window.innerWidth <= 768 ? '12px' : '15px',
              border: '2px solid #2196F3',
              margin: window.innerWidth <= 768 ? '30px 10px 0 10px' : '40px auto 0 auto',
              maxWidth: '800px'
            }}>
              <h3 style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                color: '#1976D2',
                marginBottom: '10px'
              }}>
                💡 ¿Cuál elegir?
              </h3>
              <p style={{
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                color: '#1976D2',
                lineHeight: '1.5'
              }}>
                <strong>Encuesta:</strong> Para recomendaciones más detalladas y precisas.<br/>
                <strong>Voz:</strong> Para obtener resultados rápidos y naturales.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar encuesta
  if (currentStep === 'survey') {
    return <Survey onComplete={handleSurveyComplete} onBack={() => setCurrentStep('welcome')} />;
  }

  return null;
}

export default App; 