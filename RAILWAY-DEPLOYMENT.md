# 🚂 Despliegue en Railway - Agente WhatsApp con IA

## 📋 Requisitos Previos

- [ ] Cuenta en Railway (https://railway.app/)
- [ ] Cuenta de Twilio con WhatsApp configurado
- [ ] API Key de Claude (Anthropic)
- [ ] Google Service Account configurado
- [ ] Repositorio de GitHub

---

## 🚀 Pasos para Desplegar en Railway

### 1️⃣ Preparar el Repositorio

```bash
# Asegúrate de estar en la branch railway-deployment
git checkout railway-deployment

# Verifica que los archivos necesarios existan
ls -la | grep -E "Procfile|railway.json|package.json"
```

### 2️⃣ Crear Proyecto en Railway

1. Ve a https://railway.app/
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway a acceder a tu GitHub
5. Selecciona el repositorio **`agenteWhatsapp`**
6. Selecciona la branch **`railway-deployment`**

### 3️⃣ Configurar Variables de Entorno

En Railway, ve a la pestaña **"Variables"** y agrega:

#### Twilio:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=+14155238886
```

#### Claude AI:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxx
```

#### Google:
```
GOOGLE_DOCS_ID=1CWRkJNcsScJOK-NMxtxnUdpuxrYcqaru5qiu9rHzbbw
GOOGLE_SHEET_ID=1-YTVjIqYO-m1XS_t_MRUlE7O4u_8WXKiZTQLh8BrhSE
GOOGLE_CALENDAR_ID=primary
```

#### Google Credentials (Importante):
```
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

> ⚠️ **Nota:** Pega todo el contenido del archivo `google-credentials.json` en una sola línea.

#### Configuración del Servidor:
```
PORT=3000
NODE_ENV=production
```

### 4️⃣ Desplegar

Railway desplegará automáticamente. Espera a que el deployment termine (aparecerá como "Active").

### 5️⃣ Obtener la URL Pública de tu Deployment en Railway

**IMPORTANTE: Esta URL es única para tu proyecto y la necesitas para configurar el webhook de Twilio**

#### Pasos detallados para obtener tu URL:

1. En el dashboard de Railway, selecciona tu proyecto **"agenteWhatsapp"**
2. Click en la pestaña **"Settings"** (Configuración)
3. Desplázate hacia abajo hasta la sección **"Networking"** o **"Domains"**
4. Si no existe un dominio:
   - Click en el botón **"Generate Domain"** o **"+ Add Domain"**
   - Railway generará automáticamente una URL pública
5. Copia la URL completa que aparece (ejemplo: `https://agentewhatsapp-production.up.railway.app`)

**⚠️ IMPORTANTE:** 
- Esta URL es **permanente** y no cambia a menos que la elimines manualmente
- La URL tiene el formato: `https://[nombre-proyecto]-[entorno].up.railway.app`
- **Guarda esta URL**, la necesitarás para el siguiente paso

**Ejemplo de URL generada:**
```
https://agentewhatsapp-production.up.railway.app
```

### 6️⃣ Configurar Webhook en Twilio con tu URL de Railway

**Ahora que tienes tu URL de Railway, configura el webhook en Twilio:**

#### Paso A: Acceder a Twilio Console

1. Visita: https://console.twilio.com/
2. Inicia sesión en tu cuenta
3. En el menú lateral, navega a: **Messaging** → **Try it out** → **Send a WhatsApp message**
4. O ve directamente a: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

#### Paso B: Configurar la URL del Webhook

1. En la página de WhatsApp Sandbox, busca la sección **"Sandbox Configuration"**
2. Encuentra el campo **"When a message comes in"**
3. **Aquí es donde pegas tu URL de Railway** siguiendo este formato:
   ```
   [TU_URL_DE_RAILWAY]/webhook/whatsapp
   ```
   
   **Ejemplo completo:**
   ```
   https://agentewhatsapp-production.up.railway.app/webhook/whatsapp
   ```
   
   ⚠️ **MUY IMPORTANTE:**
   - Debes agregar `/webhook/whatsapp` al final de tu URL de Railway
   - **NO** olvides el `/webhook/whatsapp` al final
   - Asegúrate de que sea `https://` (con 's')

4. Selecciona el método: **POST**
5. Click en **"Save"** o **"Save Configuration"**

#### Paso C: Verificar la Configuración

Tu webhook debería verse así en Twilio:
```
URL: https://agentewhatsapp-production.up.railway.app/webhook/whatsapp
Método: POST
```

**✅ Listo!** Twilio ahora enviará todos los mensajes de WhatsApp a tu servidor en Railway.

---

## ✅ Verificar el Despliegue

### Prueba 1: Verificar el servidor
```bash
curl https://tu-proyecto.up.railway.app
```
Debería responder: "Servidor WhatsApp activo"

### Prueba 2: Verificar logs
En Railway, ve a la pestaña **"Logs"** y verifica que veas:
```
✅ Google APIs configuradas correctamente
🚀 Servidor iniciado correctamente
✅ Base de conocimiento cargada desde Google Docs
```

### Prueba 3: Enviar mensaje de WhatsApp
1. Activa el sandbox de Twilio
2. Envía un mensaje
3. Verifica que recibas respuesta del agente

---

## 🔧 Solución de Problemas

### Error: "Cannot find module 'dotenv'"
```bash
# Asegúrate de que package.json tenga todas las dependencias
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Error: "Google credentials not found"
- Verifica que la variable `GOOGLE_CREDENTIALS` esté configurada en Railway
- Debe ser el contenido completo del JSON en una sola línea

### Error: "Port already in use"
- Railway asigna el puerto automáticamente vía la variable `PORT`
- No es necesario cambiar nada

### Los mensajes no llegan:
1. Verifica que el webhook esté configurado correctamente en Twilio
2. Revisa los logs en Railway para ver si hay errores
3. Verifica que la URL sea HTTPS (Railway lo hace automáticamente)

### ❓ "¿De dónde obtengo el link/URL para el webhook?"

**Respuesta completa:**

1. **El link viene de Railway** después de desplegar tu aplicación
2. **Pasos para obtenerlo:**
   - Ve a tu proyecto en Railway Dashboard
   - Click en "Settings"
   - Busca la sección "Domains" o "Networking"
   - Click en "Generate Domain" si no existe
   - Copia la URL completa (ej: `https://agentewhatsapp-production.up.railway.app`)
   - **Agrega** `/webhook/whatsapp` al final

3. **La URL completa será:**
   ```
   https://[tu-proyecto].up.railway.app/webhook/whatsapp
   ```

### Error: "No encuentro dónde está mi URL de Railway"

**Solución paso a paso:**

1. Inicia sesión en https://railway.app/
2. Click en tu proyecto (debe llamarse algo como "agenteWhatsapp")
3. En el dashboard del proyecto, busca estos elementos:
   - Pestaña superior: **"Settings"** ← Click aquí
   - Scroll hacia abajo hasta **"Domains"** o **"Networking"**
   - Verás un botón **"Generate Domain"** o una URL ya generada
4. Si ves una URL (como `agentewhatsapp-production.up.railway.app`):
   - **¡Esa es tu URL!** Cópiala
5. Si NO ves una URL:
   - Click en **"Generate Domain"**
   - Railway creará una automáticamente
   - Cópiala

### Error: "El webhook en Twilio marca error 404"

**Causas comunes:**
- ❌ Olvidaste agregar `/webhook/whatsapp` al final de la URL
- ❌ La URL no es la correcta de Railway
- ❌ El servidor en Railway no está corriendo

**Solución:**
```
✅ URL CORRECTA:   https://tu-app.up.railway.app/webhook/whatsapp
❌ URL INCORRECTA: https://tu-app.up.railway.app
❌ URL INCORRECTA: https://tu-app.up.railway.app/webhook
```

### Error: "¿Cuál es MI URL específica?"

Cada proyecto tiene una URL única. Para encontrar la tuya:

1. **Opción 1 - Desde Railway Dashboard:**
   - Settings → Domains → Copia la URL mostrada

2. **Opción 2 - Desde los Logs de Railway:**
   - Ve a la pestaña "Logs" en Railway
   - Busca una línea que diga: `📱 Webhook URL: https://...`
   - Esa es tu URL (aunque puede aparecer como placeholder)

3. **Opción 3 - Probar directamente:**
   - Abre tu navegador
   - Ve a: `https://[nombre-de-tu-proyecto].up.railway.app`
   - Si ves "Servidor WhatsApp activo", esa es tu URL correcta
   - Agrega `/webhook/whatsapp` para el webhook de Twilio

---

## 💰 Costos de Railway

- **Plan Free (Hobby)**: 
  - $5 USD de crédito gratis al mes
  - Suficiente para pruebas y bajo volumen
  - ~500 horas de ejecución

- **Plan Pro**: 
  - $20 USD al mes
  - Ilimitado
  - Mejor para producción

---

## 📊 Ventajas sobre LocalTunnel

✅ **URL permanente** - No cambia cada vez que reinicias  
✅ **HTTPS automático** - Certificado SSL incluido  
✅ **Sin límites de tiempo** - Funciona 24/7  
✅ **Mejor rendimiento** - Servidores dedicados  
✅ **Logs integrados** - Monitoreo en tiempo real  
✅ **Escalable** - Puede manejar más tráfico  
✅ **Reinicio automático** - Si el servidor falla, se reinicia solo  

---

## 🔄 Actualizar el Deployment

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de cambios"
git push origin railway-deployment
```

Railway detectará el push y desplegará automáticamente.

---

## 📞 Soporte

- Railway Docs: https://docs.railway.app/
- Twilio WhatsApp: https://www.twilio.com/docs/whatsapp
- Claude API: https://docs.anthropic.com/

---

¡Listo! Tu agente de WhatsApp ahora está en producción 🚀
