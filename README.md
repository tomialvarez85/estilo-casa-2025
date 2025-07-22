# 🏠 Estilo Casa - Software de Encuesta y Orientación

Software inteligente para eventos de equipamiento interior de viviendas que orienta a los visitantes hacia las áreas más relevantes del evento basándose en sus necesidades específicas.

## ✨ Características

- **Encuesta Inteligente**: 5 preguntas clave que determinan las preferencias del visitante
- **Algoritmo de Recomendación**: Sistema de puntuación que identifica las áreas más relevantes
- **Interfaz Moderna**: Diseño atractivo y responsive para una experiencia de usuario óptima
- **Resultados Personalizados**: Recomendaciones específicas con productos y áreas a visitar
- **Plan de Visita**: Sugerencias de orden de visita para maximizar la experiencia
- **Estadísticas en Tiempo Real**: API para monitorear las respuestas y tendencias

## 🚀 Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd algoritmoexpo
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm start
```

4. **Acceder a la aplicación**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📋 Estructura del Proyecto

```
algoritmoexpo/
├── src/
│   ├── components/
│   │   ├── Welcome.jsx      # Pantalla de bienvenida
│   │   ├── Survey.jsx       # Componente principal de encuesta
│   │   ├── Question.jsx     # Componente de pregunta individual
│   │   └── Results.jsx      # Pantalla de resultados
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── server.js                # Servidor Express
├── package.json             # Dependencias y scripts
├── vite.config.js           # Configuración de Vite
└── README.md               # Documentación
```

## 🎯 Algoritmo de Recomendación

El sistema utiliza un algoritmo de puntuación basado en las siguientes variables:

### Variables de Entrada
1. **Tipo de Vivienda**: Casa, Apartamento, Dúplex
2. **Estilo de Decoración**: Moderno, Clásico, Minimalista, Rústico
3. **Presupuesto**: Alto, Medio, Económico
4. **Prioridad**: Funcionalidad, Estética, Optimización de espacio
5. **Tamaño de Familia**: Grande, Pequeña, Individual

### Áreas Evaluadas
- 🍳 **Cocina**: Electrodomésticos, muebles, almacenamiento
- 🛋️ **Living y Comedor**: Sofás, mesas, iluminación
- 🛏️ **Dormitorio**: Camas, roperos, textiles
- 🚿 **Baño**: Sanitarios, grifería, muebles
- 💼 **Oficina en Casa**: Escritorios, sillas, almacenamiento
- 🌳 **Exterior y Jardín**: Muebles exteriores, parrillas, decoración

### Sistema de Puntuación
Cada respuesta suma puntos a las áreas relevantes:
- **Tipo de vivienda**: 2-3 puntos
- **Estilo**: 2-3 puntos
- **Presupuesto**: 1-2 puntos
- **Prioridad**: 2-3 puntos
- **Familia**: 1-3 puntos

## 📊 API Endpoints

### POST /api/survey
Guarda una nueva respuesta de encuesta
```json
{
  "tipoVivienda": "casa",
  "estilo": "moderno",
  "presupuesto": "alto",
  "prioridad": "funcionalidad",
  "familia": "grande"
}
```

### GET /api/survey/stats
Obtiene estadísticas de las encuestas
```json
{
  "totalResponses": 150,
  "todayResponses": 25,
  "popularAreas": [
    {"area": "cocina", "count": 45},
    {"area": "living", "count": 38}
  ],
  "popularStyles": [
    {"style": "moderno", "count": 67},
    {"style": "clasico", "count": 43}
  ]
}
```

## 🎨 Personalización

### Modificar Preguntas
Edita el array `questions` en `src/components/Survey.jsx`:

```javascript
const questions = [
  {
    id: 'nuevaPregunta',
    title: 'Tu nueva pregunta aquí',
    options: [
      { value: 'opcion1', label: 'Opción 1', icon: '🎯' },
      { value: 'opcion2', label: 'Opción 2', icon: '⭐' }
    ]
  }
];
```

### Ajustar Algoritmo
Modifica la función `calculateRecommendations` en `src/App.jsx` para cambiar la lógica de puntuación.

### Personalizar Estilos
Edita `src/index.css` para cambiar colores, fuentes y diseño.

## 🚀 Despliegue

### Producción
```bash
# Construir la aplicación
npm run build

# Iniciar servidor de producción
npm start
```

### Variables de Entorno
```bash
PORT=5000  # Puerto del servidor
NODE_ENV=production
```

## 📈 Monitoreo y Analytics

El sistema incluye:
- Contador de respuestas totales
- Respuestas del día actual
- Áreas más populares
- Estilos más solicitados
- Timestamps de todas las respuestas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto, contacta a:
- Email: soporte@expointerior.com
- Teléfono: +1 234 567 890

---

**Desarrollado con ❤️ para mejorar la experiencia en eventos de equipamiento interior** 