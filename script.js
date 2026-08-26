// Inicializar Iconos Lucide
document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Inicializar Intersection Observer (Animaciones al hacer scroll)
    initScrollAnimations();
    
    // Configurar el formulario
    initFormHandling();
});

// --- LÓGICA DEL SIMULADOR B2B (PESTAÑAS) ---
function switchTab(tab) {
    const viewEstudios = document.getElementById('view-estudios');
    const viewConstructoras = document.getElementById('view-constructoras');
    
    const btnEstudios = document.getElementById('btn-estudios');
    const btnConstructoras = document.getElementById('btn-constructoras');

    if (tab === 'estudios') {
        // Estilos de botones
        btnEstudios.className = "flex-1 py-2.5 px-6 rounded-full text-sm font-semibold bg-white text-black transition-all duration-300";
        btnConstructoras.className = "flex-1 py-2.5 px-6 rounded-full text-sm font-semibold text-brand-muted hover:text-white transition-all duration-300";
        
        // Transición de vistas (Crossfade)
        viewConstructoras.style.opacity = '0';
        setTimeout(() => {
            viewConstructoras.style.zIndex = '0';
            viewConstructoras.classList.add('pointer-events-none');
            
            viewEstudios.style.zIndex = '10';
            viewEstudios.classList.remove('pointer-events-none');
            viewEstudios.style.opacity = '1';
        }, 300); // Espera a que se desvanezca

    } else if (tab === 'constructoras') {
        // Estilos de botones
        btnConstructoras.className = "flex-1 py-2.5 px-6 rounded-full text-sm font-semibold bg-white text-black transition-all duration-300";
        btnEstudios.className = "flex-1 py-2.5 px-6 rounded-full text-sm font-semibold text-brand-muted hover:text-white transition-all duration-300";
        
        // Transición de vistas (Crossfade)
        viewEstudios.style.opacity = '0';
        setTimeout(() => {
            viewEstudios.style.zIndex = '0';
            viewEstudios.classList.add('pointer-events-none');
            
            viewConstructoras.style.zIndex = '10';
            viewConstructoras.classList.remove('pointer-events-none');
            viewConstructoras.style.opacity = '1';
        }, 300);
    }
}

// --- ANIMACIONES AL HACER SCROLL (REVEAL) ---
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 }); // Se activa cuando el 10% del elemento es visible

    reveals.forEach(reveal => {
        observer.observe(reveal);
    });

    // Efecto en la barra de navegación al hacer scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
}

// --- SIMULACIÓN DEL FORMULARIO DE ALTO NIVEL ---
function initFormHandling() {
    const form = document.getElementById('dossierForm');
    const submitBtn = document.getElementById('submitBtn');
    const formContent = document.getElementById('formContent');
    const successMessage = document.getElementById('successMessage');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('userName').value;
            
            if (name) {
                // Estado 1: Cargando (Botón cambia visualmente)
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="loading-spinner"></span> <span class="ml-2">Procesando...</span>';
                submitBtn.classList.add('opacity-80', 'cursor-not-allowed');
                
                // Simular llamada a API (Demora de 1.5 segundos)
                setTimeout(() => {
                    // Estado 2: Éxito (Ocultar formulario, mostrar mensaje de éxito)
                    formContent.style.opacity = '0';
                    
                    setTimeout(() => {
                        formContent.classList.add('hidden');
                        successMessage.classList.remove('pointer-events-none');
                        successMessage.style.opacity = '1';
                    }, 300);
                    
                }, 1500);
            }
        });
    }
}
