// ============================================
// MOULT AI - Main Application
// Features: Secure, Multi-provider, Multi-lang, PWA ready
// ============================================

// Configuration
const PROXY_URL = 'http://VOTRE_IP_SERVEUR:3000';

// Translations
const translations = {
    fr: {
        welcome: 'Comment puis-je vous aider aujourd\'hui ?',
        typeMessage: 'Tapez votre message...',
        newChat: 'Nouvelle conversation',
        import: 'Importer',
        settings: 'Paramètres',
        deleteConfirm: 'Supprimer cette conversation',
        deleteSuccess: 'Conversation supprimée',
        exportSuccess: 'Export réussi',
        importSuccess: 'Import réussi',
        errorNetwork: 'Erreur réseau',
        errorApi: 'Erreur API'
    },
    en: {
        welcome: 'How can I help you today?',
        typeMessage: 'Type your message...',
        newChat: 'New conversation',
        import: 'Import',
        settings: 'Settings',
        deleteConfirm: 'Delete this conversation',
        deleteSuccess: 'Conversation deleted',
        exportSuccess: 'Export successful',
        importSuccess: 'Import successful',
        errorNetwork: 'Network error',
        errorApi: 'API error'
    },
    es: {
        welcome: '¿Cómo puedo ayudarte hoy?',
        typeMessage: 'Escribe tu mensaje...',
        newChat: 'Nueva conversación',
        import: 'Importar',
        settings: 'Ajustes',
        deleteConfirm: 'Eliminar esta conversación',
        deleteSuccess: 'Conversación eliminada',
        exportSuccess: 'Exportación exitosa',
        importSuccess: 'Importación exitosa',
        errorNetwork: 'Error de red',
        errorApi: 'Error de API'
    },
    de: {
        welcome: 'Wie kann ich Ihnen helfen?',
        typeMessage: 'Nachricht eingeben...',
        newChat: 'Neue Konversation',
        import: 'Importieren',
        settings: 'Einstellungen',
        deleteConfirm: 'Konversation löschen',
        deleteSuccess: 'Konversation gelöscht',
        exportSuccess: 'Export erfolgreich',
        importSuccess: 'Import erfolgreich',
        errorNetwork: 'Netzwerkfehler',
        errorApi: 'API-Fehler'
    },
    it: {
        welcome: 'Come posso aiutarti oggi?',
        typeMessage: 'Scrivi il tuo messaggio...',
        newChat: 'Nuova conversazione',
        import: 'Importa',
        settings: 'Impostazioni',
        deleteConfirm: 'Elimina conversazione',
        deleteSuccess: 'Conversazione eliminata',
        exportSuccess: 'Esportazione riuscita',
        importSuccess: 'Importazione riuscita',
        errorNetwork: 'Errore di rete',
        errorApi: 'Errore API'
    },
    pt: {
        welcome: 'Como posso ajudar hoje?',
        typeMessage: 'Digite sua mensagem...',
        newChat: 'Nova conversa',
        import: 'Importar',
        settings: 'Configurações',
        deleteConfirm: 'Excluir conversa',
        deleteSuccess: 'Conversa excluída',
        exportSuccess: 'Exportação bem-sucedida',
        importSuccess: 'Importação bem-sucedida',
        errorNetwork: 'Erro de rede',
        errorApi: 'Erro de API'
    },
    ja: {
        welcome: 'どのようにお手伝いできますか？',
        typeMessage: 'メッセージを入力...',
        newChat: '新しい会話',
        import: 'インポート',
        settings: '設定',
        deleteConfirm: '会話を削除',
        deleteSuccess: '会話を削除しました',
        exportSuccess: 'エクスポート成功',
        importSuccess: 'インポート成功',
        errorNetwork: 'ネットワークエラー',
        errorApi: 'APIエラー'
    },
    zh: {
        welcome: '我能如何帮助您？',
        typeMessage: '输入消息...',
        newChat: '新对话',
        import: '导入',
        settings: '设置',
        deleteConfirm: '删除对话',
        deleteSuccess: '对话已删除',
        exportSuccess: '导出成功',
        importSuccess: '导入成功',
        errorNetwork: '网络错误',
        errorApi: 'API错误'
    }
};

// State
let currentLanguage = localStorage.getItem('language') || 'fr';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentConversationId = null;
let conversations = JSON.parse(localStorage.getItem('conversations')) || [];
let currentMessages = [];
let isLoading = false;

