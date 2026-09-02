// Importar funciones de Firebase SDK (Firestore + Auth)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initScrollAnimations();
    initDossierForm();
    loadProfilesFromFirebase(); 
    initProfileRegistration();
    initNdaModal();
    initAuthObserver();
});

// ==========================================
// AUTENTICACIÓN GOOGLE Y APPLE (FIREBASE AUTH)
// ==========================================
function initAuthObserver() {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        const authContainer = document.getElementById('authContainer');
        if (authContainer) {
            if (user) {
                authContainer.innerHTML = `
                    <div class="flex items-center gap-3">
                        <img src="${user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'}" class="w-8 h-8 rounded-full object-cover border border-blue-500/50">
                        <span class="text-xs font-bold text-white hidden sm:inline">${user.displayName || user.email}</span>
                        <button onclick="window.logoutUser()" class="bg-brand-card border border-brand-border text-xs px-3 py-1.5 rounded-lg hover:text-red-400 transition cursor-pointer">Cerrar Sesión</button>
                    </div>
                `;
            } else {
                authContainer.innerHTML = `
                    <div class="flex items-center gap-2">
                        <button onclick="window.loginWithGoogle()" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5">
                            Google
                        </button>
                        <button onclick="window.loginWithApple()" class="bg-brand-card border border-brand-border hover:bg-brand-border text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5">
                            Apple
                        </button>
                    </div>
                `;
            }
        }
    });
}

window.loginWithGoogle = async function() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error login Google:", error);
        alert("No se pudo iniciar sesión con Google.");
    }
};

window.loginWithApple = async function() {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error login Apple:", error);
        alert("No se pudo iniciar sesión con Apple.");
    }
};

window.logoutUser = async function() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
};

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
// 70 PERFILES DEMO DISTRIBUIDOS POR ESPAÑA
// ==========================================
const pImg1 = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop";
const pImg2 = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop";
const pImg3 = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop";
const pImg4 = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop";
const pImg5 = "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop";

