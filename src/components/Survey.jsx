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

  return (
    <div className="card compact-survey">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="survey-header">
        <h1 className="survey-title">📋 Encuesta de Orientación</h1>
        <div className="progress-indicator">
          ✅ {answeredCount} de {totalQuestions} preguntas respondidas
        </div>
      </div>

      <div className="compact-questions-grid">
        {questions.map((question, index) => (
          <div key={question.id} className="compact-question-section">
            <div className="compact-question-header">
              <span className="question-number">{index + 1}</span>
              <h3 className="compact-question-title">{question.title}</h3>
            </div>
            
            <div className="compact-options-grid">
              {question.options.map((option) => (
                <div
                  key={option.value}
                  className={`compact-option-card ${answers[question.id] === option.value ? 'selected' : ''}`}
                  onClick={() => handleAnswer(question.id, option.value)}
                >
                  <div className="compact-option-icon">{option.icon}</div>
                  <span className="compact-option-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="survey-footer">
        <div style={{
          display: 'flex',
          gap: 'clamp(10px, 3vw, 20px)',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '20px',
          marginTop: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '15px',
          border: '2px solid #e9ecef'
        }}>
          <button 
            className="btn btn-secondary" 
            onClick={onBack}
            style={{
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              padding: 'clamp(12px, 3vw, 15px) clamp(25px, 5vw, 30px)',
              fontSize: 'clamp(0.9rem, 2.5vw, 16px)',
              fontWeight: 'bold',
              borderRadius: '25px',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(255, 152, 0, 0.3)',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f57c00';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(255, 152, 0, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#ff9800';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 8px rgba(255, 152, 0, 0.3)';
            }}
          >
            ← Volver
          </button>
          
          <button 
            className="btn" 
            onClick={handleSubmit}
            style={{
              backgroundColor: answeredCount < totalQuestions ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              padding: 'clamp(15px, 4vw, 20px) clamp(30px, 6vw, 40px)',
              fontSize: 'clamp(1rem, 3vw, 1.2rem)',
              fontWeight: 'bold',
              borderRadius: '25px',
              cursor: answeredCount < totalQuestions ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              opacity: 1, // Siempre visible
              minHeight: '50px',
              minWidth: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              lineHeight: '1.2',
              zIndex: 10,
              position: 'relative'
            }}
            onMouseOver={(e) => {
              if (answeredCount >= totalQuestions) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 12px rgba(76, 175, 80, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              if (answeredCount >= totalQuestions) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 8px rgba(76, 175, 80, 0.3)';
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