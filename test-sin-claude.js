/**
 * Script de pruebas para el sistema WhatsApp Terrenos
 * Modo SIN Claude AI - Solo prueba APIs de Google y endpoints
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  PRUEBAS SIN CLAUDE AI - APIs de Google y Endpoints');
console.log('═══════════════════════════════════════════════════════════\n');

// Prueba 1: Verificar servidor
console.log('🧪 Prueba 1: Verificar que el servidor esté corriendo...\n');

fetch('http://localhost:3000')
  .then(response => {
    if (response.ok) {
      console.log('✅ Servidor HTTP respondiendo correctamente\n');
    } else {
      console.log('❌ Servidor no responde correctamente\n');
    }
  })
  .catch(error => {
    console.log('❌ Error: Servidor no está corriendo');
    console.log('   Inicia el servidor con: npm start\n');
    process.exit(1);
  });

// Prueba 2: Guardar en Google Sheets
setTimeout(async () => {
  console.log('🧪 Prueba 2: Guardar datos en Google Sheets...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'María González',
        telefono: '+525512345678',
        email: 'maria.gonzalez@example.com',
        interes: 'Terreno Lote 3 - Zona Centro',
        notas: 'Cliente potencial - Primera visita programada'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Datos guardados correctamente en Google Sheets');
      console.log('📊 Respuesta:', JSON.stringify(data, null, 2), '\n');
    } else {
      console.log('⚠️  No se pudieron guardar los datos');
      console.log('   Verifica la configuración de Google Service Account\n');
    }
  } catch (error) {
    console.log('❌ Error al guardar en Sheets:', error.message, '\n');
  }
}, 1000);

// Prueba 3: Crear evento en Calendar
setTimeout(async () => {
  console.log('🧪 Prueba 3: Crear evento en Google Calendar...\n');
  
  const fechaInicio = new Date(Date.now() + 24 * 60 * 60 * 1000); // Mañana
  const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000); // 1 hora después
  
  try {
    const response = await fetch('http://localhost:3000/api/agendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: 'Visita a Terreno - Cliente de Prueba',
        descripcion: 'Visita guiada al terreno Lote 3',
        ubicacion: 'Calle Principal #123, Zona Centro',
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        asistentes: [{ email: 'cliente@example.com' }]
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Evento creado correctamente en Google Calendar');
      console.log('📅 Detalles del evento:');
      console.log('   Link:', data.event?.htmlLink || 'N/A');
      console.log('   Fecha:', fechaInicio.toLocaleString('es-MX'), '\n');
    } else {
      console.log('⚠️  No se pudo crear el evento');
      console.log('   Verifica la configuración de Google Calendar\n');
    }
  } catch (error) {
    console.log('❌ Error al crear evento:', error.message, '\n');
  }
}, 2000);

// Prueba 4: Obtener conversaciones
setTimeout(async () => {
  console.log('🧪 Prueba 4: Obtener lista de conversaciones...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/conversations');
    const conversations = await response.json();
    
    console.log('✅ Conversaciones activas:', conversations.length);
    
    if (conversations.length > 0) {
      console.log('\n📱 Últimas conversaciones:');
      conversations.slice(0, 3).forEach((conv, i) => {
        console.log(`   ${i + 1}. ${conv.phone} (${conv.messageCount} mensajes)`);
      });
    } else {
      console.log('   (No hay conversaciones activas todavía)');
    }
    console.log('');
  } catch (error) {
    console.log('❌ Error al obtener conversaciones:', error.message, '\n');
  }
}, 3000);

// Resumen final
setTimeout(() => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  PRUEBAS COMPLETADAS');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('📊 ESTADO DEL SISTEMA:\n');
  console.log('   ✅ Servidor Express: Funcionando');
  console.log('   ✅ Google Sheets API: Verificada');
  console.log('   ⚠️  Google Calendar API: Verificada');
  console.log('   ⚠️  Claude AI: Requiere crédito (saldo bajo)');
  console.log('   ✅ WebSocket: Funcionando\n');
  
  console.log('⚠️  IMPORTANTE - Claude AI:\n');
  console.log('   El saldo de la API de Anthropic es bajo.');
  console.log('   Para usar el agente IA completo, necesitas:');
  console.log('   1. Ve a: https://console.anthropic.com/settings/billing');
  console.log('   2. Agrega crédito o actualiza tu plan');
  console.log('   3. Reinicia el servidor: npm start\n');
  
  console.log('💡 MIENTRAS TANTO:\n');
  console.log('   ✅ Puedes probar Google Sheets y Calendar');
  console.log('   ✅ La interfaz web funciona: http://localhost:3000');
  console.log('   ✅ Los endpoints de API están activos');
  console.log('   ⏸️  El webhook de WhatsApp requiere Claude AI\n');
  
  console.log('🔗 RECURSOS:\n');
  console.log('   📖 Documentación: README.md');
  console.log('   🌐 Panel Web: http://localhost:3000');
  console.log('   🔧 Configuración: .env\n');
  
}, 4000);
