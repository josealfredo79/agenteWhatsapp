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

// Validar variables opcionales de Google (advertencias, no bloquean)
const googleVars = ['GOOGLE_DOCS_ID', 'GOOGLE_SHEET_ID', 'GOOGLE_CALENDAR_ID'];
const missingGoogleVars = googleVars.filter(varName => !process.env[varName]);
if (missingGoogleVars.length > 0) {
  console.warn('⚠️  Variables de Google no configuradas (funcionalidad limitada):');
  missingGoogleVars.forEach(varName => console.warn(`   - ${varName}`));
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
  let credentials;
  
  // Soporte para Railway (GOOGLE_CREDENTIALS como JSON string) y local (archivo)
  if (process.env.GOOGLE_CREDENTIALS) {
    console.log('🔧 Usando GOOGLE_CREDENTIALS de variable de entorno...');
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_FILE) {
    console.log('🔧 Usando archivo de credenciales local...');
    credentials = JSON.parse(readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_FILE));
  } else {
    throw new Error('No se encontraron credenciales de Google');
  }
  
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
  console.log('   Service Account:', credentials.client_email);
} catch (error) {
  console.warn('⚠️  Google credentials no encontradas. Algunas funciones estarán deshabilitadas.');
  console.warn('   Error:', error.message);
  console.warn('   Configura GOOGLE_CREDENTIALS o GOOGLE_SERVICE_ACCOUNT_FILE');
}

// Almacenamiento en memoria para conversaciones
const conversations = new Map();

// Base de conocimiento desde Google Docs
let knowledgeBase = '';

// Definición de tools para Claude (Function Calling)
const CALENDAR_TOOLS = [
  {
    name: "agendar_cita",
    description: "Agenda una cita o visita en Google Calendar. Usa esta función cuando el cliente confirme que desea agendar una visita a una propiedad. Debes tener todos los datos requeridos antes de usar esta función.",
    input_schema: {
      type: "object",
      properties: {
        nombre_cliente: {
          type: "string",
          description: "Nombre completo del cliente"
        },
        telefono: {
          type: "string",
          description: "Número de teléfono del cliente (incluir código de país si está disponible)"
        },
        fecha: {
          type: "string",
          description: "Fecha de la cita en formato YYYY-MM-DD (año-mes-día)"
        },
        hora: {
          type: "string",
          description: "Hora de la cita en formato HH:MM de 24 horas (ejemplo: 14:30 para 2:30 PM)"
        },
        propiedad: {
          type: "string",
          description: "Nombre o descripción de la propiedad a visitar"
        },
        ubicacion: {
          type: "string",
          description: "Dirección completa o ubicación de la propiedad"
        },
        notas: {
          type: "string",
          description: "Notas adicionales o comentarios sobre la cita"
        }
      },
      required: ["nombre_cliente", "fecha", "hora", "propiedad"]
    }
  }
];

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

2. **Gestión de Formularios**: Cuando un cliente muestre interés, solicita sus datos de contacto (nombre completo, teléfono, email, propiedad de interés).

3. **Agendamiento de Citas AUTOMÁTICO**: Tienes la capacidad de AGENDAR AUTOMÁTICAMENTE visitas a propiedades usando la función "agendar_cita". 

FLUJO DE AGENDAMIENTO DE CITAS:
PASO 1: Cuando un cliente exprese interés en visitar una propiedad, solicita los siguientes datos:
   - Nombre completo del cliente
   - Número de teléfono (si no lo tienes del contexto)
   - Fecha preferida (acepta formatos como "mañana", "próximo lunes", "15 de noviembre")
   - Hora preferida (acepta formatos como "3 PM", "15:00", "a las tres")
   - Propiedad específica de interés

PASO 2: Convierte las fechas naturales a formato YYYY-MM-DD:
   - "mañana" → calcula la fecha de mañana
   - "lunes próximo" → calcula el próximo lunes
   - "15 de noviembre" → 2025-11-15

PASO 3: Convierte horas a formato 24h (HH:MM):
   - "3 PM" → "15:00"
   - "10 de la mañana" → "10:00"
   - "medio día" → "12:00"

