// Conexión WebSocket
const socket = io();

// Estado de la aplicación
let currentConversation = null;
let conversations = new Map();
let totalMessagesCount = 0;

// Referencias DOM
const conversationsList = document.getElementById('conversationsList');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatTitle = document.getElementById('chatTitle');
const totalConversationsEl = document.getElementById('totalConversations');
const totalMessagesEl = document.getElementById('totalMessages');
const activeChatsEl = document.getElementById('activeChats');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearFiltersBtn = document.getElementById('clearFilters');

// Estado de filtros
let searchQuery = '';
let dateFilter = 'all';
let allConversations = new Map();

// Formatear número de teléfono
function formatPhoneNumber(phone) {
    return phone.replace(/[^\d]/g, '');
}

// Filtrar conversaciones
function filterConversations() {
    const filtered = new Map();
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    allConversations.forEach((data, phone) => {
        // Filtro de búsqueda
        if (searchQuery) {
            const phoneMatch = phone.toLowerCase().includes(searchQuery.toLowerCase());
            const messageMatch = data.messages.some(msg => 
                msg.body.toLowerCase().includes(searchQuery.toLowerCase())
            );
            
            if (!phoneMatch && !messageMatch) {
                return;
            }
        }
        
        // Filtro de fecha
        if (dateFilter !== 'all') {
            const lastMessage = data.messages[data.messages.length - 1];
            if (!lastMessage) return;
            
            const messageTime = new Date(lastMessage.timestamp).getTime();
            
            if (dateFilter === 'today' && messageTime < oneDayAgo) {
                return;
            }
            
            if (dateFilter === 'week' && messageTime < oneWeekAgo) {
                return;
            }
        }
        
        filtered.set(phone, data);
    });
    
    conversations = filtered;
    renderConversations();
}

// Renderizar conversaciones
function renderConversations() {
    if (conversations.size === 0) {
        conversationsList.innerHTML = `
            <div class="empty-state">
                <p>No hay conversaciones aún</p>
            </div>
        `;
        return;
    }

    conversationsList.innerHTML = '';
    
    conversations.forEach((data, phone) => {
        const conversationItem = document.createElement('div');
        conversationItem.className = 'conversation-item';
        if (currentConversation === phone) {
            conversationItem.classList.add('active');
        }
        
        const lastMessage = data.messages[data.messages.length - 1];
        const preview = lastMessage ? lastMessage.body.substring(0, 50) + '...' : 'Sin mensajes';
        
        conversationItem.innerHTML = `
            <div class="conversation-phone">📱 ${phone}</div>
            <div class="conversation-preview">${preview}</div>
        `;
        
        conversationItem.addEventListener('click', () => {
            selectConversation(phone);
        });
        
        conversationsList.appendChild(conversationItem);
    });

    updateStats();
}

// Renderizar mensajes
function renderMessages() {
    if (!currentConversation || !conversations.has(currentConversation)) {
        messagesContainer.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <p>Selecciona una conversación</p>
            </div>
        `;
        return;
    }

    const data = conversations.get(currentConversation);
    messagesContainer.innerHTML = '';

    data.messages.forEach(message => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.direction}`;
        
        const time = new Date(message.timestamp).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageEl.innerHTML = `
            <div class="message-bubble">${escapeHtml(message.body)}</div>
            <div class="message-info">${time}</div>
        `;
        
        messagesContainer.appendChild(messageEl);
    });

    // Scroll al último mensaje
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Seleccionar conversación
function selectConversation(phone) {
    currentConversation = phone;
    chatTitle.textContent = `📱 ${phone}`;
    messageInput.disabled = false;
    sendButton.disabled = false;
    renderConversations();
    renderMessages();
}

// Agregar mensaje a conversación
function addMessage(message) {
    const phone = message.direction === 'inbound' ? message.from : message.to;
    
    if (!allConversations.has(phone)) {
        allConversations.set(phone, {
            phone: phone,
            messages: []
        });
    }
    
    allConversations.get(phone).messages.push(message);
    totalMessagesCount++;
    
    // Aplicar filtros antes de renderizar
    filterConversations();
    
    if (currentConversation === phone) {
        renderMessages();
    }
}

// Enviar mensaje
async function sendMessage() {
    if (!currentConversation || !messageInput.value.trim()) {
        return;
    }

    const message = messageInput.value.trim();
    messageInput.value = '';
    
    try {
        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: currentConversation,
                message: message
            })
        });
        
        if (!response.ok) {
            throw new Error('Error al enviar mensaje');
        }
        
        // El mensaje se agregará cuando llegue por WebSocket
    } catch (error) {
        console.error('Error:', error);
        alert('Error al enviar el mensaje');
    }
}

// Actualizar estadísticas
function updateStats() {
    totalConversationsEl.textContent = conversations.size;
    totalMessagesEl.textContent = totalMessagesCount;
    
    // Conversaciones activas (con mensajes en las últimas 24h)
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    let activeCount = 0;
    
    conversations.forEach(data => {
        const lastMessage = data.messages[data.messages.length - 1];
        if (lastMessage && new Date(lastMessage.timestamp).getTime() > oneDayAgo) {
            activeCount++;
        }
    });
    
    activeChatsEl.textContent = activeCount;
}

// Escape HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Búsqueda
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    filterConversations();
});

// Filtros de fecha
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        dateFilter = btn.dataset.filter;
        filterConversations();
    });
});

// Limpiar filtros
clearFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    dateFilter = 'all';
    filterBtns.forEach(b => b.classList.remove('active'));
    document.getElementById('filterAll').classList.add('active');
    filterConversations();
});

// WebSocket Events
socket.on('connect', () => {
    console.log('✅ Conectado al servidor');
});

socket.on('disconnect', () => {
    console.log('❌ Desconectado del servidor');
});

socket.on('new-message', (message) => {
    console.log('📨 Nuevo mensaje:', message);
    addMessage(message);
    
    // Notificación de sonido (opcional)
    if (Notification.permission === 'granted' && message.direction === 'inbound') {
        new Notification('Nuevo mensaje de WhatsApp', {
            body: message.body.substring(0, 50),
            icon: '/icon.png'
        });
    }
});

// Solicitar permiso para notificaciones
if (Notification.permission === 'default') {
    Notification.requestPermission();
}

// Cargar conversaciones al iniciar
async function loadConversations() {
    try {
        const response = await fetch('/api/conversations');
        const data = await response.json();
        
        console.log('📂 Conversaciones cargadas:', data);
        
        // Cargar cada conversación en allConversations
        data.forEach(conv => {
            if (!allConversations.has(conv.phone)) {
                allConversations.set(conv.phone, {
                    phone: conv.phone,
                    messages: conv.messages || []
                });
                totalMessagesCount += conv.messages?.length || 0;
            }
        });
        
        // Activar filtro "Todas" por defecto
        document.getElementById('filterAll').classList.add('active');
        
        filterConversations();
    } catch (error) {
        console.error('Error cargando conversaciones:', error);
    }
}

// Inicializar
loadConversations();
console.log('🚀 Aplicación inicializada');

// Mobile menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebar = document.getElementById('sidebar');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.add('mobile-active');
    });
}

if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('mobile-active');
    });
}

// Cerrar sidebar al seleccionar conversación en móvil
const originalSelectConversation = selectConversation;
selectConversation = function(phone) {
    originalSelectConversation(phone);
    if (window.innerWidth <= 768) {
        sidebar.classList.remove('mobile-active');
    }
};
