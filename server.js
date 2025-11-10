import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import twilio from 'twilio';
import Anthropic from '@anthropic-ai/sdk';
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno (solo si existe .env)
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Log de debug para Railway
console.log('🔍 Verificando variables de entorno...');
console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '✅ Configurado' : '❌ NO configurado');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '✅ Configurado' : '❌ NO configurado');
console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Configurado' : '❌ NO configurado');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Validar variables requeridas
const requiredEnvVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_NUMBER',
  'ANTHROPIC_API_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ ERROR: Faltan las siguientes variables de entorno:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\n💡 Configúralas en Railway Dashboard > Variables');
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(join(__dirname, 'public')));

// Configuración de Twilio
console.log('🔧 Inicializando cliente de Twilio...');
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
console.log('✅ Cliente de Twilio inicializado');

// Configuración de Claude AI
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configuración de Google APIs
let googleAuth;
let docs;
let sheets;
let calendar;

try {
  const credentials = JSON.parse(readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_FILE));
  googleAuth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/documents.readonly',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/calendar'
    ]
  });
  
  docs = google.docs({ version: 'v1', auth: googleAuth });
  sheets = google.sheets({ version: 'v4', auth: googleAuth });
  calendar = google.calendar({ version: 'v3', auth: googleAuth });
  
  console.log('✅ Google APIs configuradas correctamente');
} catch (error) {
  console.warn('⚠️  Google credentials no encontradas. Algunas funciones estarán deshabilitadas.');
  console.warn('   Por favor, configura GOOGLE_SERVICE_ACCOUNT_FILE en .env');
}

// Almacenamiento en memoria para conversaciones
const conversations = new Map();

// Base de conocimiento desde Google Docs
let knowledgeBase = '';

// Cargar base de conocimiento
async function loadKnowledgeBase() {
  if (!docs) {
    console.warn('⚠️  No se puede cargar la base de conocimiento (Google Docs no configurado)');
    return;
  }
  
  try {
    const response = await docs.documents.get({
      documentId: process.env.GOOGLE_DOCS_ID
    });
    
    // Extraer texto del documento
    const content = response.data.body.content;
    knowledgeBase = content
      .map(element => {
        if (element.paragraph) {
          return element.paragraph.elements
            .map(el => el.textRun?.content || '')
            .join('');
        }
        return '';
      })
      .join('');
    
    console.log('✅ Base de conocimiento cargada desde Google Docs');
    console.log(`   Caracteres: ${knowledgeBase.length}`);
  } catch (error) {
    console.error('❌ Error al cargar base de conocimiento:', error.message);
  }
}

// Sistema de prompt profesional para Claude
const SYSTEM_PROMPT = `Eres un asistente virtual profesional especializado en atención al cliente para una empresa de terrenos e inmuebles. Tu nombre es AsistenteTerrenos.

CONOCIMIENTOS BASE:
${knowledgeBase || 'Cargando base de conocimiento...'}

CAPACIDADES Y FUNCIONES:
1. **Información sobre Terrenos**: Responde consultas sobre propiedades, ubicaciones, precios, características y disponibilidad usando la base de conocimiento proporcionada.

2. **Gestión de Formularios**: Cuando un cliente muestre interés, solicita sus datos de contacto (nombre completo, teléfono, email, propiedad de interés) y confirma que desea que se registren en el sistema.

3. **Agendamiento de Citas**: Ofrece agendar visitas a las propiedades. Solicita fecha y hora preferida, y confirma disponibilidad antes de registrar.

INSTRUCCIONES DE COMPORTAMIENTO:
- Saluda de manera cordial y profesional
- Sé claro, conciso y amable en todas tus respuestas
- Si no tienes información específica, sé honesto y ofrece alternativas
- Mantén un tono profesional pero cercano
- Confirma siempre antes de registrar datos o agendar citas
- Si detectas que el cliente desea registrarse, solicita TODOS los datos necesarios antes de confirmar
- Para agendar citas, verifica disponibilidad y proporciona opciones si la fecha solicitada no está disponible

FORMATO DE RESPUESTA:
- Usa párrafos cortos y claros
- Enumera opciones cuando sea apropiado
- Solicita confirmación para acciones importantes
- Proporciona información de contacto adicional si es relevante

IMPORTANTE:
- Siempre mantén la privacidad y confidencialidad de los datos del cliente
- No inventes información que no esté en la base de conocimiento
- Si necesitas registrar datos o agendar, indícalo claramente en tu respuesta`;

// Función para interactuar con Claude
async function getChatResponse(userMessage, conversationHistory = []) {
  try {
    const messages = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];
    
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages
    });
    
    return response.content[0].text;
  } catch (error) {
    console.error('Error al comunicarse con Claude:', error);
    return 'Disculpa, estoy experimentando dificultades técnicas. Por favor, intenta de nuevo en unos momentos.';
  }
}

