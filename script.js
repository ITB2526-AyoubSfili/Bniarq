// Importar funciones de Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore, collection, getDocs, addDoc, doc, setDoc, getDoc,
    query, where, orderBy, onSnapshot, serverTimestamp, updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut,
    onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBYsGex2nRwItwWIqKZhx3UDBOJo-OwR9s",
    authDomain: "bniarqdatabase.firebaseapp.com",
    projectId: "bniarqdatabase",
    storageBucket: "bniarqdatabase.firebasestorage.app",
    messagingSenderId: "257818104962",
    appId: "1:257818104962:web:c5681ccc0f02a453f6509b",
    measurementId: "G-00SC5P9160"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Variables globales
let allProfilesCache = [];
let currentUserProfile = null;
let authMode = 'login';
let conversationsUnsub = null;
let activeThreadUnsub = null;
let activeConversationId = null;
let activePeer = null;

// ==========================================
// PERFILES DEMO MEJORADOS
// ==========================================
const demoProfiles = [
    { 
        name: "Elena Aris Studio", 
        role: "Arquitecta Principal - Diseño Residencial & Urbanismo", 
        location: "Madrid, España", 
        software: "Revit / BIM Level 3 / AutoCAD",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
        ownerUid: "demo_elena_aris",
        ownerEmail: "elena@arisstudio.com",
        experiencia: "15 años",
        proyectos: "120+ proyectos residenciales",
        especialidades: ["Vivienda sostenible", "Urbanismo", "BIM"]
    },
    { 
        name: "Ingeniería Structuralia", 
        role: "Ingeniería de Estructuras Complejas", 
        location: "Valencia, España", 
        software: "CypeCAD / Tekla / SAP2000",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
        ownerUid: "demo_structuralia",
        ownerEmail: "info@structuralia.com",
        experiencia: "20 años",
        proyectos: "300+ proyectos estructurales",
        especialidades: ["Puentes", "Edificios singulares", "Cálculo sísmico"]
    },
    { 
        name: "EcoBuild Lab", 
        role: "Consultoría Energética y Sostenibilidad", 
        location: "Barcelona, España", 
        software: "EnergyPlus / PHPP / DesignBuilder",
        photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
        ownerUid: "demo_ecobuild",
        ownerEmail: "contacto@ecobuildlab.com",
        experiencia: "8 años",
        proyectos: "85+ proyectos Passivhaus",
        especialidades: ["Passivhaus", "LEED", "Eficiencia energética"]
    },
    { 
        name: "Urban Studio Barcelona", 
        role: "Diseño Urbano y Paisajismo", 
        location: "Barcelona, España", 
        software: "Rhino / Grasshopper / QGIS",
        photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
        ownerUid: "demo_urbanstudio",
        ownerEmail: "info@urbanstudio.com",
        experiencia: "10 años",
        proyectos: "65+ proyectos urbanos",
        especialidades: ["Espacio público", "Paisajismo", "Movilidad"]
    },
    { 
        name: "Tectónica Arquitectura", 
        role: "Arquitectura Técnica y Construcción", 
        location: "México DF, México", 
        software: "Revit / Navisworks / Bluebeam",
        photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
        ownerUid: "demo_tectonica",
        ownerEmail: "info@tectonica.com",
        experiencia: "12 años",
        proyectos: "200+ proyectos constructivos",
        especialidades: ["Construcción", "Dirección de obra", "Control de calidad"]
    },
    { 
        name: "Aural Studio", 
        role: "Diseño de Interiores y Branding", 
        location: "Buenos Aires, Argentina", 
        software: "SketchUp / V-Ray / Photoshop",
        photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
        ownerUid: "demo_aural",
        ownerEmail: "hola@auralstudio.com",
        experiencia: "7 años",
        proyectos: "150+ proyectos de interiores",
        especialidades: ["Diseño comercial", "Hospitality", "Mobiliario"]
    }
];

