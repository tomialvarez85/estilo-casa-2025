import React, { useState } from 'react';


const Survey = ({ onComplete }) => {
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

  const handleSubmit = () => {
    // Verificar que todas las preguntas estén respondidas
    const allAnswered = questions.every(q => answers[q.id]);
    
    if (allAnswered) {
      onComplete(answers);
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
        <button 
          className="btn" 
          onClick={handleSubmit}
          style={{
            backgroundColor: answeredCount < totalQuestions ? '#ccc' : '#667eea',
            cursor: answeredCount < totalQuestions ? 'not-allowed' : 'pointer'
          }}
        >
          {answeredCount < totalQuestions 
            ? `Completar encuesta (${answeredCount}/${totalQuestions})`
            : 'Ver Mis Recomendaciones'
          }
        </button>
      </div>
    </div>
  );
};

export default Survey; 