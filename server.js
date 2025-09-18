import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import OpenAI from 'openai'

const app = express()
app.use(cors())
app.use(express.json())

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

app.post('/api/chat', async (req, res) => {
  const messages = req.body?.messages || []
  res.setHeader('Content-Type', 'application/json')

  try {
    const completion = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: messages.map(m => ({ role: m.role, content: m.content })),
    })

    const text = completion.output_text
    res.json({ reply: text })
  } catch (err) {
    console.error('Error en el servidor:', err)
    res.status(500).json({ error: 'No se pudo contactar con OpenAI' })
  }
})

app.listen(3000, () => console.log('✅ Servidor listo en http://localhost:3000'))
