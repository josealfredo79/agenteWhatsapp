# 🤖 Agente WhatsApp con Claude AI para Atención al Cliente

Sistema completo de atención al cliente vía WhatsApp usando Claude AI, con integración a Google Docs (base de conocimiento), Google Sheets (formularios) y Google Calendar (agendamiento de citas).

## 📋 Características

- ✅ **Agente IA con Claude**: Respuestas inteligentes basadas en base de conocimiento
- ✅ **WhatsApp vía Twilio**: Integración completa con Twilio Sandbox
- ✅ **Base de Conocimiento**: Google Docs como fuente de información
- ✅ **Registro de Clientes**: Guardado automático en Google Sheets
- ✅ **Agendamiento de Citas**: Creación de eventos en Google Calendar
- ✅ **Panel en Tiempo Real**: Interfaz web para visualizar conversaciones
- ✅ **Servidor MCP**: Herramientas para desarrollo ágil con Model Context Protocol
- ✅ **WebSocket**: Actualización en tiempo real de mensajes

## 🏗️ Arquitectura

```
┌─────────────┐        ┌──────────────┐        ┌─────────────┐
│   Cliente   │◄──────►│    Twilio    │◄──────►│  Servidor   │
│  WhatsApp   │        │   Webhook    │        │   Express   │
└─────────────┘        └──────────────┘        └──────┬──────┘
                                                       │
                       ┌───────────────────────────────┼──────────────────┐
                       │                               │                  │
                ┌──────▼──────┐              ┌────────▼────────┐  ┌─────▼─────┐
                │  Claude AI  │              │  Google APIs    │  │ WebSocket │
                │  (Anthropic)│              │ Docs/Sheets/Cal │  │   (UI)    │
                └─────────────┘              └─────────────────┘  └───────────┘
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ instalado
- Cuenta de Twilio (gratuita con sandbox)
- API Key de Anthropic (Claude)
- Cuenta de Google Cloud con APIs habilitadas

### 1. Instalación

```bash
# Clonar o descargar el proyecto
cd whatsapp-terrenos-mcp

# Instalar dependencias
npm install
```

### 2. Configuración de Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Twilio
TWILIO_ACCOUNT_SID=tu_account_sid_aqui
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=+1234567890

# Claude AI
ANTHROPIC_API_KEY=tu_api_key_de_anthropic_aqui

# Google APIs (ya configurado)
GOOGLE_DOCS_ID=1CWRkJNcsScJOK-NMxtxnUdpuxrYcqaru5qiu9rHzbbw
GOOGLE_SHEET_ID=1-YTVjIqYO-m1XS_t_MRUlE7O4u_8WXKiZTQLh8BrhSE
GOOGLE_CALENDAR_ID=primary

# Archivo de credenciales de Google (IMPORTANTE: crear este archivo)
GOOGLE_SERVICE_ACCOUNT_FILE=./google-credentials.json

# Servidor
PORT=3000
```

### 3. Configurar Google Service Account

**IMPORTANTE**: Para que funcionen Google Docs, Sheets y Calendar:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Google Docs API
   - Google Sheets API
   - Google Calendar API
4. Ve a "Credenciales" → "Crear credenciales" → "Cuenta de servicio"
5. Crea una cuenta de servicio y descarga el archivo JSON
6. Guarda el archivo como `google-credentials.json` en la raíz del proyecto
7. **Comparte** tus documentos de Google Docs, Sheets y Calendar con el email de la cuenta de servicio

**Ejemplo de email de cuenta de servicio:**
```
mi-servicio@proyecto-123456.iam.gserviceaccount.com
```

📚 **Guía detallada**: https://cloud.google.com/iam/docs/service-accounts-create

### 4. Configurar Twilio WhatsApp Sandbox

