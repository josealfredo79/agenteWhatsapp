import { google } from 'googleapis';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

async function verificarPermisos() {
  console.log('🔍 Verificando permisos del calendario...\n');
  
  try {
    let credentials;
    if (process.env.GOOGLE_SERVICE_ACCOUNT_FILE) {
      credentials = JSON.parse(readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_FILE));
    }
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar']
    });
    
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = 'tecnologicotlaxiaco@gmail.com';
    
    console.log('📋 Verificando calendario:', calendarId, '\n');
    
    // Verificar si podemos acceder al calendario
    try {
      const calInfo = await calendar.calendars.get({
        calendarId: calendarId
      });
      
      console.log('✅ Calendario accesible:');
      console.log('   Nombre:', calInfo.data.summary);
      console.log('   Timezone:', calInfo.data.timeZone);
      console.log('');
    } catch (error) {
      console.error('❌ No se puede acceder al calendario:', error.message);
      if (error.code === 404) {
        console.error('\n⚠️  El calendario no existe o el Service Account no tiene acceso\n');
      }
    }
    
    // Verificar ACL (permisos)
    console.log('🔐 Verificando permisos (ACL)...\n');
    try {
      const acl = await calendar.acl.list({
        calendarId: calendarId
      });
      
      console.log('📜 Reglas de acceso configuradas:');
      acl.data.items.forEach((rule, index) => {
        console.log(`\n   ${index + 1}. ${rule.scope.type}: ${rule.scope.value || 'default'}`);
        console.log(`      Rol: ${rule.role}`);
      });
      
      // Buscar regla del Service Account
      const serviceAccountEmail = credentials.client_email;
      const serviceAccountRule = acl.data.items.find(
        rule => rule.scope.value === serviceAccountEmail
      );
      
      if (serviceAccountRule) {
        console.log(`\n✅ Service Account encontrado en ACL`);
        console.log(`   Email: ${serviceAccountEmail}`);
        console.log(`   Rol: ${serviceAccountRule.role}`);
        
        if (serviceAccountRule.role === 'writer' || serviceAccountRule.role === 'owner') {
          console.log('   ✅ Permisos suficientes para crear eventos\n');
        } else {
          console.log('   ⚠️  Permisos insuficientes. Se requiere "writer" o "owner"\n');
        }
      } else {
        console.log(`\n❌ Service Account NO encontrado en ACL`);
        console.log(`   ${serviceAccountEmail} no tiene acceso al calendario\n`);
        console.log('💡 SOLUCIÓN:');
        console.log('   1. Ve a Google Calendar > Configuración');
        console.log('   2. Selecciona tu calendario');
        console.log('   3. "Compartir con personas específicas"');
        console.log(`   4. Agregar: ${serviceAccountEmail}`);
        console.log('   5. Permisos: "Hacer cambios en eventos" (writer)');
      }
      
    } catch (error) {
      console.error('❌ Error verificando ACL:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

verificarPermisos();
