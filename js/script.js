/**
 * Moult AI Web — Frontend Controller v5
 * Full i18n, offline detection, proper code blocks, math, custom dropdowns, PWA auto-update, delete all conversations
 *
 * Translations are loaded from js/i18n.js (I18N, LANG_FLAGS, RTL_LANGS, currentLang, t)
 */

// ==========================================
// INTERNATIONALIZATION (i18n) — applyTranslations
// ==========================================

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && t(key)) el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        if (key && t(key)) el.setAttribute('title', t(key));
    });
    const inp = $('message-input');
    if (inp) inp.placeholder = t('placeholder');
    const searchInp = $('search-input');
    if (searchInp) searchInp.placeholder = t('searchPlaceholder');
    const lc = $('lang-code');
    if (lc) lc.textContent = LANG_FLAGS[currentLang] || currentLang.toUpperCase();
    const qas = document.querySelectorAll('.quick-action span:last-child');
    const qaKeys = ['quickConcept', 'quickDebug', 'quickEmail', 'quickTranslate'];
    qas.forEach((s, i) => { if (qaKeys[i]) s.textContent = t(qaKeys[i]); });

    const settingsTitle = document.querySelector('#settings-modal .modal-header h2');
    if (settingsTitle) settingsTitle.textContent = t('paramTitle');
    const langTitle = document.querySelector('#language-modal .modal-header h2');
    if (langTitle) langTitle.textContent = t('selectLang');
    const searchTitle = document.querySelector('#search-modal .modal-header h2');
    if (searchTitle) searchTitle.textContent = '🔍 ' + t('search');
    renderHistory();
}

// ==========================================
// CONFIG
// ==========================================
const CONFIG = {
    DEFAULT_SERVER: localStorage.getItem('moult-server-url') || 'https://api-moult-ai.lombard-web-services.com',
    MAX_HISTORY: 5000,
    STORAGE_KEY: 'moult-conversations'
};

const state = {
    currentConversationId: null,
    conversations: [],
    isLoading: false,
    models: {},
    currentProvider: 'openrouter',
    currentModel: null,
    currentMode: 'default',
    sidebarCollapsed: localStorage.getItem('moult-sidebar-collapsed') === 'true',
    settings: {
        serverUrl: CONFIG.DEFAULT_SERVER,
        theme: localStorage.getItem('moult-theme') || 'dark',
        fontSize: parseInt(localStorage.getItem('moult-font-size')) || 14,
        exportFormat: localStorage.getItem('moult-export-format') || 'json'
    }
};

const el = {};
function $(id) { return document.getElementById(id); }

// ==========================================
// CUSTOM DROPDOWNS - VERSION CORRIGÉE (positionnement fixe)
// ==========================================
function createCustomDropdown(selectId, dropdownId, options, onChange, openUp = false, fullWidth = false) {
    const trigger = document.getElementById(selectId);
    const dropdown = document.getElementById(dropdownId);
    const selectedText = trigger ? trigger.querySelector('.selected-text') : null;
    
    if (!trigger || !dropdown) return null;

    let currentValue = options.length > 0 ? (options[0].value || options[0]) : null;
    let currentOptions = options;

    function renderOptions() {
        dropdown.innerHTML = '';
        currentOptions.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'custom-option';
            let displayLabel = opt.label || opt;
            if (window.innerWidth <= 768 && displayLabel.length > 35) {
                displayLabel = displayLabel.substring(0, 32) + '...';
            }
            div.textContent = displayLabel;
            div.dataset.value = opt.value || opt;
            div.title = opt.label || opt;
            
            if (div.dataset.value === currentValue) div.classList.add('selected');
            
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                currentValue = div.dataset.value;
                const fullLabel = opt.label || opt;
                if (selectedText) selectedText.textContent = fullLabel;
                
                dropdown.classList.remove('open');
                trigger.classList.remove('open');
                
                if (onChange) onChange(currentValue);
                
                document.querySelectorAll(`#${dropdownId} .custom-option`).forEach(opt => {
                    opt.classList.remove('selected');
                });
                div.classList.add('selected');
            });
            dropdown.appendChild(div);
        });
        
        if (fullWidth) {
            dropdown.style.width = '100%';
            dropdown.style.minWidth = '100%';
        } else if (trigger && window.innerWidth > 768) {
            dropdown.style.minWidth = trigger.offsetWidth + 'px';
            dropdown.style.width = 'auto';
        }
        
        if (window.innerWidth <= 768) {
            dropdown.style.maxWidth = (window.innerWidth - 32) + 'px';
            dropdown.style.minWidth = '200px';
        }
    }

    function positionDropdown() {
        if (!dropdown.classList.contains('open')) return;
        
        if (fullWidth) {
            // Format dropdown in settings — full width, opens upward
            dropdown.style.top = 'auto';
            dropdown.style.bottom = 'calc(100% + 4px)';
            dropdown.style.left = '0';
            dropdown.style.right = '0';
            dropdown.style.width = '100%';
            dropdown.style.minWidth = '100%';
            dropdown.style.transform = 'none';
            return;
        }
        
        // Align left edge of dropdown with left edge of trigger
        const wrapper = trigger.closest('.custom-select-wrapper') || trigger.parentElement;
        if (!wrapper) return;
        
        const wrapperRect = wrapper.getBoundingClientRect();
        const triggerRect = trigger.getBoundingClientRect();
        const leftOffset = triggerRect.left - wrapperRect.left;
        
        // Vertical positioning
        if (openUp) {
            dropdown.style.top = '';
            dropdown.style.bottom = 'calc(100% + 4px)';
        } else {
            dropdown.style.bottom = '';
            dropdown.style.top = 'calc(100% + 4px)';
        }
        
        // Horizontal: left-aligned with trigger
        dropdown.style.left = leftOffset + 'px';
        dropdown.style.transform = 'none';
        dropdown.style.right = 'auto';
        dropdown.style.width = 'auto';
        
        // Prevent viewport overflow (check after render)
        requestAnimationFrame(() => {
            const ddRect = dropdown.getBoundingClientRect();
            const overRight = ddRect.right - (window.innerWidth - 8);
            if (overRight > 0) {
                dropdown.style.left = Math.max(8, leftOffset - overRight) + 'px';
            }
            const ddRect2 = dropdown.getBoundingClientRect();
            if (ddRect2.left < 8) {
                dropdown.style.left = '8px';
            }
        });
    }

    function closeDropdownOnClickOutside(e) {
        if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
            trigger.classList.remove('open');
        }
    }

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const isOpen = dropdown.classList.contains('open');
        
        document.querySelectorAll('.custom-dropdown').forEach(d => {
            if (d !== dropdown) d.classList.remove('open');
        });
        document.querySelectorAll('.custom-select').forEach(s => {
            if (s !== trigger) s.classList.remove('open');
        });
        
        if (!isOpen) {
            dropdown.classList.add('open');
            trigger.classList.add('open');
            renderOptions();
            setTimeout(positionDropdown, 10);
        } else {
            dropdown.classList.remove('open');
            trigger.classList.remove('open');
        }
    });

    document.removeEventListener('click', closeDropdownOnClickOutside);
    document.addEventListener('click', closeDropdownOnClickOutside);
    
    window.removeEventListener('resize', positionDropdown);
    window.addEventListener('resize', () => {
        if (dropdown.classList.contains('open')) {
            setTimeout(positionDropdown, 10);
        }
    });
    
    window.removeEventListener('scroll', positionDropdown);
    window.addEventListener('scroll', () => {
        if (dropdown.classList.contains('open')) {
            setTimeout(positionDropdown, 10);
        }
    });

    if (options.length > 0 && selectedText) {
        selectedText.textContent = options[0].label || options[0];
        if (onChange) onChange(options[0].value || options[0]);
    }
    renderOptions();
    
    return { trigger, dropdown, setOptions: (newOptions) => { currentOptions = newOptions; renderOptions(); } };
}

