#!/bin/bash

# Script de utilidad para gestionar el Agente de WhatsApp
# Autor: José Alfredo
# Fecha: 9 de noviembre de 2025

COLOR_VERDE='\033[0;32m'
COLOR_ROJO='\033[0;31m'
COLOR_AMARILLO='\033[1;33m'
COLOR_AZUL='\033[0;34m'
SIN_COLOR='\033[0m'

function mostrar_menu() {
    echo -e "\n${COLOR_AZUL}╔════════════════════════════════════════╗${SIN_COLOR}"
    echo -e "${COLOR_AZUL}║  🤖 AGENTE WHATSAPP - MENU PRINCIPAL  ║${SIN_COLOR}"
    echo -e "${COLOR_AZUL}╚════════════════════════════════════════╝${SIN_COLOR}\n"
    echo -e "1) ${COLOR_VERDE}Iniciar sistema${SIN_COLOR}"
    echo -e "2) ${COLOR_ROJO}Detener sistema${SIN_COLOR}"
    echo -e "3) ${COLOR_AMARILLO}Reiniciar sistema${SIN_COLOR}"
    echo -e "4) ${COLOR_AZUL}Ver estado${SIN_COLOR}"
    echo -e "5) ${COLOR_AZUL}Ver logs${SIN_COLOR}"
    echo -e "6) ${COLOR_AZUL}Ver logs en tiempo real${SIN_COLOR}"
    echo -e "7) ${COLOR_VERDE}Mostrar URL del webhook${SIN_COLOR}"
    echo -e "8) ${COLOR_ROJO}Salir${SIN_COLOR}"
    echo -e "\n${COLOR_AMARILLO}Seleccione una opción:${SIN_COLOR} "
}

function iniciar_sistema() {
    echo -e "\n${COLOR_VERDE}🚀 Iniciando sistema...${SIN_COLOR}\n"
    
    # Verificar si ya está corriendo
    if pgrep -f "node server.js" > /dev/null; then
        echo -e "${COLOR_AMARILLO}⚠️  El servidor ya está en ejecución${SIN_COLOR}"
        return
    fi
    
    # Iniciar servidor
    cd /home/josealfredo/whatsapp-terrenos-mcp
    node server.js > server.log 2>&1 &
    sleep 3
    
    # Verificar LocalTunnel
    if ! pgrep -f "lt --port 3000" > /dev/null; then
        echo -e "${COLOR_AMARILLO}📡 Iniciando LocalTunnel...${SIN_COLOR}"
        lt --port 3000 --subdomain agentewhatsapp > tunnel.log 2>&1 &
        sleep 2
    fi
    
    # Mostrar estado
    if pgrep -f "node server.js" > /dev/null; then
        echo -e "${COLOR_VERDE}✅ Servidor iniciado correctamente${SIN_COLOR}"
        echo -e "${COLOR_VERDE}✅ URL del webhook: https://agentewhatsapp.loca.lt/webhook/whatsapp${SIN_COLOR}"
        echo -e "\n${COLOR_AZUL}📊 Ver logs con: tail -f server.log${SIN_COLOR}\n"
    else
        echo -e "${COLOR_ROJO}❌ Error al iniciar el servidor${SIN_COLOR}"
    fi
}

function detener_sistema() {
    echo -e "\n${COLOR_ROJO}🛑 Deteniendo sistema...${SIN_COLOR}\n"
    
    # Detener servidor
    pkill -f "node server.js"
    sleep 2
    
    # Verificar
    if pgrep -f "node server.js" > /dev/null; then
        echo -e "${COLOR_ROJO}❌ Error al detener el servidor${SIN_COLOR}"
        echo -e "${COLOR_AMARILLO}Intentando forzar detención...${SIN_COLOR}"
        pkill -9 -f "node server.js"
        sleep 1
    fi
    
    echo -e "${COLOR_VERDE}✅ Sistema detenido${SIN_COLOR}\n"
}

function reiniciar_sistema() {
    echo -e "\n${COLOR_AMARILLO}🔄 Reiniciando sistema...${SIN_COLOR}\n"
    detener_sistema
    sleep 2
    iniciar_sistema
}

