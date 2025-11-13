#!/usr/bin/env node

/**
 * Script de prueba para agendar una cita de prueba en Google Calendar
 * Simula el proceso completo de agendamiento
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';
import { readFileSync } from 'fs';

dotenv.config();

console.log('\n🧪 PRUEBA: Agendar Cita en Google Calendar\n');
console.log('='.repeat(60));

// Inicializar Google Calendar API
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
  
  console.log('\n✅ Google Calendar API inicializada');
  console.log(`   Service Account: ${credentials.client_email}`);
} catch (error) {
  console.error('❌ Error inicializando API:', error.message);
  process.exit(1);
}

// Datos de prueba del cliente
const clientePrueba = {
  nombre: 'José Alfredo (PRUEBA)',
  email: 'tecnologicotlaxiaco@gmail.com', // Usamos tu email para que recibas la invitación
  telefono: '+52 333 123 4567',
  propiedad: 'Terreno Lote 5 - Zona Norte',
  ubicacion: 'Av. Principal #123, Guadalajara, Jalisco'
};

// Crear fechas para mañana a las 10:00 AM
const mañana = new Date();
mañana.setDate(mañana.getDate() + 1);
mañana.setHours(10, 0, 0, 0);

const fechaInicio = new Date(mañana);
const fechaFin = new Date(mañana.getTime() + 60 * 60 * 1000); // +1 hora

console.log('\n📋 DATOS DE LA CITA DE PRUEBA:\n');
console.log(`   Cliente: ${clientePrueba.nombre}`);
console.log(`   Email: ${clientePrueba.email}`);
console.log(`   Teléfono: ${clientePrueba.telefono}`);
console.log(`   Propiedad: ${clientePrueba.propiedad}`);
console.log(`   Ubicación: ${clientePrueba.ubicacion}`);
console.log(`   Fecha: ${fechaInicio.toLocaleDateString('es-MX')}`);
console.log(`   Hora: ${fechaInicio.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`);
console.log(`   Duración: 1 hora`);

// Obtener Calendar ID de la variable de entorno
const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
console.log(`\n📅 Calendar ID: ${calendarId}`);

// Validar email con regex estricto
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const asistentes = [];

if (clientePrueba.email && emailRegex.test(clientePrueba.email)) {
  asistentes.push({
    email: clientePrueba.email,
    responseStatus: 'needsAction'
  });
  console.log(`✅ Email validado: ${clientePrueba.email}`);
} else {
  console.warn(`⚠️  Email inválido: ${clientePrueba.email}`);
}

// Crear evento
const evento = {
  summary: `[PRUEBA] Visita: ${clientePrueba.propiedad}`,
  description: `**ESTO ES UNA PRUEBA - PUEDES ELIMINAR ESTE EVENTO**

Cliente: ${clientePrueba.nombre}
Email: ${clientePrueba.email}
Teléfono: ${clientePrueba.telefono}

Propiedad de interés: ${clientePrueba.propiedad}

Notas: Esta es una cita de prueba creada automáticamente para verificar que el sistema funciona correctamente.`,
  location: clientePrueba.ubicacion,
  start: {
    dateTime: fechaInicio.toISOString(),
    timeZone: 'America/Mexico_City',
  },
  end: {
    dateTime: fechaFin.toISOString(),
    timeZone: 'America/Mexico_City',
  },
  attendees: asistentes,
  reminders: {
    useDefault: false,
    overrides: [
      { method: 'email', minutes: 24 * 60 }, // 24 horas antes
      { method: 'popup', minutes: 30 },       // 30 minutos antes
    ],
  },
  colorId: '11', // Rojo para identificar fácilmente
  visibility: 'default',
  transparency: 'opaque',
  status: 'confirmed'
};

console.log('\n🔄 Creando evento en Google Calendar...\n');

try {
  const response = await calendar.events.insert({
    calendarId: calendarId,
    resource: evento,
    sendUpdates: 'all' // Enviar invitaciones a todos los asistentes
  });
  
  console.log('✅ ¡CITA AGENDADA EXITOSAMENTE!\n');
  console.log('📊 DETALLES DEL EVENTO:\n');
  console.log(`   Event ID: ${response.data.id}`);
  console.log(`   Status: ${response.data.status}`);
  console.log(`   Link: ${response.data.htmlLink}`);
  console.log(`   Creado: ${new Date(response.data.created).toLocaleString('es-MX')}`);
  
  if (asistentes.length > 0) {
    console.log(`\n📧 Invitación enviada a: ${clientePrueba.email}`);
    console.log(`   Revisa tu bandeja de entrada o spam`);
  }
  
  console.log('\n🎯 VERIFICA EN GOOGLE CALENDAR:');
  console.log(`   1. Abre: https://calendar.google.com/`);
  console.log(`   2. Busca el evento: "[PRUEBA] Visita: ${clientePrueba.propiedad}"`);
  console.log(`   3. Debería aparecer en color ROJO`);
  console.log(`   4. Para mañana a las 10:00 AM`);
  
  console.log('\n🗑️  ELIMINAR ESTE EVENTO DE PRUEBA:');
  console.log(`   Opción 1: Abre el link: ${response.data.htmlLink}`);
  console.log(`   Opción 2: Búscalo en tu calendario y elimínalo`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ PRUEBA COMPLETADA EXITOSAMENTE\n');
  
  console.log('💡 CONCLUSIÓN:');
  console.log(`   ✅ Calendar ID correcto: ${calendarId}`);
  console.log(`   ✅ Evento creado en tu calendario`);
  console.log(`   ✅ Invitación enviada por email`);
  console.log(`   ✅ Sistema funcionando correctamente`);
  console.log('\n🚀 Railway está listo para recibir citas reales por WhatsApp\n');
  
} catch (error) {
  console.error('\n❌ ERROR AL CREAR EVENTO:\n');
  console.error(`   Mensaje: ${error.message}`);
  
  if (error.code === 404) {
    console.error('\n💡 SOLUCIÓN:');
    console.error(`   El calendario "${calendarId}" no fue encontrado o no está compartido.`);
    console.error('\n   Pasos para compartir:');
    console.error('   1. Abre https://calendar.google.com/');
    console.error(`   2. Inicia sesión con: ${calendarId}`);
    console.error('   3. Configuración del calendario → Compartir');
    console.error(`   4. Agrega: ${credentials.client_email}`);
    console.error('   5. Permisos: "Hacer cambios en eventos"');
  } else if (error.code === 403) {
    console.error('\n💡 SOLUCIÓN:');
    console.error('   El Service Account no tiene permisos en este calendario.');
    console.error(`   Comparte el calendario con: ${credentials.client_email}`);
  } else {
    console.error('\n   Detalles completos:', error);
  }
  
  process.exit(1);
}