function initCustomDropdowns() {
    // Model dropdown (s'ouvre vers le bas - normal)
    const modelOptions = [];
    Object.keys(state.models).forEach(provider => {
        if (state.models[provider] && state.models[provider].length) {
            state.models[provider].forEach(model => {
                modelOptions.push({
                    value: `${provider}:${model}`,
                    label: `${getProviderDisplayName(provider)} - ${simplifyModelName(model)}`
                });
            });
        }
    });
    
    if (modelOptions.length === 0) {
        modelOptions.push({ value: 'openrouter:nvidia/nemotron-3-nano-30b-a3b:free', label: 'OpenRouter - Nemotron' });
    }
    
    createCustomDropdown('model-select', 'model-dropdown', modelOptions, (value) => {
        const [provider, ...modelParts] = value.split(':');
        state.currentProvider = provider;
        state.currentModel = modelParts.join(':');
    }, false, false);
    
    // Mode dropdown (s'ouvre vers le HAUT)
    const modeOptions = [
        { value: 'default', label: '🤖 Assistant' },
        { value: 'coding', label: '💻 Code' },
        { value: 'creative', label: '🎨 Créatif' },
        { value: 'concise', label: '⚡ Concis' },
        { value: 'academic', label: '📚 Académique' },
        { value: 'debug', label: '🔍 Debug' }
    ];
    
    createCustomDropdown('mode-select', 'mode-dropdown', modeOptions, (value) => {
        state.currentMode = value;
        const modeMap = { default: '🤖 Assistant', coding: '💻 Code', creative: '🎨 Créatif', concise: '⚡ Concis', academic: '📚 Académique', debug: '🔍 Debug' };
        const selectedText = document.querySelector('#mode-select .selected-text');
        if (selectedText) selectedText.textContent = modeMap[value] || value;
    }, true, false);
    
    // Format dropdown (full width, s'ouvre vers le HAUT)
    const formatOptions = [
        { value: 'json', label: 'JSON' },
        { value: 'jsonl', label: 'JSONL' },
        { value: 'md', label: 'Markdown' },
        { value: 'alpaca', label: 'Alpaca' }
    ];
    
    createCustomDropdown('format-select', 'format-dropdown', formatOptions, (value) => {
        state.settings.exportFormat = value;
        localStorage.setItem('moult-export-format', value);
        showToast(t('urlUpdated'), 'success');
    }, true, true);
}

function getProviderDisplayName(provider) {
    const names = { openrouter: 'OpenRouter', groq: 'GroqCloud', hf: 'HuggingFace' };
    return names[provider] || provider;
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    ['sidebar','sidebar-close','sidebar-overlay','sidebar-collapse-btn','sidebar-fab',
     'menu-toggle','chat-history','new-chat-btn','search-btn','import-btn',
     'messages-area','welcome-screen','message-input','send-btn',
     'settings-btn','settings-modal','modal-close','server-url',
     'search-modal','search-modal-close','search-input','search-results',
     'export-btn','clear-chat-btn','toast-container','provider-status',
     'model-chips','chat-container','provider-badge'
    ].forEach(id => { el[toCamelCase(id)] = $(id); });

    applyTheme(state.settings.theme);
    applyFontSize(state.settings.fontSize);
    loadConversations();
    if (state.sidebarCollapsed) { el.sidebar.classList.add('collapsed'); el.sidebarFab?.classList.add('visible'); }
    setTimeout(() => { $('splash-screen')?.classList.add('hidden'); }, 1500);

    await fetchModels();
    initCustomDropdowns();
    setupEvents();
    applyTranslations();
    setupOfflineDetection();
    setupPWAUpdate();
    setupA2HS();
    el.messageInput?.focus();
    enforceHistoryTitleStyles();
});

function enforceHistoryTitleStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .history-title {
            font-family: 'Roboto', var(--font-sans) !important;
            font-weight: 400 !important;
            font-size: 0.8125rem !important;
            color: var(--text-secondary) !important;
            background: transparent !important;
            background-image: none !important;
            -webkit-text-fill-color: inherit !important;
            background-clip: unset !important;
        }
        .history-item.active .history-title {
            font-weight: 500 !important;
            color: var(--accent-primary) !important;
        }
    `;
    document.head.appendChild(style);
}

function toCamelCase(s) { return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); }

// ==========================================
// OFFLINE DETECTION
// ==========================================
function setupOfflineDetection() {
    let wasOffline = !navigator.onLine;
    const bar = document.createElement('div');
    bar.className = 'offline-bar';
    bar.style.display = 'none';
    document.body.appendChild(bar);

    function update() {
        const offline = !navigator.onLine;
        if (offline && !wasOffline) {
            bar.textContent = t('offline');
            bar.className = 'offline-bar';
            bar.style.display = 'block';
        }
        if (!offline && wasOffline) {
            bar.style.display = 'none';
        }
        wasOffline = offline;
    }
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    if (!navigator.onLine) {
        bar.textContent = t('offline');
        bar.className = 'offline-bar';
        bar.style.display = 'block';
    }
}

// ==========================================
// PWA AUTO-UPDATE
// ==========================================
function setupPWAUpdate() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            setInterval(() => {
                registration.update();
                console.log('[App] Checking for SW updates...');
            }, 60 * 60 * 1000);
        });
        
        navigator.serviceWorker.addEventListener('message', event => {
            if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                console.log('[App] Update available, reloading...');
                showToast('📱 ' + (currentLang === 'fr' ? 'Nouvelle version disponible, mise à jour...' : 'New version available, updating...'), 'info');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        });
        
        navigator.serviceWorker.ready.then(registration => {
            registration.update();
        });
    }
}

// ==========================================
// A2HS (ADD TO HOME SCREEN) BANNER
// ==========================================
let deferredInstallPrompt = null;

function setupA2HS() {
    const banner = document.getElementById('a2hs-banner');
    const installBtn = document.getElementById('a2hs-install');
    const laterBtn = document.getElementById('a2hs-later');

    if (!banner || !installBtn || !laterBtn) return;

    // Do not show if already installed (standalone)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
        return;
    }

    // Capture the install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;

        // Show banner after a short delay for elegance
        setTimeout(() => {
            banner.classList.add('visible');
        }, 2500);
    });

    // Install button click
    installBtn.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log('[A2HS] User choice:', outcome);
        deferredInstallPrompt = null;
        banner.classList.remove('visible');
        if (outcome === 'accepted') {
            showToast(t('installSuccess') || 'Application installee', 'success');
        }
    });

    // Later button click — just hide, will reappear on next reload
    laterBtn.addEventListener('click', () => {
        banner.classList.add('hiding');
        banner.classList.remove('visible');
        setTimeout(() => {
            banner.classList.remove('hiding');
        }, 500);
    });

    // Hide banner when app gets installed
    window.addEventListener('appinstalled', () => {
        banner.classList.remove('visible');
        banner.classList.remove('hiding');
        deferredInstallPrompt = null;
    });
}

// ==========================================
// MODELS
// ==========================================
const ALLOWED_MODELS = {
    openrouter: [
        'nvidia/nemotron-3-nano-30b-a3b:free',
        'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        'nvidia/nemotron-nano-12b-v2-vl:free',
        'nvidia/nemotron-3-ultra-550b-a55b:free',
        'poolside/laguna-m.1:free'
    ],
    groq: [
        'llama-3.3-70b-versatile'
    ],
    hf: []
};

async function fetchModels() {
    try {
        const res = await fetch(`${state.settings.serverUrl}/api/models`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        const rawModels = data.models || {};
        // Filter to only allowed models
        state.models = {};
        Object.keys(ALLOWED_MODELS).forEach(provider => {
            const allowed = ALLOWED_MODELS[provider];
            const available = rawModels[provider] || [];
            state.models[provider] = allowed.filter(m => available.includes(m));
        });
        updateModelDropdown();
        updateProviderStatus(data.providers || {});
        populateModelChips();
    } catch (e) {
        state.models = JSON.parse(JSON.stringify(ALLOWED_MODELS));
        updateModelDropdown();
        populateModelChips();
        updateProviderStatus({ openrouter: false, groq: false, hf: false });
    }
}

function updateModelDropdown() {
    const modelOptions = [];
    Object.keys(state.models).forEach(provider => {
        if (state.models[provider] && state.models[provider].length) {
            state.models[provider].forEach(model => {
                modelOptions.push({
                    value: `${provider}:${model}`,
                    label: `${getProviderDisplayName(provider)} - ${simplifyModelName(model)}`
                });
            });
        }
    });
    
    if (modelOptions.length === 0) {
        modelOptions.push({ value: 'openrouter:nvidia/nemotron-3-nano-30b-a3b:free', label: 'OpenRouter - Nemotron' });
    }
    
    const trigger = document.getElementById('model-select');
    const dropdown = document.getElementById('model-dropdown');
    if (trigger && dropdown) {
        const selectedText = trigger.querySelector('.selected-text');
        if (selectedText && modelOptions[0]) {
            selectedText.textContent = modelOptions[0].label;
            const [provider, ...modelParts] = modelOptions[0].value.split(':');
            state.currentProvider = provider;
            state.currentModel = modelParts.join(':');
        }
        dropdown.innerHTML = '';
        modelOptions.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'custom-option';
            div.textContent = opt.label;
            div.dataset.value = opt.value;
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                const [provider, ...modelParts] = opt.value.split(':');
                state.currentProvider = provider;
                state.currentModel = modelParts.join(':');
                if (selectedText) selectedText.textContent = opt.label;
                dropdown.classList.remove('open');
                trigger.classList.remove('open');
                document.querySelectorAll('#model-dropdown .custom-option').forEach(o => o.classList.remove('selected'));
                div.classList.add('selected');
            });
            dropdown.appendChild(div);
        });
        // Set min-width only when not open (CSS handles centering when open)
        if (!dropdown.classList.contains('open') && trigger) {
            dropdown.style.minWidth = trigger.offsetWidth + 'px';
        }
    }
}

function populateModelChips() { 
    if (!el.modelChips) return; 
    const all = []; 
    Object.values(state.models).forEach(m => { if (m) m.forEach(x => all.push(x)); }); 
    el.modelChips.innerHTML = all.map(m => `<span class="chip">${simplifyModelName(m)}</span>`).join(''); 
}

function simplifyModelName(model) {
    if (!model) return 'Unknown';
    const m = model.split('/').pop().replace(/:free$/, '');
    const map = { 'nemotron': 'Nemotron', 'llama': 'Llama', 'qwen': 'Qwen', 'poolside': 'Poolside', 'gemma': 'Gemma', 'deepseek': 'DeepSeek', 'mimo': 'Mimo', 'mistral': 'Mistral', 'mixtral': 'Mixtral', 'phi': 'Phi', 'yi': 'Yi' };
    const lower = m.toLowerCase();
    for (const [key, name] of Object.entries(map)) {
        if (lower.includes(key)) {
            const parts = m.split('-'); const idx = parts.findIndex(p => p.toLowerCase().includes(key));
            const version = parts.slice(idx + 1).join(' ').replace(/:free/g, '').trim();
            return version ? `${name} ${version}` : name;
        }
    }
    return m.length > 30 ? m.substring(0, 27) + '...' : m;
}

function updateProviderStatus(providers) { 
    const c = el.providerStatus; 
    if (!c) return; 
    ['openrouter', 'groq', 'hf'].forEach(name => { 
        const item = c.querySelector(`.status-item[data-provider="${name}"]`); 
        if (item) { 
            item.classList.remove('online', 'offline'); 
            item.classList.add(providers[name] ? 'online' : 'offline'); 
        } 
    }); 
}

// ==========================================
// DELETE ALL CONVERSATIONS MODAL
// ==========================================
function showDeleteAllModal() {
    const modal = document.getElementById('delete-all-modal');
    if (modal) modal.classList.add('active');
}

function closeDeleteAllModal() {
    const modal = document.getElementById('delete-all-modal');
    if (modal) modal.classList.remove('active');
}

function clearAllConversations() {
    state.conversations = [];
    state.currentConversationId = null;
    saveConversations();
    
    if (el.messagesArea) {
        el.messagesArea.innerHTML = '';
        el.messagesArea.classList.remove('active');
    }
    if (el.welcomeScreen) el.welcomeScreen.style.display = 'flex';
    if (el.messageInput) {
        el.messageInput.value = '';
        handleInput();
    }
    renderHistory();
    showToast(t('allConversationsDeleted'), 'success');
    closeDeleteAllModal();
}

// ==========================================
// EVENTS
// ==========================================
function setupEvents() {
    el.menuToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.sidebar.classList.add('open');
        el.sidebarOverlay.classList.add('active');
    });
    el.sidebarClose?.addEventListener('click', closeSidebar);
    el.sidebarOverlay?.addEventListener('click', closeSidebar);
    el.sidebarCollapseBtn?.addEventListener('click', toggleSidebarCollapse);
    el.sidebarFab?.addEventListener('click', openSidebarFab);

    el.newChatBtn?.addEventListener('click', startNewChat);
    el.searchBtn?.addEventListener('click', openSearch);
    el.searchModalClose?.addEventListener('click', () => el.searchModal.classList.remove('active'));
    el.searchModal?.querySelector('.modal-overlay')?.addEventListener('click', () => el.searchModal.classList.remove('active'));
    el.searchInput?.addEventListener('input', performSearch);
    el.importBtn?.addEventListener('click', importConversations);

    el.messageInput?.addEventListener('input', handleInput);
    el.messageInput?.addEventListener('keydown', handleKeydown);
    el.sendBtn?.addEventListener('click', sendMessage);

    el.settingsBtn?.addEventListener('click', () => el.settingsModal.classList.add('active'));
    el.modalClose?.addEventListener('click', closeSettings);
    el.settingsModal?.querySelector('.modal-overlay')?.addEventListener('click', closeSettings);

    el.serverUrlInput?.addEventListener('change', (e) => {
        state.settings.serverUrl = e.target.value; 
        localStorage.setItem('moult-server-url', e.target.value);
        fetchModels(); 
        showToast(t('urlUpdated'), 'success');
    });

    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', () => {
            applyTheme(btn.dataset.theme);
            document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    const fontSizeInput = $('font-size');
    if (fontSizeInput) {
        fontSizeInput.addEventListener('input', (e) => {
            const size = parseInt(e.target.value); 
            state.settings.fontSize = size;
            localStorage.setItem('moult-font-size', size); 
            applyFontSize(size);
            document.querySelector('.range-value').textContent = `${size}px`;
        });
        fontSizeInput.value = state.settings.fontSize;
        document.querySelector('.range-value').textContent = `${state.settings.fontSize}px`;
    }

    el.exportBtn?.addEventListener('click', exportConversations);
    
    // Delete all conversations - corbeille button
    el.clearChatBtn?.addEventListener('click', () => {
        if (state.conversations.length === 0) {
            showToast(t('noHistory'), 'warning');
            return;
        }
        showDeleteAllModal();
    });

    document.querySelectorAll('.quick-action').forEach(btn => {
        btn.addEventListener('click', () => { 
            el.messageInput.value = btn.dataset.prompt; 
            handleInput(); 
            el.messageInput.focus(); 
        });
    });

    document.querySelector('.main')?.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && el.sidebar.classList.contains('open') && !e.target.closest('.sidebar')) closeSidebar();
    });

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const themes = ['dark', 'light', 'ocean', 'forest', 'sunset', 'midnight'];
        const idx = themes.indexOf(state.settings.theme); 
        const next = themes[(idx + 1) % themes.length];
        applyTheme(next);
        document.querySelectorAll('.theme-option').forEach(b => b.classList.toggle('active', b.dataset.theme === next));
        showToast(`${t('themeChanged')} ${next}`, 'success');
    });

    $('lang-toggle')?.addEventListener('click', () => $('language-modal')?.classList.add('active'));
    $('lang-modal-close')?.addEventListener('click', () => $('language-modal')?.classList.remove('active'));
    $('language-modal')?.querySelector('.modal-overlay')?.addEventListener('click', () => $('language-modal')?.classList.remove('active'));

    document.querySelectorAll('.lang-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.dataset.lang;
            const dir = RTL_LANGS.includes(currentLang) ? 'rtl' : 'ltr';
            document.documentElement.setAttribute('dir', dir);
            document.documentElement.setAttribute('lang', currentLang);
            localStorage.setItem('moult-lang', currentLang);
            document.querySelectorAll('.lang-option-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === currentLang));
            applyTranslations();
            $('language-modal')?.classList.remove('active');
            showToast(`${t('langChanged')} ${btn.textContent.trim()}`, 'success');
        });
    });

    // Delete modal event listeners
    document.getElementById('delete-all-modal-close')?.addEventListener('click', closeDeleteAllModal);
    document.querySelector('#delete-all-modal .modal-overlay')?.addEventListener('click', closeDeleteAllModal);
    document.getElementById('delete-all-cancel')?.addEventListener('click', closeDeleteAllModal);
    document.getElementById('delete-all-confirm')?.addEventListener('click', clearAllConversations);

    const savedLang = localStorage.getItem('moult-lang') || 'fr';
    currentLang = savedLang;
    document.documentElement.setAttribute('dir', RTL_LANGS.includes(savedLang) ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', savedLang);
    document.querySelectorAll('.lang-option-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === savedLang));
}

function closeSidebar() { el.sidebar.classList.remove('open'); el.sidebarOverlay.classList.remove('active'); }
function closeSettings() { el.settingsModal.classList.remove('active'); }
function applyFontSize(size) { document.documentElement.style.fontSize = `${size}px`; }
function toggleSidebarCollapse() { state.sidebarCollapsed = !state.sidebarCollapsed; el.sidebar.classList.toggle('collapsed', state.sidebarCollapsed); el.sidebarFab?.classList.toggle('visible', state.sidebarCollapsed); localStorage.setItem('moult-sidebar-collapsed', state.sidebarCollapsed); }
function openSidebarFab() { state.sidebarCollapsed = false; el.sidebar.classList.remove('collapsed'); el.sidebarFab?.classList.remove('visible'); localStorage.setItem('moult-sidebar-collapsed', 'false'); }

// ==========================================
// SEARCH
// ==========================================
function openSearch() { el.searchModal.classList.add('active'); el.searchInput.value = ''; el.searchResults.innerHTML = ''; el.searchInput.focus(); }
function performSearch() {
    const query = el.searchInput.value.trim().toLowerCase();
    if (!query) { el.searchResults.innerHTML = ''; return; }
    const results = [];
    state.conversations.forEach(conv => {
        const titleMatch = conv.title.toLowerCase().includes(query);
        const msgs = (conv.messages || []).filter(m => m.content && m.content.toLowerCase().includes(query));
        if (titleMatch || msgs.length > 0) results.push({ conversation: conv, msgs: msgs.slice(0, 3) });
    });
    if (!results.length) { el.searchResults.innerHTML = `<div style="text-align:center;padding:var(--space-lg);color:var(--text-muted);font-size:.85rem">${t('noResults')} « ${escapeHtml(query)} »</div>`; return; }
    el.searchResults.innerHTML = '';
    results.forEach(({ conversation, msgs }) => {
        const item = document.createElement('div'); item.className = 'search-result-item';
        const preview = msgs.length > 0 ? highlightText(msgs[0].content.substring(0, 120) + (msgs[0].content.length > 120 ? '...' : ''), query) : '';
        item.innerHTML = `<div class="search-result-title">${highlightText(conversation.title, query)}</div>${preview ? `<div class="search-result-preview">${preview}</div>` : ''}`;
        item.addEventListener('click', () => { el.searchModal.classList.remove('active'); loadConversation(conversation.id); });
        el.searchResults.appendChild(item);
    });
}
function highlightText(text, query) { if (!query) return escapeHtml(text); return escapeHtml(text).replace(new RegExp(`(${escapeRegex(query)})`, 'gi'), '<span class="search-result-highlight">$1</span>'); }
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// ==========================================
// IMPORT / EXPORT
// ==========================================
function importConversations() {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,.jsonl,.md,.txt';
    input.onchange = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        try {
            const text = await file.text(); let imported = [];
            const ext = file.name.split('.').pop().toLowerCase();
            if (ext === 'jsonl') { for (const line of text.split('\n')) { if (line.trim()) imported.push(JSON.parse(line)); } }
            else if (ext === 'md' || ext === 'txt') { imported.push({ title: file.name.replace(/\.\w+$/, ''), messages: text.split('\n').filter(l => l.trim()).map(l => ({ role: l.startsWith('## ') ? 'user' : 'assistant', content: l.replace(/^##\s*/, '') })) }); }
            else { const data = JSON.parse(text); imported = Array.isArray(data) ? data : (data.messages ? [data] : [data]); }
            for (const item of imported) {
                if (item.messages && item.title) state.conversations.unshift({ id: Date.now().toString() + Math.random().toString(36).substr(2, 5), title: item.title, messages: item.messages, createdAt: item.createdAt || new Date().toISOString(), updatedAt: item.updatedAt || new Date().toISOString() });
                else if (item.role && item.content) state.conversations.unshift({ id: Date.now().toString() + Math.random().toString(36).substr(2, 5), title: t('newConv'), messages: [item], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            }
            saveConversations(); renderHistory();
            showToast(`${imported.length} ${t('importSuccess')}`, 'success');
        } catch (err) { showToast('Error: ' + err.message, 'error'); }
    }; input.click();
}

async function exportConversations() {
    const format = state.settings.exportFormat || 'json';
    if (format === 'json' || format === 'jsonl') {
        if (typeof JSZip === 'undefined') { await loadJSZip(); }
        const zip = new JSZip();
        for (const conv of state.conversations) { const safe = conv.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50); const date = new Date(conv.createdAt).toISOString().split('T')[0]; if (format === 'json') zip.file(`${safe}_${date}.json`, JSON.stringify(conv, null, 2)); else zip.file(`${safe}_${date}.jsonl`, conv.messages.map(m => JSON.stringify(m)).join('\n')); }
        const blob = await zip.generateAsync({ type: 'blob' }); downloadBlob(blob, `moult-ai-export-${Date.now()}.zip`);
    } else if (format === 'alpaca') { let lines = []; for (const conv of state.conversations) { const msgs = conv.messages; for (let i = 0; i < msgs.length - 1; i++) { if (msgs[i].role === 'user' && msgs[i + 1].role === 'assistant') lines.push(JSON.stringify({ instruction: msgs[i].content, input: '', output: msgs[i + 1].content })); } } downloadBlob(new Blob([lines.join('\n')], { type: 'application/jsonl' }), `moult-ai-alpaca-${Date.now()}.jsonl`); }
    else if (format === 'md') { let md = ''; for (const conv of state.conversations) { md += `## ${conv.title}\n\n`; for (const msg of conv.messages) { md += `**${msg.role === 'user' ? '👤 ' + t('youLabel') : '🤖 ' + t('aiLabel')}** : ${msg.content}\n\n`; } md += '---\n\n'; } downloadBlob(new Blob([md], { type: 'text/markdown' }), `moult-ai-export-${Date.now()}.md`); }
    showToast('Export OK', 'success');
}
function downloadBlob(blob, filename) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }
function loadJSZip() { return new Promise((r, j) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.onload = r; s.onerror = j; document.head.appendChild(s); }); }