// DOM Elements
const sidebar = document.getElementById('sidebar');
const conversationsList = document.getElementById('conversationsList');
const welcomeScreen = document.getElementById('welcomeScreen');
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const importChatBtn = document.getElementById('importChatBtn');
const settingsBtn = document.getElementById('settingsBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const modelSelect = document.getElementById('modelSelect');
const modeSelect = document.getElementById('modeSelect');
const providerBadge = document.getElementById('providerBadge');
const typingIndicator = document.getElementById('typingIndicator');
const languageModal = document.getElementById('languageModal');
const settingsModal = document.getElementById('settingsModal');
const notification = document.getElementById('notification');

// ============================================
// INITIALIZATION
// ============================================
function init() {
    applyTheme(currentTheme);
    applyLanguage();
    loadConversations();
    setupEventListeners();
    loadModels();
    
    if (conversations.length === 0) {
        createNewConversation();
    } else {
        loadConversation(conversations[0].id);
    }
}

// Load available models from server
async function loadModels() {
    try {
        const response = await fetch(`${PROXY_URL}/api/models`);
        const data = await response.json();
        console.log('Available models:', data);
    } catch (error) {
        console.error('Failed to load models:', error);
    }
}

// Apply theme
function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    currentTheme = theme;
    
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark' || theme === 'midnight') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Apply language
function applyLanguage() {
    const t = translations[currentLanguage];
    document.getElementById('welcomeText').textContent = t.welcome;
    userInput.placeholder = t.typeMessage;
    document.querySelector('.new-chat-btn span').textContent = t.newChat;
    document.querySelector('.import-chat-btn span').textContent = t.import;
    document.querySelector('.settings-btn span').textContent = t.settings;
    
    const langSpan = langToggle.querySelector('span');
    langSpan.textContent = currentLanguage.toUpperCase();
    
    localStorage.setItem('language', currentLanguage);
}

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ============================================
// CONVERSATIONS MANAGEMENT
// ============================================
function loadConversations() {
    conversationsList.innerHTML = '';
    conversations.forEach(conv => {
        const convElement = createConversationElement(conv);
        conversationsList.appendChild(convElement);
    });
}

function createConversationElement(conversation) {
    const div = document.createElement('div');
    div.className = `conversation-item ${currentConversationId === conversation.id ? 'active' : ''}`;
    div.setAttribute('data-id', conversation.id);
    
    div.innerHTML = `
        <div class="conversation-info">
            <div class="conversation-title" ondblclick="editConversationTitle('${conversation.id}')">${conversation.title || 'Nouvelle conversation'}</div>
            <div class="conversation-date">${new Date(conversation.createdAt).toLocaleString()}</div>
        </div>
        <button class="conversation-delete" onclick="event.stopPropagation(); deleteConversation('${conversation.id}')">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    div.addEventListener('click', () => loadConversation(conversation.id));
    return div;
}

window.editConversationTitle = async function(conversationId) {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    const newTitle = prompt('Nouveau titre:', conversation.title);
    if (newTitle && newTitle.trim()) {
        conversation.title = newTitle.trim();
        saveConversations();
        loadConversations();
        showNotification('Titre modifié', 'success');
    }
};

function createNewConversation() {
    const newConversation = {
        id: Date.now().toString(),
        title: `Conversation ${conversations.length + 1}`,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    conversations.unshift(newConversation);
    saveConversations();
    loadConversations();
    loadConversation(newConversation.id);
}

function loadConversation(conversationId) {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;
    
    currentConversationId = conversationId;
    currentMessages = conversation.messages || [];
    
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-id') === conversationId);
    });
    
    renderMessages();
    
    if (currentMessages.length === 0) {
        welcomeScreen.style.display = 'flex';
        chatMessages.style.display = 'none';
    } else {
        welcomeScreen.style.display = 'none';
        chatMessages.style.display = 'flex';
    }
}

function renderMessages() {
    chatMessages.innerHTML = '';
    currentMessages.forEach(msg => {
        addMessageToUI(msg.role, msg.content, false);
    });
    scrollToBottom();
}

function addMessageToUI(role, content, save = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = `<div class="message-content">${content.replace(/\n/g, '<br>')}</div>`;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    if (save) {
        currentMessages.push({ role, content, timestamp: new Date().toISOString() });
        saveCurrentConversation();
    }
}

function saveCurrentConversation() {
    const index = conversations.findIndex(c => c.id === currentConversationId);
    if (index !== -1) {
        conversations[index].messages = currentMessages;
        conversations[index].updatedAt = new Date().toISOString();
        if (currentMessages.length > 0 && conversations[index].title === `Conversation ${index + 1}`) {
            conversations[index].title = currentMessages[0]?.content.substring(0, 30) + '...';
        }
        saveConversations();
        loadConversations();
    }
}

function saveConversations() {
    localStorage.setItem('conversations', JSON.stringify(conversations));
}

window.deleteConversation = function(conversationId) {
    const t = translations[currentLanguage];
    conversations = conversations.filter(c => c.id !== conversationId);
    saveConversations();
    
    if (conversations.length === 0) {
        createNewConversation();
    } else {
        loadConversation(conversations[0].id);
    }
    loadConversations();
    showNotification(t.deleteSuccess, 'success');
};

// ============================================
// CHAT FUNCTIONALITY
// ============================================
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message || isLoading) return;
    
    welcomeScreen.style.display = 'none';
    chatMessages.style.display = 'flex';
    
    addMessageToUI('user', message);
    userInput.value = '';
    autoResizeTextarea();
    
    isLoading = true;
    typingIndicator.style.display = 'flex';
    scrollToBottom();
    
    const requestBody = {
        message: message,
        provider: modelSelect.value,
        mode: modeSelect.value,
        history: currentMessages.slice(-10) // Last 10 messages for context
    };
    
    try {
        const response = await fetch(`${PROXY_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        typingIndicator.style.display = 'none';
        addMessageToUI('assistant', data.message);
        
    } catch (error) {
        typingIndicator.style.display = 'none';
        addMessageToUI('assistant', `❌ ${translations[currentLanguage].errorApi}: ${error.message}`);
    } finally {
        isLoading = false;
    }
}

function clearConversation() {
    currentMessages = [];
    saveCurrentConversation();
    renderMessages();
    welcomeScreen.style.display = 'flex';
    chatMessages.style.display = 'none';
    showNotification('Conversation effacée', 'success');
}

// ============================================
// IMPORT/EXPORT
// ============================================
function importConversation() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.jsonl';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        const text = await file.text();
        const format = document.getElementById('importFormat').value;
        
        try {
            let importedMessages = [];
            
            if (format === 'json') {
                const data = JSON.parse(text);
                importedMessages = data.messages || data;
            } else if (format === 'jsonl') {
                const lines = text.split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        const item = JSON.parse(line);
                        importedMessages.push(item);
                    }
                }
            }
            
            const newConversation = {
                id: Date.now().toString(),
                title: `Importé ${new Date().toLocaleString()}`,
                messages: importedMessages,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            conversations.unshift(newConversation);
            saveConversations();
            loadConversations();
            loadConversation(newConversation.id);
            showNotification(translations[currentLanguage].importSuccess, 'success');
            
        } catch (error) {
            showNotification('Erreur d\'import: ' + error.message, 'error');
        }
    };
    input.click();
}

