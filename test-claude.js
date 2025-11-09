import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

console.log('🧪 Probando conexión con Claude AI...\n');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function testClaude() {
  try {
    console.log('📡 Enviando mensaje de prueba a Claude...');
    
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Responde solo con: "Conexión exitosa"'
      }]
    });
    
    console.log('✅ Respuesta de Claude:', response.content[0].text);
    console.log('\n✅ Conexión con Claude AI funcionando correctamente\n');
    
  } catch (error) {
    console.error('❌ Error al conectar con Claude:');
    console.error('   Tipo:', error.constructor.name);
    console.error('   Mensaje:', error.message);
    
    if (error.status) {
      console.error('   Status HTTP:', error.status);
    }
    
    console.log('\n💡 Verifica que ANTHROPIC_API_KEY esté correctamente configurada en .env\n');
  }
}

testClaude();