const defaultProfiles = [
    { name: "Aris Studio", role: "Diseño Residencial", location: "Madrid", software: "Revit / BIM", photo: pImg1, cert: "Passivhaus Designer" },
    { name: "Structuralia", role: "Cálculo de Estructuras", location: "Barcelona", software: "CypeCAD", photo: pImg2, cert: "BIM Level 3" },
    { name: "EcoBuild Lab", role: "Consultoría Energética", location: "Valencia", software: "EnergyPlus", photo: pImg3, cert: "LEED AP BD+C" },
    { name: "Norte Arquitectura", role: "Urbanismo Público", location: "Bilbao", software: "Archicad", photo: pImg4, cert: "ISO 19650" },
    { name: "Andalucía Design", role: "Resorts Turísticos", location: "Sevilla", software: "Revit / 3ds Max", photo: pImg5, cert: "WELL AP" },
    { name: "Zaragoza Ingenieros", role: "Climatización MEP", location: "Zaragoza", software: "Cype MEP", photo: pImg2, cert: "Energy Manager" },
    { name: "Costa Sol Villas", role: "Villas de Lujo", location: "Málaga", software: "Rhino", photo: pImg1, cert: "BREEAM Associate" },
    { name: "Murcia AgroTech", role: "Instalaciones Agrícolas", location: "Murcia", software: "Revit", photo: pImg4, cert: "Agro-Building Cert" },
    { name: "Mallorca Build", role: "Arquitectura Bioclimática", location: "Palma", software: "Vectorworks", photo: pImg3, cert: "EnerPHit" },
    { name: "Canarias Volcanic", role: "Edificación Resiliente", location: "Las Palmas", software: "AutoCAD", photo: pImg2, cert: "Resilience Expert" },
    { name: "Alicante Costa", role: "Urbanismo Costero", location: "Alicante", software: "Civil 3D", photo: pImg5, cert: "Coastal Planner" },
    { name: "Córdoba Califal", role: "Restauración Patrimonio", location: "Córdoba", software: "Photogrammetry", photo: pImg1, cert: "Heritage Pro" },
    { name: "Valladolid Steel", role: "Estructuras Metálicas", location: "Valladolid", software: "Tekla", photo: pImg4, cert: "Welding Engineer" },
    { name: "Vigo Marine Arch", role: "Arquitectura Naval", location: "Vigo", software: "Nupas", photo: pImg2, cert: "Marine Architect" },
    { name: "Gijón Industrial", role: "Naves Industriales", location: "Gijón", software: "Revit Structure", photo: pImg3, cert: "Industrial Safety" },
    { name: "L'Hospitalet Densify", role: "Densificación Urbana", location: "L'Hospitalet", software: "ArcGIS", photo: pImg5, cert: "Urban Density" },
    { name: "Vitoria Green Lab", role: "Capital Verde Diseño", location: "Vitoria", software: "PHPP", photo: pImg1, cert: "Passivhaus Tradesperson" },
    { name: "A Coruña Atlantic", role: "Fachadas Marítimas", location: "A Coruña", software: "Revit", photo: pImg4, cert: "Facade Engineer" },
    { name: "Granada Alhambra", role: "Diseño Nazarí Moderno", location: "Granada", software: "Rhino", photo: pImg2, cert: "Traditional Materials" },
    { name: "Elche Palm Studio", role: "Paisajismo Protegido", location: "Elche", software: "Lumion", photo: pImg3, cert: "Landscape Pro" },
    { name: "Oviedo Thermal", role: "Balnearios y Termas", location: "Oviedo", software: "Revit MEP", photo: pImg5, cert: "Spa Designer" },
    { name: "Badalona Tower", role: "Rascacielos Residencial", location: "Badalona", software: "SAP2000", photo: pImg4, cert: "High-Rise Expert" },
    { name: "Terrassa Lofts", role: "Conversión Industrial", location: "Terrassa", software: "AutoCAD", photo: pImg1, cert: "Heritage Conversion" },
    { name: "Cartagena Port", role: "Ingeniería Portuaria", location: "Cartagena", software: "Civil 3D", photo: pImg2, cert: "Port Infra" },
    { name: "Jerez Cellars", role: "Arquitectura Enológica", location: "Jerez", software: "Revit", photo: pImg3, cert: "Winery Architect" },
    { name: "Sabadell Dynamics", role: "Cálculo Dinámico", location: "Sabadell", software: "ETABS", photo: pImg5, cert: "Structural Dynamics" },
    { name: "Móstoles Housing", role: "VPO Sostenible", location: "Móstoles", software: "Archicad", photo: pImg1, cert: "Social Housing" },
    { name: "Tenerife Sur Resort", role: "Complejos Hoteleros", location: "Santa Cruz de Tenerife", software: "Revit / 3ds Max", photo: pImg4, cert: "Hospitality Design" },
    { name: "Pamplona Passive", role: "Clima Continental Eco", location: "Pamplona", software: "PHPP", photo: pImg2, cert: "Passivhaus Master" },
    { name: "Almería Greenhouses", role: "Invernaderos Tech", location: "Almería", software: "AutoDesk", photo: pImg3, cert: "Agro-Tech" },
    { name: "Alcalá Campus", role: "Recintos Universitarios", location: "Alcalá de Henares", software: "Revit", photo: pImg5, cert: "Campus Planner" },
    { name: "Fuenlabrada Precast", role: "Hormigón Prefabricado", location: "Fuenlabrada", software: "Tekla", photo: pImg1, cert: "Precast Concrete" },
    { name: "Leganés Smart", role: "Automatización BMS", location: "Leganés", software: "Revit MEP", photo: pImg4, cert: "Smart Building" },
    { name: "Donostia Coastal", role: "Diseño Litoral", location: "San Sebastián", software: "GIS", photo: pImg2, cert: "Coastal Planner" },
    { name: "Getafe Aero", role: "Instalaciones Aeronáuticas", location: "Getafe", software: "Catia", photo: pImg3, cert: "Aero Facility" },
    { name: "Burgos Stone", role: "Estructuras de Fábrica", location: "Burgos", software: "Ansys", photo: pImg5, cert: "Stone Mechanics" },
    { name: "Albacete Solar", role: "Plantas Fotovoltaicas", location: "Albacete", software: "PVsyst", photo: pImg1, cert: "Solar Plant Design" },
    { name: "Santander Sea", role: "Defensas Marítimas", location: "Santander", software: "Civil 3D", photo: pImg4, cert: "Maritime Engineer" },
    { name: "Castellón Ceramic", role: "Envolventes Cerámicas", location: "Castellón", software: "Rhino", photo: pImg2, cert: "Ceramic Envelope" },
    { name: "Alcorcón Efficiency", role: "Rehabilitación Energética", location: "Alcorcón", software: "EnergyPlus", photo: pImg3, cert: "Retrofit Expert" },
    { name: "La Laguna Heritage", role: "Cascos Históricos", location: "San Cristóbal de La Laguna", software: "AutoCAD", photo: pImg5, cert: "Historic Planner" },
    { name: "Logroño Rioja Lab", role: "Bodegas Modernas", location: "Logroño", software: "Archicad", photo: pImg1, cert: "Wine Architecture" },
    { name: "Badajoz Bridge", role: "Puentes Civiles", location: "Badajoz", software: "Cype Civil", photo: pImg4, cert: "Bridge Engineer" },
    { name: "Salamanca Plaza", role: "Restauración Comercial", location: "Salamanca", software: "Revit", photo: pImg2, cert: "Commercial Heritage" },
    { name: "Huelva Atlantic", role: "Infraestructura Logística", location: "Huelva", software: "Revit MEP", photo: pImg3, cert: "Logistics Hub" },
    { name: "Lleida Agro", role: "Estructuras Agroindustriales", location: "Lleida", software: "CypeCAD", photo: pImg5, cert: "Agro-Industrial Master" },
    { name: "Marbella Luxury", role: "Urbanizaciones Premium", location: "Marbella", software: "Lumion", photo: pImg1, cert: "Luxury Real Estate" },
    { name: "Tarragona Roman", role: "Arqueología 3D", location: "Tarragona", software: "Blender", photo: pImg4, cert: "3D Archaeologist" },
    { name: "Dos Hermanas Build", role: "Expansión Urbana", location: "Dos Hermanas", software: "ArcGIS", photo: pImg2, cert: "Urban Expansion" },
    { name: "León Mining", role: "Geotecnia y Cimentación", location: "León", software: "GeoStudio", photo: pImg3, cert: "Geotechnical Spec" },
    { name: "Torrejón AirBase", role: "Instalaciones Militares", location: "Torrejón de Ardoz", software: "Revit", photo: pImg5, cert: "Defense Infrastructure" },
    { name: "Parla Commute", role: "Intercambiadores Transporte", location: "Parla", software: "Civil 3D", photo: pImg1, cert: "Transport Node Pro" },
    { name: "Mataró Textile", role: "Fábricas Textiles 4.0", location: "Mataró", software: "Plant3D", photo: pImg4, cert: "Industry 4.0" },
    { name: "Cádiz Bay", role: "Astillero y Diques", location: "Cádiz", software: "AutoCAD", photo: pImg2, cert: "Dry Dock Engineer" },
    { name: "Algeciras Cargo", role: "Terminales de Contenedores", location: "Algeciras", software: "Navisworks", photo: pImg3, cert: "Cargo Terminal Spec" },
    { name: "Santa Coloma Social", role: "Integración Urbana", location: "Santa Coloma", software: "QGIS", photo: pImg5, cert: "Social Integrator" },
    { name: "Jaén Olivar", role: "Almazaras Sostenibles", location: "Jaén", software: "Revit", photo: pImg1, cert: "Olive Mill Expert" },
    { name: "Alcobendas Corp", role: "Sedes Corporativas", location: "Alcobendas", software: "Rhino", photo: pImg4, cert: "Corporate HQ Design" },
    { name: "Ourense Spa", role: "Arquitectura Termal", location: "Ourense", software: "Revit MEP", photo: pImg2, cert: "Thermal Spa Cert" },
    { name: "Reus Modernist", role: "Rutas Modernistas", location: "Reus", software: "Archicad", photo: pImg3, cert: "Modernist Guide" },
    { name: "Telde Logistics", role: "Naves de Distribución", location: "Telde", software: "Cype", photo: pImg5, cert: "Distribution Node" },
    { name: "Barakaldo Steel", role: "Reconversión Siderúrgica", location: "Barakaldo", software: "AutoCAD", photo: pImg1, cert: "Steelwork Revival" },
    { name: "Girona Pyrenees", role: "Refugios de Montaña", location: "Girona", software: "PHPP", photo: pImg4, cert: "Alpine Architecture" },
    { name: "Lugo Wall", role: "Mantenimiento Murallas", location: "Lugo", software: "Photogrammetry", photo: pImg2, cert: "Ancient Walls" },
    { name: "Santiago Pilgrims", role: "Albergues Sostenibles", location: "Santiago", software: "Revit", photo: pImg3, cert: "Hostel Design" },
    { name: "Cáceres OldTown", role: "Hoteles Boutique Históricos", location: "Cáceres", software: "Lumion", photo: pImg5, cert: "Boutique Hotel" },
    { name: "Melilla Border", role: "Puestos Fronterizos", location: "Melilla", software: "Civil 3D", photo: pImg1, cert: "Border Facility" },
    { name: "San Fernando Naval", role: "Instalaciones de la Armada", location: "San Fernando", software: "Revit", photo: pImg4, cert: "Naval Architect" },
    { name: "Ceuta Strait", role: "Logística Transcontinental", location: "Ceuta", software: "Navisworks", photo: pImg2, cert: "Transcontinental Hub" },
    { name: "Ibiza Minimal", role: "Villas Minimalistas", location: "Ibiza", software: "Rhino", photo: pImg3, cert: "Minimalist Pro" },
    { name: "Ayoub", role: "Diseño & Estructuras", location: "Barcelona", software: "Revit", photo: pImg1, cert: "Passivhaus" }
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
            const batchPromises = defaultProfiles.map(p => {
                const newP = {...p, createdAt: new Date().toISOString()};
                return addDoc(collection(db, "perfiles"), newP);
            });
            await Promise.all(batchPromises);
            const newSnapshot = await getDocs(collection(db, "perfiles"));
            allProfilesCache = [];
            newSnapshot.forEach((doc) => allProfilesCache.push(doc.data()));
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
        const certBadge = p.cert ? `<span class="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full font-semibold inline-block mb-3"><i data-lucide="award" class="w-3 h-3 inline mr-1"></i> ${p.cert}</span>` : '';
        
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
                <p class="text-xs font-semibold text-white mb-2">${p.role}</p>
                ${certBadge}
                <div class="text-xs text-brand-muted flex items-center gap-2 mb-6">
                    <i data-lucide="cpu" class="w-4 h-4"></i> ${p.software}
                </div>
            </div>
            <div class="space-y-2">
                <button onclick="window.openNdaModal('${p.name.replace(/'/g, "\\'")}')" class="w-full bg-brand-dark border border-brand-border hover:bg-blue-600 hover:text-white text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer">
                    Conectar / Enviar NDA
                </button>
                <button onclick="window.openPeerChat('${p.name.replace(/'/g, "\\'")}')" class="w-full bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer">
                    <i data-lucide="message-square" class="w-3.5 h-3.5"></i> Mensaje Directo P2P
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// COMPRESIÓN DE IMÁGENES AL REGISTRAR
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
            if (width > height && width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } 
            else if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
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
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Guardando en la nube...";
        submitBtn.disabled = true;

        const fileInput = document.getElementById('pPhotoFile');
        let photoData = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop"; 

        const saveToFirestore = async (finalPhotoUrl) => {
            const newProfile = {
                name: document.getElementById('pName').value,
                role: document.getElementById('pRole').value,
                location: document.getElementById('pLocation').value,
                software: document.getElementById('pSoftware').value,
                cert: document.getElementById('pCert').value || "Validado Bniarq",
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
                alert("Hubo un error al guardar el perfil en la nube.");
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        };

        if (fileInput && fileInput.files && fileInput.files[0]) {
            compressImage(fileInput.files[0], (compressedImg) => { saveToFirestore(compressedImg); });
        } else {
            saveToFirestore(photoData);
        }
    });
}

