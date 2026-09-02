// Importar funciones de Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getFirestore, collection, getDocs, addDoc, doc, setDoc, getDoc, updateDoc,
    query, where, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    getAuth, GoogleAuthProvider, signInWithPopup, signOut,
    onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,
    updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword
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

// ==========================================
// CONFIGURACIÓN DE EMAILJS
// ==========================================
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_sbrdv6n',
    TEMPLATE_ID: 'template_6z1gbae',
    PUBLIC_KEY: 'hm3t3ODtyq5Exj4Sw'
};

// Variables globales
let allProfilesCache = [];
let currentUserProfile = null;
let authMode = 'login';
let conversationsUnsub = null;
let activeThreadUnsub = null;
let activeConversationId = null;
let activePeer = null;

// Variables 2FA
let pending2FAEmail = null;
let pending2FAName = null;
let pending2FACode = null;
let pending2FATimestamp = null;
let pending2FAResolve = null;
let twoFATimeout = null;

// ==========================================
// PERFILES DEMO
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
// CARGA DE PERFILES
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
    initProfileEditor();
    init2FA();
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

            btn.innerHTML = '<span class="loading-spinner align-middle"></span> <span class="ml-2">Procesando...</span>';
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
    // Ya está en el HTML
}

window.openNdaModal = function(studioName) {
    const target = document.getElementById('targetStudioName');
    const container = document.getElementById('ndaFormContainer');
    const success = document.getElementById('ndaSuccessContainer');
    const email = document.getElementById('ndaEmail');
    
    if (target) target.textContent = studioName;
    if (container) container.classList.remove('hidden');
    if (success) success.classList.add('hidden');
    if (email) email.value = '';
    
    const modal = document.getElementById('ndaModal');
    if (modal) {
        modal.classList.remove('hidden-modal');
        modal.classList.add('flex-center');
        setTimeout(() => modal.style.opacity = '1', 10);
    }
};

window.closeNdaModal = function() {
    const modal = document.getElementById('ndaModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.classList.add('hidden-modal');
            modal.classList.remove('flex-center');
        }, 300);
    }
};

window.submitNda = function(e) {
    e.preventDefault();
    const container = document.getElementById('ndaFormContainer');
    const success = document.getElementById('ndaSuccessContainer');
    if (container) container.classList.add('hidden');
    if (success) success.classList.remove('hidden');
};

// ==========================================
// 2FA COMPLETO CON EMAILJS
// ==========================================
function generate2FACode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function send2FACodeByEmail(email, name, code) {
    try {
        if (typeof emailjs === 'undefined') {
            await loadEmailJS();
        }
        
        const templateParams = {
            to_email: email,
            name: name || email.split('@')[0] || 'Usuario',
            code: code
        };
        
        console.log('📧 Enviando email 2FA a:', email);
        console.log('📧 Código:', code);
        
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams,
            EMAILJS_CONFIG.PUBLIC_KEY
        );
        
        console.log('✅ Email 2FA enviado con éxito');
        return true;
    } catch (error) {
        console.error('❌ Error al enviar email 2FA:', error);
        alert(`🔐 Tu código de verificación es: ${code}\n\n(Revisa tu correo o la consola)`);
        return false;
    }
}

function loadEmailJS() {
    return new Promise((resolve) => {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
        script.onload = () => {
            emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
            resolve();
        };
        script.onerror = () => {
            console.warn('⚠️ No se pudo cargar EmailJS, usando modo offline');
            resolve();
        };
        document.head.appendChild(script);
    });
}

async function start2FAFlow(email, name) {
    if (twoFATimeout) {
        clearTimeout(twoFATimeout);
        twoFATimeout = null;
    }
    
    return new Promise((resolve) => {
        const code = generate2FACode();
        pending2FACode = code;
        pending2FAEmail = email;
        pending2FAName = name || email.split('@')[0] || 'Usuario';
        pending2FATimestamp = Date.now();
        pending2FAResolve = resolve;
        
        send2FACodeByEmail(email, pending2FAName, code);
        
        const modal = document.getElementById('2faModal');
        if (modal) {
            modal.classList.remove('hidden-modal');
            modal.classList.add('flex-center');
            setTimeout(() => modal.style.opacity = '1', 10);
            
            const codeInput = document.getElementById('2faCode');
            if (codeInput) {
                codeInput.value = '';
                setTimeout(() => codeInput.focus(), 100);
            }
            
            const errorEl = document.getElementById('2faError');
            if (errorEl) errorEl.classList.add('hidden');
            
            const submitBtn = document.getElementById('2faSubmitBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Verificar y Acceder';
            }
            
            const subtitle = document.getElementById('2faSubtitle');
            if (subtitle) {
                subtitle.innerHTML = `
                    Hemos enviado un código de 6 dígitos a<br>
                    <strong style="color: #2563eb;">${email}</strong>
                `;
            }
        }
        
        twoFATimeout = setTimeout(() => {
            pending2FACode = null;
            if (pending2FAResolve) {
                pending2FAResolve(false);
                pending2FAResolve = null;
            }
            close2FAModal();
            alert('⏰ El código de verificación ha expirado. Solicita uno nuevo.');
        }, 300000);
    });
}

