import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const AlsoInteresting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para filtrar empresas con productos muy particulares
  const filterSpecializedCompanies = (allCompanies, excludedStands = []) => {
    // Palabras clave que indican productos muy particulares o especializados
    const specializedKeywords = [
      // Productos únicos y especializados
      'artesanal', 'artesano', 'hecho a mano', 'personalizado', 'custom',
      'sustentable', 'ecológico', 'eco', 'bioconstrucción', 'bioconstruccion',
      'purificador', 'filtro', 'agua', 'aire', 'calidad del aire',
      'aromaterapia', 'fragancia', 'esencia', 'difusor', 'vela aromática',
      'colchón premium', 'sommier premium', 'textil premium', 'algodón orgánico',
      'iluminación led', 'iluminación inteligente', 'domótica', 'smart home',
      'diseño exclusivo', 'edición limitada', 'colección especial',
      'tecnología avanzada', 'innovación', 'patente', 'exclusivo',
      'importado', 'internacional', 'premium', 'alta gama', 'lujo',
      'sustentabilidad', 'reciclado', 'reutilizado', 'upcycling',
      'bienestar', 'wellness', 'relajación', 'spa', 'terapéutico',
      'diseño único', 'creación propia', 'desarrollo propio'
    ];

    // Crear set de stands excluidos para búsqueda rápida
    const excludedKeys = new Set(excludedStands.map(stand => `${stand.name}|${stand.stand_number}`));

    return allCompanies.filter(company => {
      // Excluir stands ya recomendados
      const isExcluded = excludedKeys.has(`${company.name}|${company.stand_number}`);
      if (isExcluded) return false;

      const text = (company.activity + ' ' + company.name + ' ' + (company.sector || '')).toLowerCase();
      
      // Verificar si contiene palabras clave de productos especializados
      const hasSpecializedKeywords = specializedKeywords.some(keyword => 
        text.includes(keyword.toLowerCase())
      );

      // También incluir empresas con sectores muy específicos
      const specializedSectors = [
        'aromaterapia', 'bienestar', 'sustentabilidad', 'tecnología', 
        'innovación', 'arte', 'artesanía', 'premium', 'lujo'
      ];
      
      const hasSpecializedSector = company.sector && 
        specializedSectors.some(sector => 
          company.sector.toLowerCase().includes(sector.toLowerCase())
        );

      return hasSpecializedKeywords || hasSpecializedSector;
    });
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        if (!supabase) return;
        const { data, error } = await supabase
          .from('companies')
          .select('name, activity, stand_number, sector')
          .order('name', { ascending: true });
        if (error) {
          console.warn('No se pudieron cargar empresas:', error.message);
          setCompanies([]);
        } else {
          // Obtener stands recomendados desde la navegación (si vienen desde Results)
          const recommendedStands = location.state?.recommendedStands || [];
          
          // Filtrar solo empresas con productos muy particulares, excluyendo las ya recomendadas
          const specializedCompanies = filterSpecializedCompanies(data || [], recommendedStands);
          setCompanies(specializedCompanies);
        }
      } catch (e) {
        console.warn('Error al cargar empresas:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [location.state]);

  return (
    <div className="container">
      <div className="card" style={{ marginTop: 20 }}>
        {/* Header con diseño especial */}
        <div style={{
          textAlign: 'center',
          marginBottom: window.innerWidth <= 768 ? '30px' : '40px',
          padding: window.innerWidth <= 768 ? '20px 15px' : '30px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: window.innerWidth <= 768 ? '15px' : '20px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          margin: window.innerWidth <= 768 ? '0 10px 30px 10px' : '0 0 40px 0'
        }}>
          {/* Efecto de partículas de fondo */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }}></div>
          
          <h1 style={{ 
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: '15px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 1
          }}>
            ✨ Te podría interesar
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            margin: '0',
            opacity: '0.95',
            fontWeight: '300',
            position: 'relative',
            zIndex: 1
          }}>
            Productos únicos y especializados que podrían sorprenderte
          </p>
          
          {/* Iconos decorativos */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            fontSize: '1.5rem',
            opacity: '0.3'
          }}>🌟</div>
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            fontSize: '1.5rem',
            opacity: '0.3'
          }}>💎</div>
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '30px',
            fontSize: '1.2rem',
            opacity: '0.3'
          }}>🎨</div>
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '30px',
            fontSize: '1.2rem',
            opacity: '0.3'
          }}>🔮</div>
        </div>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Cargando...</p>
        ) : companies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ color: '#666', marginBottom: '15px' }}>No hay productos especializados disponibles</h3>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              En este momento no hay expositores con productos muy particulares registrados.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: window.innerWidth <= 768 ? '15px' : '20px',
            marginTop: window.innerWidth <= 768 ? '15px' : '20px',
            padding: window.innerWidth <= 768 ? '0 10px' : '0'
          }}>
            {companies.map((c, idx) => (
              <div 
                key={c.name + c.stand_number} 
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: window.innerWidth <= 768 ? '15px' : '20px',
                  padding: window.innerWidth <= 768 ? '20px' : '25px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  border: '2px solid transparent',
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: window.innerWidth <= 768 ? 'auto' : '280px'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-8px)';
                  e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                }}
              >
                {/* Número de orden con diseño especial */}
                <div style={{
                  position: 'absolute',
                  top: window.innerWidth <= 768 ? '10px' : '15px',
                  right: window.innerWidth <= 768 ? '10px' : '15px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  borderRadius: '50%',
                  width: window.innerWidth <= 768 ? '30px' : '35px',
                  height: window.innerWidth <= 768 ? '30px' : '35px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: window.innerWidth <= 768 ? '12px' : '14px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)'
                }}>
                  {idx + 1}
                </div>

                {/* Icono principal */}
                <div style={{
                  fontSize: window.innerWidth <= 768 ? '2.5rem' : '3rem',
                  marginBottom: window.innerWidth <= 768 ? '12px' : '15px',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  ✨
                </div>

                {/* Nombre de la empresa */}
                <h3 style={{
                  fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem',
                  fontWeight: '700',
                  color: '#2c3e50',
                  marginBottom: window.innerWidth <= 768 ? '8px' : '12px',
                  textAlign: 'center',
                  lineHeight: '1.3',
                  wordBreak: 'break-word'
                }}>
                  {c.name}
                </h3>

                {/* Actividad */}
                <p style={{
                  color: '#666',
                  fontSize: window.innerWidth <= 768 ? '0.85rem' : '0.95rem',
                  lineHeight: '1.5',
                  marginBottom: window.innerWidth <= 768 ? '15px' : '20px',
                  textAlign: 'center',
                  minHeight: window.innerWidth <= 768 ? '50px' : '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  wordBreak: 'break-word'
                }}>
                  {c.activity}
                </p>

                {/* Información adicional en chips */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: window.innerWidth <= 768 ? '6px' : '8px',
                  alignItems: 'center'
                }}>
                  {c.sector && (
                    <div style={{
                      backgroundColor: '#f8f9fa',
                      color: '#495057',
                      padding: window.innerWidth <= 768 ? '4px 8px' : '6px 12px',
                      borderRadius: window.innerWidth <= 768 ? '15px' : '20px',
                      fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.85rem',
                      fontWeight: '600',
                      border: '1px solid #e9ecef',
                      textAlign: 'center',
                      wordBreak: 'break-word'
                    }}>
                      🏷️ {c.sector}
                    </div>
                  )}
                  
                  <div style={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    padding: window.innerWidth <= 768 ? '6px 12px' : '8px 16px',
                    borderRadius: window.innerWidth <= 768 ? '20px' : '25px',
                    fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem',
                    fontWeight: '700',
                    boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center'
                  }}>
                    📍 Stand {c.stand_number}
                  </div>
                </div>

                {/* Efecto de brillo sutil */}
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.5s ease'
                }}></div>
              </div>
            ))}
          </div>
        )}

        <div style={{ 
          textAlign: 'center', 
          marginTop: window.innerWidth <= 768 ? '30px' : '40px',
          padding: window.innerWidth <= 768 ? '0 15px' : '0',
          display: 'flex',
          gap: window.innerWidth <= 768 ? '10px' : '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            className="btn" 
            onClick={() => navigate(-1)}
            style={{ 
              backgroundColor: '#6c757d',
              fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
              padding: window.innerWidth <= 768 ? '12px 20px' : '15px 30px',
              borderRadius: window.innerWidth <= 768 ? '25px' : '30px',
              minWidth: window.innerWidth <= 768 ? '120px' : '150px',
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
          
          <Link 
            className="btn" 
            to="/" 
            style={{ 
              backgroundColor: '#ff9800',
              fontSize: window.innerWidth <= 768 ? '0.9rem' : '1rem',
              padding: window.innerWidth <= 768 ? '12px 20px' : '15px 30px',
              borderRadius: window.innerWidth <= 768 ? '25px' : '30px',
              minWidth: window.innerWidth <= 768 ? '150px' : '180px',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#e68900';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#ff9800';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 152, 0, 0.3)';
            }}
          >
            🏠 Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AlsoInteresting;