// ==========================================
// FILTRADO AVANZADO
// ==========================================
window.filterProfiles = function() {
    const queryElement = document.getElementById('searchInput');
    if (!queryElement) return;
    const query = queryElement.value.toLowerCase();
    
    const filtered = allProfilesCache.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.role.toLowerCase().includes(query) || 
        p.location.toLowerCase().includes(query) ||
        p.software.toLowerCase().includes(query) ||
        (p.cert && p.cert.toLowerCase().includes(query))
    );
    renderProfiles(filtered);
};

// ==========================================
// SISTEMA DE NDA
// ==========================================
function initNdaModal() {
    if (document.getElementById('ndaModal')) return;
    const modalHTML = `
        <div id="ndaModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
            <div class="bg-brand-dark border border-brand-border w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
                <button onclick="window.closeNdaModal()" class="absolute top-5 right-5 text-brand-muted hover:text-white cursor-pointer">
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
                    <form id="ndaActionForm" onsubmit="window.submitNda(event)" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-brand-muted mb-1 uppercase">Tu Correo Corporativo</label>
                            <input type="email" id="ndaEmail" required placeholder="tu@empresa.com" class="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none">
                        </div>
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer">
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
                    <button onclick="window.closeNdaModal()" class="w-full bg-brand-card border border-brand-border text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-border transition cursor-pointer">
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
// MENSAJERÍA P2P EN FIREBASE CON USUARIO AUTENTICADO
// ==========================================
function initPeerMessaging(studioTarget) {
    if (document.getElementById('peerChatModal')) document.getElementById('peerChatModal').remove();

    const chatModalHTML = `
        <div id="peerChatModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
            <div class="bg-brand-card border border-brand-border w-full max-w-lg p-6 rounded-3xl shadow-2xl flex flex-col h-[500px]">
                <div class="flex justify-between items-center border-b border-brand-border pb-4">
                    <div>
                        <h3 class="text-sm font-bold text-white">Mensajería Directa Bniarq</h3>
                        <p class="text-xs text-blue-400">Chat con: <span class="font-bold text-white">${studioTarget}</span></p>
                    </div>
                    <button onclick="document.getElementById('peerChatModal').remove()" class="text-brand-muted hover:text-white cursor-pointer">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <div id="peerMessagesList" class="flex-1 overflow-y-auto py-4 space-y-3 text-xs pr-2">
                    <div class="text-center text-brand-muted pb-2 border-b border-brand-border/50 mb-4">Canal seguro cifrado activo.</div>
                </div>
                <div class="border-t border-brand-border pt-3 flex gap-2">
                    <input type="text" id="peerInputMsg" onkeypress="window.handlePeerEnter(event, '${studioTarget}')" placeholder="${currentUser ? 'Escribe tu mensaje...' : 'Inicia sesión para escribir...'}" ${!currentUser ? 'disabled' : ''} class="flex-1 bg-brand-dark border border-brand-border rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-blue-500 disabled:opacity-50">
                    <button onclick="window.sendPeerMessage('${studioTarget}')" ${!currentUser ? 'disabled' : ''} class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer disabled:opacity-50">Enviar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatModalHTML);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    loadPeerMessages(studioTarget);
}

