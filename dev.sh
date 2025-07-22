#!/bin/bash

echo "🚀 Iniciando Estilo Casa - Software de Encuesta"
echo "=================================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo "Por favor instala Node.js desde https://nodejs.org/"
    exit 1
fi

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Construir la aplicación
echo "🔨 Construyendo aplicación..."
npm run build

# Iniciar el servidor
echo "🌐 Iniciando servidor en http://localhost:5000"
echo "📊 API disponible en http://localhost:5000/api"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

npm start 