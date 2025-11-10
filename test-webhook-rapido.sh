#!/bin/bash

# Script de prueba rápida del webhook
# Autor: José Alfredo
# Fecha: 9 de noviembre de 2025

COLOR_VERDE='\033[0;32m'
COLOR_ROJO='\033[0;31m'
COLOR_AMARILLO='\033[1;33m'
COLOR_AZUL='\033[0;34m'
SIN_COLOR='\033[0m'

echo -e "\n${COLOR_AZUL}╔════════════════════════════════════════════════════════════╗${SIN_COLOR}"
echo -e "${COLOR_AZUL}║                                                            ║${SIN_COLOR}"
echo -e "${COLOR_AZUL}║         🧪 PRUEBA RÁPIDA DEL WEBHOOK WHATSAPP             ║${SIN_COLOR}"
echo -e "${COLOR_AZUL}║                                                            ║${SIN_COLOR}"
echo -e "${COLOR_AZUL}╚════════════════════════════════════════════════════════════╝${SIN_COLOR}\n"

# Verificar que el servidor esté corriendo
if ! pgrep -f "node server.js" > /dev/null; then
    echo -e "${COLOR_ROJO}❌ El servidor no está corriendo${SIN_COLOR}"
    echo -e "${COLOR_AMARILLO}Iniciando servidor...${SIN_COLOR}\n"
    cd /home/josealfredo/whatsapp-terrenos-mcp
    node server.js > server.log 2>&1 &
    sleep 3
fi

echo -e "${COLOR_AZUL}🔍 Verificando conectividad...${SIN_COLOR}\n"

# Probar endpoint local
echo -e "${COLOR_AMARILLO}1. Probando servidor local (http://localhost:3000)${SIN_COLOR}"
RESPONSE=$(curl -s http://localhost:3000)
if [ "$RESPONSE" == "Servidor WhatsApp activo" ]; then
    echo -e "   ${COLOR_VERDE}✅ Servidor local: OK${SIN_COLOR}"
else
    echo -e "   ${COLOR_ROJO}❌ Servidor local: ERROR${SIN_COLOR}"
    echo -e "   Respuesta: $RESPONSE"
fi

echo ""

# Probar LocalTunnel
echo -e "${COLOR_AMARILLO}2. Probando LocalTunnel (https://agentewhatsapp.loca.lt)${SIN_COLOR}"
RESPONSE=$(curl -s https://agentewhatsapp.loca.lt)
if [ "$RESPONSE" == "Servidor WhatsApp activo" ]; then
    echo -e "   ${COLOR_VERDE}✅ LocalTunnel: OK${SIN_COLOR}"
else
    echo -e "   ${COLOR_AMARILLO}⚠️  LocalTunnel: Verificar${SIN_COLOR}"
    echo -e "   Respuesta: $RESPONSE"
    echo -e "   ${COLOR_AZUL}Tip: LocalTunnel puede requerir confirmación en el navegador${SIN_COLOR}"
fi

echo ""

# Probar webhook endpoint
echo -e "${COLOR_AMARILLO}3. Probando endpoint del webhook${SIN_COLOR}"
RESPONSE=$(curl -s -X POST http://localhost:3000/webhook/whatsapp \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+12345678900&Body=Test&NumMedia=0")

if [ -n "$RESPONSE" ]; then
    echo -e "   ${COLOR_VERDE}✅ Webhook endpoint: OK${SIN_COLOR}"
    echo -e "   ${COLOR_AZUL}Respuesta: $RESPONSE${SIN_COLOR}"
else
    echo -e "   ${COLOR_ROJO}❌ Webhook endpoint: ERROR${SIN_COLOR}"
fi

echo ""

# Mostrar logs recientes
echo -e "${COLOR_AMARILLO}4. Últimas 5 líneas del log:${SIN_COLOR}"
if [ -f server.log ]; then
    tail -5 server.log | while read line; do
        echo -e "   ${COLOR_AZUL}$line${SIN_COLOR}"
    done
else
    echo -e "   ${COLOR_ROJO}❌ No se encontró server.log${SIN_COLOR}"
fi

echo ""

# Resumen
echo -e "${COLOR_AZUL}╔════════════════════════════════════════════════════════════╗${SIN_COLOR}"
echo -e "${COLOR_AZUL}║                       📊 RESUMEN                           ║${SIN_COLOR}"
echo -e "${COLOR_AZUL}╚════════════════════════════════════════════════════════════╝${SIN_COLOR}\n"

if pgrep -f "node server.js" > /dev/null; then
    echo -e "${COLOR_VERDE}✅ Servidor Node.js: ACTIVO${SIN_COLOR}"
else
    echo -e "${COLOR_ROJO}❌ Servidor Node.js: INACTIVO${SIN_COLOR}"
fi

if pgrep -f "lt --port 3000" > /dev/null; then
    echo -e "${COLOR_VERDE}✅ LocalTunnel: ACTIVO${SIN_COLOR}"
else
    echo -e "${COLOR_ROJO}❌ LocalTunnel: INACTIVO${SIN_COLOR}"
fi

echo -e "\n${COLOR_AZUL}📱 URL del webhook para Twilio:${SIN_COLOR}"
echo -e "${COLOR_VERDE}   https://agentewhatsapp.loca.lt/webhook/whatsapp${SIN_COLOR}\n"

echo -e "${COLOR_AMARILLO}💡 Tip: Si LocalTunnel muestra advertencias, abrir la URL en un navegador${SIN_COLOR}"
echo -e "${COLOR_AMARILLO}   para confirmar y luego actualizar el webhook en Twilio.${SIN_COLOR}\n"
