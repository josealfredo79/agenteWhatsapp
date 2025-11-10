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

### 5️⃣ Obtener la URL Pública

1. En Railway, ve a **"Settings"**
2. Busca la sección **"Domains"**
3. Click en **"Generate Domain"**
4. Copia la URL generada (ej: `https://tu-proyecto.up.railway.app`)

### 6️⃣ Configurar Webhook en Twilio

1. Ve a Twilio Console: https://console.twilio.com/
2. Messaging → Try it out → Send a WhatsApp message
3. En "When a message comes in", pega:
   ```
   https://tu-proyecto.up.railway.app/webhook/whatsapp
   ```
4. Método: **POST**
5. Guarda los cambios

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
