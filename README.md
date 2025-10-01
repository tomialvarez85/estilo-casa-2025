# 🏠 Estilo Casa 2025 - Sistema de Recomendación Inteligente

Sistema inteligente para la Expo Estilo Casa 2025 que orienta a los visitantes hacia los stands más relevantes basándose en sus necesidades específicas, con funcionalidades de búsqueda por voz y navegación intuitiva.

## ✨ Características

- **Encuesta Inteligente**: Sistema de preguntas que determina las preferencias del visitante
- **Búsqueda por Voz**: Reconocimiento de voz para búsquedas directas en la base de datos
- **Algoritmo de Recomendación**: Sistema de puntuación que identifica los stands más relevantes
- **Interfaz Responsive**: Diseño optimizado para dispositivos móviles y desktop
- **Navegación Intuitiva**: Sistema de botones "Volver" y navegación fluida
- **Resultados Personalizados**: Recomendaciones específicas con stands y empresas
- **Sección "Te podría interesar"**: Página separada con stands especializados
- **Base de Datos Supabase**: Integración con base de datos en la nube

## 🚀 Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd estilo-casa-2025
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env` con las credenciales de Supabase:
```bash
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

5. **Acceder a la aplicación**
- Aplicación: http://localhost:5173

## 📋 Estructura del Proyecto

```
estilo-casa-2025/
├── src/
│   ├── components/
│   │   ├── Survey.jsx           # Componente principal de encuesta
│   │   ├── Results.jsx          # Pantalla de resultados y stands recomendados
│   │   ├── AlsoInteresting.jsx  # Página "Te podría interesar"
│   │   └── VoiceRecognition.jsx # Componente de reconocimiento de voz
│   ├── App.jsx                  # Componente principal con routing
│   ├── main.jsx                 # Punto de entrada con React Router
│   └── index.css                # Estilos globales
├── public/                      # Archivos estáticos
├── package.json                 # Dependencias y scripts
├── vite.config.js               # Configuración de Vite
├── .env                         # Variables de entorno (Supabase)
└── README.md                    # Documentación
```

## 🎯 Funcionalidades del Sistema

### 🔍 Búsqueda por Voz
- **Reconocimiento de Voz**: Utiliza Web Speech API para capturar comandos de voz
- **Búsqueda Inteligente**: Busca en las columnas `activity` y `name` de la base de datos
- **Limpieza de Texto**: Remueve palabras innecesarias como "Busco", "Necesito", etc.
- **Resultados Directos**: Muestra stands que coinciden con la búsqueda por voz

### 📊 Encuesta Tradicional
- **Preguntas Personalizadas**: Sistema de preguntas adaptado a necesidades del evento
- **Algoritmo de Puntuación**: Sistema que evalúa respuestas y genera recomendaciones
- **Resultados Personalizados**: Stands recomendados basados en las respuestas

### 🏢 Gestión de Stands
- **Base de Datos Supabase**: Integración con base de datos en la nube
- **Información Completa**: Nombre, actividad, stand, sector de cada empresa
- **Filtrado Inteligente**: Algoritmos para evitar duplicados y generar contenido relevante

### 🎨 Interfaz de Usuario
- **Diseño Responsive**: Optimizado para móviles y desktop
- **Navegación Intuitiva**: Botones "Volver" en todo el sistema
- **Centrado en Móvil**: Contenido centrado verticalmente en dispositivos móviles
- **Footer Dinámico**: Aparece solo al hacer scroll hacia abajo

## 🗄️ Base de Datos