window.openPeerChat = function(studioName) {
    if (!currentUser) {
        alert("Debes iniciar sesión con Google o Apple para enviar mensajes directos a otros estudios.");
        return;
    }
    initPeerMessaging(studioName);
};

window.handlePeerEnter = function(e, target) {
    if (e.key === 'Enter') window.sendPeerMessage(target);
};

window.sendPeerMessage = async function(target) {
    if (!currentUser) return;
    const input = document.getElementById('peerInputMsg');
    if (!input || !input.value.trim()) return;
    
    try {
        await addDoc(collection(db, "mensajes_p2p"), {
            destinatario: target,
            remitenteUID: currentUser.uid,
            remitenteName: currentUser.displayName || currentUser.email,
            texto: input.value.trim(),
            timestamp: new Date().toISOString()
        });
        input.value = "";
    } catch (e) {
        console.error("Error al enviar mensaje P2P:", e);
    }
};

function loadPeerMessages(target) {
    const container = document.getElementById('peerMessagesList');
    if (!container) return;

    const q = query(collection(db, "mensajes_p2p"), orderBy("timestamp", "asc"));
    onSnapshot(q, (snapshot) => {
        container.innerHTML = '<div class="text-center text-brand-muted pb-2 border-b border-brand-border/50 mb-4">Canal seguro cifrado activo.</div>';
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.destinatario === target || data.remitenteName) {
                const isMe = currentUser && data.remitenteUID === currentUser.uid;
                const div = document.createElement('div');
                div.className = isMe ? "text-right" : "text-left";
                div.innerHTML = `
                    <div class="inline-block p-3 rounded-xl max-w-[80%] text-xs shadow-md ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-brand-dark border border-brand-border text-gray-200 rounded-tl-none'}">
                        <span class="block font-bold text-[10px] opacity-75 mb-0.5">${data.remitenteName || 'Usuario'}</span>
                        <p>${data.texto}</p>
                    </div>
                `;
                container.appendChild(div);
            }
        });
        container.scrollTop = container.scrollHeight;
    });
}

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
    if (e.key === 'Enter') window.sendUserMessage();
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