// ==========================================
// CARGA DE PERFILES DESDE FIREBASE
// ==========================================
async function loadProfilesFromFirebase() {
    const grid = document.getElementById('profilesGrid');
    if (!grid) return;

    try {
        const querySnapshot = await getDocs(collection(db, "perfiles"));
        const firebaseProfiles = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            firebaseProfiles.push({
                ...data,
                ownerUid: data.ownerUid || `firebase_${doc.id}`
            });
        });

        const existingNames = new Set(firebaseProfiles.map(p => p.name));
        const demoProfilesToAdd = demoProfiles.filter(p => !existingNames.has(p.name));
        
        allProfilesCache = [...firebaseProfiles, ...demoProfilesToAdd];
        renderProfiles(allProfilesCache);
        
        window.allProfilesCache = allProfilesCache;
        window.renderProfiles = renderProfiles;
    } catch (error) {
        console.error("Error al cargar de Firebase, usando perfiles demo: ", error);
        allProfilesCache = demoProfiles;
        window.allProfilesCache = allProfilesCache;
        renderProfiles(demoProfiles);
    }
}

function renderProfiles(profiles) {
    const grid = document.getElementById('profilesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (!profiles || profiles.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i data-lucide="users" class="w-12 h-12 text-brand-muted mx-auto mb-4"></i>
                <p class="text-brand-muted">No hay perfiles disponibles. ¡Sé el primero en publicar tu estudio!</p>
            </div>
        `;
        return;
    }
    
    const countEl = document.getElementById('profilesCount');
    if (countEl) {
        countEl.textContent = `${profiles.length} profesionales en la red`;
    }
    
    profiles.forEach(p => {
        const photoUrl = p.photo && p.photo.trim() !== "" ? p.photo : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop";
        const card = document.createElement('div');
        card.className = "bg-brand-card border border-brand-border p-6 rounded-3xl flex flex-col justify-between hover:border-blue-500/50 transition duration-300 shadow-xl";
        
        const isDemo = p.ownerUid && p.ownerUid.startsWith('demo_');
        const isOwner = currentUserProfile && p.ownerUid === currentUserProfile.uid;
        
        let especialidadesHTML = '';
        if (p.especialidades && p.especialidades.length > 0) {
            especialidadesHTML = `
                <div class="flex flex-wrap gap-1 mb-3">
                    ${p.especialidades.slice(0, 3).map(esp => 
                        `<span class="text-[9px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full">${esp}</span>`
                    ).join('')}
                </div>
            `;
        }
        
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
                ${especialidadesHTML}
                <div class="text-xs text-brand-muted flex items-center gap-2 mb-6">
                    <i data-lucide="cpu" class="w-4 h-4"></i> ${p.software}
                </div>
                ${p.experiencia ? `<div class="text-xs text-brand-muted flex items-center gap-2 mb-2"><i data-lucide="clock" class="w-3.5 h-3.5"></i> ${p.experiencia} de experiencia</div>` : ''}
                ${p.proyectos ? `<div class="text-xs text-brand-muted flex items-center gap-2 mb-2"><i data-lucide="briefcase" class="w-3.5 h-3.5"></i> ${p.proyectos}</div>` : ''}
            </div>
            <div class="flex gap-2">
                ${isOwner ? `
                    <button class="flex-1 bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-1.5">
                        <i data-lucide="check" class="w-3.5 h-3.5"></i> Tu perfil
                    </button>
                ` : `
                    <button onclick="openNdaModal('${p.name.replace(/'/g, "\\'")}')" class="flex-1 bg-brand-dark border border-brand-border hover:bg-blue-600 hover:text-white text-white text-xs font-bold py-3 rounded-xl transition">
                        Enviar NDA
                    </button>
                    ${isDemo ? `
                        <button onclick="alert('Este es un perfil de demostración. Regístrate para contactar con profesionales reales.')" class="flex-1 bg-brand-dark border border-brand-border hover:bg-blue-600 hover:text-white text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-1.5">
                            <i data-lucide="mail" class="w-3.5 h-3.5"></i> Demo
                        </button>
                    ` : `
                        <button onclick='startConversation(${JSON.stringify({ uid: p.ownerUid || null, name: p.name, photo: p.photo || "" }).replace(/'/g, "&#39;")})' class="flex-1 bg-brand-dark border border-brand-border hover:bg-blue-600 hover:text-white text-white text-xs font-bold py-3 rounded-xl transition flex items-center justify-center gap-1.5">
                            <i data-lucide="mail" class="w-3.5 h-3.5"></i> Mensaje
                        </button>
                    `}
                `}
            </div>
        `;
        grid.appendChild(card);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initScrollAnimations();
    initDossierForm();
    loadProfilesFromFirebase();
    initProfileRegistration();
    initNdaModal();
    initAuthForm();
    watchAuthState();
});