// ==========================================
// CONVERSATIONS
// ==========================================
function loadConversations() { try { state.conversations = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY)) || []; } catch { state.conversations = []; } renderHistory(); }
function saveConversations() { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.conversations.slice(-CONFIG.MAX_HISTORY))); }

function startNewChat() { state.currentConversationId = null; if (el.messagesArea) el.messagesArea.innerHTML = ''; el.messagesArea?.classList.remove('active'); if (el.welcomeScreen) el.welcomeScreen.style.display = 'flex'; el.messageInput.value = ''; handleInput(); renderHistory(); if (window.innerWidth <= 768) closeSidebar(); }
function createConversation(title) { const conv = { id: Date.now().toString(), title: title || t('newConv'), messages: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; state.conversations.unshift(conv); state.currentConversationId = conv.id; saveConversations(); renderHistory(); return conv; }
function getCurrentConversation() { return state.conversations.find(c => c.id === state.currentConversationId); }
function addMessageToConversation(role, content, meta = {}) { const conv = getCurrentConversation(); if (!conv) return; conv.messages.push({ role, content, timestamp: new Date().toISOString(), ...meta }); conv.updatedAt = new Date().toISOString(); if (conv.messages.length === 1 && role === 'user') conv.title = content.length > 40 ? content.substring(0, 40) + '...' : content; saveConversations(); renderHistory(); }
function loadConversation(id) { const conv = state.conversations.find(c => c.id === id); if (!conv) return; state.currentConversationId = id; el.welcomeScreen.style.display = 'none'; el.messagesArea.classList.add('active'); el.messagesArea.innerHTML = ''; conv.messages.forEach(m => renderMessage(m.role, m.content, m)); renderHistory(); scrollToBottom(); if (window.innerWidth <= 768) closeSidebar(); }
function deleteConversation(id, event) { event.stopPropagation(); state.conversations = state.conversations.filter(c => c.id !== id); if (state.currentConversationId === id) startNewChat(); saveConversations(); renderHistory(); showToast(t('convDeleted'), 'success'); }

function clearCurrentChat() { 
    const conv = getCurrentConversation(); 
    if (conv) { 
        conv.messages = []; 
        conv.updatedAt = new Date().toISOString(); 
        saveConversations(); 
    } 
    state.currentConversationId = null; 
    el.messagesArea.innerHTML = ''; 
    el.messagesArea.classList.remove('active'); 
    if (el.welcomeScreen) el.welcomeScreen.style.display = 'flex'; 
    renderHistory(); 
    showToast(t('convCleared'), 'success'); 
}

// ==========================================
// HISTORY RENDER
// ==========================================
function renderHistory() {
    const c = el.chatHistory; if (!c) return; c.innerHTML = '';
    if (!state.conversations.length) { c.innerHTML = `<div style="text-align:center;padding:var(--space-lg);color:var(--text-muted);font-size:.8rem">${t('noHistory')}</div>`; return; }
    state.conversations.forEach(conv => {
        const item = document.createElement('div');
        item.className = `history-item ${conv.id === state.currentConversationId ? 'active' : ''}`;
        item.innerHTML = `<span class="history-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span><span class="history-title">${escapeHtml(conv.title)}</span><div class="history-actions"><button class="history-action-btn edit-btn" title="${t('rename')}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button><button class="history-action-btn delete-btn" title="${t('delete')}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>`;
        item.addEventListener('click', (e) => { if (!e.target.closest('.history-actions')) loadConversation(conv.id); });
        const editBtn = item.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => { e.stopPropagation(); editTitle(item.querySelector('.history-title'), conv); });
        }
        const deleteBtn = item.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => deleteConversation(conv.id, e));
        }
        c.appendChild(item);
    });
}

