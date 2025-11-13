# 🔗 Guía: ¿Dónde obtengo la URL del Webhook?

## ❓ Pregunta Frecuente

**"Este link lo obtienes de donde???"**

Esta guía te explica **exactamente** dónde y cómo obtener la URL que necesitas para configurar el webhook de Twilio.

---

## 📍 Respuesta Rápida

La URL del webhook viene de **Railway** después de desplegar tu aplicación. No es algo que tú creas, sino que Railway la genera automáticamente.

**Formato de la URL:**
```
https://[nombre-de-tu-proyecto].up.railway.app/webhook/whatsapp
```

---

## 🎯 Pasos Detallados para Obtener la URL

### Paso 1: Desplegar en Railway

Primero debes tener tu aplicación desplegada en Railway. Si aún no lo has hecho:

1. Ve a https://railway.app/
2. Inicia sesión
3. Click en "New Project"
4. Conecta tu repositorio de GitHub
5. Espera a que termine el deployment (aparecerá como "Active")

### Paso 2: Generar el Dominio Público

Una vez desplegado:

1. **En el Dashboard de Railway**, click en tu proyecto
2. Click en la pestaña **"Settings"** (arriba)
3. Scroll hacia abajo hasta la sección **"Networking"** o **"Domains"**
4. Verás una de estas dos opciones:

   **Opción A:** Si ya tienes un dominio generado
   ```
   ✅ Domain: agentewhatsapp-production.up.railway.app
   ```
   👉 **¡Esa es tu URL base!** Cópiala.

   **Opción B:** Si NO hay dominio
   ```
   [ Generate Domain ]  ← Click este botón
   ```
   👉 Railway generará automáticamente una URL como:
   ```
   agentewhatsapp-production.up.railway.app
   ```

### Paso 3: Construir la URL del Webhook

Ahora que tienes tu URL base de Railway, construye la URL del webhook:

**Tu URL base (de Railway):**
```
https://agentewhatsapp-production.up.railway.app
```

**Agrega `/webhook/whatsapp` al final:**
```
https://agentewhatsapp-production.up.railway.app/webhook/whatsapp
```

**¡Esta es la URL completa que necesitas para Twilio!** ✅

---

## 📋 Configurar en Twilio

Ahora que tienes la URL completa:

1. Ve a: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. Busca el campo **"When a message comes in"**
3. Pega tu URL completa:
   ```
   https://agentewhatsapp-production.up.railway.app/webhook/whatsapp
   ```
4. Selecciona método: **POST**
5. Click en **"Save"**

---

## 🖼️ Ejemplos Visuales

### En Railway - Sección Domains

```
┌─────────────────────────────────────────────┐
│ Settings > Networking > Domains             │
├─────────────────────────────────────────────┤
│                                             │
│ Public Networking                           │
│                                             │
│ ✅ agentewhatsapp-production.up.railway.app │
│                                             │
│ [ Generate Domain ] [ + Add Domain ]       │
│                                             │
└─────────────────────────────────────────────┘
```

### En Twilio - Sandbox Configuration

```
┌─────────────────────────────────────────────────────────┐
│ When a message comes in:                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [https://agentewhatsapp-production.up.railway.app/... ]│
│                                                         │
│ Method: [POST ▼]                                        │
│                                                         │
│ [ Save ]                                                │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Verificación

Para confirmar que tu URL es correcta:

### Prueba 1: Abrir en el Navegador

Abre tu navegador y ve a tu URL base (sin el `/webhook/whatsapp`):
```
https://agentewhatsapp-production.up.railway.app
```

**Deberías ver:**
```
Servidor WhatsApp activo
```

Si ves este mensaje, ¡tu URL es correcta! ✅

### Prueba 2: Revisar los Logs de Railway

1. En Railway, ve a la pestaña **"Logs"**
2. Busca una línea que diga:
   ```
   📱 URL del Webhook para Twilio:
      https://[tu-url]/webhook/whatsapp
   ```
3. Esa es tu URL correcta

---

## ❌ Errores Comunes

### Error 1: "No encuentro la sección Domains"

**Solución:**
- La sección puede llamarse "Networking", "Domains" o "Public Networking"
- Está dentro de "Settings" en Railway
- Si no la encuentras, actualiza la página de Railway

### Error 2: "No aparece ningún dominio"

**Solución:**
- Click en el botón **"Generate Domain"**
- Railway creará uno automáticamente en segundos
- Si el botón no aparece, verifica que el deployment esté "Active"

### Error 3: "Mi URL es diferente cada vez"

**Solución:**
- La URL de Railway es **permanente** y NO cambia
- Si estás usando ngrok o localtunnel, esas SÍ cambian
- Usa Railway para tener una URL fija

### Error 4: "Twilio dice 404 Not Found"

**Verificaciones:**
- ✅ ¿Agregaste `/webhook/whatsapp` al final?
- ✅ ¿Está escrito exactamente así? (sin espacios extra)
- ✅ ¿El servidor en Railway está corriendo? (status: Active)
- ✅ ¿Usaste `https://` en lugar de `http://`?

---

## 🆘 ¿Aún tienes dudas?

### Pregunta: "¿Cada persona tiene una URL diferente?"

**Respuesta:** ¡SÍ! Cada proyecto en Railway tiene su propia URL única. Por eso no podemos darte una URL específica en la documentación. Debes obtenerla de TU proyecto en Railway.

### Pregunta: "¿Esta URL es gratis?"

**Respuesta:** Sí, Railway genera la URL pública de forma gratuita con el plan Free (hasta $5 USD de crédito mensual).

### Pregunta: "¿Puedo usar mi propio dominio?"

**Respuesta:** Sí, en Railway puedes agregar un dominio personalizado (como `whatsapp.miempresa.com`), pero eso es opcional. La URL generada por Railway funciona perfectamente.

---

## 📚 Referencias

- [Documentación de Railway - Deployments](https://docs.railway.app/deploy/deployments)
- [Twilio - WhatsApp Sandbox](https://www.twilio.com/docs/whatsapp/sandbox)
- [Guía completa de deployment](RAILWAY-DEPLOYMENT.md)

---

**¿Te ayudó esta guía?** Si encontraste la respuesta a tu pregunta, ¡ya puedes configurar el webhook exitosamente! 🎉
