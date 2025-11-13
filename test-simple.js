#!/usr/bin/env node

/**
 * Prueba de cita SIN asistentes (solución para Service Accounts)
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';
import { readFileSync } from 'fs';

dotenv.config();

console.log('\n🧪 PRUEBA: Agendar Cita SIN Asistentes\n');
console.log('='.repeat(60));

let calendar, credentials;

try {
  credentials = JSON.parse(readFileSync('google-credentials.json'));
  const googleAuth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar']
  });
  calendar = google.calendar({ version: 'v3', auth: googleAuth });
  console.log('✅ API inicializada');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

const mañana = new Date();
mañana.setDate(mañana.getDate() + 1);
mañana.setHours(10, 0, 0, 0);
const fechaFin = new Date(mañana.getTime() + 60 * 60 * 1000);

const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
console.log(`📅 Calendar ID: ${calendarId}`);

const evento = {
  summary: '[PRUEBA] Visita: Terreno Lote 5',
  description: `Cliente: José Alfredo (PRUEBA)
Email: tecnologicotlaxiaco@gmail.com
Teléfono: +52 333 123 4567

Propiedad: Terreno Lote 5 - Zona Norte
Ubicación: Av. Principal #123, Guadalajara

⚠️ Esta es una cita de prueba - Puedes eliminarla`,
  location: 'Av. Principal #123, Guadalajara, Jalisco',
  start: {
    dateTime: mañana.toISOString(),
    timeZone: 'America/Mexico_City',
  },
  end: {
    dateTime: fechaFin.toISOString(),
    timeZone: 'America/Mexico_City',
  },
  attendees: [], // SIN asistentes
  reminders: {
    useDefault: false,
    overrides: [
      { method: 'popup', minutes: 30 },
    ],
  },
  colorId: '11',
  status: 'confirmed'
};

console.log('\n📋 Creando evento...\n');

try {
  const response = await calendar.events.insert({
    calendarId: calendarId,
    resource: evento,
    sendUpdates: 'none'
  });
  
  console.log('✅ ¡EVENTO CREADO EXITOSAMENTE!\n');
  console.log(`   Event ID: ${response.data.id}`);
  console.log(`   Link: ${response.data.htmlLink}`);
  console.log(`   Fecha: ${mañana.toLocaleDateString('es-MX')} a las 10:00 AM`);
  
  console.log('\n🎯 VERIFICA EN GOOGLE CALENDAR:');
  console.log('   1. Abre: https://calendar.google.com/');
  console.log('   2. Busca el evento (color rojo)');
  console.log('   3. El email del cliente está en la descripción');
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ SISTEMA FUNCIONANDO CORRECTAMENTE\n');
  
  console.log('📝 NOTA IMPORTANTE:');
  console.log('   Los eventos se crean sin invitaciones automáticas');
  console.log('   El email del cliente aparece en la descripción');
  console.log('   Puedes invitar manualmente desde Google Calendar\n');
  
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  if (error.response?.data) {
    console.error('Detalles:', JSON.stringify(error.response.data, null, 2));
  }
  process.exit(1);
}