window.verify2FACode = async function(e) {
    e.preventDefault();
    const codeInput = document.getElementById('2faCode');
    const errorEl = document.getElementById('2faError');
    const submitBtn = document.getElementById('2faSubmitBtn');
    
    if (!codeInput || !errorEl || !submitBtn) return;
    
    const enteredCode = codeInput.value.trim();
    
    if (enteredCode.length !== 6 || !/^\d{6}$/.test(enteredCode)) {
        errorEl.textContent = '❌ El código debe tener 6 dígitos numéricos.';
        errorEl.classList.remove('hidden');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verificando...';
    
    try {
        if (pending2FATimestamp && (Date.now() - pending2FATimestamp) > 300000) {
            throw new Error('⏰ El código ha expirado. Solicita uno nuevo.');
        }
        
        if (enteredCode === pending2FACode) {
            errorEl.classList.add('hidden');
            
            if (twoFATimeout) {
                clearTimeout(twoFATimeout);
                twoFATimeout = null;
            }
            
            close2FAModal();
            sessionStorage.setItem('2fa_verified', 'true');
            
            if (pending2FAResolve) {
                pending2FAResolve(true);
                pending2FAResolve = null;
            }
            
            alert('✅ ¡Verificación 2FA completada con éxito!');
            loadProfilesFromFirebase();
            
        } else {
            errorEl.textContent = '❌ Código incorrecto. Inténtalo de nuevo.';
            errorEl.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Verificar y Acceder';
            codeInput.value = '';
            codeInput.focus();
        }
    } catch (error) {
        console.error('Error verificando 2FA:', error);
        errorEl.textContent = error.message || '❌ Error al verificar el código.';
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Verificar y Acceder';
        codeInput.value = '';
        codeInput.focus();
    }
};

window.close2FAModal = function() {
    const modal = document.getElementById('2faModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.classList.add('hidden-modal');
            modal.classList.remove('flex-center');
        }, 300);
    }
    
    if (twoFATimeout) {
        clearTimeout(twoFATimeout);
        twoFATimeout = null;
    }
    
    if (pending2FAResolve) {
        pending2FAResolve(false);
        pending2FAResolve = null;
    }
    
    pending2FACode = null;
};

window.resend2FACode = function() {
    if (pending2FAEmail) {
        const newCode = generate2FACode();
        pending2FACode = newCode;
        pending2FATimestamp = Date.now();
        
        send2FACodeByEmail(pending2FAEmail, pending2FAName, newCode);
        
        const errorEl = document.getElementById('2faError');
        if (errorEl) {
            errorEl.textContent = '✅ Nuevo código enviado. Revisa tu correo.';
            errorEl.classList.remove('hidden');
            errorEl.classList.add('text-emerald-400');
            errorEl.classList.remove('text-red-400');
            setTimeout(() => {
                errorEl.classList.add('hidden');
            }, 5000);
        }
    }
};

function init2FA() {
    loadEmailJS();
    console.log('🔐 2FA inicializado con EmailJS');
}

// ==========================================
// CHATBOT
// ==========================================
let chatOpenFirstTime = true;
let chatStep = 0;
let isBotResponding = false;

window.toggleChat = function() {
    const win = document.getElementById('chat-window');
    if (!win) return;
    
    if (win.classList.contains('hidden')) {
        win.classList.remove('hidden');
        setTimeout(() => win.classList.add('chat-open'), 10);
        
        if (chatOpenFirstTime) {
            chatOpenFirstTime = false;
            chatStep = 0;
            const messages = document.getElementById('chat-messages');
            if (messages) messages.innerHTML = '';
            setTimeout(botGreeting, 500);
        }
    } else {
        win.classList.remove('chat-open');
        setTimeout(() => win.classList.add('hidden'), 300);
    }
};

