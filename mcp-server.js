#!/usr/bin/env node

/**
 * Servidor MCP (Model Context Protocol) para Agente WhatsApp
 * Proporciona herramientas para desarrollo ágil y gestión de conversaciones
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import { readFileSync, existsSync } from 'fs';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

// Configuración de Google APIs
let googleAuth;
let docs;
let sheets;
let calendar;

async function initializeGoogleAPIs() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_FILE || !existsSync(process.env.GOOGLE_SERVICE_ACCOUNT_FILE)) {
    console.error('⚠️  Google Service Account no configurado');
    return false;
  }

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

    console.error('✅ Google APIs inicializadas');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando Google APIs:', error.message);
    return false;
  }
}

// Almacenamiento en memoria de conversaciones
const conversationsDB = new Map();

// Crear servidor MCP
const server = new Server(
  {
    name: 'whatsapp-terrenos-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Definir herramientas disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_knowledge_base',
        description: 'Obtiene el contenido completo de la base de conocimiento desde Google Docs',
        inputSchema: {
          type: 'object',
          properties: {
            documentId: {
              type: 'string',
              description: 'ID del documento de Google Docs (opcional, usa el configurado por defecto)',
            },
          },
        },
      },
      {
        name: 'search_knowledge_base',
        description: 'Busca información específica en la base de conocimiento',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Término o pregunta a buscar en la base de conocimiento',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'save_to_sheet',
        description: 'Guarda datos de un cliente en Google Sheets (formulario de registro)',
        inputSchema: {
          type: 'object',
          properties: {
            nombre: {
              type: 'string',
              description: 'Nombre completo del cliente',
            },
            telefono: {
              type: 'string',
              description: 'Número de teléfono del cliente',
            },
            email: {
              type: 'string',
              description: 'Email del cliente',
            },
            interes: {
              type: 'string',
              description: 'Propiedad o terreno de interés',
            },
            notas: {
              type: 'string',
              description: 'Notas adicionales sobre el cliente',
            },
          },
          required: ['nombre', 'telefono'],
        },
      },
      {
        name: 'create_calendar_event',
        description: 'Crea una cita en Google Calendar para visita a propiedad',
        inputSchema: {
          type: 'object',
          properties: {
            titulo: {
              type: 'string',
              description: 'Título del evento (ej: "Visita a Terreno Lote 5")',
            },
            descripcion: {
              type: 'string',
              description: 'Descripción detallada del evento',
            },
            ubicacion: {
              type: 'string',
              description: 'Dirección o ubicación del terreno',
            },
            fechaInicio: {
              type: 'string',
              description: 'Fecha y hora de inicio en formato ISO 8601 (ej: 2025-11-15T10:00:00-06:00)',
            },
            fechaFin: {
              type: 'string',
              description: 'Fecha y hora de fin en formato ISO 8601',
            },
            emailCliente: {
              type: 'string',
              description: 'Email del cliente para enviar invitación',
            },
          },
          required: ['titulo', 'fechaInicio', 'fechaFin'],
        },
      },
      {
        name: 'get_conversations',
        description: 'Obtiene el historial de conversaciones con clientes',
        inputSchema: {
          type: 'object',
          properties: {
            phoneNumber: {
              type: 'string',
              description: 'Número de teléfono para filtrar (opcional)',
            },
            limit: {
              type: 'number',
              description: 'Número máximo de conversaciones a retornar',
              default: 10,
            },
          },
        },
      },
      {
        name: 'analyze_conversation',
        description: 'Analiza una conversación para extraer intención, sentimiento y datos clave del cliente',
        inputSchema: {
          type: 'object',
          properties: {
            phoneNumber: {
              type: 'string',
              description: 'Número de teléfono del cliente',
            },
          },
          required: ['phoneNumber'],
        },
      },
      {
        name: 'get_sheet_data',
        description: 'Lee datos registrados en Google Sheets',
        inputSchema: {
          type: 'object',
          properties: {
            range: {
              type: 'string',
              description: 'Rango a leer (ej: "A1:F10")',
              default: 'A1:F100',
            },
          },
        },
      },
      {
        name: 'generate_response',
        description: 'Genera una respuesta usando Claude AI con el contexto de la base de conocimiento',
        inputSchema: {
          type: 'object',
          properties: {
            userMessage: {
              type: 'string',
              description: 'Mensaje del usuario',
            },
            context: {
              type: 'string',
              description: 'Contexto adicional (opcional)',
            },
          },
          required: ['userMessage'],
        },
      },
    ],
  };
});

// Implementar handlers de herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_knowledge_base': {
        if (!docs) {
          throw new Error('Google Docs API no inicializada');
        }

        const docId = args.documentId || process.env.GOOGLE_DOCS_ID;
        const response = await docs.documents.get({ documentId: docId });

        const content = response.data.body.content
          .map(element => {
            if (element.paragraph) {
              return element.paragraph.elements
                .map(el => el.textRun?.content || '')
                .join('');
            }
            return '';
          })
          .join('');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                documentId: docId,
                characterCount: content.length,
                content: content,
              }, null, 2),
            },
          ],
        };
      }

      case 'search_knowledge_base': {
        if (!docs) {
          throw new Error('Google Docs API no inicializada');
        }

        const docId = process.env.GOOGLE_DOCS_ID;
        const response = await docs.documents.get({ documentId: docId });

        const content = response.data.body.content
          .map(element => {
            if (element.paragraph) {
              return element.paragraph.elements
                .map(el => el.textRun?.content || '')
                .join('');
            }
            return '';
          })
          .join('');

        // Búsqueda simple por coincidencia de texto
        const query = args.query.toLowerCase();
        const lines = content.split('\n');
        const matches = lines.filter(line => 
          line.toLowerCase().includes(query)
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                query: args.query,
                matchesFound: matches.length,
                matches: matches.slice(0, 10), // Limitar a 10 resultados
              }, null, 2),
            },
          ],
        };
      }

      case 'save_to_sheet': {
        if (!sheets) {
          throw new Error('Google Sheets API no inicializada');
        }

        const values = [[
          new Date().toISOString(),
          args.nombre || '',
          args.telefono || '',
          args.email || '',
          args.interes || '',
          args.notas || '',
        ]];

        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: 'A:F',
          valueInputOption: 'USER_ENTERED',
          resource: { values },
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Datos guardados en Google Sheets',
                data: args,
              }, null, 2),
            },
          ],
        };
      }

      case 'create_calendar_event': {
        if (!calendar) {
          throw new Error('Google Calendar API no inicializada');
        }

        const attendees = args.emailCliente 
          ? [{ email: args.emailCliente }] 
          : [];

        const event = {
          summary: args.titulo,
          description: args.descripcion || '',
          location: args.ubicacion || '',
          start: {
            dateTime: args.fechaInicio,
            timeZone: 'America/Mexico_City',
          },
          end: {
            dateTime: args.fechaFin,
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

        const result = await calendar.events.insert({
          calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
          resource: event,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                message: 'Evento creado en Google Calendar',
                eventId: result.data.id,
                htmlLink: result.data.htmlLink,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_conversations': {
        const phoneFilter = args.phoneNumber;
        const limit = args.limit || 10;

        let conversations = Array.from(conversationsDB.values());

        if (phoneFilter) {
          conversations = conversations.filter(c => c.phoneNumber === phoneFilter);
        }

        conversations = conversations.slice(0, limit);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                total: conversations.length,
                conversations: conversations,
              }, null, 2),
            },
          ],
        };
      }

      case 'analyze_conversation': {
        const conversation = conversationsDB.get(args.phoneNumber);

        if (!conversation) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  message: 'Conversación no encontrada',
                }, null, 2),
              },
            ],
          };
        }

        // Análisis simple de la conversación
        const analysis = {
          phoneNumber: args.phoneNumber,
          messageCount: conversation.messages.length,
          firstContact: conversation.messages[0]?.timestamp,
          lastContact: conversation.messages[conversation.messages.length - 1]?.timestamp,
          topics: extractTopics(conversation.messages),
          sentiment: 'neutral', // Placeholder para análisis de sentimiento
        };

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                analysis: analysis,
              }, null, 2),
            },
          ],
        };
      }

      case 'get_sheet_data': {
        if (!sheets) {
          throw new Error('Google Sheets API no inicializada');
        }

        const range = args.range || 'A1:F100';
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: range,
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                range: range,
                rowCount: response.data.values?.length || 0,
                data: response.data.values || [],
              }, null, 2),
            },
          ],
        };
      }

      case 'generate_response': {
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Cargar base de conocimiento si está disponible
        let knowledgeBase = '';
        if (docs) {
          try {
            const response = await docs.documents.get({
              documentId: process.env.GOOGLE_DOCS_ID,
            });
            knowledgeBase = response.data.body.content
              .map(element => {
                if (element.paragraph) {
                  return element.paragraph.elements
                    .map(el => el.textRun?.content || '')
                    .join('');
                }
                return '';
              })
              .join('');
          } catch (e) {
            console.error('Error cargando base de conocimiento:', e.message);
          }
        }

        const systemPrompt = `Eres un asistente virtual profesional especializado en atención al cliente para una empresa de terrenos e inmuebles.

CONOCIMIENTOS BASE:
${knowledgeBase || 'No disponible'}

${args.context ? `CONTEXTO ADICIONAL:\n${args.context}\n` : ''}

Responde de manera profesional, clara y amable.`;

        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            { role: 'user', content: args.userMessage },
          ],
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                response: response.content[0].text,
                model: response.model,
                usage: response.usage,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Herramienta desconocida: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            tool: name,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Recursos disponibles
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'whatsapp://conversations',
        name: 'Conversaciones activas',
        description: 'Lista de todas las conversaciones de WhatsApp',
        mimeType: 'application/json',
      },
      {
        uri: 'google://knowledge-base',
        name: 'Base de conocimiento',
        description: 'Contenido del documento de Google Docs con información de terrenos',
        mimeType: 'text/plain',
      },
      {
        uri: 'google://sheet-data',
        name: 'Datos de clientes',
        description: 'Registros de clientes en Google Sheets',
        mimeType: 'application/json',
      },
    ],
  };
});

// Leer recursos
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'whatsapp://conversations') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            total: conversationsDB.size,
            conversations: Array.from(conversationsDB.values()),
          }, null, 2),
        },
      ],
    };
  }

  if (uri === 'google://knowledge-base') {
    if (!docs) {
      throw new Error('Google Docs API no inicializada');
    }

    const response = await docs.documents.get({
      documentId: process.env.GOOGLE_DOCS_ID,
    });

    const content = response.data.body.content
      .map(element => {
        if (element.paragraph) {
          return element.paragraph.elements
            .map(el => el.textRun?.content || '')
            .join('');
        }
        return '';
      })
      .join('');

    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: content,
        },
      ],
    };
  }

  if (uri === 'google://sheet-data') {
    if (!sheets) {
      throw new Error('Google Sheets API no inicializada');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:F',
    });

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            rows: response.data.values || [],
            rowCount: response.data.values?.length || 0,
          }, null, 2),
        },
      ],
    };
  }

  throw new Error(`Recurso no encontrado: ${uri}`);
});

// Función auxiliar para extraer temas de conversación
function extractTopics(messages) {
  const keywords = ['terreno', 'propiedad', 'precio', 'ubicación', 'visita', 'compra'];
  const topics = new Set();

  messages.forEach(msg => {
    const text = msg.body.toLowerCase();
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        topics.add(keyword);
      }
    });
  });

  return Array.from(topics);
}

// Iniciar servidor
async function main() {
  await initializeGoogleAPIs();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('🚀 Servidor MCP iniciado');
  console.error('📋 Herramientas disponibles:');
  console.error('   - get_knowledge_base: Obtener base de conocimiento');
  console.error('   - search_knowledge_base: Buscar en base de conocimiento');
  console.error('   - save_to_sheet: Guardar datos en Google Sheets');
  console.error('   - create_calendar_event: Crear evento en Calendar');
  console.error('   - get_conversations: Obtener conversaciones');
  console.error('   - analyze_conversation: Analizar conversación');
  console.error('   - get_sheet_data: Leer datos de Sheets');
  console.error('   - generate_response: Generar respuesta con Claude');
}

main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
