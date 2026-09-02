// Importar funciones de Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Tu configuración oficial de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBYsGex2nRwItwWIqKZhx3UDBOJo-OwR9s",
    authDomain: "bniarqdatabase.firebaseapp.com",
    projectId: "bniarqdatabase",
    storageBucket: "bniarqdatabase.firebasestorage.app",
    messagingSenderId: "257818104962",
    appId: "1:257818104962:web:c5681ccc0f02a453f6509b",
    measurementId: "G-00SC5P9160"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initScrollAnimations();
    initDossierForm();
    loadProfilesFromFirebase(); // Carga los perfiles desde la nube de Firebase
    initProfileRegistration();
    initNdaModal();
});

// ==========================================
// ANIMACIONES SCROLL
// ==========================================
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
        if (navbar) {
            if (window.scrollY > 20) navbar.classList.add('navbar-scrolled');
            else navbar.classList.remove('navbar-scrolled');
        }
    });
}

// ==========================================
// FORMULARIO DE CONTACTO (DOSSIER PDF)
// ==========================================
function initDossierForm() {
    const form = document.getElementById('dossierForm');
    const FORMSPREE_URL = "https://formspree.io/f/xaeyejkn"; 

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); 
            const btn = document.getElementById('btnSubmitDossier');
            const content = document.getElementById('formContent');
            const success = document.getElementById('dossierSuccess');

            btn.innerHTML = '<span class="loading-spinner w-5 h-5 align-middle"></span> <span class="ml-2">Procesando y enviando...</span>';
            btn.classList.add('pointer-events-none', 'opacity-80');

            const link = document.createElement('a');
            link.href = 'dossier_bniarq.pdf';
            link.download = 'Dossier_Ejecutivo_Bniarq.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                if (content && success) {
                    content.style.opacity = '0'; 
                    setTimeout(() => {
                        content.classList.add('hidden'); 
                        success.classList.remove('hidden'); 
                        success.classList.add('flex'); 
                        setTimeout(() => success.style.opacity = '1', 50);
                    }, 300);
                }
            }, 1500);

            const formData = new FormData(form);
            fetch(FORMSPREE_URL, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).catch(() => {});
        });
    }
}

// ==========================================
// GESTIÓN DE PERFILES Y RED (FIREBASE CLOUD)
// ==========================================
const defaultProfiles = [
    { 
        name: "Elena Aris Studio", 
        role: "Diseño Residencial & Urbanismo", 
        location: "Madrid, España", 
        software: "Revit / BIM Level 3", 
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" 
    },
    { 
        name: "Ingeniería Structuralia", 
        role: "Cálculo de Estructuras Complejas", 
        location: "Valencia, España", 
        software: "CypeCAD / Tekla", 
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" 
    },
    { 
        name: "EcoBuild Lab", 
        role: "Consultoría Passivhaus & LEED", 
        location: "Barcelona, España", 
        software: "EnergyPlus / PHPP", 
        photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop" 
    }
];

let allProfilesCache = [];

async function loadProfilesFromFirebase() {
    const grid = document.getElementById('profilesGrid');
    if (!grid) return;

    try {
        const querySnapshot = await getDocs(collection(db, "perfiles"));
        allProfilesCache = [];
        
        querySnapshot.forEach((doc) => {
            allProfilesCache.push(doc.data());
        });

        if (allProfilesCache.length === 0) {
            allProfilesCache = defaultProfiles;
        }

        renderProfiles(allProfilesCache);
    } catch (error) {
        console.error("Error al cargar de Firebase, usando fallback local: ", error);
        renderProfiles(defaultProfiles);
    }
}

function renderProfiles(profiles) {
    const grid = document.getElementById('profilesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    profiles.forEach(p => {
        const photoUrl = p.photo && p.photo.trim() !== "" ? p.photo : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop";
        const card = document.createElement('div');
        card.className = "bg-brand-card border border-brand-border p-6 rounded-3xl flex flex-col justify-between hover:border-blue-500/50 transition duration-300 shadow-xl";
        card.innerHTML = `
            <div>
                <div class="flex items-center gap-4 mb-4">
                    <img src="${photoUrl}" alt="${p.name}" class="w-14 h-14 rounded-full object-cover border border-blue-500/30">
                    <div>
                        <h4 class="text-lg font-bold text-white leading-snug">${p.name}</h4>
                        <span class="text-[10px] uppercase tracking-wider bg-brand-dark px-2.5 py-0.5 rounded-full text-brand-muted border border-brand-border">${p.location}</span>
                    </div>
                </div>
                <p class="text-xs font-semibold text-blue-400 mb-3">${p.role}</p>
                <div class="text-xs text-brand-muted flex items-center gap-2 mb-6">
                    <i data-lucide="cpu" class="w-4 h-4"></i> ${p.software}
                </div>
            </div>
            <button onclick="openNdaModal('${p.name.replace(/'/g, "\\'")}')" class="w-full bg-brand-dark border border-brand-border hover:bg-blue-600 hover:text-white text-white text-xs font-bold py-3 rounded-xl transition">
                Conectar / Enviar NDA
            </button>
        `;
        grid.appendChild(card);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Función para comprimir imágenes antes de subir a Firebase y evitar cuelgues
function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 400; 
            const MAX_HEIGHT = 400;
            let width = img.width;
            let height = img.height;

            if (width > height && width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            } else if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Comprimir calidad al 70%
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            callback(dataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function initProfileRegistration() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Procesando imagen y guardando...";
        submitBtn.disabled = true;

        const fileInput = document.getElementById('pPhotoFile');
        let photoData = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop"; 

        const saveToFirestore = async (finalPhotoUrl) => {
            const newProfile = {
                name: document.getElementById('pName').value,
                role: document.getElementById('pRole').value,
                location: document.getElementById('pLocation').value,
                software: document.getElementById('pSoftware').value,
                photo: finalPhotoUrl,
                createdAt: new Date().toISOString()
            };

            try {
                await addDoc(collection(db, "perfiles"), newProfile);
                form.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                alert('¡Perfil guardado y publicado con éxito en la red global!');
                loadProfilesFromFirebase(); 
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                console.error("Error al guardar en Firebase: ", error);
                alert("Hubo un error al guardar el perfil en la nube.");
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        };

        // Si el usuario adjunta una foto desde su PC, la comprimimos primero
        if (fileInput && fileInput.files && fileInput.files[0]) {
            compressImage(fileInput.files[0], (compressedImg) => {
                saveToFirestore(compressedImg);
            });
        } else {
            saveToFirestore(photoData);
        }
    });
}

// Usamos window. para asegurar que el HTML en modo 'module' pueda ver la función
window.filterProfiles = function() {
    const queryElement = document.getElementById('searchInput');
    if (!queryElement) return;
    const query = queryElement.value.toLowerCase();
    
    const filtered = allProfilesCache.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.role.toLowerCase().includes(query) || 
        p.location.toLowerCase().includes(query) ||
        p.software.toLowerCase().includes(query)
    );
    renderProfiles(filtered);
}