// ==========================================
// ANIMACIONES
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
// DOSSIER FORM
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

            btn.innerHTML = '<span class="loading-spinner w-5 h-5 align-middle"></span> <span class="ml-2">Procesando...</span>';
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
                btn.innerHTML = 'Descargar Dossier PDF';
                btn.classList.remove('pointer-events-none', 'opacity-80');
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
// REGISTRO DE PERFIL
// ==========================================
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

        if (!auth.currentUser) {
            alert('Inicia sesión (o crea una cuenta) antes de publicar tu perfil.');
            openAuthModal('login');
            return;
        }

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
                ownerUid: auth.currentUser.uid,
                ownerEmail: auth.currentUser.email || "",
                createdAt: serverTimestamp()
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

        if (fileInput && fileInput.files && fileInput.files[0]) {
            compressImage(fileInput.files[0], (compressedImg) => {
                saveToFirestore(compressedImg);
            });
        } else {
            saveToFirestore(photoData);
        }
    });
}

// ==========================================
// NDA MODAL
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

window.openNdaModal = function(studioName) {
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
// CHATBOT
// ==========================================
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
        appendMessage('bot', 'Comprendo. Nuestro modelo B2B requiere una evaluación inicial de cada perfil.');
        setTimeout(() => {
            showTyping();
            setTimeout(() => {
                hideTyping();
                appendMessage('bot', 'Voy a transferir este chat a un consultor de nuestro equipo para que atienda tu consulta personalmente. ¿Te parece bien?');
            }, 1200);
        }, 600);
    }, 1200);
}

// ==========================================
// AUTENTICACIÓN COMPLETA
// ==========================================
window.openAuthModal = function(mode) {
    authMode = mode || 'login';
    applyAuthMode();
    const modal = document.getElementById('authModal');
    if (!modal) return;
    document.getElementById('authError').classList.add('hidden');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
};

window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
};

window.switchAuthMode = function() {
    authMode = authMode === 'login' ? 'register' : 'login';
    applyAuthMode();
};