function editTitle(titleSpan, conversation) {
    titleSpan.contentEditable = true; 
    titleSpan.focus();
    titleSpan.style.fontFamily = "'Roboto', var(--font-sans)";
    titleSpan.style.fontWeight = "400";
    titleSpan.style.fontSize = "0.8125rem";
    titleSpan.style.color = "var(--text-secondary)";
    titleSpan.style.background = "var(--bg-tertiary)";
    const range = document.createRange(); 
    range.selectNodeContents(titleSpan); 
    const sel = window.getSelection(); 
    sel.removeAllRanges(); 
    sel.addRange(range);
    const original = conversation.title;
    const finish = () => { 
        titleSpan.contentEditable = false; 
        const t2 = titleSpan.textContent.trim(); 
        if (t2 && t2 !== original) { 
            conversation.title = t2; 
            saveConversations(); 
            showToast(t('titleModified'), 'success'); 
        } else { 
            titleSpan.textContent = original; 
        }
        titleSpan.style.cssText = '';
        titleSpan.className = 'history-title';
    };
    titleSpan.addEventListener('blur', finish, { once: true });
    titleSpan.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') { 
            e.preventDefault(); 
            titleSpan.blur(); 
        } 
        if (e.key === 'Escape') { 
            titleSpan.textContent = original; 
            titleSpan.blur(); 
        } 
    });
}

