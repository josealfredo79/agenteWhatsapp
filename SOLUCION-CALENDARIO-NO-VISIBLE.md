# 🔍 SOLUCIÓN: Eventos se crean pero no son visibles

## ❓ Problema

El link del evento se genera correctamente, pero cuando lo abres, no ves el evento en tu calendario de Google.

## 🎯 Causa

El Service Account crea eventos en **su propio calendario**, no en el tuyo. Necesitas:

1. **Compartir un calendario tuyo con el Service Account**, O
2. **Agregar el calendario del Service Account a tu vista**

## ✅ SOLUCIÓN 1: Usar tu propio calendario (RECOMENDADO)

### Paso 1: Compartir tu calendario con el Service Account

1. Ve a [Google Calendar](https://calendar.google.com)
2. En la barra lateral izquierda, encuentra "Mis calendarios"
3. Haz clic en los **tres puntos** junto a tu calendario principal
4. Selecciona **"Configuración y uso compartido"**
5. Baja hasta **"Compartir con personas específicas"**
6. Haz clic en **"+ Agregar personas"**
7. Ingresa el email del Service Account:
   ```
   whatsapp-agent@gen-lang-client-0726897121.iam.gserviceaccount.com
   ```
8. Selecciona permisos: **"Hacer cambios en eventos"**
9. Haz clic en **"Enviar"**

### Paso 2: Obtener el ID de tu calendario

1. En la misma página de configuración, baja hasta **"Integrar calendario"**
2. Copia el **ID del calendario** (será algo como: `tu-email@gmail.com`)

### Paso 3: Actualizar variable en Railway

1. Ve a Railway Dashboard > Variables
2. Actualiza `GOOGLE_CALENDAR_ID` con el ID que copiaste:
   ```
   GOOGLE_CALENDAR_ID=tu-email@gmail.com
   ```
3. Guarda y despliega

---

## ✅ SOLUCIÓN 2: Agregar calendario del Service Account a tu vista

Si prefieres seguir usando el calendario del Service Account:

1. Ve a [Google Calendar](https://calendar.google.com)
2. En la barra lateral izquierda, al lado de "Otros calendarios" haz clic en **+**
3. Selecciona **"Suscribirse a calendario"**
4. Ingresa el email del Service Account:
   ```
   whatsapp-agent@gen-lang-client-0726897121.iam.gserviceaccount.com
   ```
5. Haz clic en **"Agregar"**

Ahora deberías ver los eventos del Service Account en tu vista.

---

## 🧪 Verificar que funciona

Después de aplicar la solución, prueba:

1. Agendar una cita por WhatsApp
2. Copiar el link del evento que te envía el bot
3. Abrir el link
4. **Deberías ver el evento** y tener la opción de agregarlo a tu calendario

---

## 📊 Configuración actual

Tu configuración actual:
- **Service Account:** `whatsapp-agent@gen-lang-client-0726897121.iam.gserviceaccount.com`
- **Calendar ID en Railway:** Verifica que sea tu email personal o el ID correcto

---

## 💡 Recomendación

**Usa SOLUCIÓN 1** - Es más profesional porque:
- Los eventos aparecen en TU calendario principal
- Los clientes pueden ver mejor los detalles
- Tienes control total sobre los eventos
- Puedes ver/editar/eliminar desde tu cuenta principal