// Función para guardar datos en Google Sheets
async function saveToGoogleSheet(data) {
  if (!sheets) {
    console.warn('⚠️  Google Sheets no configurado');
    return false;
  }
  
  try {
    const values = [[
      new Date().toISOString(),
      data.nombre || '',
      data.telefono || '',
      data.email || '',
      data.interes || '',
      data.notas || ''
    ]];
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:F',
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });
    
    console.log('✅ Datos guardados en Google Sheets');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar en Google Sheets:', error.message);
    return false;
  }
}

// Función para crear evento en Google Calendar
async function createCalendarEvent(eventData) {
  if (!calendar) {
    console.warn('⚠️  Google Calendar no configurado');
    return null;
  }
  
  try {
    const event = {
      summary: eventData.titulo || 'Visita a Propiedad',
      description: eventData.descripcion || '',
      location: eventData.ubicacion || '',
      start: {
        dateTime: eventData.fechaInicio,
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: eventData.fechaFin,
        timeZone: 'America/Mexico_City',
      },
      attendees: eventData.asistentes || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };
    
    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
    });
    
    console.log('✅ Evento creado en Google Calendar:', response.data.htmlLink);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear evento en Calendar:', error.message);
    return null;
  }
}

// Webhook de Twilio para recibir mensajes de WhatsApp
app.post('/webhook/whatsapp', async (req, res) => {
  const { From, Body, MessageSid } = req.body;
  const phoneNumber = From.replace('whatsapp:', '');
  
  console.log(`📱 Mensaje recibido de ${phoneNumber}: ${Body}`);
  
  // Obtener historial de conversación
  let history = conversations.get(phoneNumber) || [];
  
  // Emitir mensaje al frontend
  io.emit('new-message', {
    id: MessageSid,
    from: phoneNumber,
    body: Body,
    timestamp: new Date().toISOString(),
    direction: 'inbound'
  });
  
  try {
    // Obtener respuesta de Claude
    const aiResponse = await getChatResponse(Body, history);
    
    // Actualizar historial
    history.push(
      { role: 'user', content: Body },
      { role: 'assistant', content: aiResponse }
    );
    conversations.set(phoneNumber, history);
    
    // Enviar respuesta por WhatsApp
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: From,
      body: aiResponse
    });
    
    // Emitir respuesta al frontend
    io.emit('new-message', {
      id: Date.now().toString(),
      from: 'bot',
      to: phoneNumber,
      body: aiResponse,
      timestamp: new Date().toISOString(),
      direction: 'outbound'
    });
    
    // Respuesta TwiML (requerida por Twilio)
    res.type('text/xml');
    res.send('<Response></Response>');
    
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    res.status(500).send('Error');
  }
});

// Endpoint para registrar datos del formulario
app.post('/api/registro', async (req, res) => {
  const { nombre, telefono, email, interes, notas } = req.body;
  
  const success = await saveToGoogleSheet({
    nombre,
    telefono,
    email,
    interes,
    notas
  });
  
  res.json({ success, message: success ? 'Registro guardado exitosamente' : 'Error al guardar' });
});

// Endpoint para agendar citas
app.post('/api/agendar', async (req, res) => {
  const { titulo, descripcion, ubicacion, fechaInicio, fechaFin, asistentes } = req.body;
  
  const event = await createCalendarEvent({
    titulo,
    descripcion,
    ubicacion,
    fechaInicio,
    fechaFin,
    asistentes
  });
  
  res.json({ 
    success: !!event, 
    event,
    message: event ? 'Cita agendada exitosamente' : 'Error al agendar' 
  });
});

// Endpoint para enviar mensaje manual
app.post('/api/send-message', async (req, res) => {
  const { to, message } = req.body;
  
  try {
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
      body: message
    });
    
    io.emit('new-message', {
      id: Date.now().toString(),
      from: 'manual',
      to: to,
      body: message,
      timestamp: new Date().toISOString(),
      direction: 'outbound'
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para obtener conversaciones
app.get('/api/conversations', (req, res) => {
  const conversationList = Array.from(conversations.entries()).map(([phone, history]) => ({
    phone,
    lastMessage: history[history.length - 1]?.content || '',
    messageCount: history.length
  }));
  
  res.json(conversationList);
});

// WebSocket para actualizaciones en tiempo real
io.on('connection', (socket) => {
  console.log('👤 Cliente conectado al WebSocket');
  
  socket.on('disconnect', () => {
    console.log('👤 Cliente desconectado');
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, async () => {
  console.log('\n🚀 Servidor iniciado correctamente\n');
  console.log(`📡 Servidor HTTP: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook/whatsapp`);
  console.log('\n📝 Configuración:');
  console.log(`   Twilio: ${process.env.TWILIO_WHATSAPP_NUMBER}`);
  console.log(`   Claude: Configurado`);
  console.log(`   Google Docs: ${process.env.GOOGLE_DOCS_ID}`);
  console.log(`   Google Sheets: ${process.env.GOOGLE_SHEET_ID}`);
  console.log('\n⏳ Cargando base de conocimiento...\n');
  
  await loadKnowledgeBase();
  
  console.log('\n✅ Sistema listo para recibir mensajes\n');
});
