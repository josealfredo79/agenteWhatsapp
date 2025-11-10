# 📅 Guía: Automatizar Citas con Google Calendar

## 🎯 Objetivo
Permitir que Claude agende citas automáticamente en Google Calendar cuando detecte que un cliente quiere agendar una visita.

---

## 🔧 Implementación con Claude Tool Use

### **1. Definir las Tools para Claude**

```javascript
const CALENDAR_TOOLS = [
  {
    name: "agendar_cita",
    description: "Agenda una cita/visita en Google Calendar. Usa esta función cuando el cliente confirme que desea agendar una visita a una propiedad.",
    input_schema: {
      type: "object",
      properties: {
        nombre_cliente: {
          type: "string",
          description: "Nombre completo del cliente"
        },
        telefono: {
          type: "string",
          description: "Número de teléfono del cliente"
        },
        fecha: {
          type: "string",
          description: "Fecha de la cita en formato YYYY-MM-DD"
        },
        hora: {
          type: "string",
          description: "Hora de la cita en formato HH:MM (24 horas)"
        },
        propiedad: {
          type: "string",
          description: "Nombre o descripción de la propiedad a visitar"
        },
        ubicacion: {
          type: "string",
          description: "Dirección o ubicación de la propiedad"
        },
        notas: {
          type: "string",
          description: "Notas adicionales sobre la cita"
        }
      },
      required: ["nombre_cliente", "fecha", "hora", "propiedad"]
    }
  }
];
```

### **2. Modificar la función `getChatResponse()`**

```javascript
async function getChatResponse(userMessage, conversationHistory = [], phoneNumber = '') {
  try {
    const messages = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Modelo con tool use
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages,
      tools: CALENDAR_TOOLS // ← AGREGAR TOOLS
    });
    
    // Verificar si Claude quiere usar una tool
    if (response.stop_reason === 'tool_use') {
      const toolUse = response.content.find(block => block.type === 'tool_use');
      
      if (toolUse && toolUse.name === 'agendar_cita') {
        // Extraer parámetros
        const params = toolUse.input;
        
        // Crear la cita en Google Calendar
        const citaCreada = await agendarCitaAutomatica(params, phoneNumber);
        
        // Continuar la conversación con el resultado
        const followUpMessages = [
          ...messages,
          { role: 'assistant', content: response.content },
          {
            role: 'user',
            content: [{
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify({
                success: citaCreada.success,
                mensaje: citaCreada.mensaje,
                link: citaCreada.link
              })
            }]
          }
        ];
        
        // Obtener respuesta final de Claude
        const finalResponse = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: followUpMessages,
          tools: CALENDAR_TOOLS
        });
        
        return finalResponse.content[0].text;
      }
    }
    
    // Si no usa tools, devolver respuesta normal
    return response.content[0].text;
  } catch (error) {
    console.error('Error al comunicarse con Claude:', error);
    return 'Disculpa, estoy experimentando dificultades técnicas.';
  }
}
```

### **3. Crear función `agendarCitaAutomatica()`**

```javascript
async function agendarCitaAutomatica(params, phoneNumber) {
  try {
    const { nombre_cliente, telefono, fecha, hora, propiedad, ubicacion, notas } = params;
    
    // Construir fechas ISO para Calendar
    const fechaInicio = new Date(`${fecha}T${hora}:00`);
    const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000); // +1 hora
    
    // Crear evento en Google Calendar
    const evento = await createCalendarEvent({
      titulo: `Visita: ${propiedad}`,
      descripcion: `Cliente: ${nombre_cliente}\nTeléfono: ${telefono || phoneNumber}\n\n${notas || ''}`,
      ubicacion: ubicacion || propiedad,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString(),
      attendees: telefono ? [{ email: `${telefono}@whatsapp.com` }] : []
    });
    
    // Guardar también en Google Sheets
    await saveToGoogleSheet({
      nombre: nombre_cliente,
      telefono: telefono || phoneNumber,
      email: '',
      interes: propiedad,
      notas: `Cita agendada: ${fecha} ${hora} - ${notas || ''}`
    });
    
    if (evento) {
      return {
        success: true,
        mensaje: `Cita agendada exitosamente para ${fecha} a las ${hora}`,
        link: evento.htmlLink
      };
    } else {
      return {
        success: false,
        mensaje: 'Error al crear la cita en el calendario'
      };
    }
  } catch (error) {
    console.error('Error al agendar cita automática:', error);
    return {
      success: false,
      mensaje: error.message
    };
  }
}
```

### **4. Actualizar el SYSTEM_PROMPT**

```javascript
const SYSTEM_PROMPT = `Eres un asistente virtual profesional especializado en atención al cliente para una empresa de terrenos e inmuebles. Tu nombre es AsistenteTerrenos.

CONOCIMIENTOS BASE:
${knowledgeBase || 'Cargando base de conocimiento...'}