function applyAuthMode() {
    const title = document.getElementById('authModalTitle');
    const subtitle = document.getElementById('authModalSubtitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const switchText = document.getElementById('authSwitchText');
    const switchBtn = document.getElementById('authSwitchBtn');
    
    const nameField = document.getElementById('authNameField');
    const apellidoField = document.getElementById('authApellidoField');
    const fechaNacField = document.getElementById('authFechaNacField');
    const telefonoField = document.getElementById('authTelefonoField');
    const empresaField = document.getElementById('authEmpresaField');
    const cargoField = document.getElementById('authCargoField');
    const confirmPasswordField = document.getElementById('authConfirmPasswordField');
    const terminosField = document.getElementById('authTerminosField');

    if (authMode === 'login') {
        if (title) title.textContent = 'Iniciar sesión';
        if (subtitle) subtitle.textContent = 'Accede a tu cuenta Bniarq para publicar tu perfil y enviar mensajes.';
        if (submitBtn) submitBtn.textContent = 'Iniciar sesión';
        if (switchText) switchText.textContent = '¿No tienes cuenta?';
        if (switchBtn) switchBtn.textContent = 'Regístrate';
        
        if (nameField) nameField.classList.add('hidden');
        if (apellidoField) apellidoField.classList.add('hidden');
        if (fechaNacField) fechaNacField.classList.add('hidden');
        if (telefonoField) telefonoField.classList.add('hidden');
        if (empresaField) empresaField.classList.add('hidden');
        if (cargoField) cargoField.classList.add('hidden');
        if (confirmPasswordField) confirmPasswordField.classList.add('hidden');
        if (terminosField) terminosField.classList.add('hidden');
    } else {
        if (title) title.textContent = 'Crear cuenta profesional';
        if (subtitle) subtitle.textContent = 'Completa todos los datos para unirte a la red Bniarq.';
        if (submitBtn) submitBtn.textContent = 'Crear cuenta';
        if (switchText) switchText.textContent = '¿Ya tienes cuenta?';
        if (switchBtn) switchBtn.textContent = 'Inicia sesión';
        
        if (nameField) nameField.classList.remove('hidden');
        if (apellidoField) apellidoField.classList.remove('hidden');
        if (fechaNacField) fechaNacField.classList.remove('hidden');
        if (telefonoField) telefonoField.classList.remove('hidden');
        if (empresaField) empresaField.classList.remove('hidden');
        if (cargoField) cargoField.classList.remove('hidden');
        if (confirmPasswordField) confirmPasswordField.classList.remove('hidden');
        if (terminosField) terminosField.classList.remove('hidden');
    }
}

function showAuthError(message) {
    const err = document.getElementById('authError');
    if (!err) return;
    err.textContent = message;
    err.classList.remove('hidden');
}

function translateAuthError(code) {
    const map = {
        'auth/email-already-in-use': 'Ese correo ya tiene una cuenta. Prueba a iniciar sesión.',
        'auth/invalid-email': 'El correo no es válido.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/user-not-found': 'No existe ninguna cuenta con ese correo.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/invalid-credential': 'Correo o contraseña incorrectos.',
        'auth/popup-closed-by-user': 'Has cerrado la ventana antes de completar el inicio de sesión.',
        'auth/operation-not-allowed': 'Este proveedor de acceso todavía no está activado en el panel de Firebase.',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento y vuelve a intentarlo.'
    };
    return map[code] || 'Ha ocurrido un error. Inténtalo de nuevo.';
}

function initAuthForm() {
    const form = document.getElementById('authForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;
        const submitBtn = document.getElementById('authSubmitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Procesando...';
        document.getElementById('authError').classList.add('hidden');

        try {
            if (authMode === 'register') {
                const name = document.getElementById('authName').value.trim();
                const apellido = document.getElementById('authApellido').value.trim();
                const fechaNac = document.getElementById('authFechaNac').value;
                const telefono = document.getElementById('authTelefono').value.trim();
                const empresa = document.getElementById('authEmpresa').value.trim();
                const cargo = document.getElementById('authCargo').value.trim();
                const confirmPassword = document.getElementById('authConfirmPassword').value;
                const terminos = document.getElementById('authTerminos');

                if (!name) { showAuthError('El nombre completo es obligatorio.'); throw new Error('Nombre requerido'); }
                if (!apellido) { showAuthError('Los apellidos son obligatorios.'); throw new Error('Apellidos requeridos'); }
                if (!fechaNac) { showAuthError('La fecha de nacimiento es obligatoria.'); throw new Error('Fecha nacimiento requerida'); }
                if (!telefono) { showAuthError('El teléfono es obligatorio.'); throw new Error('Teléfono requerido'); }
                if (!empresa) { showAuthError('El nombre de tu estudio/empresa es obligatorio.'); throw new Error('Empresa requerida'); }
                if (!cargo) { showAuthError('Tu cargo/especialidad es obligatorio.'); throw new Error('Cargo requerido'); }
                if (password !== confirmPassword) { showAuthError('Las contraseñas no coinciden.'); throw new Error('Contraseñas no coinciden'); }
                if (!terminos.checked) { showAuthError('Debes aceptar los términos y condiciones.'); throw new Error('Términos no aceptados'); }
                
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                if (name) {
                    await updateProfile(cred.user, { displayName: `${name} ${apellido}` });
                }
                
                await setDoc(doc(db, 'usuarios', cred.user.uid), {
                    name: name,
                    apellido: apellido,
                    fechaNacimiento: fechaNac,
                    telefono: telefono,
                    empresa: empresa,
                    cargo: cargo,
                    email: email,
                    createdAt: serverTimestamp()
                });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            closeAuthModal();
            form.reset();
            loadProfilesFromFirebase();
        } catch (error) {
            console.error('Error de autenticación:', error);
            if (!document.getElementById('authError').classList.contains('hidden')) {
                // Ya hay un error mostrado
            } else {
                showAuthError(translateAuthError(error.code));
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

window.signInWithGoogle = async function() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
            const userRef = doc(db, 'usuarios', result.user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    name: result.user.displayName || '',
                    email: result.user.email || '',
                    createdAt: serverTimestamp()
                });
            }
        }
        closeAuthModal();
        loadProfilesFromFirebase();
    } catch (error) {
        console.error('Error con Google Sign-In:', error);
        showAuthError(translateAuthError(error.code));
    }
};

window.signInWithApple = async function() {
    try {
        const provider = new OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
            const userRef = doc(db, 'usuarios', result.user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    name: result.user.displayName || '',
                    email: result.user.email || '',
                    createdAt: serverTimestamp()
                });
            }
        }
        closeAuthModal();
        loadProfilesFromFirebase();
    } catch (error) {
        console.error('Error con Apple Sign-In:', error);
        showAuthError(translateAuthError(error.code));
    }
};

