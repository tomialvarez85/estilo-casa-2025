const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar Supabase con nombres de variables diferentes
const supabaseUrl = process.env.DATABASE_URL;
const supabaseKey = process.env.DATABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: DATABASE_URL y DATABASE_KEY deben estar configurados en las variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Verificar conexión a Supabase
supabase.from('encuestas').select('count').limit(1)
  .then(() => {
    console.log('✅ Conectado a Supabase:', supabaseUrl);
  })
  .catch((error) => {
    console.error('❌ Error conectando a Supabase:', error.message);
  });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas API
app.post('/api/survey', async (req, res) => {
  try {
    const surveyData = req.body;
    const { tipoVivienda, estilo, presupuesto, prioridad } = surveyData;

    const { data, error } = await supabase
      .from('encuestas')
      .insert([
        {
          tipo_vivienda: tipoVivienda,
          estilo: estilo,
          presupuesto: presupuesto,
          prioridad: prioridad
        }
      ])
      .select();

    if (error) {
      console.error('❌ Error al guardar encuesta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al guardar la encuesta en Supabase',
        error: error.message
      });
    } else {
      console.log('✅ Encuesta guardada en Supabase:', data[0]);
      res.json({
        success: true,
        message: 'Encuesta guardada exitosamente en Supabase',
        responseId: data[0].id
      });
    }
  } catch (error) {
    console.error('❌ Error al procesar la encuesta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la encuesta',
      error: error.message
    });
  }
});

app.get('/api/survey/stats', async (req, res) => {
  try {
    // Obtener total de respuestas
    const { count: totalCount, error: countError } = await supabase
      .from('encuestas')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // Obtener respuestas de hoy
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount, error: todayError } = await supabase
      .from('encuestas')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    if (todayError) {
      throw todayError;
    }

    // Obtener estadísticas por tipo de vivienda
    const { data: viviendaStats, error: viviendaError } = await supabase
      .from('encuestas')
      .select('tipo_vivienda');

    if (viviendaError) {
      throw viviendaError;
    }

    const viviendaCount = {};
    viviendaStats.forEach(item => {
      viviendaCount[item.tipo_vivienda] = (viviendaCount[item.tipo_vivienda] || 0) + 1;
    });

    const tipoViviendaMasPopular = Object.keys(viviendaCount).reduce((a, b) => 
      viviendaCount[a] > viviendaCount[b] ? a : b, 'N/A'
    );

    // Obtener estadísticas por estilo
    const { data: estiloStats, error: estiloError } = await supabase
      .from('encuestas')
      .select('estilo');

    if (estiloError) {
      throw estiloError;
    }

    const estiloCount = {};
    estiloStats.forEach(item => {
      estiloCount[item.estilo] = (estiloCount[item.estilo] || 0) + 1;
    });

    const estiloMasPopular = Object.keys(estiloCount).reduce((a, b) => 
      estiloCount[a] > estiloCount[b] ? a : b, 'N/A'
    );

    res.json({
      success: true,
      stats: {
        totalRespuestas: totalCount || 0,
        respuestasHoy: todayCount || 0,
        tipoViviendaMasPopular,
        estiloMasPopular,
        distribucionVivienda: viviendaCount,
        distribucionEstilo: estiloCount
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
});

app.get('/api/survey/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('encuestas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener encuestas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las respuestas',
        error: error.message
      });
    } else {
      res.json({
        success: true,
        responses: data || []
      });
    }
  } catch (error) {
    console.error('❌ Error al obtener encuestas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las respuestas',
      error: error.message
    });
  }
});

// Ruta para servir la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
  console.log(`🌐 Aplicación disponible en http://localhost:${PORT}`);
  console.log(`💾 Base de datos Supabase: ${supabaseUrl}`);
}); 