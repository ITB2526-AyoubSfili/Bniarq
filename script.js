import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initScrollAnimations();
    initDossierForm();
    loadProfilesFromFirebase();
    initProfileRegistration();
    initNdaModal();
});

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
            allProfilesCache = [
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
        }

        renderProfiles(allProfilesCache);
    } catch (error) {
        console.error("Error al cargar perfiles de Firebase: ", error);
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
                    <img src="${photoUrl}" alt="${p.name}" class="w-14 h-14 rounded-full object-cover border border-blue-500/35">
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
            <button class="btn-connect w-full bg-brand-dark border border-brand-border hover:bg-blue-600 hover:text-white text-white text-xs font-bold py-3 rounded-xl transition" data-studio="${p.name.replace(/"/g, '&quot;')}">
                Conectar / Enviar NDA
            </button>
        `;
        grid.appendChild(card);
    });

    // Asignar eventos de clic de forma segura para los botones generados
    document.querySelectorAll('.btn-connect').forEach(button => {
        button.addEventListener('click', () => {
            openNdaModal(button.getAttribute('data-studio'));
        });
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function initProfileRegistration() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = "Procesando imagen y guardando...";
        submitBtn.disabled = true;

        const fileInput = document.getElementById('pPhotoFile');
        let photoData = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400&auto=format&fit=crop"; 

        const saveProfileToFirestore = async (finalPhotoUrl) => {
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
                submitBtn.textContent = "Publicar Perfil en la Red";
                submitBtn.disabled = false;
                
                alert('¡Perfil y foto guardados en la nube con éxito!');
                loadProfilesFromFirebase(); 
                document.getElementById('directorio').scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                console.error("Error al guardar en Firebase: ", error);
                alert("Hubo un error al guardar el perfil.");
                submitBtn.textContent = "Publicar Perfil en la Red";
                submitBtn.disabled = false;
            }
        };

        if (fileInput && fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(uploadEvent) {
                photoData = uploadEvent.target.result;
                saveProfileToFirestore(photoData);
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            saveProfileToFirestore(photoData);
        }
    });
}

function filterProfiles() {
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

function initNdaModal() {
    if (document.getElementById('ndaModal')) return;

    const modalHTML = `
        <div id="ndaModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
            <div class="bg-brand-dark border border-brand-border w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
                <button id="closeNdaBtn" class="absolute top-5 right-5 text-brand-muted hover:text-white cursor-pointer">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
                <div id="ndaFormContainer">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-500/35">
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
                    <form id="ndaActionForm" class="space-y-4">
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
                    <div class="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/35">
                        <i data-lucide="check" class="w-7 h-7"></i>
                    </div>
                    <h4 class="text-xl font-bold text-white mb-2">¡NDA Firmado con Éxito!</h4>
                    <p class="text-xs text-brand-muted mb-6">Hemos enviado las credenciales cifradas de la sala segura a tu correo corporativo.</p>
                    <button id="understoodNdaBtn" class="w-full bg-brand-card border border-brand-border text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-border transition">
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('closeNdaBtn').addEventListener('click', closeNdaModal);
    document.getElementById('understoodNdaBtn').addEventListener('click', closeNdaModal);
    
    document.getElementById('ndaActionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('ndaFormContainer').classList.add('hidden');
        document.getElementById('ndaSuccessContainer').classList.remove('hidden');
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openNdaModal(studioName) {
    document.getElementById('targetStudioName').textContent = studioName;
    document.getElementById('ndaFormContainer').classList.remove('hidden');
    document.getElementById('ndaSuccessContainer').classList.add('hidden');
    document.getElementById('ndaEmail').value = '';
    
    const modal = document.getElementById('ndaModal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function closeNdaModal() {
    const modal = document.getElementById('ndaModal');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300);
}