// ==========================================
// RENDER MESSAGES
// ==========================================
function renderMessage(role, content, meta = {}) {
    const msg = document.createElement('div'); msg.className = `message ${role === 'user' ? 'user' : 'ai'}`;
    const avatar = document.createElement('div'); avatar.className = 'message-avatar';
    avatar.innerHTML = role === 'user' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>';
    const contentDiv = document.createElement('div'); contentDiv.className = 'message-content';
    const header = document.createElement('div'); header.className = 'message-header';
    header.innerHTML = `<span class="message-author">${role === 'user' ? t('youLabel') : t('aiLabel')}</span><span class="message-time">${new Date(meta.timestamp || Date.now()).toLocaleTimeString()}</span>`;
    if (role === 'ai' && meta.model) { const b = document.createElement('span'); b.className = 'message-model-badge'; b.textContent = simplifyModelName(meta.model); header.appendChild(b); }
    const bubble = document.createElement('div'); bubble.className = 'message-bubble'; bubble.innerHTML = formatMarkdown(content);
    contentDiv.appendChild(header); contentDiv.appendChild(bubble);
    if (meta.reasoning && role === 'ai') {
        const rb = document.createElement('div'); rb.className = 'reasoning-block';
        rb.innerHTML = `<div class="reasoning-header"><span>${t('reasoning')}</span></div><div class="reasoning-content">${escapeHtml(meta.reasoning)}</div>`;
        rb.querySelector('.reasoning-header').addEventListener('click', () => rb.querySelector('.reasoning-content').classList.toggle('collapsed'));
        contentDiv.appendChild(rb);
    }
    const actions = document.createElement('div'); actions.className = 'message-actions';
    actions.innerHTML = `<button class="message-action copy-msg-btn" title="${t('copy')}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> ${t('copy')}</button>`;
    actions.querySelector('.copy-msg-btn').addEventListener('click', () => { navigator.clipboard.writeText(content); showToast(t('copied'), 'success'); });
    contentDiv.appendChild(actions);
    msg.appendChild(avatar); msg.appendChild(contentDiv);
    el.messagesArea.appendChild(msg); scrollToBottom();
    renderMathInElement(msg);
}