function ver_estado() {
    echo -e "\n${COLOR_AZUL}╔════════════════════════════════════════╗${SIN_COLOR}"
    echo -e "${COLOR_AZUL}║       📊 ESTADO DEL SISTEMA           ║${SIN_COLOR}"
    echo -e "${COLOR_AZUL}╚════════════════════════════════════════╝${SIN_COLOR}\n"
    
    # Verificar servidor
    if pgrep -f "node server.js" > /dev/null; then
        echo -e "${COLOR_VERDE}✅ Servidor Node.js: ACTIVO${SIN_COLOR}"
        PID=$(pgrep -f "node server.js")
        echo -e "   PID: $PID"
    else
        echo -e "${COLOR_ROJO}❌ Servidor Node.js: INACTIVO${SIN_COLOR}"
    fi
    
    # Verificar LocalTunnel
    if pgrep -f "lt --port 3000" > /dev/null; then
        echo -e "${COLOR_VERDE}✅ LocalTunnel: ACTIVO${SIN_COLOR}"
        PID=$(pgrep -f "lt --port 3000")
        echo -e "   PID: $PID"
        echo -e "   URL: ${COLOR_VERDE}https://agentewhatsapp.loca.lt${SIN_COLOR}"
    else
        echo -e "${COLOR_ROJO}❌ LocalTunnel: INACTIVO${SIN_COLOR}"
    fi
    
    # Verificar puerto 3000
    echo -e "\n${COLOR_AZUL}🔌 Puerto 3000:${SIN_COLOR}"
    if lsof -i :3000 > /dev/null 2>&1; then
        lsof -i :3000 | tail -1
    else
        echo -e "   ${COLOR_AMARILLO}Disponible${SIN_COLOR}"
    fi
    
    echo ""
}

function ver_logs() {
    echo -e "\n${COLOR_AZUL}📋 Últimas 30 líneas del log:${SIN_COLOR}\n"
    if [ -f server.log ]; then
        tail -30 server.log
    else
        echo -e "${COLOR_ROJO}❌ No se encontró el archivo server.log${SIN_COLOR}"
    fi
    echo ""
}

function ver_logs_tiempo_real() {
    echo -e "\n${COLOR_AZUL}📋 Logs en tiempo real (Ctrl+C para salir):${SIN_COLOR}\n"
    if [ -f server.log ]; then
        tail -f server.log
    else
        echo -e "${COLOR_ROJO}❌ No se encontró el archivo server.log${SIN_COLOR}"
    fi
}

function mostrar_webhook_url() {
    echo -e "\n${COLOR_AZUL}╔════════════════════════════════════════╗${SIN_COLOR}"
    echo -e "${COLOR_AZUL}║         🌐 URL DEL WEBHOOK            ║${SIN_COLOR}"
    echo -e "${COLOR_AZUL}╚════════════════════════════════════════╝${SIN_COLOR}\n"
    echo -e "${COLOR_VERDE}https://agentewhatsapp.loca.lt/webhook/whatsapp${SIN_COLOR}"
    echo -e "\n${COLOR_AMARILLO}📋 Copiar esta URL en la configuración de Twilio${SIN_COLOR}"
    echo -e "${COLOR_AZUL}📱 Twilio Console: https://console.twilio.com/${SIN_COLOR}\n"
}

# Loop principal
while true; do
    mostrar_menu
    read opcion
    
    case $opcion in
        1) iniciar_sistema ;;
        2) detener_sistema ;;
        3) reiniciar_sistema ;;
        4) ver_estado ;;
        5) ver_logs ;;
        6) ver_logs_tiempo_real ;;
        7) mostrar_webhook_url ;;
        8) 
            echo -e "\n${COLOR_VERDE}👋 ¡Hasta luego!${SIN_COLOR}\n"
            exit 0
            ;;
        *)
            echo -e "\n${COLOR_ROJO}❌ Opción inválida${SIN_COLOR}\n"
            ;;
    esac
    
    echo -e "\n${COLOR_AMARILLO}Presione Enter para continuar...${SIN_COLOR}"
    read
done