// ==========================================
// SISTEMA REAL DE NDA Y CONEXIÓN (MODAL)
// ==========================================
function initNdaModal() {
    if (document.getElementById('ndaModal')) return;

    const modalHTML = `
        <div id="ndaModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
            <div class="bg-brand-dark border border-brand-border w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
                <button onclick="closeNdaModal()" class="absolute top-5 right-5 text-brand-muted hover:text-white">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
                <div id="ndaFormContainer">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/30">
                            <i data-lucide="folder-lock" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-white">Acuerdo de Confidencialidad</h3>
                            <p class="text-xs text-brand-muted">Conectando con <span id="targetStudioName" class="text-white font-semibold"></span></p>
                        </div>
                    </div>
                    <p class="text-xs text-brand-muted mb-6 leading-relaxed">
                        Para abrir una Secure Data Room y compartir documentación técnica, ambas partes deben suscribir el NDA digital bajo normativa corporativa Bniarq.
                    </p>
                    <form id="ndaActionForm" onsubmit="submitNda(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-brand-muted mb-1 uppercase">Tu Correo Corporativo</label>
                            <input type="email" id="ndaEmail" required placeholder="tu@empresa.com" class="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none">
                        </div>
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-lg flex items-center justify-center gap-2">
                            Firmar NDA y Abrir Data Room
                        </button>
                    </form>
                </div>
                <div id="ndaSuccessContainer" class="hidden text-center py-6">
                    <div class="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                        <i data-lucide="check" class="w-7 h-7"></i>
                    </div>
                    <h4 class="text-xl font-bold text-white mb-2">¡NDA Firmado con Éxito!</h4>
                    <p class="text-xs text-brand-muted mb-6">Hemos enviado las credenciales cifradas de la sala segura a tu correo corporativo.</p>
                    <button onclick="closeNdaModal()" class="w-full bg-brand-card border border-brand-border text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-border transition">
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

let activeStudio = "";

window.openNdaModal = function(studioName) {
    activeStudio = studioName;
    document.getElementById('targetStudioName').textContent = studioName;
    document.getElementById('ndaFormContainer').classList.remove('hidden');
    document.getElementById('ndaSuccessContainer').classList.add('hidden');
    document.getElementById('ndaEmail').value = '';
    
    const modal = document.getElementById('ndaModal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
};

window.closeNdaModal = function() {
    const modal = document.getElementById('ndaModal');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
};

window.submitNda = function(e) {
    e.preventDefault();
    document.getElementById('ndaFormContainer').classList.add('hidden');
    document.getElementById('ndaSuccessContainer').classList.remove('hidden');
};

// ==========================================
// CHATBOT SIMULADO B2B
// ==========================================
let chatState = 0;
let chatOpenFirstTime = true;

window.toggleChat = function() {
    const win = document.getElementById('chat-window');
    if (win) {
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
};

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

window.handleChatEnter = function(e) {
    if (e.key === 'Enter') sendUserMessage();
};

window.sendUserMessage = function() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    appendMessage('user', text);
    input.value = ''; 
    processBotResponse(text);
};

function appendMessage(sender, text) {
    const chatMsg = document.getElementById('chat-messages');
    if (!chatMsg) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' ? 'chat-msg-user' : 'chat-msg-bot';
    msgDiv.innerHTML = text;
    chatMsg.appendChild(msgDiv);
    chatMsg.scrollTop = chatMsg.scrollHeight; 
}

function showTyping() {
    const chatMsg = document.getElementById('chat-messages');
    if (!chatMsg) return;
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
                    if (chatMsg) {
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
                    }
                }, 2000); 
            }, 800);
            chatState++;
        }
    }, 1200);
}
