import { google } from 'googleapis';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config();

async function testGoogleSheets() {
  console.log('🧪 Probando conexión a Google Sheets...\n');
  
  // Verificar variables
  console.log('📋 Variables de entorno:');
  console.log('GOOGLE_CREDENTIALS:', process.env.GOOGLE_CREDENTIALS ? '✅ Configurado' : '❌ NO configurado');
  console.log('GOOGLE_SERVICE_ACCOUNT_FILE:', process.env.GOOGLE_SERVICE_ACCOUNT_FILE ? '✅ Configurado' : '❌ NO configurado');
  console.log('GOOGLE_SHEET_ID:', process.env.GOOGLE_SHEET_ID ? `✅ ${process.env.GOOGLE_SHEET_ID}` : '❌ NO configurado');
  console.log('GOOGLE_DOCS_ID:', process.env.GOOGLE_DOCS_ID ? `✅ ${process.env.GOOGLE_DOCS_ID}` : '❌ NO configurado');
  console.log('GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID ? `✅ ${process.env.GOOGLE_CALENDAR_ID}` : '❌ NO configurado');
  console.log('');
  
  let credentials;
  
  // Soporte para Railway y local
  if (process.env.GOOGLE_CREDENTIALS) {
    console.log('📄 Usando GOOGLE_CREDENTIALS de variable de entorno...');
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } else if (process.env.GOOGLE_SERVICE_ACCOUNT_FILE) {
    console.log('📄 Usando archivo de credenciales local...');
    credentials = JSON.parse(readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_FILE));
  } else {
    console.error('❌ No se encontraron credenciales de Google');
    console.error('   Configura GOOGLE_CREDENTIALS o GOOGLE_SERVICE_ACCOUNT_FILE');
    process.exit(1);
  }
  
  if (!process.env.GOOGLE_SHEET_ID) {
    console.error('❌ GOOGLE_SHEET_ID no está configurado');
    process.exit(1);
  }
  
  try {
    // Usar credenciales ya parseadas
    console.log('✅ Credenciales parseadas correctamente');
    console.log(`   Service Account: ${credentials.client_email}\n`);
    
    // Configurar auth
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/documents.readonly',
        'https://www.googleapis.com/auth/calendar'
      ]
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Test 1: Leer metadatos del sheet
    console.log('📖 Test 1: Leyendo metadatos del sheet...');
    const metadataResponse = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });
    console.log('✅ Sheet encontrado:', metadataResponse.data.properties.title);
    console.log('   Sheets disponibles:');
    metadataResponse.data.sheets.forEach(sheet => {
      console.log(`   - ${sheet.properties.title}`);
    });
    console.log('');
    
    // Test 2: Leer datos existentes
    console.log('📖 Test 2: Leyendo datos existentes (primeras 5 filas)...');
    try {
      const readResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'A1:F5',
      });
      const rows = readResponse.data.values;
      if (rows && rows.length) {
        console.log(`✅ Se encontraron ${rows.length} filas`);
        rows.forEach((row, index) => {
          console.log(`   Fila ${index + 1}:`, row.join(' | '));
        });
      } else {
        console.log('⚠️  No hay datos en el sheet');
      }
      console.log('');
    } catch (error) {
      console.error('❌ Error leyendo datos:', error.message);
    }
    
    // Test 3: Escribir datos de prueba
    console.log('✍️  Test 3: Escribiendo datos de prueba...');
    const testData = [[
      new Date().toISOString(),
      'TEST - José Prueba',
      '+52 333 123 4567',
      'test@ejemplo.com',
      'Terreno en Zapopan',
      'Prueba automática desde script'
    ]];
    
    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:F',
      valueInputOption: 'USER_ENTERED',
      resource: { values: testData }
    });
    
    console.log('✅ Datos escritos exitosamente');
    console.log(`   Rango actualizado: ${appendResponse.data.updates.updatedRange}`);
    console.log(`   Filas agregadas: ${appendResponse.data.updates.updatedRows}`);
    console.log('');
    
    // Test 4: Verificar que se escribió
    console.log('🔍 Test 4: Verificando última fila escrita...');
    const verifyResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: appendResponse.data.updates.updatedRange,
    });
    
    if (verifyResponse.data.values && verifyResponse.data.values.length > 0) {
      console.log('✅ Datos verificados:', verifyResponse.data.values[0].join(' | '));
    }
    console.log('');
    
    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
    console.log('');
    console.log('📝 IMPORTANTE: Verifica que el Service Account tenga permisos de Editor en tu Google Sheet');
    console.log(`   Service Account Email: ${credentials.client_email}`);
    console.log('   Ve a tu Google Sheet > Compartir > Agregar el email arriba con permisos de "Editor"');
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.error('Detalles:', error.response.data);
    }
    console.error('\n💡 Soluciones posibles:');
    console.error('1. Verifica que GOOGLE_SHEET_ID sea correcto');
    console.error('2. Asegúrate de que el Service Account tenga permisos en el Sheet');
    console.error('3. Verifica que las credenciales sean válidas');
    process.exit(1);
  }
}

testGoogleSheets();