// ==========================================
// CODE COPY — event delegation
// ==========================================
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.code-copy-btn');
    if (!btn) return;
    const wrapper = btn.closest('.code-block-wrapper');
    if (!wrapper) return;
    const code = wrapper.querySelector('code');
    if (!code) return;
    navigator.clipboard.writeText(code.textContent).then(() => {
        btn.textContent = '✓';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = t('copyCode'); btn.classList.remove('copied'); }, 2000);
    }).catch(() => {
        const range = document.createRange();
        range.selectNodeContents(code);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    });
});

// ==========================================
// KATEX MATH RENDERING
// ==========================================
function renderMathInElement(container) {
    if (typeof katex === 'undefined') return;
    container.querySelectorAll('.math-block, .math-inline').forEach(el => {
        const tex = el.getAttribute('data-tex');
        if (!tex) return;
        try {
            katex.render(tex, el, { displayMode: el.classList.contains('math-block'), throwOnError: false, trust: true });
        } catch (e) {
            el.textContent = tex;
        }
    });
}

function renderStreamingMessage(id) {
    const msg = document.createElement('div'); msg.className = 'message ai streaming'; msg.id = id;
    const modelBadge = state.currentModel ? `<span class="message-model-badge">${simplifyModelName(state.currentModel)}</span>` : '';
    msg.innerHTML = `<div class="message-avatar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg></div><div class="message-content"><div class="message-header"><span class="message-author">${t('aiLabel')}</span><span class="message-time">...</span>${modelBadge}</div><div class="message-bubble"><span class="typing-cursor">▌</span></div></div>`;
    el.messagesArea.appendChild(msg); scrollToBottom(); return msg;
}

function updateStreamingMessage(id, content) { const msg = document.getElementById(id); if (!msg) return; const bubble = msg.querySelector('.message-bubble'); if (bubble) { bubble.innerHTML = formatMarkdown(content); renderMathInElement(bubble); scrollToBottom(); } }

function finalizeStreamingMessage(id, content) {
    const msg = document.getElementById(id); if (!msg) return; msg.classList.remove('streaming');
    const bubble = msg.querySelector('.message-bubble'); if (bubble) { bubble.innerHTML = formatMarkdown(content); renderMathInElement(bubble); }
    const time = msg.querySelector('.message-time'); if (time) time.textContent = new Date().toLocaleTimeString();
    const contentDiv = msg.querySelector('.message-content');
    if (contentDiv && !contentDiv.querySelector('.message-actions')) {
        const actions = document.createElement('div'); actions.className = 'message-actions';
        actions.innerHTML = `<button class="message-action copy-msg-btn" title="${t('copy')}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> ${t('copy')}</button>`;
        actions.querySelector('.copy-msg-btn').addEventListener('click', () => { navigator.clipboard.writeText(content); showToast(t('copied'), 'success'); });
        contentDiv.appendChild(actions);
    }
    scrollToBottom();
}

// ==========================================
// MARKDOWN RENDERER
// ==========================================
function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);

    // 1) Protect fenced code blocks
    const codeBlocks = [];
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const idx = codeBlocks.length;
        const langLabel = lang ? `<span class="code-lang">${lang}</span>` : '';
        codeBlocks.push(`<div class="code-block-wrapper" data-code-idx="${idx}">${langLabel}<button class="code-copy-btn">${t('copyCode')}</button><pre><code class="language-${lang}">${code}</code></pre></div>`);
        return `%%CB_${idx}%%`;
    });
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
        const idx = codeBlocks.length;
        codeBlocks.push(`<div class="code-block-wrapper" data-code-idx="${idx}"><button class="code-copy-btn">${t('copyCode')}</button><pre><code>${code}</code></pre></div>`);
        return `%%CB_${idx}%%`;
    });

    // 2) Protect inline code
    const inlineCodes = [];
    html = html.replace(/`([^`]+)`/g, (m, code) => { const i = inlineCodes.length; inlineCodes.push(`<code>${code}</code>`); return `%%IC_${i}%%`; });

    // 3) LaTeX / Math
    const mathBlocks = [];
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (m, tex) => { const i = mathBlocks.length; mathBlocks.push(`<div class="math-block" data-tex="${escapeHtml(tex)}">$${tex}$</div>`); return `%%MATH_${i}%%`; });
    html = html.replace(/\$([^\$\n]+?)\$/g, (m, tex) => { const i = mathBlocks.length; mathBlocks.push(`<span class="math-inline" data-tex="${escapeHtml(tex)}">$${tex}$</span>`); return `%%MATH_${i}%%`; });

    // 4) Headings
    html = html.replace(/^#{1,6}\s+(.+)$/gm, (m, c) => `<h${m.match(/^(#+)/)[1].length}>${c}</h${m.match(/^(#+)/)[1].length}>`);

    // 5) Bold+italic, bold, italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // 6) Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // 7) Horizontal rules
    html = html.replace(/^---+$/gm, '<hr>');
    html = html.replace(/^\*\*\*+$/gm, '<hr>');

    // 8) Blockquotes
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/<\/blockquote>\s*<blockquote>/g, '\n');

    // 9) Unordered lists
    html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>[\s\S]*?<\/li>\n?)+)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // 10) Ordered lists
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<oli>$1</oli>');
    html = html.replace(/((?:<oli>[\s\S]*?<\/oli>\n?)+)/g, (m) => '<ol>' + m.replace(/<\/?oli>/g, t => t.replace('oli', 'li')) + '</ol>');

    // 11) Tables
    html = html.replace(/^\|(.+)\|$/gm, (m, content) => {
        const cells = content.split('|').map(c => c.trim());
        if (cells.every(c => /^[-:]+$/.test(c))) return '%%TSEP%%';
        return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    });
    html = html.replace(/((?:<tr>[\s\S]*?<\/tr>\n?%%TSEP%%?\n?)+)/g, (m) => {
        const cleaned = m.replace(/%%TSEP%%\n?/g, '');
        const firstRowMatch = cleaned.match(/<td>([\s\S]*?)<\/tr>/);
        if (firstRowMatch) {
            const thead = '<thead>' + firstRowMatch[0] + '</thead>';
            const tbody = '<tbody>' + cleaned.replace(firstRowMatch[0], '') + '</tbody>';
            return '<td>' + thead + tbody + '</table>';
        }
        return '</table>' + cleaned + '</table>';
    });

    // 12) Links and images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:var(--radius-md)">');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // 13) Paragraphs
    html = html.replace(/\n\n+/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    if (!html.match(/^<(h[1-6]|ul|ol|pre|blockquote|hr|table|div)/)) html = '<p>' + html + '</p>';
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p>\s*<br>\s*/g, '<p>');
    html = html.replace(/<br>\s*<\/p>/g, '</p>');

    // 14) Restore
    codeBlocks.forEach((b, i) => { html = html.replace(`%%CB_${i}%%`, b); });
    inlineCodes.forEach((c, i) => { html = html.replace(`%%IC_${i}%%`, c); });
    mathBlocks.forEach((m, i) => { html = html.replace(`%%MATH_${i}%%`, m); });

    return html;
}

