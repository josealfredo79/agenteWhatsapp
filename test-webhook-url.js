#!/usr/bin/env node

/**
 * Script de prueba para verificar la construcción de la URL del webhook
 * Este script simula cómo server.js detecta y construye la URL pública
 */

console.log('🔍 Test de Detección de URL del Webhook\n');

// Simular diferentes escenarios
const scenarios = [
  {
    name: 'Railway con RAILWAY_PUBLIC_DOMAIN',
    env: {
      RAILWAY_PUBLIC_DOMAIN: 'agentewhatsapp-production.up.railway.app',
      PORT: '3000'
    }
  },
  {
    name: 'Railway con RAILWAY_STATIC_URL',
    env: {
      RAILWAY_STATIC_URL: 'https://agentewhatsapp-production.up.railway.app',
      PORT: '3000'
    }
  },
  {
    name: 'Desarrollo Local',
    env: {
      PORT: '3000'
    }
  },
  {
    name: 'Desarrollo Local (puerto custom)',
    env: {
      PORT: '8080'
    }
  }
];

const getPublicURL = (env) => {
  const PORT = env.PORT || 3000;
  
  if (env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${env.RAILWAY_PUBLIC_DOMAIN}`;
  }
  if (env.RAILWAY_STATIC_URL) {
    return env.RAILWAY_STATIC_URL;
  }
  return `http://localhost:${PORT}`;
};

scenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}`);
  console.log('─'.repeat(50));
  
  const publicURL = getPublicURL(scenario.env);
  const webhookURL = `${publicURL}/webhook/whatsapp`;
  
  console.log(`   URL Pública: ${publicURL}`);
  console.log(`   Webhook URL: ${webhookURL}`);
  
  // Validaciones
  const validations = [];
  if (webhookURL.startsWith('https://') || webhookURL.startsWith('http://')) {
    validations.push('✅ Protocolo válido');
  } else {
    validations.push('❌ Protocolo inválido');
  }
  
  if (webhookURL.includes('/webhook/whatsapp')) {
    validations.push('✅ Ruta correcta');
  } else {
    validations.push('❌ Ruta incorrecta');
  }
  
  console.log(`   Validación: ${validations.join(', ')}`);
});

console.log('\n' + '═'.repeat(50));
console.log('✅ Test completado\n');
console.log('📝 Notas:');
console.log('   - Railway automáticamente proporciona RAILWAY_PUBLIC_DOMAIN');
console.log('   - Esta URL es única para cada proyecto');
console.log('   - La URL es permanente y no cambia');
console.log('\n💡 Para configurar el webhook en Twilio:');
console.log('   1. Obtén tu URL de Railway (Settings > Domains)');
console.log('   2. Agrega /webhook/whatsapp al final');
console.log('   3. Pégala en Twilio Console (When a message comes in)');
console.log('');
