# 🚂 Agente WhatsApp con IA - Railway Deployment

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

## 🚀 Despliegue Rápido

Este proyecto está listo para desplegarse en Railway con un solo click.

### Opción 1: Despliegue Automático

1. Click en el botón "Deploy on Railway" arriba
2. Configura las variables de entorno requeridas
3. ¡Listo!

### Opción 2: Despliegue Manual

```bash
# Ejecutar el script de preparación
./deploy-railway.sh
```

Luego sigue las instrucciones en [RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md)

## ⚙️ Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `TWILIO_ACCOUNT_SID` | Account SID de Twilio | `ACxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Auth Token de Twilio | `xxxxxxxxxx` |
| `TWILIO_WHATSAPP_NUMBER` | Número de WhatsApp | `+14155238886` |
| `ANTHROPIC_API_KEY` | API Key de Claude | `sk-ant-xxxxx` |
| `GOOGLE_CREDENTIALS` | JSON completo del Service Account | `{"type":"service_account",...}` |
| `GOOGLE_DOCS_ID` | ID del Google Doc con la base de conocimiento | `1CWRkJN...` |
| `GOOGLE_SHEET_ID` | ID del Google Sheet para logs | `1-YTVj...` |
| `GOOGLE_CALENDAR_ID` | ID del Google Calendar | `primary` |
| `PORT` | Puerto (Railway lo asigna automáticamente) | `3000` |
| `NODE_ENV` | Entorno de ejecución | `production` |

## 📋 Archivos de Configuración

- `Procfile` - Define el comando de inicio
- `railway.json` - Configuración específica de Railway
- `package.json` - Dependencias y scripts
- `.env.example` - Ejemplo de variables de entorno

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **IA**: Claude 3 (Anthropic)
- **WhatsApp**: Twilio API
- **Storage**: Google Sheets
- **Knowledge Base**: Google Docs
- **Real-time**: Socket.IO

## 📱 Características

✅ Respuestas automáticas con IA  
✅ Base de conocimiento personalizable  
✅ Registro de conversaciones  
✅ Panel web en tiempo real  
✅ Gestión de citas y formularios  
✅ Integración con Google Calendar  

## 🔗 Enlaces Útiles

- [Documentación completa](RAILWAY-DEPLOYMENT.md)
- [Railway Docs](https://docs.railway.app/)
- [Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp)
- [Claude API](https://docs.anthropic.com/)

## 💰 Costos Estimados

### Railway
- Plan Free: $5/mes de crédito gratis
- Plan Pro: $20/mes (ilimitado)

### Twilio WhatsApp
- ~$0.005 por mensaje enviado/recibido

### Claude API
- ~$3 por 1M tokens (entrada)
- ~$15 por 1M tokens (salida)

## 📞 Soporte

¿Problemas con el despliegue? Revisa [RAILWAY-DEPLOYMENT.md](RAILWAY-DEPLOYMENT.md) o abre un issue.

---

Desarrollado por José Alfredo  
© 2025