// ==========================================
// SEND
// ==========================================
function handleInput() { el.sendBtn.disabled = el.messageInput.value.length === 0 || state.isLoading; el.messageInput.style.height = 'auto'; el.messageInput.style.height = Math.min(el.messageInput.scrollHeight, 200) + 'px'; }
function handleKeydown(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!el.sendBtn.disabled) sendMessage(); } }

async function sendMessage() {
    const message = el.messageInput.value.trim();
    if (!message || state.isLoading) return;
    let conv = getCurrentConversation();
    if (!conv) conv = createConversation(message.substring(0, 40) + (message.length > 40 ? '...' : ''));
    el.welcomeScreen.style.display = 'none'; el.messagesArea.classList.add('active');
    addMessageToConversation('user', message); renderMessage('user', message);
    el.messageInput.value = ''; el.messageInput.style.height = 'auto'; handleInput(); scrollToBottom();
    state.isLoading = true; el.sendBtn.disabled = true;
    const typingId = showTypingIndicator();
    const modeMap = { '🤖 Assistant': 'default', '💻 Code': 'coding', '🎨 Créatif': 'creative', '⚡ Concis': 'concise', '📚 Académique': 'academic', '🔍 Debug': 'debug' };
    const mode = modeMap[state.currentMode] || state.currentMode || 'default';
    const history = (conv.messages || []).slice(-20).filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({ role: m.role, content: m.content }));
    try {
        const res = await fetch(`${state.settings.serverUrl}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, provider: state.currentProvider, model: state.currentModel, mode, reasoning: false, stream: true, history }) });
        removeTypingIndicator(typingId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await handleStreamResponse(res);
    } catch (error) { removeTypingIndicator(typingId); if (navigator.onLine) showToast(`Error: ${error.message}`, 'error'); state.isLoading = false; el.sendBtn.disabled = false; }
}

async function handleStreamResponse(res) {
    const reader = res.body.getReader(), decoder = new TextDecoder();
    let full = '', reasoning = '', msgId = 'msg-' + Date.now();
    renderStreamingMessage(msgId);
    try {
        while (true) {
            const { done, value } = await reader.read(); if (done) break;
            for (const line of decoder.decode(value, { stream: true }).split('\n')) {
                if (!line.startsWith('data: ')) continue;
                const d = line.slice(6); if (d === '[DONE]') continue;
                try { const parsed = JSON.parse(d); if (parsed.error) throw new Error(parsed.error); const delta = parsed.choices?.[0]?.delta; if (delta?.content) { full += delta.content; updateStreamingMessage(msgId, full); } if (delta?.reasoning) reasoning += delta.reasoning; } catch {}
            }
        }
        finalizeStreamingMessage(msgId, full);
        addMessageToConversation('assistant', full, { provider: state.currentProvider, model: state.currentModel, reasoning });
    } catch (err) { finalizeStreamingMessage(msgId, `Error: ${err.message}`); }
    finally { state.isLoading = false; el.sendBtn.disabled = false; scrollToBottom(); }
}

// ==========================================
// UI UTILS
// ==========================================
function showTypingIndicator() {
    const id = 'typing-' + Date.now(); const div = document.createElement('div'); div.className = 'message ai typing'; div.id = id;
    div.innerHTML = `<div class="message-avatar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg></div><div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
    el.messagesArea.appendChild(div); scrollToBottom(); return id;
}
function removeTypingIndicator(id) { document.getElementById(id)?.remove(); }

function showToast(message, type = 'info') {
    const toast = document.createElement('div'); toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : 'ℹ';
    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    el.toastContainer.appendChild(toast);
    setTimeout(() => { toast.classList.add('toast-exit'); setTimeout(() => toast.remove(), 300); }, 4000);
}

function scrollToBottom() { requestAnimationFrame(() => { el.chatContainer?.scrollTo({ top: el.chatContainer.scrollHeight, behavior: 'smooth' }); }); }
function escapeHtml(text) { const d = document.createElement('div'); d.textContent = text; return d.innerHTML; }
function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('moult-theme', theme); state.settings.theme = theme; }

// ==========================================
// RESET FUNCTION (pour debugging)
// ==========================================
function resetApp() {
    localStorage.clear();
    sessionStorage.clear();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
            regs.forEach(reg => reg.unregister());
        });
    }
    window.location.reload();
}