function exportAllConversations() {
    const data = JSON.stringify(conversations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moult-ai-conversations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(translations[currentLanguage].exportSuccess, 'success');
}

// ============================================
// MODALS
// ============================================
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// UTILITIES
// ============================================
function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
}

function scrollToBottom() {
    const container = chatMessages.style.display === 'none' ? welcomeScreen : chatMessages;
    if (container) container.scrollTop = container.scrollHeight;
}

function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    const icon = sidebarToggle.querySelector('i');
    if (sidebar.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
    } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
    }
}

function toggleMobileSidebar() {
    sidebar.classList.toggle('mobile-open');
}

function toggleTheme() {
    const themes = ['light', 'dark', 'ocean', 'forest', 'sunset', 'midnight'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    applyTheme(nextTheme);
    showNotification(`Thème: ${nextTheme}`, 'success');
}

function setTheme(theme) {
    applyTheme(theme);
    showNotification(`Thème: ${theme}`, 'success');
    if (settingsModal) closeModal(settingsModal);
}

function setLanguage(lang) {
    currentLanguage = lang;
    applyLanguage();
    showNotification(`Langue: ${lang.toUpperCase()}`, 'success');
    if (languageModal) closeModal(languageModal);
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    sendBtn.addEventListener('click', sendMessage);
    newChatBtn.addEventListener('click', createNewConversation);
    importChatBtn.addEventListener('click', importConversation);
    settingsBtn.addEventListener('click', () => openModal(settingsModal));
    clearChatBtn.addEventListener('click', clearConversation);
    themeToggle.addEventListener('click', toggleTheme);
    langToggle.addEventListener('click', () => openModal(languageModal));
    sidebarToggle.addEventListener('click', toggleSidebar);
    mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    userInput.addEventListener('input', autoResizeTextarea);
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(languageModal);
            closeModal(settingsModal);
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
    
    // Language options
    document.querySelectorAll('.lang-option').forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
    
    // Theme options
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });
    
    // Export button
    document.getElementById('exportAllBtn')?.addEventListener('click', exportAllConversations);
    
    // Provider change badge
    modelSelect.addEventListener('change', (e) => {
        const provider = e.target.value;
        const badgeIcon = providerBadge.querySelector('i');
        const badgeText = providerBadge.querySelector('span');
        
        const icons = {
            openrouter: 'fa-network-wired',
            hf: 'fa-robot',
            groq: 'fa-bolt'
        };
        
        badgeIcon.className = `fas ${icons[provider] || 'fa-microchip'}`;
        badgeText.textContent = provider.charAt(0).toUpperCase() + provider.slice(1);
    });
}

// Start the app
init();
