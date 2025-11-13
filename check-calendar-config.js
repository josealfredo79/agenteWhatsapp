// Script para verificar configuración de Google Calendar
import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 Verificando configuración de Google Calendar\n');
console.log('=' .repeat(60));

// Variables de Google
const googleVars = {
  'GOOGLE_CREDENTIALS': process.env.GOOGLE_CREDENTIALS,
  'GOOGLE_DOCS_ID': process.env.GOOGLE_DOCS_ID,
  'GOOGLE_SHEET_ID': process.env.GOOGLE_SHEET_ID,
  'GOOGLE_CALENDAR_ID': process.env.GOOGLE_CALENDAR_ID
};

console.log('\n📋 Variables de Google:\n');
Object.entries(googleVars).forEach(([key, value]) => {
  if (value) {
    if (key === 'GOOGLE_CREDENTIALS') {
      console.log(`✅ ${key}: Configurado (${value.length} caracteres)`);
    } else {
      console.log(`✅ ${key}: ${value}`);
    }
  } else {
    console.log(`❌ ${key}: NO CONFIGURADO`);
  }
});

console.log('\n' + '='.repeat(60));

// Mostrar instrucciones si falta GOOGLE_CALENDAR_ID
if (!process.env.GOOGLE_CALENDAR_ID) {
  console.log('\n⚠️  GOOGLE_CALENDAR_ID no está configurado\n');
  console.log('📝 Opciones:');
  console.log('   1. Usar "primary" (calendario principal de la cuenta de servicio)');
  console.log('   2. Usar email del calendario compartido contigo');
  console.log('   3. Usar ID específico del calendario\n');
  console.log('💡 Para Railway, configura esta variable en:');
  console.log('   Dashboard > Variables > New Variable');
  console.log('   Name: GOOGLE_CALENDAR_ID');
  console.log('   Value: primary  (o el email del calendario)\n');
} else {
  console.log(`\n✅ GOOGLE_CALENDAR_ID está configurado: ${process.env.GOOGLE_CALENDAR_ID}\n`);
}

console.log('='.repeat(60) + '\n');
