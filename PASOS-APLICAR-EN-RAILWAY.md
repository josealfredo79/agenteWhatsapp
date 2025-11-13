# ✅ PASOS PARA APLICAR LA CORRECCIÓN EN RAILWAY

## 📋 Resumen de lo que se hizo

✅ **Código corregido y pusheado a GitHub** (branch: railway-deployment)
- Se eliminó el `calendarId` hardcoded
- Ahora usa la variable de entorno `GOOGLE_CALENDAR_ID`
- Se agregó validación estricta de emails
- Se mejoraron los logs para debugging

## 🚀 LO QUE TIENES QUE HACER EN RAILWAY

### Paso 1: Railway detectará el push automáticamente

1. Ve a tu Railway Dashboard
2. Railway ya debería estar re-desplegando automáticamente
3. Espera a que termine el deployment (1-2 minutos)

### Paso 2: Actualizar la variable GOOGLE_CALENDAR_ID

**IMPORTANTE:** Esta es la única variable que necesitas cambiar.

1. En Railway Dashboard → Tu proyecto → **Variables**
2. Busca la línea: `GOOGLE_CALENDAR_ID=primary`
3. Cámbiala a: `GOOGLE_CALENDAR_ID=tecnologicotlaxiaco@gmail.com`

**Opción 1 - Editar directamente:**
- Click en la variable `GOOGLE_CALENDAR_ID`
- Cambiar `primary` por `tecnologicotlaxiaco@gmail.com`
- Guardar

**Opción 2 - RAW Editor:**
- Click en "RAW Editor"
- Busca la línea `GOOGLE_CALENDAR_ID=primary`
- Cámbiala a `GOOGLE_CALENDAR_ID=tecnologicotlaxiaco@gmail.com`
- Click en "Update Variables"

4. Railway re-desplegará automáticamente después de guardar

---

## 🔍 Verificar que funcionó

### En los logs de Railway:

Después del deployment, ve a **Deploy Logs** y busca estas líneas:

```
✅ Google APIs configuradas correctamente
   Service Account: whatsapp-agent@gen-lang-client-0726897121.iam.gserviceaccount.com

🚀 Servidor iniciado correctamente

📝 Configuración:
   Twilio: +14155238886
   Claude: Configurado
   Google Docs: 1CWRkJNcsScJOK-NMxtxnUdpuxrYcqaru5qiu9rHzbbw
   Google Sheets: 1-YTVjIqYO-m1XS_t_MRUlE7O4u_8WXKiZTQLh8BrhSE
```

### Cuando alguien agende una cita, verás:

```
📅 Agendando cita automática para [Nombre]...
✅ Fechas calculadas: Inicio=2025-11-15T15:00:00...
✅ Datos guardados en Google Sheets
📅 Creando evento en Google Calendar...
🔧 Calendar ID configurado: tecnologicotlaxiaco@gmail.com
📧 Email del cliente agregado como asistente: cliente@example.com
📧 Asistentes válidos: cliente@example.com
✅ Evento creado en Google Calendar
   Event ID: abc123xyz
   Link: https://www.google.com/calendar/event?eid=...
✅ Cita agendada: Cita confirmada para 2025-11-15 a las 15:00
📧 Notificaciones enviadas a: tecnologicotlaxiaco@gmail.com y cliente@example.com
```

---

## 📧 Recordatorio Importante

Verifica que el calendario `tecnologicotlaxiaco@gmail.com` esté compartido con el Service Account:

1. Abre https://calendar.google.com/
2. Inicia sesión con `tecnologicotlaxiaco@gmail.com`
3. Configuración del calendario → Compartir con personas específicas
4. Debe estar: `whatsapp-agent@gen-lang-client-0726897121.iam.gserviceaccount.com`
5. Con permisos: **"Hacer cambios en eventos"**

---

## 🧪 Probar en Producción

Una vez actualizada la variable en Railway:

1. Envía mensaje de WhatsApp al sandbox de Twilio
2. Solicita agendar una cita
3. Proporciona todos los datos (nombre, email válido, fecha, hora)
4. Confirma la cita
5. Deberías recibir el link del calendario
6. Verifica en https://calendar.google.com/ que el evento aparece

---

## ❌ ¿Qué NO hacer?

- ❌ NO modifiques otras variables (ya están correctas)
- ❌ NO cambies el código manualmente en Railway
- ❌ NO uses `primary` como Calendar ID (no funciona con Service Accounts compartidos)

---

## 📞 Si algo falla

Revisa los logs de Railway y busca:

- `❌ Error al crear evento en Calendar`
- `⚠️ Email inválido omitido`
- `Calendar not found`

Consulta el archivo `SOLUCION-CALENDARIO-RAILWAY.md` para troubleshooting detallado.

---

**Última actualización:** 13 de Noviembre, 2025  
**Versión del código:** 1.0.2  
**Commit:** fix: corregir calendario usando variable de entorno GOOGLE_CALENDAR_ID