### Estructura de la Tabla `companies`
```sql
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  activity TEXT,
  stand_number VARCHAR(50),
  sector VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Búsquedas Implementadas
- **Búsqueda por Voz**: `activity.ilike.%texto%` y `name.ilike.%texto%`
- **Filtrado por Sector**: Empresas especializadas en productos particulares
- **Evitar Duplicados**: Algoritmo para excluir stands ya recomendados

## 🎨 Componentes Principales

### Survey.jsx
- **Encuesta Interactiva**: Preguntas con opciones visuales
- **Diseño Responsive**: Optimizado para móviles
- **Navegación Fluida**: Botones de navegación intuitivos

### Results.jsx
- **Resultados de Encuesta**: Stands recomendados basados en respuestas
- **Resultados de Voz**: Stands encontrados por búsqueda por voz
- **Centrado en Móvil**: Contenido centrado verticalmente
- **Botón "Te podría interesar"**: Navegación a página especializada

### AlsoInteresting.jsx
- **Página Separada**: Stands especializados en productos particulares
- **Diseño Distinto**: Interfaz diferente a la página de resultados
- **Filtrado Inteligente**: Solo stands con productos muy específicos

### VoiceRecognition.jsx
- **Reconocimiento de Voz**: Web Speech API
- **Limpieza de Texto**: Remoción de palabras innecesarias
- **Búsqueda en BD**: Consultas directas a Supabase

## 🛠️ Configuración y Personalización

### Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:
```bash
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### Configurar Base de Datos
1. Crear proyecto en Supabase
2. Crear tabla `companies` con la estructura mencionada
3. Insertar datos de empresas y stands
4. Configurar políticas de seguridad (RLS)

### Personalizar Búsqueda por Voz
En `src/components/VoiceRecognition.jsx`:
```javascript
// Modificar palabras a remover
const wordsToRemove = [
  'busco', 'necesito', 'quiero', // agregar más palabras
  // ...
];
```

### Personalizar Estilos
- **Colores**: Modificar variables CSS en `src/index.css`
- **Responsive**: Ajustar breakpoints en componentes
- **Tipografía**: Cambiar fuentes y tamaños

## 🚀 Despliegue

### Producción con Vercel/Netlify
```bash
# Construir la aplicación
npm run build

# Los archivos estáticos se generan en /dist
# Subir a Vercel, Netlify o similar
```

### Variables de Entorno para Producción
```bash
VITE_SUPABASE_URL=tu_url_de_produccion
VITE_SUPABASE_ANON_KEY=tu_clave_de_produccion
```

## 📱 Características Técnicas

### Tecnologías Utilizadas
- **React 18**: Framework principal
- **Vite**: Herramienta de construcción
- **React Router DOM**: Navegación entre páginas
- **Supabase**: Base de datos y autenticación
- **Web Speech API**: Reconocimiento de voz
- **CSS-in-JS**: Estilos inline para componentes

### Optimizaciones
- **Responsive Design**: Adaptable a todos los dispositivos
- **Lazy Loading**: Carga optimizada de componentes
- **Centrado en Móvil**: Experiencia optimizada para móviles
- **Navegación Intuitiva**: Botones "Volver" en todo el sistema

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🎯 Flujo de Usuario

### 1. Pantalla de Bienvenida
- Mensaje de bienvenida personalizado
- Opción de encuesta tradicional o búsqueda por voz

### 2. Encuesta Tradicional
- Preguntas adaptadas al evento
- Interfaz responsive para móviles
- Navegación fluida entre preguntas

### 3. Búsqueda por Voz
- Reconocimiento de voz en tiempo real
- Búsqueda inteligente en base de datos
- Limpieza automática de texto

### 4. Resultados
- Stands recomendados basados en preferencias
- Información completa de cada stand
- Opción de navegar a "Te podría interesar"

### 5. Página "Te podría interesar"
- Stands especializados en productos particulares
- Diseño diferenciado de la página principal
- Navegación de regreso

## 📞 Soporte

Para soporte técnico o consultas sobre el proyecto:
- **Proyecto**: Expo Estilo Casa 2025
- **Tecnología**: React + Supabase + Web Speech API
- **Desarrollo**: Sistema de recomendación inteligente

---

**Desarrollado para la Expo Estilo Casa 2025 - Mejorando la experiencia de visitantes**