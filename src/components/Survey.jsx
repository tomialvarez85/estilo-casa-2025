import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Survey = ({ onComplete, onBack }) => {
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 'categoria',
      title: 'Pregunta 1: ¿Qué categoría principal te interesa recorrer?',
      options: [
        { value: 'muebles_decoracion', label: '🛋️ Muebles y decoración' },
        { value: 'aberturas_construccion', label: '🪟 Aberturas y construcción' },
        { value: 'interiorismo_integral', label: '🏡 Interiorismo y proyectos integrales' }
      ]
    },
    {
      id: 'estiloProyecto',
      title: 'Pregunta 2: ¿Qué estilo preferís para tu proyecto?',
      options: [
        { value: 'estandar', label: '✨ Estándar / listo para usar' },
        { value: 'personalizado', label: '🎨 Personalizado / a medida' },
        { value: 'artesanal', label: '🌿 Artesanal / sustentable' }
      ]
    },
    {
      id: 'espacio',
      title: 'Pregunta 3: ¿En qué espacio pensás aplicar lo que buscás?',
      options: [
        { value: 'living_dormitorio', label: '🛋️ Living / Dormitorio' },
        { value: 'cocina_comedor', label: '🍽️ Cocina / Comedor' },
        { value: 'accesos_aberturas_exterior', label: '🚪 Accesos / Aberturas / Exterior' }
      ]
    },
    {
      id: 'inversion',
      title: 'Pregunta 4: ¿Qué rango de inversión pensás destinar?',
      options: [
        { value: 'economico', label: '💸 Económico' },
        { value: 'medio', label: '💳 Medio' },
        { value: 'premium', label: '🏆 Premium' }
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

  const handleSubmit = async () => {
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

      // Persistir preferentemente en Supabase (si está configurado)
      let saved = false;
      try {
        if (supabase) {
          const { error } = await supabase
            .from('surveys')
            .insert([{ answers, results }]);
          if (error) {
            console.warn('⚠️ No se pudo guardar en Supabase:', error.message);
          } else {
            saved = true;
            console.log('✅ Encuesta guardada en Supabase');
          }
        }
      } catch (e) {
        console.warn('⚠️ Error al usar Supabase:', e.message);
      }

      // Fallback al backend existente si no se guardó en Supabase
      if (!saved) {
        try {
          const response = await fetch('/api/survey', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...answers, results })
          });
          const data = await response.json();
          if (!response.ok || !data.success) {
            console.warn('⚠️ No se pudo guardar en backend:', data?.message);
          } else {
            console.log('✅ Encuesta guardada (backend). ID:', data.surveyId);
          }
        } catch (err) {
          console.warn('⚠️ Error de red al guardar en backend:', err.message);
        }
      }

      onComplete(answers, results);
    } else {
      console.log('❌ Encuesta incompleta, faltan respuestas');
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progress = (answeredCount / totalQuestions) * 100;
  const isMobile = window.innerWidth <= 768;
  const isNotebook = window.innerWidth <= 1280 && window.innerWidth > 768;

  return (
    <div className="card compact-survey" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: isMobile ? '100px' : isNotebook ? '120px' : '25px',
      maxWidth: isMobile ? '100%' : isNotebook ? '100%' : '1100px',
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
          : '20px 25px 15px 25px',
        textAlign: 'center',
        backgroundColor: isMobile ? 'transparent' : 'white',
        borderRadius: isMobile ? '0' : '15px 15px 0 0',
        margin: isMobile ? '0' : '15px 15px 0 15px',
        boxShadow: isMobile ? 'none' : '0 3px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 className="survey-title" style={{
          fontSize: isMobile ? 'clamp(1.5rem, 4vw, 2.5rem)' : '1.8rem',
          marginBottom: isMobile ? 'clamp(10px, 2vw, 20px)' : '12px',
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
          : isNotebook ? '15px' : '0 25px 20px 25px',
        display: 'grid',
        gap: isMobile ? 'clamp(20px, 4vw, 40px)' : isNotebook ? '18px' : '15px',
        gridTemplateColumns: isMobile ? '1fr' : isNotebook ? '1fr' : 'repeat(2, 1fr)',
        maxWidth: '100%',
        backgroundColor: isMobile ? 'transparent' : 'white',
        borderRadius: isMobile ? '0' : '0 0 15px 15px',
        margin: isMobile ? '0' : isNotebook ? '0 10px 10px 10px' : '0 15px 15px 15px',
        boxShadow: isMobile ? 'none' : '0 3px 12px rgba(0, 0, 0, 0.1)'
      }}>
        {questions.map((question, index) => (
          <div key={question.id} className="compact-question-section" style={{
            backgroundColor: isMobile ? '#ffffff' : 'transparent',
            borderRadius: isMobile ? '15px' : '0',
            padding: isMobile ? 'clamp(20px, 4vw, 30px)' : isNotebook ? '16px' : '0',
            boxShadow: isMobile ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
            border: isMobile ? '1px solid #e9ecef' : 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            minHeight: isMobile ? '200px' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            // En desktop, agregar borde inferior excepto para el último
            borderBottom: !isMobile && !isNotebook && index < questions.length - 2 ? '1px solid #f1f3f4' : 'none',
            paddingBottom: !isMobile ? (isNotebook ? '8px' : '15px') : 'clamp(20px, 4vw, 30px)'
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
              gap: isMobile ? 'clamp(8px, 2vw, 15px)' : '8px',
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
                    borderRadius: isMobile ? '15px' : '10px',
                    padding: isMobile ? 'clamp(15px, 3vw, 20px)' : '10px 8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: isMobile ? 'clamp(5px, 1.5vw, 10px)' : '4px',
                    textAlign: 'center',
                    minHeight: isMobile ? 'clamp(80px, 15vw, 100px)' : '55px',
                    justifyContent: 'center',
                    boxShadow: answers[question.id] === option.value 
                      ? (isMobile 
                          ? '0 4px 15px rgba(52, 152, 219, 0.3)' 
                          : '0 3px 8px rgba(76, 175, 80, 0.3)')
                      : (isMobile 
                          ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
                          : '0 2px 4px rgba(0, 0, 0, 0.08)'),
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
                        : '0 3px 8px rgba(0, 0, 0, 0.12)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (answers[question.id] !== option.value) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = isMobile 
                        ? '0 2px 8px rgba(0, 0, 0, 0.1)' 
                        : '0 2px 4px rgba(0, 0, 0, 0.08)';
                    }
                  }}
                >
                  <div className="compact-option-icon" style={{
                    fontSize: isMobile ? 'clamp(1.5rem, 4vw, 2rem)' : '1.4rem',
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
        position: isMobile ? 'sticky' : isNotebook ? 'sticky' : 'static',
        bottom: 0,
        backgroundColor: 'white',
        padding: isMobile ? '10px 0' : isNotebook ? '10px 0' : '0',
        borderTop: isMobile ? '2px solid #e9ecef' : isNotebook ? '2px solid #e9ecef' : 'none',
        zIndex: 100,
        maxWidth: '100%',
        margin: isMobile ? '0' : isNotebook ? '0' : '0 15px 15px 15px'
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
              borderRadius: isMobile ? '25px' : '18px',
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
                  : '0 6px 18px rgba(0, 0, 0, 0.2)';
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