PASO 4: Una vez tengas TODOS los datos, confirma con el cliente:
   "¿Confirmas que deseas agendar la visita a [propiedad] para el [día] [fecha] a las [hora]?"

PASO 5: Si el cliente confirma (dice "sí", "confirmo", "correcto", etc.), USA LA FUNCIÓN "agendar_cita" INMEDIATAMENTE con los datos en el formato correcto:
   - fecha: "YYYY-MM-DD"
   - hora: "HH:MM"

PASO 6: Después de que la función se ejecute, informa al cliente sobre el resultado y proporciona detalles de la cita.
   - Si la cita fue exitosa (success: true), incluye:
     * Confirmación de fecha y hora
     * Detalles de la propiedad
     * Link del evento de Google Calendar (si está disponible en el resultado)
     * Mensaje sobre recordatorios automáticos
   - Si hubo algún error, informa amablemente y ofrece alternativas

INSTRUCCIONES CRÍTICAS:
- NO digas "voy a contactar a alguien" o "te enviaré información"
- USA LA FUNCIÓN directamente cuando tengas confirmación del cliente
- NO inventes fechas u horas, siempre pregunta al cliente
- Sé proactivo en solicitar los datos faltantes uno por uno
- Confirma SIEMPRE antes de usar la función
- Si falta algún dato requerido, solicítalo antes de confirmar
- Mantén un tono profesional pero cercano y amigable

FORMATO DE RESPUESTA:
- Usa párrafos cortos y claros
- Enumera opciones cuando sea apropiado
- Solicita confirmación para acciones importantes
- Usa emojis ocasionalmente para hacer la conversación más amigable (📅 ✅ 🏡 📍)

IMPORTANTE:
- Siempre mantén la privacidad y confidencialidad de los datos del cliente
- No inventes información que no esté en la base de conocimiento
- La función "agendar_cita" creará automáticamente el evento en el calendario Y enviará recordatorios al cliente

EJEMPLO DE CONVERSACIÓN:
Cliente: "Me gustaría ver el terreno en Zapopan"
Tú: "¡Excelente elección! 🏡 Me encantaría agendarte una visita. ¿Cuál es tu nombre completo?"
Cliente: "José Alfredo Rodríguez"
Tú: "Perfecto, José. ¿Qué día te gustaría visitarlo?"
Cliente: "El viernes"
Tú: "Entendido, el viernes 15 de noviembre. ¿A qué hora prefieres?"
Cliente: "Como a las 3 de la tarde"
Tú: "Perfecto. ¿Me confirmas tu número de teléfono para enviarte los recordatorios?"
Cliente: "+52 333 123 4567"
Tú: "Excelente. ¿Confirmas que deseas agendar la visita al terreno en Zapopan para el viernes 15 de noviembre a las 3:00 PM?"
Cliente: "Sí, confirmo"
Tú: [USA agendar_cita AQUÍ CON: fecha="2025-11-15", hora="15:00"] 
     → Espera respuesta de la función →
     → Si el resultado incluye "link": →
     "¡Listo! ✅ Tu cita está confirmada para el viernes 15 de noviembre a las 3:00 PM. 
     
📅 Puedes ver los detalles y agregarlo a tu calendario aquí:
[LINK DEL EVENTO]

Te enviaremos recordatorios automáticos 24 horas antes y 30 minutos antes de la visita. Nos vemos en [ubicación del terreno]. ¿Hay algo más en lo que pueda ayudarte?"

