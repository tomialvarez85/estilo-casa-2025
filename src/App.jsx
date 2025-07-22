import React, { useState } from 'react';
import Survey from './components/Survey';
import Results from './components/Results';
import Welcome from './components/Welcome';

function App() {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [surveyData, setSurveyData] = useState({});
  const [results, setResults] = useState(null);

  const handleSurveyComplete = async (data) => {
    setSurveyData(data);
    const recommendations = calculateRecommendations(data);
    setResults(recommendations);
    
    // Guardar la encuesta en la base de datos
    try {
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Encuesta guardada en la base de datos:', result.message);
      } else {
        console.error('❌ Error al guardar encuesta:', result.message);
      }
    } catch (error) {
      console.error('❌ Error de conexión al guardar encuesta:', error);
    }
    
    setCurrentStep('results');
  };

  const calculateRecommendations = (data) => {
    const scores = {
      cocina: 0,
      living: 0,
      dormitorio: 0,
      bano: 0,
      oficina: 0,
      exterior: 0
    };

    // Algoritmo de puntuación basado en las respuestas
    if (data.tipoVivienda === 'casa') {
      scores.living += 3;
      scores.exterior += 2;
    } else if (data.tipoVivienda === 'apartamento') {
      scores.living += 2;
      scores.oficina += 1;
    } else if (data.tipoVivienda === 'duplex') {
      scores.living += 2;
      scores.cocina += 1;
    }

    if (data.estilo === 'moderno') {
      scores.cocina += 3;
      scores.living += 2;
      scores.bano += 2;
    } else if (data.estilo === 'clasico') {
      scores.living += 3;
      scores.dormitorio += 2;
    } else if (data.estilo === 'minimalista') {
      scores.oficina += 3;
      scores.cocina += 2;
    } else if (data.estilo === 'rustico') {
      scores.exterior += 2;
      scores.living += 1;
    }

    if (data.presupuesto === 'alto') {
      scores.cocina += 2;
      scores.bano += 2;
      scores.living += 2;
    } else if (data.presupuesto === 'medio') {
      scores.living += 2;
      scores.dormitorio += 2;
    } else if (data.presupuesto === 'bajo') {
      scores.oficina += 2;
      scores.exterior += 1;
    }

    if (data.prioridad === 'funcionalidad') {
      scores.cocina += 3;
      scores.bano += 2;
    } else if (data.prioridad === 'estetica') {
      scores.living += 3;
      scores.dormitorio += 2;
    } else if (data.prioridad === 'espacio') {
      scores.oficina += 3;
      scores.exterior += 2;
    }

    // Ordenar áreas por puntuación
    const sortedAreas = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .map(([area, score]) => ({ area, score }));

    // Obtener las 3 áreas principales
    const topAreas = sortedAreas.slice(0, 3);

    return {
      topAreas,
      allScores: scores,
      recommendations: generateSpecificRecommendations(topAreas, data)
    };
  };

  const generateSpecificRecommendations = (topAreas, data) => {
    const recommendations = [];
    
    topAreas.forEach(({ area }) => {
      const areaRecs = getAreaRecommendations(area, data);
      recommendations.push(...areaRecs);
    });

    return recommendations;
  };

  const getAreaRecommendations = (area, data) => {
    const recommendations = {
      cocina: [
        {
          title: "Cocinas Integrales",
          description: "Explora cocinas completas con islas centrales y electrodomésticos integrados"
        },
        {
          title: "Electrodomésticos Premium",
          description: "Descubre la última tecnología en electrodomésticos de cocina"
        },
        {
          title: "Almacenamiento Inteligente",
          description: "Soluciones de almacenamiento optimizadas para espacios pequeños"
        }
      ],
      living: [
        {
          title: "Sofás y Sillones",
          description: "Encuentra el sofá perfecto para tu espacio y estilo"
        },
        {
          title: "Mesas de Centro",
          description: "Mesas de centro que combinan funcionalidad y diseño"
        },
        {
          title: "Iluminación Ambiental",
          description: "Sistemas de iluminación que transforman tu living"
        }
      ],
      dormitorio: [
        {
          title: "Camas y Colchones",
          description: "Descansa mejor con las mejores opciones en descanso"
        },
        {
          title: "Roperos y Vestidores",
          description: "Organiza tu ropa con soluciones de almacenamiento elegantes"
        },
        {
          title: "Textiles y Decoración",
          description: "Completa tu dormitorio con textiles de calidad"
        }
      ],
      bano: [
        {
          title: "Sanitarios y Grifería",
          description: "Productos de baño con la mejor tecnología y diseño"
        },
        {
          title: "Muebles de Baño",
          description: "Muebles funcionales que maximizan el espacio"
        },
        {
          title: "Accesorios y Decoración",
          description: "Detalles que hacen la diferencia en tu baño"
        }
      ],
      oficina: [
        {
          title: "Escritorios y Sillas",
          description: "Crea un espacio de trabajo productivo y cómodo"
        },
        {
          title: "Almacenamiento de Oficina",
          description: "Organiza tu espacio de trabajo de manera eficiente"
        },
        {
          title: "Iluminación de Trabajo",
          description: "Iluminación especializada para tu oficina en casa"
        }
      ],
      exterior: [
        {
          title: "Muebles de Exterior",
          description: "Disfruta de tu espacio exterior con muebles duraderos"
        },
        {
          title: "Parrillas y Cocinas Exteriores",
          description: "Equipa tu área de parrilla con lo mejor"
        },
        {
          title: "Decoración de Jardín",
          description: "Añade personalidad a tu espacio exterior"
        }
      ]
    };

    return recommendations[area] || [];
  };

  const resetSurvey = () => {
    setCurrentStep('welcome');
    setSurveyData({});
    setResults(null);
  };

  return (
    <div className="container">
      
      {currentStep === 'welcome' && (
        <Welcome onStart={() => setCurrentStep('survey')} />
      )}
      
      {currentStep === 'survey' && (
        <Survey onComplete={handleSurveyComplete} />
      )}
      
      {currentStep === 'results' && (
        <Results 
          results={results} 
          surveyData={surveyData}
          onRestart={resetSurvey}
        />
      )}
    </div>
  );
}

export default App; 