CAPACIDADES Y FUNCIONES:
1. **Información sobre Terrenos**: Responde consultas sobre propiedades, ubicaciones, precios, características y disponibilidad.

2. **Gestión de Formularios**: Recopila datos de contacto de clientes interesados.

3. **Agendamiento de Citas**: Puedes AGENDAR AUTOMÁTICAMENTE visitas a propiedades usando la función "agendar_cita".

FLUJO DE AGENDAMIENTO DE CITAS:
1. Cuando un cliente exprese interés en visitar una propiedad, pregunta:
   - Nombre completo
   - Número de teléfono (si no está en el contexto)
   - Fecha preferida (formato: DD/MM/YYYY)
   - Hora preferida (formato: HH:MM)
   - Propiedad de interés

2. Una vez tengas TODOS los datos, confirma con el cliente:
   "¿Confirmas que deseas agendar la visita para el [fecha] a las [hora]?"

3. Si el cliente confirma, USA LA FUNCIÓN "agendar_cita" inmediatamente.

4. Después de agendar, informa al cliente:
   - Confirmación de fecha y hora
   - Ubicación de la propiedad
   - Recordatorio de que recibirá notificaciones

INSTRUCCIONES IMPORTANTES:
- NO digas que "vas a agendar" o que "contactarás a alguien"
- USA LA FUNCIÓN directamente cuando tengas confirmación
- Sé proactivo en solicitar los datos faltantes
- Confirma ANTES de agendar

FORMATO DE FECHAS:
- Acepta formatos como: "mañana", "próximo lunes", "15 de noviembre"
- Convierte a formato YYYY-MM-DD internamente
- Para horas, acepta formato 12h (3 PM) y convierte a 24h (15:00)

EJEMPLO DE CONVERSACIÓN:
Cliente: "Me interesa visitar el terreno en Zapopan"
Tú: "¡Excelente! Me gustaría agendar una visita. ¿Cuál es tu nombre completo?"
Cliente: "José Alfredo"
Tú: "Perfecto José. ¿Qué día te gustaría visitarlo?"
Cliente: "El viernes a las 3 de la tarde"
Tú: "Entendido. ¿Me confirmas tu teléfono para enviarte recordatorios?"
Cliente: "+52 333 123 4567"
Tú: "¿Confirmas que deseas agendar la visita al terreno en Zapopan para el viernes 15 de noviembre a las 15:00?"
Cliente: "Sí, confirmo"
Tú: [USA agendar_cita AQUÍ] → "¡Listo! Tu cita está agendada para el viernes 15 de noviembre a las 3:00 PM. Te enviaremos un recordatorio 24 horas antes. Nos vemos en [ubicación del terreno]. ¿Necesitas algo más?"
`;
```

---

## 📊 Flujo Completo

```
Cliente en WhatsApp
       ↓
"Quiero visitar el terreno"
       ↓
Claude detecta intención
       ↓
Solicita: nombre, fecha, hora, teléfono
       ↓
Cliente proporciona datos
       ↓
Claude pide confirmación
       ↓
Cliente confirma: "Sí"
       ↓
Claude ejecuta tool "agendar_cita"
       ↓
Se crea evento en Google Calendar
       ↓
Se guarda en Google Sheets
       ↓
Claude informa al cliente: "✅ Cita agendada"
       ↓
Cliente recibe recordatorios automáticos
```

---

## 🧪 Prueba

**Cliente:** "Hola, me interesa el terreno en Zapopan"  
**Bot:** "¡Hola! ¿Te gustaría agendar una visita? ¿Cuál es tu nombre?"  
**Cliente:** "Juan Pérez"  
**Bot:** "Perfecto Juan. ¿Qué día prefieres visitarlo?"  
**Cliente:** "El lunes a las 10 AM"  
**Bot:** "¿Confirmas agendar para el lunes 13 de nov a las 10:00?"  
**Cliente:** "Sí"  
**Bot:** ✅ **[CREA LA CITA]** "¡Listo! Tu cita está agendada. Te esperamos el lunes a las 10:00 en [dirección]"

---

## ⚙️ Variables de Entorno Necesarias

Ya las tienes configuradas:
- ✅ `GOOGLE_CALENDAR_ID=primary`
- ✅ `GOOGLE_CREDENTIALS` (con permisos de Calendar)

---

## 💡 Mejoras Opcionales

1. **Verificar disponibilidad real** antes de confirmar
2. **Enviar mensaje de WhatsApp** adicional con resumen
3. **Integrar con CRM** externo
4. **Permitir reagendar/cancelar** citas por WhatsApp

---

## 🚀 ¿Quieres que implemente esto?

Puedo agregarlo al código ahora mismo. Solo dime:
- ¿Implementamos Tool Use de Claude?
- ¿Alguna personalización específica?
