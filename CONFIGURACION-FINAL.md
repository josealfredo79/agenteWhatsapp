# 🎉 CONFIGURACIÓN COMPLETA - Agente WhatsApp

## ✅ Estado del Sistema

El sistema está **completamente operativo** y listo para recibir mensajes de WhatsApp.

### 📊 Componentes Activos

1. **Servidor Node.js**: ✅ Ejecutándose en puerto 3000
2. **LocalTunnel**: ✅ Túnel público activo
3. **Google Docs**: ✅ Base de conocimiento cargada (5106 caracteres)
4. **Google Sheets**: ✅ Sistema de registro configurado
5. **Claude API**: ✅ Configurado y listo

---

## 🌐 URLs del Sistema

### ⚠️ IMPORTANTE: Sobre la URL del Webhook

La URL que ves a continuación (`https://agentewhatsapp.loca.lt/webhook/whatsapp`) es un **ejemplo con LocalTunnel** para desarrollo local. 

**Para producción en Railway, la URL será diferente y única para tu proyecto.**

📖 **Lee la [Guía de URL del Webhook](WEBHOOK-URL-GUIA.md) para saber cómo obtener TU URL específica.**

### URL Pública del Webhook (EJEMPLO - LocalTunnel):
```
https://agentewhatsapp.loca.lt/webhook/whatsapp
```

**Para Railway (Producción):**
```
https://[tu-proyecto].up.railway.app/webhook/whatsapp
```
👉 Consulta [RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md) y [WEBHOOK-URL-GUIA.md](WEBHOOK-URL-GUIA.md)

### URLs Locales:
- Servidor HTTP: `http://localhost:3000`
- WebSocket: `ws://localhost:3000`
- Panel Web: `http://localhost:3000`

---

## 📱 Configuración en Twilio

### Paso 1: Acceder a Twilio Console
1. Ir a: https://console.twilio.com/
2. Navegar a: **Messaging** → **Try it out** → **Send a WhatsApp message**

### Paso 2: Configurar el Webhook
1. En la sección "Sandbox settings"
2. Buscar el campo **"When a message comes in"**
3. Ingresar la URL del webhook:
   ```
   https://agentewhatsapp.loca.lt/webhook/whatsapp
   ```
4. Método HTTP: **POST**
5. Hacer clic en **Save**

### Paso 3: Probar el Sistema
1. Enviar un mensaje a tu número de WhatsApp Sandbox: **+1 415 523 8886**
2. Primero enviar el código de activación: `join <tu-código-sandbox>`
3. Luego enviar un mensaje de prueba, por ejemplo:
   ```
   Hola, ¿tienen terrenos disponibles?
   ```

---

## 🔍 Monitoreo del Sistema

### Ver logs en tiempo real:
```bash
tail -f server.log
```

### Ver estado de procesos:
```bash
ps aux | grep -E "node server.js|lt --port"
```

### Reiniciar el servidor:
```bash
pkill -f "node server.js"
cd /home/josealfredo/whatsapp-terrenos-mcp
node server.js > server.log 2>&1 &
```

### Reiniciar LocalTunnel:
```bash
pkill lt
lt --port 3000 --subdomain agentewhatsapp &
```

---

## 📝 Información de Configuración

### Número de Twilio:
```
+1 (217) 387-4424
```

### Google Docs ID (Base de Conocimiento):
```
1CWRkJNcsScJOK-NMxtxnUdpuxrYcqaru5qiu9rHzbbw
```

### Google Sheets ID (Registro de Conversaciones):
```
1-YTVjIqYO-m1XS_t_MRUlE7O4u_8WXKiZTQLh8BrhSE
```

---

## 🚨 Solución de Problemas

### Si no se reciben mensajes:

1. **Verificar que LocalTunnel esté activo:**
   ```bash
   curl https://agentewhatsapp.loca.lt
   ```
   Debería devolver: "Servidor WhatsApp activo"

2. **Verificar el webhook en Twilio:**
   - La URL debe ser exactamente: `https://agentewhatsapp.loca.lt/webhook/whatsapp`
   - El método debe ser POST

3. **Revisar logs del servidor:**
   ```bash
   tail -50 server.log
   ```

4. **Verificar que el servidor esté corriendo:**
   ```bash
   lsof -i :3000
   ```

### Si LocalTunnel se desconecta:

LocalTunnel es gratuito pero puede desconectarse. Para reconectar:
```bash
pkill lt
lt --port 3000 --subdomain agentewhatsapp
```

Nota: Si el subdominio "agentewhatsapp" no está disponible, usar otro y actualizar la URL en Twilio.

---

## 🎯 Próximos Pasos

1. ✅ Configurar el webhook en Twilio
2. ✅ Probar enviando un mensaje de WhatsApp
3. ✅ Verificar que las respuestas se registren en Google Sheets
4. ✅ Monitorear el panel web en http://localhost:3000

---

## 📞 Contacto del Sistema

- **Desarrollador**: José Alfredo
- **Fecha de configuración**: 9 de noviembre de 2025
- **Versión**: 1.0.0

---

## 🔐 Seguridad

⚠️ **IMPORTANTE**: No compartir públicamente:
- Las credenciales de Google (`google-credentials.json`)
- Las claves de API de Claude
- El archivo `.env` si existe

---

## 📚 Documentación Adicional

- `README.md`: Documentación general del proyecto
- `INICIO-RAPIDO.txt`: Guía de inicio rápido
- `CONFIGURAR-GOOGLE.txt`: Instrucciones de Google API
- `RESULTADOS-PRUEBAS.md`: Resultados de pruebas realizadas

---

¡Tu agente de WhatsApp está listo para ayudar a tus clientes! 🎉
