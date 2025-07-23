import React from 'react';

const TePodriaInteresar = () => {
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

  return (
    <div className="te-podria-interesar-container" style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div className="header" style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          color: '#333',
          fontSize: '2.5rem',
          marginBottom: '10px'
        }}>
          🔍 Te podría interesar
        </h1>
        <p style={{
          color: '#666',
          fontSize: '1.1rem',
          margin: '0'
        }}>
          Descubre otros sectores fascinantes de la exposición
        </p>
      </div>

      <div className="sections-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {sections.map((section) => (
          <div key={section.id} className="section-card" style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer',
            borderLeft: `5px solid ${section.color}`
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
              fontSize: '3rem',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              {section.icon}
            </div>
            <h3 style={{
              color: '#333',
              fontSize: '1.3rem',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              {section.title}
            </h3>
            <p style={{
              color: '#666',
              fontSize: '1rem',
              lineHeight: '1.5',
              textAlign: 'center',
              margin: '0'
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
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <p style={{
          color: '#666',
          fontSize: '1rem',
          margin: '0 0 15px 0'
        }}>
          💡 Explora todos los sectores para encontrar inspiración y productos únicos
        </p>
        <button 
          onClick={() => window.close()}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '12px 25px',
            borderRadius: '25px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1976D2'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#2196F3'}
        >
          ✖️ Cerrar
        </button>
      </div>
    </div>
  );
};

export default TePodriaInteresar; 