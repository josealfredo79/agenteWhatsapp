# 🔧 SOLUCIÓN: Calendario de Google no funciona en Railway

## 🎯 Problema Identificado

Los eventos de Google Calendar **no se están creando correctamente** en producción (Railway) porque:

1. ❌ El código tenía **hardcoded** el email `tecnologicotlaxiaco@gmail.com` en lugar de usar la variable de entorno
2. ❌ La variable `GOOGLE_CALENDAR_ID` estaba configurada como `primary` pero debería ser el email compartido
3. ❌ No había validación estricta de emails antes de agregarlos como asistentes
4. ✅ En local funcionaba porque probablemente usabas un `.env` con el calendario correcto

---

## ✅ Correcciones Aplicadas (v1.0.2)

### 1. **Código actualizado para usar variable de entorno**
```javascript
// ANTES (hardcoded):
const calendarId = 'tecnologicotlaxiaco@gmail.com';

// AHORA (desde variable de entorno):
const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
```

### 2. **Validación estricta de emails**
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (email && emailRegex.test(email)) {
  asistentes.push({ email, responseStatus: 'needsAction' });
} else {
  console.warn('Email inválido omitido:', email);
}
```

### 3. **Logs mejorados para debugging**
- Muestra el Calendar ID que se está usando
- Indica qué emails son válidos/inválidos
- Confirma a quiénes se enviaron notificaciones

---

## 🚀 PASOS PARA APLICAR EN RAILWAY

### Paso 1: Actualizar Variable de Entorno

1. Ve a **Railway Dashboard** → Tu proyecto
2. Click en **Variables** → **RAW Editor**
3. Busca la línea `GOOGLE_CALENDAR_ID` y **REEMPLÁZALA** por:

```env
GOOGLE_CALENDAR_ID=tecnologicotlaxiaco@gmail.com
```

**Archivo completo de variables** (usa tus valores reales):

```env
TWILIO_ACCOUNT_SID=tu_account_sid_aqui
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=+14155238886
ANTHROPIC_API_KEY=tu_api_key_aqui
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
GOOGLE_DOCS_ID=tu_docs_id_aqui
GOOGLE_SHEET_ID=tu_sheet_id_aqui
GOOGLE_CALENDAR_ID=tecnologicotlaxiaco@gmail.com
NODE_ENV=production
```

> ⚠️ **IMPORTANTE:** Copia las credenciales reales desde tu archivo `.env` local o desde las variables que ya tienes en Railway.

4. Click en **Update Variables**

### Paso 2: Hacer Push del Código Actualizado

```bash
# En tu terminal local
git add server.js
git commit -m "fix: corregir calendario usando variable de entorno y validación de emails"
git push origin railway-deployment
```

Railway detectará el push y **re-desplegará automáticamente**.

### Paso 3: Verificar en los Logs de Railway

Después del deployment (1-2 min), ve a **Deploy Logs** y busca:

```
✅ Google APIs configuradas correctamente
   Service Account: whatsapp-agent@gen-lang-client-0726897121.iam.gserviceaccount.com

🚀 Servidor iniciado correctamente
📝 Configuración:
   Google Calendar ID: tecnologicotlaxiaco@gmail.com
```

---

## 🧪 Probar que Funciona

### 1. Envía un mensaje de WhatsApp:

```
Cliente: Hola
Bot: ¡Hola! 👋 Soy AsistenteTerrenos. ¿En qué puedo ayudarte hoy?

Cliente: Quiero agendar una visita
Bot: ¡Perfecto! Me encantaría agendarte una visita. ¿Cuál es tu nombre completo?

Cliente: José Alfredo
Bot: Gracias, José. ¿Cuál es tu correo electrónico?

Cliente: jose@example.com
Bot: Perfecto. ¿Qué día te gustaría visitarlo?

Cliente: mañana
Bot: Entendido. ¿A qué hora prefieres?

Cliente: 3 de la tarde
Bot: Perfecto. ¿Me confirmas tu teléfono?

Cliente: +52 333 123 4567
Bot: ¿Confirmas la visita al terreno para el viernes 15 a las 3:00 PM?

Cliente: Sí
Bot: ✅ ¡Cita confirmada!

📅 Link del calendario: https://www.google.com/calendar/event?eid=...