INSTRUCCIÓN ESPECIAL PARA LINKS:
Cuando la función "agendar_cita" devuelva un resultado con "link", SIEMPRE incluye ese link en tu respuesta al cliente.
Formato: Incluye el link completo en una línea separada para que sea clickeable en WhatsApp.`;

// Función para interactuar con Claude (con soporte para Tool Use)
async function getChatResponse(userMessage, conversationHistory = [], phoneNumber = '') {
  try {
    const messages = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages,
      tools: CALENDAR_TOOLS
    });
    
    // Verificar si Claude quiere usar una tool
    if (response.stop_reason === 'tool_use') {
      const toolUse = response.content.find(block => block.type === 'tool_use');
      
      if (toolUse && toolUse.name === 'agendar_cita') {
        console.log('🔧 Claude solicita agendar cita:', toolUse.input);
        
        // Ejecutar la función de agendar
        const resultado = await agendarCitaAutomatica(toolUse.input, phoneNumber);
        
        // Continuar la conversación con el resultado
        const followUpMessages = [
          ...messages,
          { role: 'assistant', content: response.content },
          {
            role: 'user',
            content: [{
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify(resultado)
            }]
          }
        ];
        
        // Obtener respuesta final de Claude con el resultado
        const finalResponse = await anthropic.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: followUpMessages,
          tools: CALENDAR_TOOLS
        });
        
        const finalTextContent = finalResponse.content.find(block => block.type === 'text');
        return finalTextContent ? finalTextContent.text : 'Cita procesada correctamente.';
      }
    }
    
    // Si no usa tools, devolver respuesta normal
    const textContent = response.content.find(block => block.type === 'text');
    return textContent ? textContent.text : response.content[0].text;
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
    console.log('📅 Creando evento en Google Calendar...');
    console.log('   Calendar ID:', process.env.GOOGLE_CALENDAR_ID || 'NO CONFIGURADO');
    console.log('   Título:', eventData.titulo);
    console.log('   Fecha inicio:', eventData.fechaInicio);
    console.log('   Fecha fin:', eventData.fechaFin);
    
    // Asegurar que el dueño del calendario esté como asistente para que vea el evento
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    const attendees = eventData.asistentes || [];
    
    // Si el calendar ID es un email, agregarlo como asistente principal
    if (calendarId.includes('@') && calendarId !== 'primary') {
      // Verificar que no esté ya en la lista
      const ownerExists = attendees.some(a => a.email === calendarId);
      if (!ownerExists) {
        attendees.unshift({ 
          email: calendarId,
          organizer: true,
          self: true,
          responseStatus: 'accepted'
        });
      }
    }
    
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
      attendees: attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };
    
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    console.log('🔧 Usando Calendar ID:', calendarId);
    
    const response = await calendar.events.insert({
      calendarId: calendarId,
      resource: event,
    });
    
    console.log('✅ Evento creado en Google Calendar');
    console.log('   Event ID:', response.data.id);
    console.log('   Link:', response.data.htmlLink);
    console.log('   Status:', response.data.status);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear evento en Calendar:', error.message);
    console.error('   Código de error:', error.code);
    if (error.response && error.response.data) {
      console.error('   Detalles:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Función para agendar cita automáticamente desde Claude
async function agendarCitaAutomatica(params, phoneNumber) {
  try {
    const { nombre_cliente, telefono, fecha, hora, propiedad, ubicacion, notas } = params;
    
    console.log(`📅 Agendando cita automática para ${nombre_cliente}...`);
    console.log(`📋 Datos recibidos:`, { nombre_cliente, telefono, fecha, hora, propiedad, ubicacion });
    
    // Construir fechas ISO para Calendar
    const fechaInicio = new Date(`${fecha}T${hora}:00-06:00`); // Mexico City timezone
    const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000); // +1 hora de duración
    
    // Validar que la fecha sea válida
    if (isNaN(fechaInicio.getTime())) {
      console.error(`❌ Fecha u hora inválida: ${fecha} ${hora}`);
      return {
        success: false,
        mensaje: `Fecha u hora inválida. Por favor verifica: ${fecha} ${hora}`
      };
    }
    
    console.log(`✅ Fechas calculadas: Inicio=${fechaInicio.toISOString()}, Fin=${fechaFin.toISOString()}`);
    
    // Guardar en Google Sheets primero (más confiable)
    const telefonoFinal = telefono || phoneNumber.replace('whatsapp:', '');
    let sheetsSaved = false;
    
    try {
      await saveToGoogleSheet({
        nombre: nombre_cliente,
        telefono: telefonoFinal,
        email: '',
        interes: propiedad,
        notas: `Cita agendada: ${fecha} ${hora}. ${notas || ''}`
      });
      sheetsSaved = true;
      console.log('✅ Datos guardados en Google Sheets');
    } catch (error) {
      console.error('⚠️  Error al guardar en Sheets (continuando):', error.message);
    }
    
    // Intentar crear evento en Google Calendar
    let evento = null;
    try {
      evento = await createCalendarEvent({
        titulo: `Visita: ${propiedad}`,
        descripcion: `Cliente: ${nombre_cliente}\nTeléfono: ${telefono || phoneNumber}\n\nNotas: ${notas || 'Sin notas adicionales'}`,
        ubicacion: ubicacion || propiedad,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        asistentes: []
      });
    } catch (error) {
      console.error('⚠️  Error al crear evento en Calendar (continuando):', error.message);
    }
    
    // Respuesta exitosa si al menos Sheets funcionó
    if (sheetsSaved || evento) {
      const mensaje = evento 
        ? `Cita confirmada para ${fecha} a las ${hora}. ✅ Evento creado en Google Calendar.${evento.htmlLink ? '\n\n📅 Link del evento: ' + evento.htmlLink : ''}`
        : `Cita registrada para ${fecha} a las ${hora}. (Evento de calendario pendiente)`;
      
      console.log('✅ Cita agendada:', mensaje);
      return {
        success: true,
        mensaje,
        link: evento?.htmlLink || null,
        evento: {
          fecha,
          hora,
          propiedad,
          ubicacion: ubicacion || propiedad,
          calendar_link: evento?.htmlLink || null
        }
      };
    } else {
      return {
        success: false,
        mensaje: 'No se pudo guardar la cita. Verifica la configuración de Google.'
      };
    }
  } catch (error) {
    console.error('❌ Error crítico al agendar cita automática:', error);
    console.error('Stack:', error.stack);
    return {
      success: false,
      mensaje: `Error al procesar la cita: ${error.message}`
    };
  }
}

// Función para simular escritura y enviar mensaje con delay
async function sendTypingAndMessage(to, from, message) {
  try {
    // Dividir mensaje en párrafos si es muy largo
    const paragraphs = message.split('\n\n').filter(p => p.trim().length > 0);
    
    // Si el mensaje tiene múltiples párrafos, enviarlos con pausas entre ellos
    if (paragraphs.length > 1 && message.length > 200) {
      console.log(`📝 Enviando mensaje en ${paragraphs.length} partes con pausas...`);
      
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i].trim();
        
        // Calcular tiempo de espera basado en la longitud del párrafo
        const typingTime = Math.min(Math.max(paragraph.length / 20 * 1000, 1500), 4000); // Entre 1.5 y 4 segundos
        
        console.log(`⌛ Simulando escritura de párrafo ${i+1}/${paragraphs.length} (${(typingTime/1000).toFixed(1)}s)...`);
        
        // Esperar para simular que está escribiendo
        await new Promise(resolve => setTimeout(resolve, typingTime));
        
        // Enviar párrafo
        await twilioClient.messages.create({
          from: from,
          to: to,
          body: paragraph
        });
        
        console.log(`✅ Párrafo ${i+1}/${paragraphs.length} enviado`);
        
        // Pequeña pausa adicional entre párrafos (excepto después del último)
        if (i < paragraphs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
    } else {
      // Mensaje corto o sin múltiples párrafos, enviar directo con una pausa
      const typingTime = Math.min(Math.max(message.length / 15 * 1000, 2000), 5000); // Entre 2 y 5 segundos
      
      console.log(`⌛ Simulando escritura por ${(typingTime/1000).toFixed(1)} segundos...`);
      
      await new Promise(resolve => setTimeout(resolve, typingTime));
      
      await twilioClient.messages.create({
        from: from,
        to: to,
        body: message
      });
      
      console.log(`✅ Mensaje enviado después de simular escritura`);
    }
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
    throw error;
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
    // Obtener respuesta de Claude (pasando phoneNumber para citas)
    const aiResponse = await getChatResponse(Body, history, phoneNumber);
    
    // Actualizar historial
    history.push(
      { role: 'user', content: Body },
      { role: 'assistant', content: aiResponse }
    );
    conversations.set(phoneNumber, history);
    
    // Enviar respuesta por WhatsApp con simulación de escritura
    await sendTypingAndMessage(
      From, 
      `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      aiResponse
    );
    
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
