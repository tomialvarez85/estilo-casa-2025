import React, { useState } from 'react';

const Survey = ({ onComplete, onBack }) => {
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 'tipoVivienda',
      title: '¿Qué tipo de vivienda tienes o planeas equipar?',
      options: [
        { value: 'casa', label: 'Casa', icon: '🏠' },
        { value: 'apartamento', label: 'Apartamento', icon: '🏢' },
        { value: 'duplex', label: 'Dúplex', icon: '🏘️' }
      ]
    },
    {
      id: 'estilo',
      title: '¿Qué estilo de decoración prefieres?',
      options: [
        { value: 'moderno', label: 'Moderno', icon: '✨' },
        { value: 'clasico', label: 'Clásico', icon: '👑' },
        { value: 'minimalista', label: 'Minimalista', icon: '⚪' },
        { value: 'rustico', label: 'Rústico', icon: '🌾' }
      ]
    },
    {
      id: 'presupuesto',
      title: '¿Cuál es tu rango de presupuesto para el equipamiento?',
      options: [
        { value: 'alto', label: 'Alto (Premium)', icon: '💎' },
        { value: 'medio', label: 'Medio (Estandar)', icon: '💰' },
        { value: 'bajo', label: 'Económico', icon: '💡' }
      ]
    },
    {
      id: 'prioridad',
      title: '¿Qué es más importante para ti en el equipamiento?',
      options: [
        { value: 'funcionalidad', label: 'Funcionalidad', icon: '⚙️' },
        { value: 'estetica', label: 'Estética', icon: '🎨' },
        { value: 'espacio', label: 'Optimización de espacio', icon: '📐' }
      ]
    }
  ];

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateRecommendations = (data) => {
    console.log('🎯 Calculando recomendaciones para encuesta:', data);
    
    // Siempre mostrar los 3 pabellones principales independientemente de las respuestas
    const topAreas = [
      { area: 'cocina', score: 3 },
      { area: 'living', score: 2 },
      { area: 'dormitorio', score: 1 }
    ];
    
    // Crear puntuaciones para todas las áreas (para compatibilidad)
    const scores = {
      cocina: 3,
      living: 2,
      dormitorio: 1,
      bano: 0,
      oficina: 0,
      exterior: 0
    };
    
    console.log('🎯 Resultados de encuesta:', { topAreas, allScores: scores });
    
    return {
      topAreas,
      allScores: scores
    };
  };

  const handleSubmit = () => {
    // Verificar que todas las preguntas estén respondidas
    const allAnswered = questions.every(q => answers[q.id]);
    
    console.log('🎯 handleSubmit llamado');
    console.log('📊 answeredCount:', answeredCount);
    console.log('📋 totalQuestions:', totalQuestions);
    console.log('✅ allAnswered:', allAnswered);
    console.log('📝 answers:', answers);
    
    if (allAnswered) {
      console.log('🚀 Encuesta completa, generando resultados...');
      const results = calculateRecommendations(answers);
      onComplete(answers, results);
    } else {
      console.log('❌ Encuesta incompleta, faltan respuestas');
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progress = (answeredCount / totalQuestions) * 100;
  const isMobile = window.innerWidth <= 768;

  return (
    <div className="card compact-survey" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: isMobile ? '100px' : '30px',
      maxWidth: isMobile ? '100%' : '1200px',
      margin: '0 auto',
      width: '100%',
      backgroundColor: isMobile ? 'transparent' : '#f8f9fa'
    }}>
      {/* Progress Bar - Solo en móvil */}
      {isMobile && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      
      {/* Header - Diseño diferente para móvil vs desktop */}
      <div className="survey-header" style={{
        padding: isMobile 
          ? 'clamp(20px, 4vw, 40px) clamp(15px, 3vw, 30px)'
          : '20px 30px 15px 30px',
        textAlign: 'center',
        backgroundColor: isMobile ? 'transparent' : 'white',
        borderRadius: isMobile ? '0' : '15px 15px 0 0',
        margin: isMobile ? '0' : '15px 15px 0 15px',
        boxShadow: isMobile ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 className="survey-title" style={{
          fontSize: isMobile ? 'clamp(1.5rem, 4vw, 2.5rem)' : '2rem',
          marginBottom: isMobile ? 'clamp(10px, 2vw, 20px)' : '10px',
          color: '#2c3e50',
          fontWeight: isMobile ? '600' : '700'
        }}>📋 Encuesta de Orientación</h1>
        <div className="progress-indicator" style={{
          fontSize: isMobile ? 'clamp(0.9rem, 2.5vw, 1.1rem)' : '1rem',
          color: '#7f8c8d',
          fontWeight: '500'
        }}>
          ✅ {answeredCount} de {totalQuestions} preguntas respondidas
        </div>
        
        {/* Progress Bar para desktop */}
        {!isMobile && (
          <div style={{
            marginTop: '15px',
            backgroundColor: '#e9ecef',
            borderRadius: '20px',
            height: '4px',
            overflow: 'hidden',
            maxWidth: '250px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#4CAF50',
              borderRadius: '20px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        )}
      </div>

      {/* Questions Grid - Diseño completamente diferente */}
      <div className="compact-questions-grid" style={{
        flex: 1,
        overflowY: isMobile ? 'auto' : 'visible',
        padding: isMobile 
          ? 'clamp(10px, 2vw, 30px)'
          : '0 30px 20px 30px',
        display: 'grid',
        gap: isMobile ? 'clamp(20px, 4vw, 40px)' : '15px',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        maxWidth: '100%',
        backgroundColor: isMobile ? 'transparent' : 'white',
        borderRadius: isMobile ? '0' : '0 0 15px 15px',
        margin: isMobile ? '0' : '0 15px 15px 15px',
        boxShadow: isMobile ? 'none' : '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        {questions.map((question, index) => (
          <div key={question.id} className="compact-question-section" style={{
            backgroundColor: isMobile ? '#ffffff' : 'transparent',
            borderRadius: isMobile ? '15px' : '0',
            padding: isMobile ? 'clamp(20px, 4vw, 30px)' : '0',
            boxShadow: isMobile ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
            border: isMobile ? '1px solid #e9ecef' : 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            minHeight: isMobile ? '200px' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            // En desktop, agregar borde inferior excepto para el último
            borderBottom: !isMobile && index < questions.length - 2 ? '1px solid #f1f3f4' : 'none',
            paddingBottom: !isMobile ? '15px' : 'clamp(20px, 4vw, 30px)'
          }}>
            <div className="compact-question-header" style={{
              marginBottom: isMobile ? 'clamp(15px, 3vw, 25px)' : '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 'clamp(8px, 2vw, 15px)' : '10px',
                marginBottom: isMobile ? 'clamp(10px, 2vw, 15px)' : '10px'
              }}>
                <span className="question-number" style={{
                  backgroundColor: '#3498db',
                  color: 'white',
                  width: isMobile ? 'clamp(30px, 6vw, 40px)' : '30px',
                  height: isMobile ? 'clamp(30px, 6vw, 40px)' : '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? 'clamp(0.9rem, 2.5vw, 1.1rem)' : '0.9rem',
                  fontWeight: 'bold'
                }}>{index + 1}</span>
                <h3 className="compact-question-title" style={{
                  fontSize: isMobile ? 'clamp(1.1rem, 3vw, 1.4rem)' : '1.1rem',
                  color: '#2c3e50',
                  margin: 0,
                  fontWeight: '600',
                  lineHeight: '1.3'
                }}>{question.title}</h3>
              </div>
            </div>
            
            <div className="compact-options-grid" style={{
              display: 'grid',
              gap: isMobile ? 'clamp(8px, 2vw, 15px)' : '10px',
              gridTemplateColumns: isMobile 
                ? 'repeat(auto-fit, minmax(120px, 1fr))'
                : question.options.length === 3 
                  ? 'repeat(3, 1fr)' 
                  : 'repeat(2, 1fr)',
              flex: 1
            }}>
              {question.options.map((option) => (
                <div
                  key={option.value}
                  className={`compact-option-card ${answers[question.id] === option.value ? 'selected' : ''}`}
                  onClick={() => handleAnswer(question.id, option.value)}
                  style={{
                    backgroundColor: answers[question.id] === option.value 
                      ? (isMobile ? '#3498db' : '#4CAF50') 
                      : (isMobile ? '#f8f9fa' : '#ffffff'),
                    color: answers[question.id] === option.value ? 'white' : '#2c3e50',
                    border: `2px solid ${answers[question.id] === option.value 
                      ? (isMobile ? '#3498db' : '#4CAF50') 
                      : (isMobile ? '#e9ecef' : '#e1e5e9')}`,
                    borderRadius: isMobile ? '15px' : '12px',
                    padding: isMobile ? 'clamp(15px, 3vw, 20px)' : '12px 8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: isMobile ? 'clamp(5px, 1.5vw, 10px)' : '5px',
                    textAlign: 'center',
                    minHeight: isMobile ? 'clamp(80px, 15vw, 100px)' : '60px',
                    justifyContent: 'center',
                    boxShadow: answers[question.id] === option.value 
                      ? (isMobile 
                          ? '0 4px 15px rgba(52, 152, 219, 0.3)' 
                          : '0 4px 12px rgba(76, 175, 80, 0.3)')
                      : (isMobile 
                          ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
                          : '0 2px 6px rgba(0, 0, 0, 0.08)'),
                    transform: answers[question.id] === option.value 
                      ? 'translateY(-1px)' 
                      : 'translateY(0)',
                    fontWeight: answers[question.id] === option.value ? '600' : '500'
                  }}
                  onMouseOver={(e) => {
                    if (answers[question.id] !== option.value) {
                      e.target.style.transform = isMobile ? 'translateY(-1px)' : 'translateY(-1px)';
                      e.target.style.boxShadow = isMobile 
                        ? '0 4px 12px rgba(0, 0, 0, 0.15)' 
                        : '0 4px 10px rgba(0, 0, 0, 0.12)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (answers[question.id] !== option.value) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = isMobile 
                        ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
                        : '0 2px 6px rgba(0, 0, 0, 0.08)';
                    }
                  }}
                >
                  <div className="compact-option-icon" style={{
                    fontSize: isMobile ? 'clamp(1.5rem, 4vw, 2rem)' : '1.5rem',
                    marginBottom: isMobile ? 'clamp(3px, 1vw, 5px)' : '3px'
                  }}>{option.icon}</div>
                  <span className="compact-option-label" style={{
                    fontSize: isMobile ? 'clamp(0.8rem, 2.5vw, 0.95rem)' : '0.8rem',
                    fontWeight: 'inherit'
                  }}>{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer - Diseño diferente para móvil vs desktop */}
      <div className="survey-footer" style={{
        position: isMobile ? 'sticky' : 'static',
        bottom: 0,
        backgroundColor: 'white',
        padding: isMobile ? '10px 0' : '0',
        borderTop: isMobile ? '2px solid #e9ecef' : 'none',
        zIndex: 100,
        maxWidth: '100%',
        margin: isMobile ? '0' : '0 15px 15px 15px'
      }}>
        <div style={{
          display: 'flex',
          gap: 'clamp(10px, 3vw, 20px)',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: isMobile ? 'clamp(15px, 3vw, 25px)' : '20px',
          backgroundColor: isMobile ? '#f8f9fa' : '#4CAF50',
          borderRadius: isMobile ? '15px' : '15px',
          border: isMobile ? '2px solid #e9ecef' : 'none',
          margin: isMobile ? '0 clamp(10px, 2vw, 20px)' : '0',
          maxWidth: isMobile ? '600px' : '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          boxShadow: isMobile ? 'none' : '0 4px 15px rgba(76, 175, 80, 0.3)'
        }}>
          <button 
            className="btn" 
            onClick={handleSubmit}
            style={{
              backgroundColor: answeredCount < totalQuestions 
                ? (isMobile ? '#ccc' : '#ffffff') 
                : (isMobile ? '#4CAF50' : '#ffffff'),
              color: answeredCount < totalQuestions 
                ? (isMobile ? 'white' : '#666') 
                : (isMobile ? 'white' : '#4CAF50'),
              border: isMobile ? 'none' : `2px solid ${answeredCount < totalQuestions ? '#ccc' : '#ffffff'}`,
              padding: isMobile 
                ? 'clamp(15px, 4vw, 20px) clamp(30px, 6vw, 40px)' 
                : '15px 30px',
              fontSize: isMobile ? 'clamp(1rem, 3vw, 1.2rem)' : '1rem',
              fontWeight: 'bold',
              borderRadius: isMobile ? '25px' : '20px',
              cursor: answeredCount < totalQuestions ? 'not-allowed' : 'pointer',
              boxShadow: isMobile 
                ? '0 4px 8px rgba(76, 175, 80, 0.3)' 
                : '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              opacity: 1,
              minHeight: isMobile ? '50px' : '45px',
              minWidth: isMobile ? '200px' : '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              lineHeight: '1.2',
              zIndex: 10,
              position: 'relative',
              maxWidth: isMobile ? '400px' : '220px',
              width: '100%'
            }}
            onMouseOver={(e) => {
              if (answeredCount >= totalQuestions) {
                e.target.style.transform = isMobile ? 'translateY(-2px)' : 'translateY(-1px)';
                e.target.style.boxShadow = isMobile 
                  ? '0 6px 12px rgba(76, 175, 80, 0.4)' 
                  : '0 6px 15px rgba(0, 0, 0, 0.2)';
              }
            }}
            onMouseOut={(e) => {
              if (answeredCount >= totalQuestions) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = isMobile 
                  ? '0 4px 8px rgba(76, 175, 80, 0.3)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.15)';
              }
            }}
          >
            {answeredCount < totalQuestions 
              ? `Completar encuesta (${answeredCount}/${totalQuestions})`
              : '🚀 Ver Mis Recomendaciones'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default Survey; 