1. Ve a [Twilio Console - WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. Únete al sandbox enviando el mensaje desde tu WhatsApp
3. Configura el webhook en "Sandbox Configuration":
   - **When a message comes in**: `http://TU_URL/webhook/whatsapp`
   - Para desarrollo local, usa [ngrok](https://ngrok.com/):
     ```bash
     ngrok http 3000
     # Usa la URL https que te proporciona
     ```
   - Para producción (Railway), consulta la **[Guía de URL del Webhook](WEBHOOK-URL-GUIA.md)** 👈 **¡IMPORTANTE!**

> 💡 **¿No sabes dónde obtener la URL del webhook?** Lee la [Guía de URL del Webhook](WEBHOOK-URL-GUIA.md) que te explica paso a paso.

### 5. Ejecutar el Servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en:
- 🌐 **Interfaz Web**: http://localhost:3000
- 📡 **Webhook**: http://localhost:3000/webhook/whatsapp
- 🔌 **WebSocket**: ws://localhost:3000

### 6. Probar el Sistema

```bash
# Ejecutar suite de pruebas
node test-webhook.js
```

## 🛠️ Servidor MCP (Model Context Protocol)

El proyecto incluye un servidor MCP para desarrollo ágil:

```bash
# Ejecutar servidor MCP
node mcp-server.js
```

### Herramientas MCP Disponibles

1. **get_knowledge_base** - Obtiene la base de conocimiento completa
2. **search_knowledge_base** - Busca información específica
3. **save_to_sheet** - Guarda datos de clientes en Google Sheets
4. **create_calendar_event** - Crea citas en Google Calendar
5. **get_conversations** - Obtiene historial de conversaciones
6. **analyze_conversation** - Analiza sentimiento e intención
7. **get_sheet_data** - Lee datos de Google Sheets
8. **generate_response** - Genera respuestas con Claude AI

### Configurar MCP en Claude Desktop

Agrega esto a tu configuración de Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "whatsapp-terrenos": {
      "command": "node",
      "args": ["/ruta/completa/al/proyecto/mcp-server.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## 📁 Estructura del Proyecto

```
whatsapp-terrenos-mcp/
├── server.js              # Servidor Express principal
├── mcp-server.js          # Servidor MCP con herramientas
├── test-webhook.js        # Script de pruebas
├── package.json           # Dependencias y scripts
├── .env                   # Variables de entorno (crear desde .env.example)
├── .env.example           # Plantilla de variables
├── google-credentials.json # Credenciales de Google (crear manualmente)
├── mcp-config.json        # Configuración del servidor MCP
├── public/
│   ├── index.html        # Interfaz web
│   └── app.js            # Lógica del frontend
└── README.md             # Esta documentación
```

## 🔑 APIs y Configuración

### Twilio WhatsApp

- **Documentación**: https://www.twilio.com/docs/whatsapp/sandbox
- **Número sandbox**: +12173874424
- **Webhook**: Configurado para recibir mensajes

### Claude AI (Anthropic)

- **Documentación**: https://docs.anthropic.com/
- **Modelo**: claude-3-5-sonnet-20241022
- **Límites**: 1024 tokens por respuesta

### Google APIs

- **Docs API**: https://developers.google.com/docs/api
- **Sheets API**: https://developers.google.com/sheets/api
- **Calendar API**: https://developers.google.com/calendar/api

## 📡 Endpoints de la API

### POST `/webhook/whatsapp`
Webhook de Twilio para recibir mensajes de WhatsApp

**Body (x-www-form-urlencoded):**
```
From=whatsapp:+5215512345678
Body=Mensaje del cliente
MessageSid=SMXXXXXXXXX
```

### POST `/api/registro`
Guarda datos de cliente en Google Sheets

**Body (JSON):**
```json
{
  "nombre": "Juan Pérez",
  "telefono": "+5215512345678",
  "email": "juan@example.com",
  "interes": "Terreno Lote 5",
  "notas": "Cliente interesado en visita"
}
```

### POST `/api/agendar`
Crea evento en Google Calendar

**Body (JSON):**
```json
{
  "titulo": "Visita a Terreno",
  "descripcion": "Visita guiada",
  "ubicacion": "Calle Principal #123",
  "fechaInicio": "2025-11-15T10:00:00-06:00",
  "fechaFin": "2025-11-15T11:00:00-06:00",
  "asistentes": [{"email": "cliente@example.com"}]
}
```

### POST `/api/send-message`
Envía mensaje manual por WhatsApp

**Body (JSON):**
```json
{
  "to": "+5215512345678",
  "message": "Hola, gracias por tu interés"
}
```

### GET `/api/conversations`
Obtiene lista de conversaciones activas

## 🎨 Interfaz Web

La interfaz web incluye:

- 📊 **Dashboard** con estadísticas en tiempo real
- 💬 **Chat en vivo** con conversaciones activas
- 📱 **Lista de contactos** organizados
- ✉️ **Envío manual** de mensajes
- 🔔 **Notificaciones** en tiempo real vía WebSocket

## 🧪 Pruebas

### Probar Webhook localmente

```bash
# Ejecutar servidor
npm start

# En otra terminal, ejecutar pruebas
node test-webhook.js
```

### Probar desde WhatsApp

1. Únete al sandbox de Twilio enviando: `join <tu-codigo-sandbox>`
2. Envía un mensaje de prueba
3. Observa la respuesta del agente IA
4. Revisa la interfaz web en http://localhost:3000

## 🎯 Prompt del Agente

El agente está configurado con un prompt profesional que:

- ✅ Usa la base de conocimiento de Google Docs
- ✅ Mantiene contexto de conversación
- ✅ Solicita datos cuando detecta interés
- ✅ Ofrece agendar visitas
- ✅ Responde de forma clara y profesional
- ✅ Confirma antes de registrar datos

### Personalizar el Prompt

Edita `server.js` y modifica la constante `SYSTEM_PROMPT` para ajustar el comportamiento del agente.

## 🔒 Seguridad

- ✅ Variables de entorno para credenciales sensibles
- ✅ Validación de webhooks de Twilio
- ✅ CORS configurado
- ✅ Escape de HTML en frontend
- ⚠️ **No commitear** archivos `.env` o `google-credentials.json`

## 🐛 Troubleshooting

### Error: Google APIs no inicializadas

**Solución**: Asegúrate de:
1. Tener el archivo `google-credentials.json`
2. Haber compartido Docs, Sheets y Calendar con la cuenta de servicio
3. Tener las APIs habilitadas en Google Cloud Console

### Error: Twilio webhook no funciona

**Solución**:
1. Verifica que el servidor esté corriendo
2. Si es local, usa ngrok para exponer el puerto
3. Configura la URL completa en Twilio Console

### Error: Claude no responde

**Solución**:
1. Verifica que `ANTHROPIC_API_KEY` esté correcta
2. Revisa los límites de tu cuenta
3. Consulta la consola para mensajes de error

### Mensajes no aparecen en la interfaz

**Solución**:
1. Abre la consola del navegador (F12)
2. Verifica que WebSocket esté conectado
3. Recarga la página

## 📦 Dependencias Principales

```json
{
  "express": "^4.18.2",           // Servidor HTTP
  "@anthropic-ai/sdk": "^0.27.0", // Claude AI
  "twilio": "^4.19.0",            // WhatsApp/SMS
  "googleapis": "^128.0.0",       // Google APIs
  "socket.io": "^4.6.1",          // WebSocket
  "@modelcontextprotocol/sdk": "^0.5.0" // MCP
}
```

## 🚀 Despliegue en Producción

### Opción 1: Railway (Recomendado)

**Documentación completa:** [RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway init
railway up
```

**Importante:** Después de desplegar en Railway, necesitas obtener la URL pública para configurar el webhook de Twilio. Consulta la **[Guía de URL del Webhook](WEBHOOK-URL-GUIA.md)** para instrucciones detalladas sobre cómo obtener esta URL.

### Opción 2: Heroku

```bash
# Crear app
heroku create mi-agente-whatsapp

# Configurar variables
heroku config:set ANTHROPIC_API_KEY=tu-key
heroku config:set TWILIO_ACCOUNT_SID=tu-sid
# ... (todas las variables del .env)

# Deploy
git push heroku main
```

### Opción 3: VPS (Ubuntu)

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Clonar y configurar
git clone tu-repo
cd whatsapp-terrenos-mcp
npm install
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar con PM2
pm2 start server.js --name whatsapp-agent
pm2 startup
pm2 save
```

## 📝 Licencia

ISC

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para problemas o preguntas:
- Revisa la sección de Troubleshooting
- Consulta la documentación oficial de las APIs
- Abre un issue en el repositorio

## 🎓 Recursos Adicionales

- [Documentación de Twilio WhatsApp](https://www.twilio.com/docs/whatsapp)
- [Guía de Claude AI](https://docs.anthropic.com/claude/docs)
- [Google Workspace APIs](https://developers.google.com/workspace)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)

---

**Desarrollado con ❤️ usando Claude AI, Twilio y Google APIs**
