import { google } from 'googleapis';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

async function testAgendarCita() {
  console.log('🧪 Probando agendamiento de cita en Google Calendar...\n');
  
  try {
    // Cargar credenciales
    let credentials;
    if (process.env.GOOGLE_CREDENTIALS) {
      credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_FILE) {
      credentials = JSON.parse(readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_FILE));
    } else {
      throw new Error('No se encontraron credenciales');
    }
    
    console.log('✅ Credenciales cargadas');
    console.log(`   Service Account: ${credentials.client_email}\n`);
    
    // Configurar Google Calendar
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar']
    });
    
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Datos de prueba para la cita
    const now = new Date();
    const mañana = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const fechaInicio = new Date(mañana.setHours(15, 0, 0, 0)); // Mañana a las 3 PM
    const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000); // +1 hora
    
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'tecnologicotlaxiaco@gmail.com';
    
    console.log('📋 Datos de la cita de prueba:');
    console.log(`   Cliente: José Alfredo (PRUEBA)`);
    console.log(`   Propiedad: Terreno en Zapopan`);
    console.log(`   Fecha: ${fechaInicio.toLocaleDateString('es-MX')}`);
    console.log(`   Hora: ${fechaInicio.toLocaleTimeString('es-MX')}`);
    console.log(`   Calendar ID: ${calendarId}\n`);
    
    // Crear evento
    const event = {
      summary: '🧪 TEST - Visita: Terreno en Zapopan',
      description: `Cliente: José Alfredo (PRUEBA)
Teléfono: +52 333 123 4567

Notas: Esta es una cita de prueba del sistema. Puedes eliminarla.`,
      location: 'Zapopan, Jalisco',
      start: {
        dateTime: fechaInicio.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: fechaFin.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      colorId: '11', // Rojo para que sea fácil de identificar
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };
    
    console.log('📅 Creando evento en Google Calendar...');
    
    const response = await calendar.events.insert({
      calendarId: calendarId,
      resource: event,
    });
    
    console.log('\n✅ ¡EVENTO CREADO EXITOSAMENTE!\n');
    console.log('📊 Detalles del evento:');
    console.log(`   Event ID: ${response.data.id}`);
    console.log(`   Status: ${response.data.status}`);
    console.log(`   Título: ${response.data.summary}`);
    console.log(`   Inicio: ${response.data.start.dateTime}`);
    console.log(`   Fin: ${response.data.end.dateTime}`);
    console.log(`   Link: ${response.data.htmlLink}\n`);
    
    console.log('🔍 VERIFICACIÓN:');
    console.log(`   1. Abre este link: ${response.data.htmlLink}`);
    console.log(`   2. O ve a tu Google Calendar: https://calendar.google.com`);
    console.log(`   3. Busca el evento "🧪 TEST - Visita: Terreno en Zapopan"`);
    console.log(`   4. Fecha: Mañana ${fechaInicio.toLocaleDateString('es-MX')} a las 3:00 PM\n`);
    
    // Verificar que el evento existe
    console.log('🔎 Verificando que el evento existe...');
    const getEvent = await calendar.events.get({
      calendarId: calendarId,
      eventId: response.data.id,
    });
    
    console.log(`✅ Evento verificado: ${getEvent.data.summary}\n`);
    
    // Preguntar si eliminar
    console.log('💡 NOTA: Este es un evento de prueba.');
    console.log('   Puedes eliminarlo manualmente desde Google Calendar');
    console.log(`   o guardarlo como recordatorio de que el sistema funciona.\n`);
    
    console.log('🎉 PRUEBA EXITOSA - El sistema SÍ guarda eventos en tu calendario!\n');
    
    return response.data;
    
  } catch (error) {
    console.error('\n❌ ERROR en la prueba:', error.message);
    
    if (error.code === 403) {
      console.error('\n⛔ ERROR DE PERMISOS');
      console.error('   El Service Account no tiene permisos en el calendario.');
      console.error('\n💡 SOLUCIÓN:');
      console.error('   1. Ve a Google Calendar > Configuración');
      console.error('   2. Busca tu calendario');
      console.error('   3. Compartir con: whatsapp-agent@gen-lang-client-0726897121.iam.gserviceaccount.com');
      console.error('   4. Permisos: "Hacer cambios en eventos"');
    } else if (error.code === 404) {
      console.error('\n⛔ CALENDARIO NO ENCONTRADO');
      console.error(`   El calendario "${process.env.GOOGLE_CALENDAR_ID}" no existe o no es accesible.`);
      console.error('\n💡 Verifica que GOOGLE_CALENDAR_ID sea correcto en Railway');
    } else {
      console.error('\nDetalles:', error);
    }
    
    process.exit(1);
  }
}

testAgendarCita();
