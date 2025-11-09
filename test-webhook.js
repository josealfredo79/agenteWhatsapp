/**
 * Script de prueba para simular webhooks de Twilio
 * Permite probar el sistema sin necesidad de Twilio real
 */

import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:3000';

// Mensaje de prueba
const testMessage = {
  From: 'whatsapp:+525512345678',
  Body: 'Hola, me interesa información sobre terrenos',
  MessageSid: `TEST_${Date.now()}`,
  AccountSid: 'TEST_ACCOUNT',
  MessagingServiceSid: 'TEST_SERVICE',
  NumMedia: '0',
  ProfileName: 'Cliente de Prueba',
  SmsMessageSid: `TEST_${Date.now()}`,
  SmsStatus: 'received',
  To: 'whatsapp:+12173874424',
};

async function testWebhook() {
  console.log('🧪 Iniciando prueba de webhook...\n');
  console.log('📱 Simulando mensaje de:', testMessage.From);
  console.log('💬 Mensaje:', testMessage.Body);
  console.log('');

  try {
    const response = await fetch(`${SERVER_URL}/webhook/whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(testMessage).toString(),
    });

    console.log('📡 Respuesta del servidor:', response.status, response.statusText);
    
    if (response.ok) {
      const text = await response.text();
      console.log('✅ Webhook procesado correctamente');
      console.log('📄 Respuesta:', text);
    } else {
      console.error('❌ Error en el webhook');
    }
  } catch (error) {
    console.error('❌ Error al conectar con el servidor:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo:');
    console.log('   npm start');
  }
}

async function testSaveToSheet() {
  console.log('\n\n🧪 Probando guardado en Google Sheets...\n');

  const testData = {
    nombre: 'Juan Pérez',
    telefono: '+525512345678',
    email: 'juan.perez@example.com',
    interes: 'Terreno Lote 5 - Zona Norte',
    notas: 'Cliente interesado en visita el fin de semana',
  };

  try {
    const response = await fetch(`${SERVER_URL}/api/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Datos guardados correctamente en Google Sheets');
      console.log('📊 Datos:', testData);
    } else {
      console.log('⚠️  Google Sheets no configurado o error:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testCreateEvent() {
  console.log('\n\n🧪 Probando creación de evento en Google Calendar...\n');

  const eventData = {
    titulo: 'Visita a Terreno - Cliente de Prueba',
    descripcion: 'Visita guiada al terreno Lote 5, Zona Norte',
    ubicacion: 'Calle Principal #123, Zona Norte',
    fechaInicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
    fechaFin: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hora después
    asistentes: [{ email: 'cliente@example.com' }],
  };

  try {
    const response = await fetch(`${SERVER_URL}/api/agendar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Evento creado correctamente en Google Calendar');
      console.log('🔗 Link del evento:', result.event?.htmlLink);
    } else {
      console.log('⚠️  Google Calendar no configurado o error:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar todas las pruebas
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SUITE DE PRUEBAS - Agente WhatsApp Terrenos');
  console.log('═══════════════════════════════════════════════════════════\n');

  await testWebhook();
  await testSaveToSheet();
  await testCreateEvent();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  PRUEBAS COMPLETADAS');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('💡 Próximos pasos:');
  console.log('   1. Abre http://localhost:3000 para ver la interfaz');
  console.log('   2. Configura el webhook en Twilio: http://tu-dominio/webhook/whatsapp');
  console.log('   3. Configura Google Service Account para Sheets y Calendar');
  console.log('');
}

runAllTests();
