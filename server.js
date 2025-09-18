import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Endpoint principal de chat
app.post('/api/chat', async (req, res) => {
  try {
    const messages = req.body?.messages || [];

    // Configurar streaming NDJSON
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.setHeader('Cache-Control', 'no-cache');

    const response = await openai.responses.stream({
      model: 'gpt-4o-mini',
      input: messages.map(m => ({ role: m.role, content: m.content }))
    });

    response.on('message', (msg) => {
      if (msg.type === 'response.output_text.delta') {
        res.write(JSON.stringify({ delta: msg.delta }) + '\n');
      }
    });

    response.on('end', () => {
      res.write(JSON.stringify({ done: true }) + '\n');
      res.end();
    });

    response.on('error', (err) => {
      console.error('Error en streaming:', err);
      if (!res.headersSent) res.status(500);
      res.end();
    });

  } catch (err) {
    console.error('Error en /api/chat:', err);
    res.status(500).json({ error: 'Error interno en el servidor' });
  }
});

// Solo inicia el servidor si está en desarrollo (localhost)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`✅ Servidor local escuchando en http://localhost:${PORT}`)
  );
}

export default app;