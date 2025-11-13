# 🔍 Verificar Logs de Railway

## Pasos para verificar que el calendario está configurado correctamente:

### 1. Ir a Railway Logs
1. Abre Railway Dashboard: https://railway.app/dashboard
2. Click en tu proyecto `content-balance` → `production` → servicio `web`
3. Click en la pestaña **"Deployments"**
4. Click en el deployment más reciente (el de hace 3 minutos)
5. Verás los logs del deployment

### 2. Buscar estas líneas en los logs:

**Al inicio del deployment, deberías ver:**
```
🔍 Verificando variables de entorno...
TWILIO_ACCOUNT_SID: ✅ Configurado
TWILIO_AUTH_TOKEN: ✅ Configurado
ANTHROPIC_API_KEY: ✅ Configurado
```

**Y más abajo:**
```
✅ Google APIs configuradas correctamente
   Service Account: whatsapp-agent@gen-lang-client-0726897121.iam.gserviceaccount.com
```

**Y después:**
```
🚀 Servidor iniciado correctamente

📡 Servidor HTTP: http://0.0.0.0:3000
🔌 WebSocket: ws://0.0.0.0:3000
📱 Webhook URL: https://tu-app.railway.app/webhook/whatsapp

📝 Configuración:
   Twilio: +14155238886
   Claude: Configurado
   Google Docs: 1CWRkJNcsScJOK-NMxtxnUdpuxrYcqaru5qiu9rHzbbw
   Google Sheets: 1-YTVjIqYO-m1XS_t_MRUlE7O4u_8WXKiZTQLh8BrhSE
```

### 3. Si ves esas líneas → ✅ Todo está bien

Ahora cuando alguien agende una cita por WhatsApp, verás en los logs:

```
📅 Agendando cita automática para [Nombre Cliente]...
✅ Fechas calculadas: Inicio=2025-11-XX...
✅ Datos guardados en Google Sheets
📅 Creando evento en Google Calendar...
🔧 Calendar ID configurado: tecnologicotlaxiaco@gmail.com
📧 Sin email del cliente, solo se creará el evento sin asistentes
✅ Evento creado en Google Calendar
   Event ID: xxxxxx
   Link: https://www.google.com/calendar/event?eid=...
✅ Cita agendada: Cita confirmada para 2025-11-XX a las XX:XX
📧 Notificaciones enviadas a: tecnologicotlaxiaco@gmail.com
```

**Lo importante es ver:**
- `🔧 Calendar ID configurado: tecnologicotlaxiaco@gmail.com` ← ESTO confirma que está usando tu calendario
- `✅ Evento creado en Google Calendar` ← Evento creado exitosamente

---

## ¿Qué hago después de verificar los logs?

Si los logs muestran que todo está bien, **ve directamente a probar por WhatsApp**.