function botGreeting() {
    isBotResponding = true;
    showTyping();
    setTimeout(() => {
        hideTyping();
        appendMessage('bot', '👋 Hola, soy el asistente de Bniarq.');
        setTimeout(() => {
            showTyping();
            setTimeout(() => {
                hideTyping();
                appendMessage('bot', '¿Tienes alguna duda sobre nuestra plataforma?');
                isBotResponding = false;
                chatStep = 0;
            }, 800);
        }, 600);
    }, 800);
}

function appendMessage(sender, text) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' ? 'chat-msg-user' : 'chat-msg-bot';
    msgDiv.innerHTML = text;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function showTyping() {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    hideTyping();
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-typing';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
}

function hideTyping() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

window.sendUserMessage = function() {
    const input = document.getElementById('chat-input');
    const btn = document.getElementById('chatSendBtn');
    
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    
    if (isBotResponding) return;
    
    if (btn) {
        btn.disabled = true;
        btn.textContent = '...';
    }
    
    appendMessage('user', text);
    input.value = '';
    processUserMessage(text, btn);
};

function processUserMessage(userText, btn) {
    if (isBotResponding) return;
    isBotResponding = true;
    chatStep++;
    
    showTyping();
    
    setTimeout(() => {
        hideTyping();
        
        let response = '';
        
        if (chatStep === 1) {
            response = '📌 Gracias por tu mensaje. Nuestro equipo de soporte revisa cada consulta con atención.';
        } else if (chatStep === 2) {
            response = '🔄 ¿Te gustaría que un asesor se ponga en contacto contigo?';
        } else if (chatStep === 3) {
            response = '✅ Perfecto. Puedes escribirnos a <strong>soporte@bniarq.com</strong> o dejarnos tu email aquí y te contactaremos.';
            chatStep = 0;
        } else {
            response = '📞 Si necesitas ayuda adicional, escríbenos a <strong>soporte@bniarq.com</strong>';
            chatStep = 0;
        }
        
        appendMessage('bot', response);
        isBotResponding = false;
        
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Enviar';
        }
    }, 1200);
}

// ==========================================
// AUTENTICACIÓN
// ==========================================
window.openAuthModal = function(mode) {
    authMode = mode || 'login';
    applyAuthMode();
    const modal = document.getElementById('authModal');
    if (!modal) return;
    const errorEl = document.getElementById('authError');
    if (errorEl) errorEl.classList.add('hidden');
    modal.classList.remove('hidden-modal');
    modal.classList.add('flex-center');
    setTimeout(() => modal.style.opacity = '1', 10);
};

window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.classList.add('hidden-modal');
        modal.classList.remove('flex-center');
    }, 300);
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
    
    const fields = [
        'authNameField', 'authApellidoField', 'authFechaNacField',
        'authTelefonoField', 'authEmpresaField', 'authCargoField',
        'authConfirmPasswordField', 'authTerminosField'
    ];
    
    const isLogin = authMode === 'login';
    
    if (title) title.textContent = isLogin ? 'Iniciar sesión' : 'Crear cuenta profesional';
    if (subtitle) subtitle.textContent = isLogin ? 'Accede a tu cuenta Bniarq' : 'Completa todos los datos para unirte';
    if (submitBtn) submitBtn.textContent = isLogin ? 'Iniciar sesión' : 'Crear cuenta';
    if (switchText) switchText.textContent = isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?';
    if (switchBtn) switchBtn.textContent = isLogin ? 'Regístrate' : 'Inicia sesión';
    
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (isLogin) el.classList.add('hidden');
            else el.classList.remove('hidden');
        }
    });
}

function showAuthError(message) {
    const err = document.getElementById('authError');
    if (!err) return;
    err.textContent = message;
    err.classList.remove('hidden');
}

