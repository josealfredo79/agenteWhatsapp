#!/bin/bash

# Script para desplegar en Railway
# Autor: José Alfredo
# Fecha: 9 de noviembre de 2025

COLOR_VERDE='\033[0;32m'
COLOR_ROJO='\033[0;31m'
COLOR_AMARILLO='\033[1;33m'
COLOR_AZUL='\033[0;34m'
SIN_COLOR='\033[0m'

echo -e "\n${COLOR_AZUL}╔════════════════════════════════════════════════════════════╗${SIN_COLOR}"
echo -e "${COLOR_AZUL}║                                                            ║${SIN_COLOR}"
echo -e "${COLOR_AZUL}║         🚂 PREPARAR DESPLIEGUE EN RAILWAY                 ║${SIN_COLOR}"
echo -e "${COLOR_AZUL}║                                                            ║${SIN_COLOR}"
echo -e "${COLOR_AZUL}╚════════════════════════════════════════════════════════════╝${SIN_COLOR}\n"

# Verificar que estamos en la branch correcta
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "railway-deployment" ]; then
    echo -e "${COLOR_AMARILLO}⚠️  No estás en la branch railway-deployment${SIN_COLOR}"
    echo -e "${COLOR_AMARILLO}Cambiando a railway-deployment...${SIN_COLOR}\n"
    git checkout railway-deployment
fi

# Verificar archivos necesarios
echo -e "${COLOR_AZUL}🔍 Verificando archivos necesarios...${SIN_COLOR}\n"

FILES=("package.json" "server.js" "Procfile" "railway.json" ".env.example")
MISSING=0

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${COLOR_VERDE}✅ $file${SIN_COLOR}"
    else
        echo -e "${COLOR_ROJO}❌ $file - FALTANTE${SIN_COLOR}"
        MISSING=1
    fi
done

if [ $MISSING -eq 1 ]; then
    echo -e "\n${COLOR_ROJO}❌ Faltan archivos necesarios. Verifica la configuración.${SIN_COLOR}\n"
    exit 1
fi

echo -e "\n${COLOR_VERDE}✅ Todos los archivos necesarios están presentes${SIN_COLOR}\n"

# Verificar dependencias
echo -e "${COLOR_AZUL}📦 Verificando dependencias...${SIN_COLOR}\n"
if [ -d "node_modules" ]; then
    echo -e "${COLOR_VERDE}✅ node_modules existe${SIN_COLOR}"
else
    echo -e "${COLOR_AMARILLO}⚠️  node_modules no existe. Ejecutando npm install...${SIN_COLOR}"
    npm install
fi

# Verificar .env
echo -e "\n${COLOR_AZUL}🔐 Verificando variables de entorno...${SIN_COLOR}\n"
if [ -f ".env" ]; then
    echo -e "${COLOR_VERDE}✅ .env existe${SIN_COLOR}"
    echo -e "${COLOR_AMARILLO}📝 Recuerda configurar estas variables en Railway:${SIN_COLOR}"
    echo -e "   - TWILIO_ACCOUNT_SID"
    echo -e "   - TWILIO_AUTH_TOKEN"
    echo -e "   - TWILIO_WHATSAPP_NUMBER"
    echo -e "   - ANTHROPIC_API_KEY"
    echo -e "   - GOOGLE_CREDENTIALS"
    echo -e "   - GOOGLE_DOCS_ID"
    echo -e "   - GOOGLE_SHEET_ID"
else
    echo -e "${COLOR_ROJO}❌ .env no existe (normal en Railway)${SIN_COLOR}"
fi

# Mostrar cambios pendientes
echo -e "\n${COLOR_AZUL}📋 Cambios pendientes:${SIN_COLOR}\n"
git status --short

# Preguntar si desea hacer commit
echo -e "\n${COLOR_AMARILLO}¿Deseas hacer commit y push de los cambios? (s/n)${SIN_COLOR} "
read -r RESPUESTA

if [ "$RESPUESTA" = "s" ] || [ "$RESPUESTA" = "S" ]; then
    echo -e "\n${COLOR_AZUL}📝 Ingresa el mensaje del commit:${SIN_COLOR} "
    read -r MENSAJE
    
    git add .
    git commit -m "$MENSAJE"
    
    echo -e "\n${COLOR_AZUL}🚀 Subiendo cambios a GitHub...${SIN_COLOR}\n"
    git push origin railway-deployment
    
    echo -e "\n${COLOR_VERDE}✅ Cambios subidos exitosamente${SIN_COLOR}"
else
    echo -e "\n${COLOR_AMARILLO}⏭️  Saltando commit${SIN_COLOR}"
fi

# Instrucciones finales
echo -e "\n${COLOR_AZUL}╔════════════════════════════════════════════════════════════╗${SIN_COLOR}"
echo -e "${COLOR_AZUL}║              📋 PRÓXIMOS PASOS                             ║${SIN_COLOR}"
echo -e "${COLOR_AZUL}╚════════════════════════════════════════════════════════════╝${SIN_COLOR}\n"

echo -e "${COLOR_VERDE}1.${SIN_COLOR} Ve a: ${COLOR_AZUL}https://railway.app/${SIN_COLOR}"
echo -e "${COLOR_VERDE}2.${SIN_COLOR} Click en 'New Project' → 'Deploy from GitHub repo'"
echo -e "${COLOR_VERDE}3.${SIN_COLOR} Selecciona: ${COLOR_AZUL}agenteWhatsapp (railway-deployment)${SIN_COLOR}"
echo -e "${COLOR_VERDE}4.${SIN_COLOR} Configura las variables de entorno"
echo -e "${COLOR_VERDE}5.${SIN_COLOR} Espera el deployment"
echo -e "${COLOR_VERDE}6.${SIN_COLOR} Genera el dominio público"
echo -e "${COLOR_VERDE}7.${SIN_COLOR} Actualiza el webhook en Twilio\n"

echo -e "${COLOR_AZUL}📚 Documentación completa en:${SIN_COLOR} RAILWAY-DEPLOYMENT.md\n"

echo -e "${COLOR_VERDE}✨ ¡Listo para desplegar en Railway!${SIN_COLOR}\n"
