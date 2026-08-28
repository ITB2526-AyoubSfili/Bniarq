document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar iconos
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
    // Array con todos los identificadores
    const tabs = ['grafo', 'dataroom', 'matching'];
    
    tabs.forEach(tab => {
        const btn = document.getElementById(`tab-${tab}`);
        const img = document.getElementById(`img-${tab}`);
        
        if (tab === tabName) {
            // Activar botón
            btn.classList.add('active-tab');
            btn.classList.remove('inactive-tab');
            // Mostrar Imagen
            img.classList.remove('opacity-0', 'pointer-events-none');
            img.classList.add('opacity-100');
        } else {
            // Desactivar botón
            btn.classList.add('inactive-tab');
            btn.classList.remove('active-tab');
            // Ocultar Imagen
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
    const speed = 200; // Velocidad de la animación

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
                observer.unobserve(counter); // Para que solo anime una vez
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        observer.observe(counter);
    });
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

            // Simular carga B2B
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
