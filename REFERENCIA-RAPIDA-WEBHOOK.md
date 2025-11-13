# 🚀 Tarjeta de Referencia Rápida: Webhook de Twilio

## ⚡ Configuración en 5 Minutos

### Paso 1: Despliega en Railway
```bash
railway login
railway init
railway up
```

### Paso 2: Obtén tu URL
1. Ve a https://railway.app/
2. Abre tu proyecto
3. **Settings** → **Domains**
4. Si no hay dominio: click **"Generate Domain"**
5. **Copia la URL** (ej: `agentewhatsapp-production.up.railway.app`)

### Paso 3: Construye la URL del Webhook
```
Tu URL de Railway:
https://agentewhatsapp-production.up.railway.app

Agrega al final:
/webhook/whatsapp

URL completa del webhook:
https://agentewhatsapp-production.up.railway.app/webhook/whatsapp
```

### Paso 4: Configura en Twilio
1. Ve a https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. En **"When a message comes in"**, pega tu URL completa
3. Método: **POST**
4. Click **Save**

### Paso 5: Verifica
```bash
# Abre en tu navegador (sin /webhook/whatsapp):
https://agentewhatsapp-production.up.railway.app

# Deberías ver:
"Servidor WhatsApp activo"
```

---

## ❓ Pregunta Frecuente

**"Este link lo obtienes de donde???"**

**Respuesta:** El link viene de **Railway** cuando generas el dominio público de tu proyecto.

**No es:**
- ❌ Un link que tú creas
- ❌ Un link que está en el código
- ❌ Un link que copiaste de la documentación

**Es:**
- ✅ Un link único generado por Railway
- ✅ Específico para TU proyecto
- ✅ Permanente (no cambia)

---

## 📍 Ubicación de la URL en Railway

```
Railway → Tu Proyecto → Settings → Domains

Si no ves un dominio: Click "Generate Domain"
Si ves un dominio: Ese es tu link base
```

---

## ✅ Checklist de Verificación

- [ ] Proyecto desplegado en Railway (estado: Active)
- [ ] Dominio generado en Railway Dashboard
- [ ] URL copiada correctamente
- [ ] Agregado `/webhook/whatsapp` al final
- [ ] URL configurada en Twilio con método POST
- [ ] Navegador muestra "Servidor WhatsApp activo"
- [ ] Logs de Railway muestran "Sistema listo para recibir mensajes"
- [ ] Mensaje de prueba enviado desde WhatsApp
- [ ] Respuesta recibida del agente

---

## 🔧 Comandos Útiles

```bash
# Verificar sintaxis del servidor
node --check server.js

# Probar lógica de detección de URL
node test-webhook-url.js

# Ver logs en Railway
# Ve a tu proyecto → pestaña "Logs"

# Verificar que el servidor responde
curl https://tu-proyecto.up.railway.app
```

---

## ❌ Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| 404 Not Found | Falta `/webhook/whatsapp` | Agrégalo al final de la URL |
| Dominio no existe | No generado en Railway | Click "Generate Domain" |
| URL cambia | Usando ngrok/localtunnel | Usa Railway (URL permanente) |
| https vs http | Protocolo incorrecto | Railway usa HTTPS automáticamente |

---

## 📚 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| [WEBHOOK-URL-GUIA.md](WEBHOOK-URL-GUIA.md) | Guía completa paso a paso |
| [RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md) | Instrucciones de despliegue |
| [DIAGRAMA-WEBHOOK.md](DIAGRAMA-WEBHOOK.md) | Diagramas visuales |
| [RESUMEN-CAMBIOS-WEBHOOK.md](RESUMEN-CAMBIOS-WEBHOOK.md) | Resumen técnico |

---

## 🆘 ¿Necesitas Ayuda?

1. **Lee primero:** [WEBHOOK-URL-GUIA.md](WEBHOOK-URL-GUIA.md)
2. **Revisa errores comunes:** Sección de troubleshooting
3. **Verifica logs:** Railway Dashboard → Logs
4. **Prueba URL:** Abre en navegador para verificar

---

## 💡 Tips Profesionales

✨ **Tu URL de Railway es única** - No copies URLs de la documentación, usa la TUYA

✨ **La URL no cambia** - Una vez generada, es permanente

✨ **HTTPS es automático** - No necesitas configurar certificados SSL

✨ **Los logs ayudan** - El servidor muestra la URL correcta al iniciar

---

## 📞 Formato Correcto

```
✅ CORRECTO:
https://[tu-proyecto-único].up.railway.app/webhook/whatsapp

❌ INCORRECTO:
https://tu-app.railway.app/webhook/whatsapp
http://tu-proyecto.up.railway.app/webhook/whatsapp
https://tu-proyecto.up.railway.app
https://tu-proyecto.up.railway.app/webhook
```

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0

**¿Te fue útil?** ⭐ Da estrella al repositorio si esta guía te ayudó!
