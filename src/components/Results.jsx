import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Results = ({ results, surveyData, onRestart }) => {
  const navigate = useNavigate();
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Debug logs
  console.log('🔍 Results component recibió:');
  console.log('- results:', results);
  console.log('- surveyData:', surveyData);
  const [showTePodriaInteresar, setShowTePodriaInteresar] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [recommendedStands, setRecommendedStands] = useState([]);
  const [alsoInteresting, setAlsoInteresting] = useState([]);
  const alsoRef = useRef(null);
  const showOnlyAlso = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('interesar') === '1';
    } catch {
      return false;
    }
  })();

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

  // Cargar empresas desde Supabase y calcular stands recomendados
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('companies')
          .select('name, activity, stand_number, sector');
        if (error) {
          console.warn('⚠️ No se pudieron cargar empresas:', error.message);
          return;
        }
        setCompanies(data || []);
      } catch (e) {
        console.warn('⚠️ Error al cargar empresas:', e.message);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!companies || companies.length === 0 || !surveyData) {
      setRecommendedStands([]);
      setAlsoInteresting([]);
      return;
    }

    // Mapeo de palabras clave por respuesta
    const keywordsByAnswer = {
      categoria: {
        muebles_decoracion: ['mueble', 'muebler', 'deco', 'decor', 'sillón', 'sillon', 'mesa', 'madera', 'textil', 'tapizado'],
        aberturas_construccion: ['abertura', 'aluminio', 'puerta', 'ventana', 'revestimiento', 'ladrillo', 'pvc', 'galería', 'galeria', 'techo'],
        interiorismo_integral: ['interiorismo', 'proyecto', 'cortinas', 'alfombra', 'integral', 'diseño de interiores']
      },
      estiloProyecto: {
        estandar: ['listo para usar', 'colchón', 'colchon', 'somier', 'sommier', 'terminado', 'stock'],
        personalizado: ['a medida', 'personalizado', 'amoblamiento', 'carpintería', 'carpinteria'],
        artesanal: ['artesanal', 'sustentable', 'rústico', 'rustico', 'bioconstrucción', 'bioconstruccion', 'tornería', 'torneria']
      },
      espacio: {
        living_dormitorio: ['living', 'dormitorio', 'sillón', 'sillon', 'racks', 'bancos', 'textil'],
        cocina_comedor: ['cocina', 'comedor', 'amoblamientos de cocina', 'campana', 'anafe', 'horno', 'vajilla', 'mesa'],
        accesos_aberturas_exterior: ['acceso', 'abertura', 'exterior', 'galería', 'galeria', 'puerta', 'cerradura']
      },
      inversion: {
        economico: ['económico', 'economico', 'minorista'],
        medio: ['estándar', 'estandar', 'medio'],
        premium: ['alta gama', 'premium', 'acero quirúrgico']
      }
    };

    const normalized = (s) => (s || '').toString().toLowerCase();

    const scoreCompany = (company) => {
      const text = normalized(company.activity + ' ' + company.name);
      let score = 0;

      // Puntuar por cada dimensión respondida
      Object.entries(keywordsByAnswer).forEach(([questionId, options]) => {
        const answer = surveyData[questionId];
        if (!answer) return;
        const kw = options[answer] || [];
        kw.forEach(k => {
          if (text.includes(k)) score += 2; // peso por keyword
        });
      });

      // Leve sesgo por pabellones comunes de resultados calculados
      if (results && results.topAreas) {
        const areaBoost = results.topAreas.reduce((acc, a, idx) => acc + (3 - idx), 0);
        score += Math.min(areaBoost, 3);
      }

      return score;
    };

    const ranked = companies
      .map(c => ({ ...c, score: scoreCompany(c) }))
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8); // top 8 stands

    setRecommendedStands(ranked);

    // Te podría interesar: stands excluidos por el filtro, pero afines a lifestyle/servicios
    const recommendedKeys = new Set(ranked.map(r => `${r.name}|${r.stand_number}`));
    const lifestyleKeywords = [
      'purificador', 'agua', 'vela', 'fragancia', 'aroma', 'difusor',
      'colchón', 'colchon', 'sommier', 'somier', 'textil', 'iluminación', 'iluminacion'
    ];
    const maybeInteresting = companies
      .filter(c => !recommendedKeys.has(`${c.name}|${c.stand_number}`))
      .map(c => {
        const text = (c.activity + ' ' + c.name).toLowerCase();
        const hits = lifestyleKeywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
        return { ...c, hits };
      })
      .filter(c => c.hits > 0)
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 6);
    setAlsoInteresting(maybeInteresting);
  }, [companies, surveyData, results]);

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

  // Función para mostrar selector de voces
  const displayVoiceSelector = () => {
    const voices = window.speechSynthesis.getVoices();
    console.log('🎤 Todas las voces disponibles:', voices.map(v => `${v.name} (${v.lang})`));
    
    // Crear lista de voces para mostrar
    const voiceList = voices.map(voice => 
      `${voice.name} (${voice.lang}) - ${voice.default ? 'DEFAULT' : ''}`
    ).join('\n');
    
    alert(`🎤 Voces disponibles en tu dispositivo:\n\n${voiceList}\n\nRevisa la consola para más detalles.`);
  };

  // Función para probar una voz específica
  const testSpecificVoice = (voiceName) => {
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(voice => voice.name.includes(voiceName));
    
    if (selectedVoice) {
      const utterance = new SpeechSynthesisUtterance("Hola, esta es una prueba de la voz " + selectedVoice.name);
      utterance.voice = selectedVoice;
      utterance.lang = 'es-MX';
      utterance.rate = 0.9;
      utterance.volume = 1;
      utterance.pitch = 1.1;
      
      console.log('🎤 Probando voz específica:', selectedVoice.name);
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`No se encontró la voz "${voiceName}"`);
    }
  };

  // Función para usar Web Speech API con selección inteligente de voz
  const speakWithTTS = (text) => {
    // Cancelar cualquier audio actual
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Obtener todas las voces disponibles
    const voices = window.speechSynthesis.getVoices();
    
    // Log de todas las voces disponibles para debugging
    console.log('🎤 Voces disponibles:', voices.map(v => `${v.name} (${v.lang})`));
    
    // Detectar si es dispositivo móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    console.log('📱 Información del dispositivo:', {
      isMobile,
      isSafari,
      isIOS,
      userAgent: navigator.userAgent
    });
    
    let selectedVoice = null;
    
    if (isMobile) {
      console.log('📱 Aplicando estrategia móvil para Shelley(es-ES)');
      
      // Estrategia específica para móviles - priorizar Shelley(es-ES) - Default
      const mobilePreferredVoices = [
        'Shelley(es-ES) - Default', 'Shelley', 'Shelley(es-ES)',
        'Google español (México)', 'Google español (Mexico)',
        'Microsoft Sabina - Spanish (Mexico)', 'Microsoft Helena - Spanish (Spain)',
        'Samantha', 'Victoria', 'Ana', 'Maria', 'Carmen', 'Isabel', 'Rosa'
      ];
      
      // Buscar Shelley(es-ES) - Default específicamente primero
      selectedVoice = voices.find(voice => 
        voice.name.includes('Shelley(es-ES) - Default') || 
        voice.name.includes('Shelley(es-ES)') ||
        voice.name.includes('Shelley')
      );
      
      if (selectedVoice) {
        console.log('📱 Voz Shelley(es-ES) encontrada:', selectedVoice.name);
      } else {
        // Si no encuentra Shelley, buscar otras voces preferidas
        selectedVoice = voices.find(voice => 
          mobilePreferredVoices.some(name => voice.name.includes(name))
        );
        
        if (selectedVoice) {
          console.log('📱 Voz preferida móvil encontrada:', selectedVoice.name);
        } else {
          // Buscar cualquier voz en español de España
          selectedVoice = voices.find(voice => 
            voice.lang === 'es-ES' || voice.lang === 'es-ES'
          );
          
          if (selectedVoice) {
            console.log('📱 Voz en español de España encontrada:', selectedVoice.name);
          } else {
            // Buscar cualquier voz en español de México
            selectedVoice = voices.find(voice => 
              voice.lang === 'es-MX' || voice.lang === 'es-MX'
            );
            
            if (selectedVoice) {
              console.log('📱 Voz en español de México encontrada:', selectedVoice.name);
            } else {
              // Buscar cualquier voz en español
              selectedVoice = voices.find(voice => 
                voice.lang.startsWith('es')
              );
              
              if (selectedVoice) {
                console.log('📱 Voz en español encontrada:', selectedVoice.name);
              } else {
                // Buscar voces femeninas del sistema
                selectedVoice = voices.find(voice => 
                  voice.name.toLowerCase().includes('samantha') ||
                  voice.name.toLowerCase().includes('victoria') ||
                  voice.name.toLowerCase().includes('ana') ||
                  voice.name.toLowerCase().includes('maria')
                );
                
                if (selectedVoice) {
                  console.log('📱 Voz femenina del sistema encontrada:', selectedVoice.name);
                } else {
                  // Último recurso: primera voz disponible
                  selectedVoice = voices[0];
                  console.log('📱 Usando primera voz disponible:', selectedVoice?.name);
                }
              }
            }
          }
        }
      }
    } else {
      // Estrategia para desktop - priorizar Google México
      console.log('💻 Aplicando estrategia desktop para Google México');
      
      // Buscar Google México específicamente
      selectedVoice = voices.find(voice => 
        voice.name.includes('Google español (México)') || 
        voice.name.includes('Google español (Mexico)')
      );
      
      if (selectedVoice) {
        console.log('🎤 Voz de Google México encontrada:', selectedVoice.name);
      } else {
        // Buscar otras voces preferidas
        const preferredVoices = [
          'Google español (España)', 'Google español (Spain)',
          'Microsoft Sabina - Spanish (Mexico)', 'Microsoft Helena - Spanish (Spain)',
          'Microsoft Pablo - Spanish (Spain)', 'Microsoft Raul - Spanish (Mexico)'
        ];
        
        selectedVoice = voices.find(voice => 
          preferredVoices.some(name => voice.name.includes(name))
        );
        
        if (selectedVoice) {
          console.log('🎤 Voz preferida encontrada:', selectedVoice.name);
        } else {
          // Buscar cualquier voz en español de México
          selectedVoice = voices.find(voice => 
            voice.lang === 'es-MX'
          );
          
          if (selectedVoice) {
            console.log('🎤 Voz en español de México encontrada:', selectedVoice.name);
          } else {
            // Buscar cualquier voz en español
            selectedVoice = voices.find(voice => 
              voice.lang.startsWith('es')
            );
            
            if (selectedVoice) {
              console.log('🎤 Voz en español encontrada:', selectedVoice.name);
            } else {
              // Buscar voces femeninas
              selectedVoice = voices.find(voice => 
                voice.name.toLowerCase().includes('samantha') ||
                voice.name.toLowerCase().includes('victoria') ||
                voice.name.toLowerCase().includes('alex') ||
                voice.name.toLowerCase().includes('karen')
              );
              
              if (selectedVoice) {
                console.log('🎤 Voz femenina encontrada:', selectedVoice.name);
              } else {
                // Último recurso: primera voz disponible
                selectedVoice = voices[0];
                console.log('🎤 Usando primera voz disponible:', selectedVoice?.name);
              }
            }
          }
        }
      }
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('🎤 Voz seleccionada:', selectedVoice.name, `(${selectedVoice.lang})`);
    }
    
    // Configurar el utterance
    utterance.lang = 'es-MX';
    utterance.rate = 0.9;  // Velocidad (0.1 - 10)
    utterance.volume = 1;  // Volumen (0 - 1)
    utterance.pitch = 1.1; // Tono (0 - 2)
    
    // Eventos para debugging
    utterance.onstart = () => {
      console.log('🔊 Iniciando reproducción de voz');
      if (isMobile) {
        console.log('📱 Indicador visual móvil activado');
      }
    };
    
    utterance.onend = () => {
      console.log('✅ Reproducción de voz completada');
    };
    
    utterance.onerror = (event) => {
      console.error('❌ Error en reproducción de voz:', event.error);
    };
    
    // Reproducir
    window.speechSynthesis.speak(utterance);
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

  // Autoplay de voz deshabilitado al mostrar resultados

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
        {!showOnlyAlso && (
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          textAlign: 'center',
          marginBottom: 'clamp(15px, 4vw, 30px)',
          color: '#2c3e50',
          fontWeight: '700',
          lineHeight: '1.2',
          padding: window.innerWidth <= 768 ? '0 15px' : '0'
        }}>
          🧭 Stands recomendados para visitar
        </h1>
        )}

        {/* Sugerencias de Stands (basado en respuestas) */}
        {!showOnlyAlso && (
        <div className="card" style={{ marginTop: '20px' }}>
          {recommendedStands.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>
              No encontramos coincidencias directas. Te sugerimos empezar por las áreas destacadas arriba.
            </p>
          ) : (
            <div className="recommendations" style={{ marginTop: 10 }}>
              {recommendedStands.map((c, idx) => (
                <div 
                  key={c.name + c.stand_number} 
                  className="recommendation-item" 
                  style={{ 
                    display: 'flex', 
                    gap: window.innerWidth <= 768 ? 8 : 12, 
                    alignItems: 'flex-start',
                    padding: window.innerWidth <= 768 ? '12px' : '15px',
                    marginBottom: window.innerWidth <= 768 ? '10px' : '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: window.innerWidth <= 768 ? '8px' : '12px',
                    border: '1px solid #e9ecef'
                  }}
                >
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? 20 : 24,
                    flexShrink: 0
                  }}>📍</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="recommendation-title" style={{
                      fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
                      fontWeight: '600',
                      marginBottom: '4px',
                      wordBreak: 'break-word'
                    }}>
                      {idx + 1}. {c.name}
                    </div>
                    <div className="recommendation-description" style={{
                      fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem',
                      color: '#666',
                      marginBottom: '8px',
                      lineHeight: '1.4',
                      wordBreak: 'break-word'
                    }}>
                      {c.activity}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: window.innerWidth <= 768 ? 6 : 12, 
                      marginTop: 6 
                    }}>
                      {c.sector && (
                        <span style={{ 
                          fontWeight: 600, 
                          color: '#2c3e50',
                          fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.85rem',
                          backgroundColor: '#e3f2fd',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>Sector: {c.sector}</span>
                      )}
                      <span style={{ 
                        fontWeight: 600, 
                        color: '#667eea',
                        fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.85rem',
                        backgroundColor: '#f3e5f5',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>Stand: {c.stand_number}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Botón para ir a "Te podría interesar" (navegación a ruta aparte) */}
        {alsoInteresting.length > 0 && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: window.innerWidth <= 768 ? '20px' : '30px',
            padding: window.innerWidth <= 768 ? '0 15px' : '0'
          }}>
            <button
              className="btn"
              onClick={() => navigate('/interesar', { 
                state: { 
                  recommendedStands: recommendedStands,
                  alsoInteresting: alsoInteresting 
                } 
              })}
              style={{
                fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
                padding: window.innerWidth <= 768 ? '12px 20px' : '15px 30px',
                borderRadius: window.innerWidth <= 768 ? '25px' : '30px',
                minWidth: window.innerWidth <= 768 ? '200px' : '250px'
              }}
            >
              🔎 Ver "Te podría interesar"
            </button>
          </div>
        )}

        {/* Botón Volver */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: window.innerWidth <= 768 ? '20px' : '30px',
          padding: window.innerWidth <= 768 ? '0 15px' : '0'
        }}>
          <button
            className="btn"
            onClick={onRestart}
            style={{
              backgroundColor: '#6c757d',
              fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
              padding: window.innerWidth <= 768 ? '12px 20px' : '15px 30px',
              borderRadius: window.innerWidth <= 768 ? '25px' : '30px',
              minWidth: window.innerWidth <= 768 ? '150px' : '180px',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(108, 117, 125, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#5a6268';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#6c757d';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.3)';
            }}
          >
            ← Volver
          </button>
        </div>



        {/* Controles de voz eliminados para dejar solo stands recomendados */}

        {/* Sección "Te podría interesar" eliminada */}
      </div>
    </div>
  );
};

export default Results;