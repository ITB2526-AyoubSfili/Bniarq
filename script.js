document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar iconos Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // 2. Inicializar animaciones de Scroll
    initScrollAnimations();
    
    // 3. Inicializar el formulario del Dossier
    initDossierForm();
    
    // 4. Iniciar Contadores Animados
    initCounters();
});

// ==========================================
// 1. INTERACTIVIDAD PESTAÑAS (SOFTWARE MODULES)
// ==========================================
function changeFeature(tabName) {
    const tabs = ['grafo', 'dataroom', 'matching'];
    
    tabs.forEach(tab => {
        const btn = document.getElementById(`tab-${tab}`);
        const img = document.getElementById(`img-${tab}`);
        
        if (tab === tabName) {
            btn.classList.add('active-tab');
            btn.classList.remove('inactive-tab');
            img.classList.remove('opacity-0', 'pointer-events-none');
            img.classList.add('opacity-100');
        } else {
            btn.classList.add('inactive-tab');
            btn.classList.remove('active-tab');
            img.classList.add('opacity-0', 'pointer-events-none');
            img.classList.remove('opacity-100');
        }
    });
}

// ==========================================
// 2. ANIMACIONES AL SCROLL (Reveal Tech)
// ==========================================
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.15 }); 

    reveals.forEach(reveal => observer.observe(reveal));

    // Navbar blur on scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
}

// ==========================================
// 3. ANIMACIÓN DE CONTADORES NUMÉRICOS
// ==========================================
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200; 

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText;
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCount();
                observer.unobserve(counter); 
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// ==========================================
// 4. CONTROL DEL FORMULARIO DEL DOSSIER
// ==========================================
function initDossierForm() {
    const form = document.getElementById('dossierForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const btn = document.getElementById('btnSubmitDossier');
            const content = document.getElementById('formContent');
            const success = document.getElementById('dossierSuccess');

            btn.innerHTML = '<span class="loading-spinner w-5 h-5 align-middle"></span> <span class="ml-2">Autenticando y Encriptando...</span>';
            btn.classList.add('pointer-events-none', 'opacity-80');

            setTimeout(() => {
                content.style.opacity = '0'; 
                
                setTimeout(() => {
                    content.classList.add('hidden'); 
                    success.classList.remove('hidden'); 
                    success.classList.add('flex'); 
                    setTimeout(() => success.style.opacity = '1', 50);
                }, 300);
            }, 1800); 
        });
    }
}

// ==========================================
// 5. LÓGICA DEL CHATBOT SIMULADO
// ==========================================
let chatState = 0;
let chatOpenFirstTime = true;

function toggleChat() {
    const win = document.getElementById('chat-window');
    
    if (win.classList.contains('hidden')) {
        win.classList.remove('hidden');
        setTimeout(() => win.classList.add('chat-open'), 10);
        
        if (chatOpenFirstTime) {
            chatOpenFirstTime = false;
            setTimeout(botGreeting, 500);
        }
    } else {
        win.classList.remove('chat-open');
        setTimeout(() => win.classList.add('hidden'), 300);
    }
}

function botGreeting() {
    showTyping();
    setTimeout(() => {
        hideTyping();
        appendMessage('bot', '¡Hola! Bienvenido al portal B2B de Bniarq. 👋');
        
        setTimeout(() => {
            showTyping();
            setTimeout(() => {
                hideTyping();
                appendMessage('bot', '¿En qué puedo ayudarte hoy? Para guiarte mejor, ¿representas a un Estudio de Arquitectura o a una Constructora/Fondo?');
            }, 1200);
        }, 600);
    }, 1000);
}

function handleChatEnter(e) {
    if (e.key === 'Enter') sendUserMessage();
}

function sendUserMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    appendMessage('user', text);
    input.value = ''; 
    
    processBotResponse(text);
}

function appendMessage(sender, text) {
    const chatMsg = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' ? 'chat-msg-user' : 'chat-msg-bot';
    msgDiv.innerHTML = text;
    chatMsg.appendChild(msgDiv);
    chatMsg.scrollTop = chatMsg.scrollHeight; 
}

function showTyping() {
    const chatMsg = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-typing';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    chatMsg.appendChild(typingDiv);
    chatMsg.scrollTop = chatMsg.scrollHeight;
}

function hideTyping() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function processBotResponse(userText) {
    showTyping();
    const thinkingTime = 1000 + Math.random() * 1000;
    
    setTimeout(() => {
        hideTyping();
        
        if (chatState === 0) {
            appendMessage('bot', 'Entendido. Nuestro Grafo de Confianza conecta perfiles como el tuyo a diario.');
            chatState++;
            
            setTimeout(() => {
                showTyping();
                setTimeout(() => {
                    hideTyping();
                    appendMessage('bot', 'Como veo que podrías tener un caso de uso corporativo, ¿quieres que te transfiera ahora mismo con un experto de validación B2B para resolver tus dudas en directo?');
                }, 1500);
            }, 800);
            
        } else if (chatState === 1) {
            appendMessage('bot', 'Perfecto. Transfiriendo chat a un agente humano en la sala segura... 🔒');
            
            setTimeout(() => {
                showTyping();
                setTimeout(() => {
                    hideTyping();
                    
                    const chatMsg = document.getElementById('chat-messages');
                    const agentDiv = document.createElement('div');
                    agentDiv.className = 'flex gap-3 items-start mt-2';
                    agentDiv.style.animation = 'fadeInMsg 0.4s ease';
                    agentDiv.innerHTML = `
                        <div class="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-lg">
                            <span class="text-white text-xs font-bold">CA</span>
                        </div>
                        <div class="bg-brand-dark border border-emerald-500/30 text-gray-200 rounded-xl rounded-tl-none p-3 text-sm shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <strong class="text-emerald-400">Carlos (Validación Bniarq):</strong><br>
                            ¡Hola! Acabo de tomar el control del chat. He leído tu solicitud y me parece muy interesante. ¿Qué volumen de proyectos (PEM) soléis manejar al año para orientarte mejor?
                        </div>
                    `;
                    chatMsg.appendChild(agentDiv);
                    chatMsg.scrollTop = chatMsg.scrollHeight;
                }, 2500); 
            }, 1000);
            
            chatState++;
        } else {
            appendMessage('bot', '<i>Carlos está escribiendo... En un entorno real, aquí continuarías tu conversación con nuestro equipo de ventas.</i>');
        }
    }, thinkingTime);
}
