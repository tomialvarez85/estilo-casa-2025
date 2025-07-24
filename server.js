const express = require('express');
const cors = require('cors');
const path = require('path');
// const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar CORS
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Configurar MongoDB Atlas (COMENTADO PARA DESARROLLO LOCAL)
// const mongoUrl = process.env.MONGODB_URI;

// if (!mongoUrl) {
//   console.error('❌ Error: MONGODB_URI debe estar configurado en las variables de entorno');
//   process.exit(1);
// }

// let db;

// Conectar a MongoDB con configuración SSL (COMENTADO PARA DESARROLLO LOCAL)
// async function connectToMongoDB() {
//   try {
//     const client = new MongoClient(mongoUrl, {
//       ssl: true,
//       sslValidate: false,
//       retryWrites: true,
//       w: 'majority'
//     });
    
//     await client.connect();
//     db = client.db('estilo-casa-2025');
//     console.log('✅ Conectado a MongoDB Atlas');
//   } catch (error) {
//     console.error('❌ Error conectando a MongoDB:', error.message);
//     process.exit(1);
//   }
// }

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Ruta para guardar encuesta (SIMULADA PARA DESARROLLO LOCAL)
app.post('/api/survey', async (req, res) => {
  try {
    const surveyData = req.body;
    
    console.log('📊 Datos de encuesta recibidos:', surveyData);
    
    // Simular guardado en base de datos (COMENTADO PARA DESARROLLO LOCAL)
    // const result = await db.collection('surveys').insertOne({
    //   ...surveyData,
    //   timestamp: new Date(),
    //   source: 'web'
    // });
    
    // console.log('✅ Encuesta guardada en MongoDB:', result.insertedId);
    
    // Simular respuesta exitosa
    res.json({
      success: true,
      message: 'Encuesta guardada exitosamente (modo desarrollo)',
      // surveyId: result.insertedId
    });
    
  } catch (error) {
    console.error('❌ Error guardando encuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para guardar resultados de voz (SIMULADA PARA DESARROLLO LOCAL)
app.post('/api/voice-results', async (req, res) => {
  try {
    const voiceData = req.body;
    
    console.log('🎤 Datos de voz recibidos:', voiceData);
    
    // Simular guardado en base de datos (COMENTADO PARA DESARROLLO LOCAL)
    // const result = await db.collection('voice_results').insertOne({
    //   ...voiceData,
    //   timestamp: new Date(),
    //   source: 'voice'
    // });
    
    // console.log('✅ Resultados de voz guardados en MongoDB:', result.insertedId);
    
    // Simular respuesta exitosa
    res.json({
      success: true,
      message: 'Resultados de voz guardados exitosamente (modo desarrollo)',
      // voiceId: result.insertedId
    });
    
  } catch (error) {
    console.error('❌ Error guardando resultados de voz:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para obtener estadísticas (SIMULADA PARA DESARROLLO LOCAL)
app.get('/api/stats', async (req, res) => {
  try {
    console.log('📈 Solicitud de estadísticas recibida');
    
    // Simular estadísticas (COMENTADO PARA DESARROLLO LOCAL)
    // const surveyCount = await db.collection('surveys').countDocuments();
    // const voiceCount = await db.collection('voice_results').countDocuments();
    
    // const popularAreas = await db.collection('surveys').aggregate([
    //   { $unwind: '$topAreas' },
    //   { $group: { _id: '$topAreas.area', count: { $sum: 1 } } },
    //   { $sort: { count: -1 } },
    //   { $limit: 5 }
    // ]).toArray();
    
    // Simular datos de estadísticas
    const mockStats = {
      totalSurveys: 150,
      totalVoiceResults: 75,
      popularAreas: [
        { area: 'cocina', count: 45 },
        { area: 'living', count: 38 },
        { area: 'dormitorio', count: 32 },
        { area: 'bano', count: 25 },
        { area: 'oficina', count: 18 }
      ],
      lastUpdated: new Date().toISOString()
    };
    
    console.log('📊 Estadísticas simuladas enviadas:', mockStats);
    
    res.json({
      success: true,
      data: mockStats
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para obtener información de la base de datos (SIMULADA PARA DESARROLLO LOCAL)
app.get('/api/db-info', async (req, res) => {
  try {
    console.log('💾 Solicitud de información de BD recibida');
    
    // Simular información de base de datos (COMENTADO PARA DESARROLLO LOCAL)
    // const dbName = db.databaseName;
    // const collections = await db.listCollections().toArray();
    // const surveyCount = await db.collection('surveys').countDocuments();
    // const voiceCount = await db.collection('voice_results').countDocuments();
    
    // console.log(`💾 Base de datos MongoDB Atlas: ${dbName}`);
    // console.log('📚 Colecciones disponibles:', collections.map(c => c.name));
    // console.log(`📊 Total de encuestas: ${surveyCount}`);
    // console.log(`🎤 Total de resultados de voz: ${voiceCount}`);
    
    // Simular información de base de datos
    const mockDbInfo = {
      database: 'estilo-casa-2025 (simulado)',
      collections: ['surveys', 'voice_results', 'stats'],
      totalSurveys: 150,
      totalVoiceResults: 75,
      status: 'modo desarrollo - sin conexión real'
    };
    
    console.log('💾 Información de BD simulada enviada:', mockDbInfo);
    
    res.json({
      success: true,
      data: mockDbInfo
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo información de BD:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log('📱 Modo desarrollo activado - Base de datos simulada');
  
  // Conectar a MongoDB (COMENTADO PARA DESARROLLO LOCAL)
  // await connectToMongoDB();
  
  console.log('✅ Servidor listo para recibir peticiones');
});

// Manejo de cierre graceful (COMENTADO PARA DESARROLLO LOCAL)
// process.on('SIGINT', async () => {
//   console.log('\n🔄 Cerrando servidor...');
//   if (db) {
//     await db.client.close();
//     console.log('🔌 Conexión a MongoDB cerrada');
//   }
//   process.exit(0);
// }); 