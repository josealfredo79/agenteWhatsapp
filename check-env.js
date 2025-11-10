// Script de diagnóstico para verificar variables de entorno
console.log('🔍 DIAGNÓSTICO DE VARIABLES DE ENTORNO\n');

const requiredVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_NUMBER',
  'ANTHROPIC_API_KEY',
  'GOOGLE_CREDENTIALS',
  'GOOGLE_DOCS_ID',
  'GOOGLE_SHEET_ID',
  'GOOGLE_CALENDAR_ID',
  'NODE_ENV',
  'PORT'
];

console.log('Variables requeridas:\n');

requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  const preview = value ? (value.length > 50 ? `${value.substring(0, 50)}...` : value) : 'NO DEFINIDA';
  console.log(`${status} ${varName}: ${preview}`);
});

console.log('\n📊 Resumen:');
const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.log(`❌ Faltan ${missing.length} variables:`, missing.join(', '));
  process.exit(1);
} else {
  console.log('✅ Todas las variables están configuradas');
  process.exit(0);
}
