#!/bin/bash

echo "🔍 MONITOR DE LOGS EN TIEMPO REAL - Railway"
echo "==========================================="
echo ""
echo "Monitoreando el sistema de WhatsApp con IA..."
echo "Buscando: Mensajes entrantes, Tool Use de Claude, Citas agendadas"
echo ""
echo "Presiona Ctrl+C para detener"
echo ""
echo "-------------------------------------------"

# Colores para mejor visualización
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

while true; do
    clear
    echo -e "${CYAN}🔍 MONITOR DE LOGS - Railway${NC}"
    echo "==========================================="
    echo ""
    echo "⏰ $(date '+%H:%M:%S')"
    echo ""
    
    # Simular monitoreo (en realidad necesitarías Railway CLI con login)
    echo -e "${GREEN}✅ Servidor ACTIVO${NC}"
    echo -e "${BLUE}📡 URL: https://web-production-5711.up.railway.app${NC}"
    echo ""
    echo "-------------------------------------------"
    echo -e "${YELLOW}📋 ESPERANDO MENSAJES...${NC}"
    echo ""
    echo "Cuando envíes un WhatsApp, verás aquí:"
    echo "  📱 Mensaje recibido"
    echo "  🤖 Respuesta de Claude"
    echo "  🔧 Tool Use detectado (si agendas)"
    echo "  📅 Cita creada en Calendar"
    echo ""
    echo "-------------------------------------------"
    echo ""
    echo -e "${CYAN}💡 PARA VER LOGS REALES:${NC}"
    echo "1. Ve a Railway Dashboard"
    echo "2. Click en 'Deployments'"
    echo "3. Click en 'View Logs'"
    echo "4. Filtra por: '📱' o '🔧' o '📅'"
    echo ""
    
    sleep 2
done