window.logout = async function() {
    await signOut(auth);
    if (conversationsUnsub) { conversationsUnsub(); conversationsUnsub = null; }
    loadProfilesFromFirebase();
};

function watchAuthState() {
    onAuthStateChanged(auth, async (user) => {
        const authArea = document.getElementById('authArea');
        const authAreaPerfiles = document.getElementById('authAreaPerfiles');
        
        if (user) {
            let userData = {};
            try {
                const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
                if (userDoc.exists()) {
                    userData = userDoc.data();
                }
            } catch (e) {
                console.error('Error al obtener datos de usuario:', e);
            }
            
            const displayName = userData.name || user.displayName || user.email?.split('@')[0] || 'Usuario';
            const photoURL = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563EB&color=fff`;
            
            currentUserProfile = {
                uid: user.uid,
                name: displayName,
                email: user.email || '',
                photo: photoURL,
                apellido: userData.apellido || '',
                empresa: userData.empresa || '',
                cargo: userData.cargo || '',
                telefono: userData.telefono || '',
                fechaNacimiento: userData.fechaNacimiento || ''
            };

            const userHTML = `
                <div class="relative">
                    <button onclick="toggleAccountMenu()" class="flex items-center gap-2 bg-brand-card border border-brand-border hover:border-blue-500 rounded-full pl-1.5 pr-3 py-1.5 transition">
                        <img src="${currentUserProfile.photo}" class="w-6 h-6 rounded-full object-cover" alt="avatar">
                        <span class="text-xs font-semibold text-white max-w-[100px] truncate">${currentUserProfile.name}</span>
                    </button>
                    <div id="accountMenu" class="hidden absolute right-0 mt-2 w-56 bg-brand-card border border-brand-border rounded-2xl shadow-2xl overflow-hidden">
                        <div class="px-4 py-3 border-b border-brand-border">
                            <p class="text-xs font-bold text-white">${currentUserProfile.name} ${currentUserProfile.apellido}</p>
                            <p class="text-[10px] text-brand-muted truncate">${currentUserProfile.email}</p>
                            ${currentUserProfile.empresa ? `<p class="text-[10px] text-brand-muted">${currentUserProfile.empresa}</p>` : ''}
                        </div>
                        <button onclick="toggleInbox(); toggleAccountMenu();" class="w-full text-left px-4 py-3 text-xs text-white hover:bg-brand-border transition flex items-center gap-2">
                            <i data-lucide="mail" class="w-3.5 h-3.5"></i> Mis mensajes
                        </button>
                        <button onclick="logout()" class="w-full text-left px-4 py-3 text-xs text-red-400 hover:bg-brand-border transition flex items-center gap-2">
                            <i data-lucide="log-out" class="w-3.5 h-3.5"></i> Cerrar sesión
                        </button>
                    </div>
                </div>
            `;
            
            if (authArea) authArea.innerHTML = userHTML;
            if (authAreaPerfiles) authAreaPerfiles.innerHTML = userHTML;
            
            const messagesFab = document.getElementById('messagesFab');
            if (messagesFab) messagesFab.classList.remove('hidden');
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
            watchConversations();
            loadProfilesFromFirebase();
        } else {
            currentUserProfile = null;
            const loginHTML = `
                <button onclick="openAuthModal('login')" class="text-xs font-bold text-brand-muted hover:text-white transition px-3 py-2">
                    Iniciar sesión
                </button>
                <button onclick="openAuthModal('register')" class="bg-brand-card border border-brand-border hover:bg-brand-border text-white text-xs font-bold px-4 py-2.5 rounded-full transition">
                    Crear cuenta
                </button>
            `;
            
            if (authArea) authArea.innerHTML = loginHTML;
            if (authAreaPerfiles) authAreaPerfiles.innerHTML = loginHTML;
            
            const messagesFab = document.getElementById('messagesFab');
            if (messagesFab) messagesFab.classList.add('hidden');
            
            const inboxWindow = document.getElementById('inbox-window');
            if (inboxWindow) inboxWindow.classList.add('hidden');
            
            if (conversationsUnsub) { conversationsUnsub(); conversationsUnsub = null; }
            loadProfilesFromFirebase();
        }
    });
}

window.toggleAccountMenu = function() {
    const menu = document.getElementById('accountMenu');
    if (menu) menu.classList.toggle('hidden');
};

document.addEventListener('click', (e) => {
    const menu = document.getElementById('accountMenu');
    if (menu && !menu.classList.contains('hidden') && !e.target.closest('#authArea') && !e.target.closest('#authAreaPerfiles')) {
        menu.classList.add('hidden');
    }
});

// ==========================================
// MENSAJERÍA REAL
// ==========================================
function conversationIdFor(uidA, uidB) {
    return [uidA, uidB].sort().join('_');
}

window.startConversation = async function(peer) {
    if (!auth.currentUser) {
        alert('Inicia sesión para poder enviar mensajes a otros perfiles.');
        openAuthModal('login');
        return;
    }
    if (!peer.uid) {
        alert('Este perfil no puede recibir mensajes.');
        return;
    }
    if (peer.uid === auth.currentUser.uid) {
        alert('No puedes enviarte un mensaje a ti mismo.');
        return;
    }

    const convId = conversationIdFor(auth.currentUser.uid, peer.uid);
    const convRef = doc(db, 'conversations', convId);
    const convSnap = await getDoc(convRef);

    if (!convSnap.exists()) {
        await setDoc(convRef, {
            participants: [auth.currentUser.uid, peer.uid],
            participantsInfo: {
                [auth.currentUser.uid]: { name: currentUserProfile.name, photo: currentUserProfile.photo || '' },
                [peer.uid]: { name: peer.name || 'Usuario', photo: peer.photo || '' }
            },
            lastMessage: '',
            lastMessageAt: serverTimestamp(),
            createdAt: serverTimestamp()
        });
    }

    openThread(convId, { uid: peer.uid, name: peer.name || 'Usuario' });
    const inboxWindow = document.getElementById('inbox-window');
    if (inboxWindow) {
        inboxWindow.classList.remove('hidden');
        setTimeout(() => inboxWindow.classList.add('chat-open'), 10);
    }
};

window.toggleInbox = function() {
    const win = document.getElementById('inbox-window');
    if (!win) return;
    if (win.classList.contains('hidden')) {
        win.classList.remove('hidden');
        setTimeout(() => win.classList.add('chat-open'), 10);
        backToInboxView();
    } else {
        win.classList.remove('chat-open');
        setTimeout(() => win.classList.add('hidden'), 300);
    }
};

function watchConversations() {
    if (conversationsUnsub) conversationsUnsub();
    const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', auth.currentUser.uid),
        orderBy('lastMessageAt', 'desc')
    );
    conversationsUnsub = onSnapshot(q, (snapshot) => {
        renderConversationsList(snapshot);
    }, (error) => {
        console.error('Error escuchando conversaciones:', error);
    });
}

function renderConversationsList(snapshot) {
    const list = document.getElementById('conversationsList');
    if (!list) return;

    if (snapshot.empty) {
        list.innerHTML = '<p class="text-xs text-brand-muted p-4">Aún no tienes conversaciones. Contacta con un perfil desde el directorio para empezar a chatear.</p>';
        return;
    }

    list.innerHTML = '';
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const peerUid = data.participants.find(uid => uid !== auth.currentUser.uid);
        const peerInfo = data.participantsInfo ? data.participantsInfo[peerUid] : null;
        const peerName = peerInfo ? peerInfo.name : 'Usuario';
        const peerPhoto = (peerInfo && peerInfo.photo) ? peerInfo.photo : `https://ui-avatars.com/api/?name=${encodeURIComponent(peerName)}&background=1f1f1f&color=fff`;

        const item = document.createElement('button');
        item.className = 'w-full text-left p-4 flex items-center gap-3 hover:bg-brand-border/50 transition';
        item.innerHTML = `
            <img src="${peerPhoto}" class="w-9 h-9 rounded-full object-cover shrink-0" alt="${peerName}">
            <div class="min-w-0">
                <p class="text-xs font-bold text-white truncate">${peerName}</p>
                <p class="text-[11px] text-brand-muted truncate">${data.lastMessage || 'Conversación iniciada'}</p>
            </div>
        `;
        item.onclick = () => openThread(docSnap.id, { uid: peerUid, name: peerName });
        list.appendChild(item);
    });
}

function openThread(convId, peer) {
    activeConversationId = convId;
    activePeer = peer;

    document.getElementById('inboxListView').classList.add('hidden');
    document.getElementById('threadView').classList.remove('hidden');
    document.getElementById('threadView').classList.add('flex');
    document.getElementById('threadPeerName').textContent = peer.name || 'Usuario';
    document.getElementById('threadMessages').innerHTML = '<p class="text-xs text-brand-muted text-center">Cargando mensajes...</p>';

    if (activeThreadUnsub) activeThreadUnsub();
    const q = query(collection(db, 'conversations', convId, 'messages'), orderBy('createdAt', 'asc'));
    activeThreadUnsub = onSnapshot(q, (snapshot) => {
        renderThreadMessages(snapshot);
    }, (error) => {
        console.error('Error escuchando mensajes:', error);
    });
}

function renderThreadMessages(snapshot) {
    const container = document.getElementById('threadMessages');
    if (!container) return;
    container.innerHTML = '';

    if (snapshot.empty) {
        container.innerHTML = '<p class="text-xs text-brand-muted text-center">Escribe el primer mensaje de la conversación.</p>';
        return;
    }

    snapshot.forEach((docSnap) => {
        const msg = docSnap.data();
        const mine = msg.senderId === auth.currentUser.uid;
        const bubble = document.createElement('div');
        bubble.className = mine ? 'chat-msg-user self-end' : 'chat-msg-bot self-start';
        bubble.textContent = msg.text;
        container.appendChild(bubble);
    });
    container.scrollTop = container.scrollHeight;
}

window.backToInbox = function() {
    backToInboxView();
};

function backToInboxView() {
    document.getElementById('threadView').classList.add('hidden');
    document.getElementById('threadView').classList.remove('flex');
    document.getElementById('inboxListView').classList.remove('hidden');
    if (activeThreadUnsub) { activeThreadUnsub(); activeThreadUnsub = null; }
    activeConversationId = null;
    activePeer = null;
}

window.handleThreadEnter = function(e) {
    if (e.key === 'Enter') sendThreadMessage();
};

window.sendThreadMessage = async function() {
    const input = document.getElementById('threadInput');
    if (!input || !activeConversationId) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    try {
        await addDoc(collection(db, 'conversations', activeConversationId, 'messages'), {
            senderId: auth.currentUser.uid,
            text: text,
            createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, 'conversations', activeConversationId), {
            lastMessage: text,
            lastMessageAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        alert('No se pudo enviar el mensaje. Revisa tu conexión o las reglas de Firestore.');
    }
};

// ==========================================
// FILTRADO DE PERFILES (GLOBAL)
// ==========================================
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
};
