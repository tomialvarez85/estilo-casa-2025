const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Crear cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Conectado a Supabase:', supabaseUrl);

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
      console.error('Error al guardar en Supabase:', error);
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
    console.error('Error general:', error);
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
    const { count: totalResponses, error: countError } = await supabase
      .from('encuestas')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // Obtener respuestas de hoy
    const today = new Date().toISOString().split('T')[0];
    const { count: todayResponses, error: todayError } = await supabase
      .from('encuestas')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);

    if (todayError) {
      throw todayError;
    }

    // Obtener tipo de vivienda más popular
    const { data: popularAreas, error: areasError } = await supabase
      .from('encuestas')
      .select('tipo_vivienda')
      .limit(100);

    if (areasError) {
      throw areasError;
    }

    // Obtener estilo más popular
    const { data: popularStyles, error: stylesError } = await supabase
      .from('encuestas')
      .select('estilo')
      .limit(100);

    if (stylesError) {
      throw stylesError;
    }

    // Procesar estadísticas
    const areaCounts = {};
    const styleCounts = {};

    popularAreas.forEach(item => {
      areaCounts[item.tipo_vivienda] = (areaCounts[item.tipo_vivienda] || 0) + 1;
    });

    popularStyles.forEach(item => {
      styleCounts[item.estilo] = (styleCounts[item.estilo] || 0) + 1;
    });

    const topArea = Object.entries(areaCounts)
      .sort(([,a], [,b]) => b - a)[0] || ['ninguno', 0];

    const topStyle = Object.entries(styleCounts)
      .sort(([,a], [,b]) => b - a)[0] || ['ninguno', 0];

    res.json({
      success: true,
      stats: {
        totalResponses: totalResponses || 0,
        todayResponses: todayResponses || 0,
        popularAreas: [{ area: topArea[0], count: topArea[1] }],
        popularStyles: [{ estilo: topStyle[0], count: topStyle[1] }]
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
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
      console.error('Error al obtener encuestas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las respuestas',
        error: error.message
      });
    } else {
      res.json({
        success: true,
        responses: data
      });
    }
  } catch (error) {
    console.error('Error general:', error);
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
  console.log(`☁️ Base de datos Supabase: ${supabaseUrl}`);
}); 