Te hemos enviado una invitación a tu email. Recibirás recordatorios automáticos...
```

### 2. Verifica en Railway Logs:

Deberías ver:

```
📅 Agendando cita automática para José Alfredo...
✅ Fechas calculadas: Inicio=2025-11-15T15:00:00...
✅ Datos guardados en Google Sheets
📅 Creando evento en Google Calendar...
🔧 Calendar ID configurado: tecnologicotlaxiaco@gmail.com
📧 Email del cliente agregado como asistente: jose@example.com
📧 Asistentes válidos: jose@example.com
✅ Evento creado en Google Calendar
   Event ID: abc123xyz
   Link: https://www.google.com/calendar/event?eid=...
✅ Cita agendada: Cita confirmada para 2025-11-15 a las 15:00...
📧 Notificaciones enviadas a: tecnologicotlaxiaco@gmail.com y jose@example.com
```

### 3. Verifica en Google Calendar:

1. Abre https://calendar.google.com/
2. Inicia sesión con `tecnologicotlaxiaco@gmail.com`
3. **Deberías ver el evento** en el calendario
4. El cliente `jose@example.com` debería recibir una **invitación por email**

---

## ⚠️ Requisito Previo CRÍTICO

**El calendario `tecnologicotlaxiaco@gmail.com` debe estar compartido con el Service Account:**

### Verificar/Configurar el compartido:

1. Ve a https://calendar.google.com/
2. Inicia sesión con `tecnologicotlaxiaco@gmail.com`
3. En la barra lateral, busca tu calendario
4. Click en **⋮** (tres puntos) → **Configuración y uso compartido**
5. Baja a **"Compartir con personas específicas"**
6. Verifica que esté agregado:
   ```
   whatsapp-agent@gen-lang-client-0726897121.iam.gserviceaccount.com
   ```
   Con permisos: **"Hacer cambios en eventos"**

7. Si NO está, agrégalo:
   - Click en **+ Agregar personas**
   - Email: `whatsapp-agent@gen-lang-client-0726897121.iam.gserviceaccount.com`
   - Permisos: **"Hacer cambios en eventos"**
   - **Enviar**

---

## 🔍 Troubleshooting

### Error: "Calendar not found"

**Causa:** El calendario no existe o no está compartido con el Service Account.

**Solución:** Verifica el compartido (paso anterior).

---

### Error: "Invalid email"

**Causa:** El cliente proporcionó un email mal formado.

**Solución:** El código ahora valida automáticamente. Si el email es inválido:
- Se crea el evento SIN asistente
- El cliente NO recibe invitación (pero el evento sí se crea)
- En los logs verás: `⚠️ Email inválido omitido: ...`

---

### Los eventos se crean pero el cliente no recibe invitación

**Causas posibles:**
1. Email inválido (verifica logs)
2. La invitación fue a spam
3. Gmail bloqueó el email del Service Account

**Verificación:**
```bash
# En Railway logs, busca:
📧 Email del cliente agregado como asistente: cliente@example.com
📧 Asistentes válidos: cliente@example.com
```

Si dice `Sin asistentes`, el email no es válido.

---

## 📊 Comparación: Antes vs Ahora

| Aspecto | Antes ❌ | Ahora ✅ |
|---------|---------|---------|
| **Calendar ID** | Hardcoded | Variable de entorno |
| **Validación de email** | Básica (`includes('@')`) | Regex estricto |
| **Logs** | Mínimos | Detallados para debugging |
| **Flexibilidad** | Solo 1 calendario | Cambiar vía env var |
| **Error handling** | Silencioso | Warnings visibles |

---

## 🎯 Resultado Esperado

Después de aplicar estos cambios:

✅ Los eventos se crean en `tecnologicotlaxiaco@gmail.com`  
✅ Los clientes con email válido reciben invitaciones  
✅ Los recordatorios se envían automáticamente  
✅ Los logs muestran exactamente qué está pasando  
✅ Puedes cambiar el calendario editando 1 variable en Railway  

---

## 💡 Mejoras Opcionales Futuras

1. **Múltiples calendarios:** Usar diferentes calendarios según la propiedad
2. **Verificar disponibilidad:** Antes de agendar, ver si el horario está libre
3. **Reagendar/Cancelar:** Permitir al cliente modificar citas por WhatsApp
4. **Sincronización bidireccional:** Si cancelas en Calendar, notificar al cliente

---

**¿Necesitas ayuda aplicando estos cambios?** Avísame y te guío paso a paso.
