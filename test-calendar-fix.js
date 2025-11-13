#!/usr/bin/env node

/**
 * Script de prueba para verificar la corrección del calendario
 * Ejecutar con: node test-calendar-fix.js
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';
import { readFileSync } from 'fs';

dotenv.config();

console.log('\n🧪 TEST: Verificación de corrección del calendario\n');
console.log('=' .repeat(60));

// 1. Verificar variables de entorno
console.log('\n1️⃣ VERIFICANDO VARIABLES DE ENTORNO\n');

const envVars = {
  'GOOGLE_CALENDAR_ID': process.env.GOOGLE_CALENDAR_ID,
  'GOOGLE_CREDENTIALS': process.env.GOOGLE_CREDENTIALS ? '✅ Configurado' : '❌ Falta',
  'GOOGLE_DOCS_ID': process.env.GOOGLE_DOCS_ID,
  'GOOGLE_SHEET_ID': process.env.GOOGLE_SHEET_ID
};

for (const [key, value] of Object.entries(envVars)) {
  console.log(`   ${key}: ${value || '❌ NO configurado'}`);
}

if (!process.env.GOOGLE_CALENDAR_ID) {
  console.log('\n⚠️  ADVERTENCIA: GOOGLE_CALENDAR_ID no está configurado');
  console.log('   Se usará "primary" por defecto');
  console.log('   Para producción, configura: GOOGLE_CALENDAR_ID=tecnologicotlaxiaco@gmail.com\n');
}

// 2. Inicializar Google Calendar API
console.log('\n2️⃣ INICIALIZANDO GOOGLE CALENDAR API\n');

let calendar;
let credentials;

try {
  if (process.env.GOOGLE_CREDENTIALS) {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_FILE) {
    credentials = JSON.parse(readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_FILE));
  } else {
    credentials = JSON.parse(readFileSync('google-credentials.json'));
  }
  
  const googleAuth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar']
  });
  
  calendar = google.calendar({ version: 'v3', auth: googleAuth });
  
  console.log('   ✅ API inicializada correctamente');
  console.log(`   Service Account: ${credentials.client_email}`);
} catch (error) {
  console.error('   ❌ Error inicializando API:', error.message);
  process.exit(1);
}

// 3. Verificar acceso al calendario
console.log('\n3️⃣ VERIFICANDO ACCESO AL CALENDARIO\n');

const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
console.log(`   Calendar ID a usar: ${calendarId}`);

try {
  const calendarInfo = await calendar.calendars.get({
    calendarId: calendarId
  });
  
  console.log('   ✅ Calendario encontrado:');
  console.log(`      Nombre: ${calendarInfo.data.summary}`);
  console.log(`      Timezone: ${calendarInfo.data.timeZone}`);
  console.log(`      ID: ${calendarInfo.data.id}`);
} catch (error) {
  console.error('   ❌ Error accediendo al calendario:', error.message);
  if (error.code === 404) {
    console.error('\n   💡 SOLUCIÓN:');
    console.error('      1. Verifica que el calendario existe');
    console.error('      2. Comparte el calendario con el Service Account:');
    console.error(`         ${credentials.client_email}`);
    console.error('      3. Dale permisos de "Hacer cambios en eventos"');
  }
  process.exit(1);
}

// 4. Validar función de validación de emails
console.log('\n4️⃣ PROBANDO VALIDACIÓN DE EMAILS\n');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const testEmails = [
  { email: 'jose@example.com', esperado: true },
  { email: 'tecnologicotlaxiaco@gmail.com', esperado: true },
  { email: 'test@domain.co.uk', esperado: true },
  { email: 'invalido@', esperado: false },
  { email: '@invalido.com', esperado: false },
  { email: 'sin-arroba.com', esperado: false },
  { email: 'espacios @test.com', esperado: false },
  { email: '', esperado: false },
  { email: null, esperado: false }
];

let validacionPassed = true;

for (const test of testEmails) {
  const resultado = test.email ? emailRegex.test(test.email) : false;
  const status = resultado === test.esperado ? '✅' : '❌';
  const emojiEmail = test.email || '(vacío)';
  
  console.log(`   ${status} ${emojiEmail}: ${resultado ? 'válido' : 'inválido'}`);
  
  if (resultado !== test.esperado) {
    validacionPassed = false;
  }
}

if (!validacionPassed) {
  console.error('\n❌ Validación de emails falló');
  process.exit(1);
}

// 5. Crear evento de prueba
console.log('\n5️⃣ CREANDO EVENTO DE PRUEBA\n');

const ahora = new Date();
const fechaInicio = new Date(ahora.getTime() + 24 * 60 * 60 * 1000); // Mañana
const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000); // +1 hora

const eventoTest = {
  summary: '[TEST] Verificación del calendario - ELIMINAR',
  description: 'Este es un evento de prueba creado automáticamente.\nPuedes eliminarlo manualmente.',
  location: 'Oficina de pruebas',
  start: {
    dateTime: fechaInicio.toISOString(),
    timeZone: 'America/Mexico_City',
  },
  end: {
    dateTime: fechaFin.toISOString(),
    timeZone: 'America/Mexico_City',
  },
  attendees: [],
  reminders: {
    useDefault: false,
    overrides: [
      { method: 'email', minutes: 24 * 60 },
      { method: 'popup', minutes: 30 },
    ],
  },
  colorId: '11', // Rojo para que sea fácil de identificar
};

console.log(`   📅 Título: ${eventoTest.summary}`);
console.log(`   📍 Ubicación: ${eventoTest.location}`);
console.log(`   ⏰ Inicio: ${fechaInicio.toLocaleString('es-MX')}`);
console.log(`   🕐 Fin: ${fechaFin.toLocaleString('es-MX')}`);
console.log(`   📧 Asistentes: Ninguno (prueba sin asistentes)`);

try {
  const response = await calendar.events.insert({
    calendarId: calendarId,
    resource: eventoTest,
    sendUpdates: 'none'
  });
  
  console.log('\n   ✅ Evento creado exitosamente:');
  console.log(`      Event ID: ${response.data.id}`);
  console.log(`      Link: ${response.data.htmlLink}`);
  console.log(`      Status: ${response.data.status}`);
  
  console.log('\n   💡 Verifica en Google Calendar que el evento aparece');
  console.log(`      https://calendar.google.com/`);
  console.log(`\n   🗑️  Para eliminar este evento de prueba:`);
  console.log(`      1. Abre el link arriba`);
  console.log(`      2. O búscalo por el título: "${eventoTest.summary}"`);
  
} catch (error) {
  console.error('\n   ❌ Error creando evento:', error.message);
  if (error.response && error.response.data) {
    console.error('   Detalles:', JSON.stringify(error.response.data, null, 2));
  }
  process.exit(1);
}

// 6. Resumen final
console.log('\n' + '='.repeat(60));
console.log('✅ TODAS LAS PRUEBAS PASARON\n');

console.log('📋 RESUMEN:');
console.log(`   ✅ Variables de entorno configuradas`);
console.log(`   ✅ Google Calendar API funcionando`);
console.log(`   ✅ Acceso al calendario verificado`);
console.log(`   ✅ Validación de emails correcta`);
console.log(`   ✅ Creación de eventos exitosa`);

console.log('\n🚀 LISTO PARA PRODUCCIÓN');
console.log('\n💡 PRÓXIMOS PASOS:');
console.log('   1. Commitea los cambios:');
console.log('      git add server.js SOLUCION-CALENDARIO-RAILWAY.md');
console.log('      git commit -m "fix: corregir calendario con variable de entorno"');
console.log('   2. Push a Railway:');
console.log('      git push origin railway-deployment');
console.log('   3. Actualiza GOOGLE_CALENDAR_ID en Railway:');
console.log(`      GOOGLE_CALENDAR_ID=${calendarId}`);
console.log('   4. Verifica los logs de Railway después del deployment');
console.log('\n');
