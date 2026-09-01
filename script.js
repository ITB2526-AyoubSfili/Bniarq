document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initScrollAnimations();
    initDossierForm();
});

// PESTAÑAS (TECNOLOGÍA)
function changeFeature(tabName) {
    const tabs = ['grafo', 'dataroom'];
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

// ANIMACIONES SCROLL
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.15 }); 

    reveals.forEach(reveal => observer.observe(reveal));

    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) navbar.classList.add('navbar-scrolled');
        else navbar.classList.remove('navbar-scrolled');
    });
}

// FORMULARIO CONECTADO A FORMSPREE Y DESCARGA DE PDF
function initDossierForm() {
    const form = document.getElementById('dossierForm');
    const FORMSPREE_URL = "https://formspree.io/f/xaeyejkn"; // Tu endpoint real

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const btn = document.getElementById('btnSubmitDossier');
            const content = document.getElementById('formContent');
            const success = document.getElementById('dossierSuccess');

            btn.innerHTML = '<span class="loading-spinner w-5 h-5 align-middle"></span> <span class="ml-2">Procesando y enviando...</span>';
            btn.classList.add('pointer-events-none', 'opacity-80');

            const formData = new FormData(form);

            fetch(FORMSPREE_URL, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (response.ok) {
                    // Descargar el PDF con el nombre actualizado dossier_bniarq.pdf
                    const link = document.createElement('a');
                    link.href = 'dossier_bniarq.pdf'; 
                    link.download = 'Dossier_Ejecutivo_Bniarq.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    content.style.opacity = '0'; 
                    setTimeout(() => {
                        content.classList.add('hidden'); 
                        success.classList.remove('hidden'); 
                        success.classList.add('flex'); 
                        setTimeout(() => success.style.opacity = '1', 50);
                    }, 300);
                } else {
                    alert("Hubo un problema al enviar el formulario.");
                    btn.innerHTML = 'Solicitar Dossier de Información';
                    btn.classList.remove('pointer-events-none', 'opacity-80');
                }
            })
            .catch(error => {
                alert("Error de conexión. Inténtalo de nuevo.");
                btn.innerHTML = 'Solicitar Dossier de Información';
                btn.classList.remove('pointer-events-none', 'opacity-80');
            });
        });
    }
}

// CHATBOT SIMULADO
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
        appendMessage('bot', 'Hola. Estás en el entorno de soporte de Bniarq.');
        setTimeout(() => {
            showTyping();
            setTimeout(() => {
                hideTyping();
                appendMessage('bot', '¿Tienes alguna duda sobre cómo funciona nuestro proceso de validación o necesitas hablar con alguien del equipo?');
            }, 1000);
        }, 600);
    }, 800);
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
    setTimeout(() => {
        hideTyping();
        if (chatState === 0) {
            appendMessage('bot', 'Comprendo. Nuestro modelo B2B requiere una evaluación inicial de cada perfil.');
            chatState++;
            setTimeout(() => {
                showTyping();
                setTimeout(() => {
                    hideTyping();
                    appendMessage('bot', 'Voy a transferir este chat a un consultor de nuestro equipo para que atienda tu consulta personalmente. ¿Te parece bien?');
                }, 1200);
            }, 600);
        } else if (chatState === 1) {
            appendMessage('bot', 'Conectando con un agente humano...');
            setTimeout(() => {
                showTyping();
                setTimeout(() => {
                    hideTyping();
                    const chatMsg = document.getElementById('chat-messages');
                    const agentDiv = document.createElement('div');
                    agentDiv.className = 'flex gap-3 items-start mt-2';
                    agentDiv.style.animation = 'fadeInMsg 0.4s ease';
                    agentDiv.innerHTML = `
                        <div class="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center shrink-0">
                            <span class="text-white text-xs font-bold">Eq</span>
                        </div>
                        <div class="bg-brand-dark border border-brand-border text-gray-200 rounded-xl rounded-tl-none p-3 text-sm">
                            <strong class="text-white">Equipo Bniarq:</strong><br>
                            Hola, soy parte del equipo. Veo que tienes interés en nuestro proceso. ¿Nos escribes desde un estudio de arquitectura o desde el lado de la construcción?
                        </div>
                    `;
                    chatMsg.appendChild(agentDiv);
                    chatMsg.scrollTop = chatMsg.scrollHeight;
                }, 2000); 
            }, 800);
            chatState++;
        }
    }, 1200);
}