function translateAuthError(code) {
    const map = {
        'auth/email-already-in-use': 'Este correo ya está registrado. Inicia sesión.',
        'auth/invalid-email': 'El correo no es válido.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/user-not-found': 'No existe ninguna cuenta con ese correo.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/invalid-credential': 'Correo o contraseña incorrectos.',
        'auth/popup-closed-by-user': 'Has cerrado la ventana antes de completar el inicio de sesión.',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento.'
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
        const errorEl = document.getElementById('authError');
        if (errorEl) errorEl.classList.add('hidden');

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
                
                try {
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
                        createdAt: serverTimestamp(),
                        twoFAEnabled: false
                    });
                    
                    closeAuthModal();
                    form.reset();
                    loadProfilesFromFirebase();
                    
                } catch (registerError) {
                    if (registerError.code === 'auth/email-already-in-use') {
                        if (errorEl) {
                            errorEl.textContent = '⚠️ Este correo ya está registrado. ';
                            errorEl.classList.remove('hidden');
                            errorEl.classList.add('text-yellow-400');
                            errorEl.classList.remove('text-red-400');
                            
                            const switchBtn = document.createElement('button');
                            switchBtn.textContent = 'Iniciar sesión';
                            switchBtn.className = 'text-blue-400 hover:text-blue-300 font-semibold ml-2 underline';
                            switchBtn.onclick = () => {
                                authMode = 'login';
                                applyAuthMode();
                                document.getElementById('authEmail').value = email;
                                document.getElementById('authPassword').value = password;
                                form.dispatchEvent(new Event('submit'));
                            };
                            errorEl.appendChild(switchBtn);
                        }
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                        return;
                    } else {
                        throw registerError;
                    }
                }
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                
                const user = auth.currentUser;
                if (user) {
                    const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
                    const userData = userDoc.exists() ? userDoc.data() : {};
                    
                    if (userData.twoFAEnabled === true) {
                        const verified = await start2FAFlow(user.email, userData.name);
                        if (!verified) {
                            await signOut(auth);
                            showAuthError('❌ Verificación 2FA cancelada.');
                            return;
                        }
                    }
                }
                
                closeAuthModal();
                form.reset();
                loadProfilesFromFirebase();
            }
        } catch (error) {
            console.error('Error de autenticación:', error);
            if (errorEl && !errorEl.textContent) {
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
                    createdAt: serverTimestamp(),
                    twoFAEnabled: false
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

window.logout = async function() {
    await signOut(auth);
    if (conversationsUnsub) { conversationsUnsub(); conversationsUnsub = null; }
    loadProfilesFromFirebase();
};

function watchAuthState() {
    onAuthStateChanged(auth, async (user) => {
        const authArea = document.getElementById('authArea');
        
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
                fechaNacimiento: userData.fechaNacimiento || '',
                twoFAEnabled: userData.twoFAEnabled || false
            };

            const userHTML = `
                <div class="relative">
                    <button onclick="toggleAccountMenu()" class="flex items-center gap-2 bg-brand-card border border-brand-border hover:border-blue-500 rounded-full pl-1.5 pr-3 py-1.5 transition">
                        <img src="${currentUserProfile.photo}" class="w-6 h-6 rounded-full object-cover" alt="avatar">
                        <span class="text-xs font-semibold text-white max-w-[100px] truncate">${currentUserProfile.name}</span>
                    </button>
                    <div id="accountMenu" class="hidden absolute right-0 mt-2 w-56 bg-brand-card border border-brand-border rounded-2xl shadow-2xl overflow-hidden">
                        <div class="px-4 py-3 border-b border-brand-border">
                            <p class="text-xs font-bold text-white">${currentUserProfile.name} ${currentUserProfile.apellido || ''}</p>
                            <p class="text-[10px] text-brand-muted truncate">${currentUserProfile.email}</p>
                            ${currentUserProfile.empresa ? `<p class="text-[10px] text-brand-muted">${currentUserProfile.empresa}</p>` : ''}
                            ${currentUserProfile.twoFAEnabled ? `<p class="text-[10px] text-emerald-400">🔒 2FA Activado</p>` : `<p class="text-[10px] text-brand-muted">🔓 2FA Desactivado</p>`}
                        </div>
                        <button onclick="openProfileEditor(); toggleAccountMenu();" class="w-full text-left px-4 py-3 text-xs text-white hover:bg-brand-border transition flex items-center gap-2">
                            <i data-lucide="user-cog" class="w-3.5 h-3.5"></i> Editar perfil
                        </button>
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
    if (menu && !menu.classList.contains('hidden') && !e.target.closest('#authArea')) {
        menu.classList.add('hidden');
    }
});

// ==========================================
// EDITOR DE PERFIL
// ==========================================
function initProfileEditor() {
    const form = document.getElementById('profileEditorForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('editProfileSubmitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';
        
        const errorEl = document.getElementById('editProfileError');
        const successEl = document.getElementById('editProfileSuccess');
        if (errorEl) errorEl.classList.add('hidden');
        if (successEl) successEl.classList.add('hidden');

        try {
            const user = auth.currentUser;
            if (!user) {
                if (errorEl) {
                    errorEl.textContent = 'No has iniciado sesión.';
                    errorEl.classList.remove('hidden');
                }
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }

            const name = document.getElementById('editName').value.trim();
            const apellido = document.getElementById('editApellido').value.trim();
            const email = document.getElementById('editEmail').value.trim();
            const telefono = document.getElementById('editTelefono').value.trim();
            const empresa = document.getElementById('editEmpresa').value.trim();
            const cargo = document.getElementById('editCargo').value.trim();
            const fechaNac = document.getElementById('editFechaNac').value;
            const twoFAEnabled = document.getElementById('edit2FA').checked;

            if (!name) { if (errorEl) { errorEl.textContent = 'El nombre es obligatorio.'; errorEl.classList.remove('hidden'); } throw new Error('Nombre requerido'); }
            if (!apellido) { if (errorEl) { errorEl.textContent = 'Los apellidos son obligatorios.'; errorEl.classList.remove('hidden'); } throw new Error('Apellidos requeridos'); }
            if (!email) { if (errorEl) { errorEl.textContent = 'El email es obligatorio.'; errorEl.classList.remove('hidden'); } throw new Error('Email requerido'); }

            if (name !== user.displayName) {
                await updateProfile(user, { displayName: `${name} ${apellido}` });
            }

            // ACTUALIZAR 2FA
            const current2FA = currentUserProfile?.twoFAEnabled || false;
            if (twoFAEnabled !== current2FA) {
                if (twoFAEnabled) {
                    const verified = await start2FAFlow(user.email, name);
                    if (verified) {
                        await updateDoc(doc(db, 'usuarios', user.uid), {
                            twoFAEnabled: true
                        });
                        currentUserProfile.twoFAEnabled = true;
                        alert('✅ 2FA activado correctamente.');
                    } else {
                        document.getElementById('edit2FA').checked = false;
                        throw new Error('No se pudo activar 2FA');
                    }
                } else {
                    await updateDoc(doc(db, 'usuarios', user.uid), {
                        twoFAEnabled: false
                    });
                    currentUserProfile.twoFAEnabled = false;
                    alert('✅ 2FA desactivado correctamente.');
                }
            }

            await updateDoc(doc(db, 'usuarios', user.uid), {
                name: name,
                apellido: apellido,
                telefono: telefono,
                empresa: empresa,
                cargo: cargo,
                fechaNacimiento: fechaNac,
                updatedAt: serverTimestamp()
            });

            if (currentUserProfile) {
                currentUserProfile.name = name;
                currentUserProfile.apellido = apellido;
                currentUserProfile.email = email;
                currentUserProfile.telefono = telefono;
                currentUserProfile.empresa = empresa;
                currentUserProfile.cargo = cargo;
                currentUserProfile.fechaNacimiento = fechaNac;
            }

            if (successEl) {
                successEl.textContent = '¡Perfil actualizado con éxito!';
                successEl.classList.remove('hidden');
            }
            
            watchAuthState();
            
            setTimeout(() => {
                closeProfileEditor();
            }, 2000);

        } catch (error) {
            console.error('Error al guardar perfil:', error);
            if (errorEl && !errorEl.textContent) {
                errorEl.textContent = 'Error al guardar los cambios. Reintenta.';
                errorEl.classList.remove('hidden');
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

window.openProfileEditor = function() {
    if (!currentUserProfile) {
        alert('Debes iniciar sesión primero.');
        return;
    }

    document.getElementById('editName').value = currentUserProfile.name || '';
    document.getElementById('editApellido').value = currentUserProfile.apellido || '';
    document.getElementById('editEmail').value = currentUserProfile.email || '';
    document.getElementById('editTelefono').value = currentUserProfile.telefono || '';
    document.getElementById('editEmpresa').value = currentUserProfile.empresa || '';
    document.getElementById('editCargo').value = currentUserProfile.cargo || '';
    document.getElementById('editFechaNac').value = currentUserProfile.fechaNacimiento || '';
    document.getElementById('edit2FA').checked = currentUserProfile.twoFAEnabled || false;
    document.getElementById('editProfileError').classList.add('hidden');
    document.getElementById('editProfileSuccess').classList.add('hidden');

    const modal = document.getElementById('profileEditorModal');
    if (modal) {
        modal.classList.remove('hidden-modal');
        modal.classList.add('flex-center');
        setTimeout(() => modal.style.opacity = '1', 10);
    }
};

window.closeProfileEditor = function() {
    const modal = document.getElementById('profileEditorModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.classList.add('hidden-modal');
            modal.classList.remove('flex-center');
        }, 300);
    }
};

window.changePassword = async function() {
    const user = auth.currentUser;
    if (!user) {
        alert('No has iniciado sesión.');
        return;
    }

    const currentPassword = prompt('Introduce tu contraseña actual:');
    if (!currentPassword) return;

    const newPassword = prompt('Introduce tu nueva contraseña (mín. 6 caracteres):');
    if (!newPassword || newPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    const confirmPassword = prompt('Confirma tu nueva contraseña:');
    if (newPassword !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        alert('¡Contraseña actualizada con éxito!');
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        if (error.code === 'auth/wrong-password') {
            alert('La contraseña actual es incorrecta.');
        } else {
            alert('Error al cambiar la contraseña: ' + translateAuthError(error.code));
        }
    }
};

// ==========================================
// MENSAJERÍA
// ==========================================
function conversationIdFor(uidA, uidB) {
    return [uidA, uidB].sort().join('_');
}

window.startConversation = async function(peer) {
    if (!auth.currentUser) {
        alert('Inicia sesión para poder enviar mensajes.');
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
        where('participants', 'array-contains', auth.currentUser.uid)
    );
    
    conversationsUnsub = onSnapshot(q, (snapshot) => {
        const docs = [];
        snapshot.forEach(doc => {
            docs.push({ id: doc.id, ...doc.data() });
        });
        docs.sort((a, b) => {
            const aTime = a.lastMessageAt?.toMillis?.() || 0;
            const bTime = b.lastMessageAt?.toMillis?.() || 0;
            return bTime - aTime;
        });
        renderConversationsList(docs);
    }, (error) => {
        console.error('Error escuchando conversaciones:', error);
    });
}

function renderConversationsList(docs) {
    const list = document.getElementById('conversationsList');
    if (!list) return;

    if (!docs || docs.length === 0) {
        list.innerHTML = '<p class="text-xs text-brand-muted p-4 text-center">Aún no tienes conversaciones.</p>';
        return;
    }

    list.innerHTML = '';
    docs.forEach((data) => {
        const peerUid = data.participants?.find(uid => uid !== auth.currentUser.uid);
        if (!peerUid) return;
        
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
        item.onclick = () => openThread(data.id, { uid: peerUid, name: peerName });
        list.appendChild(item);
    });
}

function openThread(convId, peer) {
    activeConversationId = convId;
    activePeer = peer;

    const inboxListView = document.getElementById('inboxListView');
    const threadView = document.getElementById('threadView');
    const threadPeerName = document.getElementById('threadPeerName');
    const threadMessages = document.getElementById('threadMessages');

    if (!inboxListView || !threadView || !threadPeerName || !threadMessages) {
        console.error('Elementos de mensajería no encontrados');
        alert('La ventana de mensajería no está disponible.');
        return;
    }

    inboxListView.classList.add('hidden');
    threadView.classList.remove('hidden');
    threadView.classList.add('flex');
    threadPeerName.textContent = peer.name || 'Usuario';
    threadMessages.innerHTML = '<p class="text-xs text-brand-muted text-center">Cargando mensajes...</p>';

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
        container.innerHTML = '<p class="text-xs text-brand-muted text-center">Escribe el primer mensaje.</p>';
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
    const inboxListView = document.getElementById('inboxListView');
    const threadView = document.getElementById('threadView');
    
    if (threadView) {
        threadView.classList.add('hidden');
        threadView.classList.remove('flex');
    }
    if (inboxListView) {
        inboxListView.classList.remove('hidden');
    }
    
    if (activeThreadUnsub) { 
        activeThreadUnsub(); 
        activeThreadUnsub = null; 
    }
    activeConversationId = null;
    activePeer = null;
}

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
        alert('No se pudo enviar el mensaje.');
    }
};

// ==========================================
// FILTRADO DE PERFILES
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
