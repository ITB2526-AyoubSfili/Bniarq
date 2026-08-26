document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    initScrollAnimations();
    initDossierForm();
    initProposalForm();
});

// ==========================================
// BASE DE DATOS SIMULADA (Para que los resultados cambien)
// ==========================================
const dbConstructoras = [
    { name: "FerroCapital Infraestructuras", loc: "Sede Madrid", match: 98, tag1: "Financia hasta 35M€", tag2: "Gran músculo financiero" },
    { name: "Nexus Obras y Capital", loc: "Operativa Levante", match: 92, tag1: "Especialistas Residencial", tag2: "Alta liquidez actual" },
    { name: "Buildia Edificación S.A.", loc: "Operativa Nacional", match: 87, tag1: "Certificados BREEAM", tag2: "Buscan proyectos llave en mano" },
    { name: "Grupo Vértice Constructor", loc: "Cataluña / Baleares", match: 84, tag1: "Proyectos Hoteleros", tag2: "Coinversión disponible" },
    { name: "IberObras Desarrollos", loc: "Sede Andalucía", match: 79, tag1: "Suelos finalistas", tag2: "Ejecución rápida" },
    { name: "Altum Partners & Build", loc: "Madrid / Norte", match: 76, tag1: "Máximo 15M€", tag2: "Rigor en plazos (99%)" },
    { name: "Sinergia Capital Constructora", loc: "Operativa Nacional", match: 71, tag1: "Fondo de Inversión Propio", tag2: "Alta exigencia BIM" }
];

const dbEstudios = [
    { name: "Vanguardia Arquitectos", loc: "Estudio Top 50 · Valencia", match: 96, tag1: "Licencia Concedida", tag2: "PEM estimado: 18.5M€" },
    { name: "Kroma Design Studio", loc: "Estudio Boutique · Baleares", match: 91, tag1: "Resort 5 Estrellas", tag2: "BIM Nivel 3 integrado" },
    { name: "Atelier Central Arq", loc: "Oficina Madrid", match: 88, tag1: "Proyecto Básico Terminado", tag2: "Sostenibilidad LEED Platinum" },
    { name: "Espacio BIM Proyectos", loc: "Operativa Nacional", match: 85, tag1: "120 Viviendas de Lujo", tag2: "Listo para licitar obra" },
    { name: "Línea 6 Arquitectura", loc: "Sede Barcelona", match: 81, tag1: "Edificio Corporativo", tag2: "Falta Partner Financiero" },
    { name: "Métrica Urbana", loc: "Andalucía", match: 75, tag1: "Desarrollo Logístico", tag2: "Licencia en trámite" },
    { name: "Zenit Proyectos y Diseño", loc: "Norte de España", match: 72, tag1: "Residencial Passivhaus", tag2: "PEM estimado: 8M€" }
];

// Función para obtener 3 elementos aleatorios de un array
function getRandomResults(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// ==========================================
// CONTROL DE PESTAÑAS (Estudio / Constructora)
// ==========================================
function switchTab(tab) {
    const viewEstudios = document.getElementById('view-estudios');
    const viewConstructoras = document.getElementById('view-constructoras');
    const btnEstudios = document.getElementById('btn-estudios');
    const btnConstructoras = document.getElementById('btn-constructoras');

    // Ocultar resultados previos al cambiar de rol
    document.getElementById('results-estudios').classList.add('hidden');
    document.getElementById('results-constructoras').classList.add('hidden');
    document.getElementById('btn-search-estudios').innerHTML = '<i data-lucide="search" class="w-4 h-4"></i> Ejecutar Búsqueda en Bniarq';
    document.getElementById('btn-search-constructoras').innerHTML = '<i data-lucide="search" class="w-4 h-4"></i> Buscar Oportunidades de Obra';

    if (tab === 'estudios') {
        btnEstudios.className = "flex-1 py-3 px-6 rounded-full text-sm font-semibold bg-white text-black transition-all duration-300";
        btnConstructoras.className = "flex-1 py-3 px-6 rounded-full text-sm font-semibold text-brand-muted hover:text-white transition-all duration-300";
        viewConstructoras.classList.add('hidden');
        viewEstudios.classList.remove('hidden');
    } else {
        btnConstructoras.className = "flex-1 py-3 px-6 rounded-full text-sm font-semibold bg-white text-black transition-all duration-300";
        btnEstudios.className = "flex-1 py-3 px-6 rounded-full text-sm font-semibold text-brand-muted hover:text-white transition-all duration-300";
        viewEstudios.classList.add('hidden');
        viewConstructoras.classList.remove('hidden');
    }
    lucide.createIcons();
}

// ==========================================
// SIMULAR BÚSQUEDA Y GENERAR RESULTADOS DINÁMICOS
// ==========================================
function runSearch(role) {
    const btn = document.getElementById(`btn-search-${role}`);
    const resultsContainer = document.getElementById(`results-${role}`);
    
    // 1. Efecto de carga en el botón
    btn.innerHTML = '<span class="loading-spinner w-4 h-4"></span> Procesando base de datos B2B...';
    btn.classList.add('opacity-80', 'pointer-events-none');
    resultsContainer.classList.add('hidden');

    // 2. Elegir base de datos correcta y color
    const db = role === 'estudios' ? dbConstructoras : dbEstudios;
    const accentColor = role === 'estudios' ? 'blue' : 'amber';
    
    // Obtener 3 empresas aleatorias y ordenarlas por "match" de mayor a menor
    const selectedResults = getRandomResults(db, 3).sort((a, b) => b.match - a.match);

    // 3. Simular tiempo de conexión al servidor y generar HTML
    setTimeout(() => {
        let htmlString = `<h5 class="text-sm font-semibold text-brand-muted mb-6 uppercase tracking-widest border-b border-brand-border pb-2">Resultados Verificados del Algoritmo</h5>`;
        
        selectedResults.forEach(item => {
            // El primer resultado resalta más que los otros
            const isTopMatch = item.match > 90;
            const borderColor = isTopMatch ? `border-${accentColor}-500/40` : 'border-brand-border';
            const badgeBg = isTopMatch ? `bg-${accentColor}-500/10 text-${accentColor}-400 border-${accentColor}-500/20` : 'bg-gray-800 text-gray-300 border-gray-600';

            htmlString += `
                <div class="bg-brand-dark p-6 rounded-2xl border ${borderColor} flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-gray-500 transition shadow-lg">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="${badgeBg} text-xs font-bold px-3 py-1 rounded-full border">Match ${item.match}%</span>
                            <h5 class="text-xl font-bold text-white">${item.name}</h5>
                        </div>
                        <p class="text-xs text-brand-muted mb-4">${item.loc}</p>
                        <div class="flex flex-wrap gap-3 text-xs text-brand-muted">
                            <span class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-500"></i> ${item.tag1}</span>
                            <span class="flex items-center gap-1.5"><i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-500"></i> ${item.tag2}</span>
                        </div>
                    </div>
                    <button onclick="openProposalModal('${item.name}')" class="w-full md:w-auto ${isTopMatch ? 'bg-white text-black hover:bg-gray-200' : 'bg-brand-card border border-brand-border text-white hover:bg-gray-800'} font-semibold py-3 px-6 rounded-lg transition text-sm">
                        Proponer Alianza Segura
                    </button>
                </div>
            `;
        });

        // Insertar HTML
        resultsContainer.innerHTML = htmlString;

        // Restaurar Botón
        btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Búsqueda Completada`;
        btn.classList.remove('opacity-80', 'pointer-events-none');
        
        // Mostrar resultados con animación
        resultsContainer.classList.remove('hidden');
        resultsContainer.classList.add('fade-in-up');
        
        // Recargar iconos en el nuevo HTML inyectado
        lucide.createIcons();
        
    }, 1200); // 1.2 segundos de simulación
}

// ==========================================
// CONTROL DEL MODAL DE PROPUESTA B2B
// ==========================================
function openProposalModal(targetName) {
    const modal = document.getElementById('proposalModal');
    const modalWindow = document.getElementById('modalWindow');
    const formContent = document.getElementById('proposalFormContent');
    const successMsg = document.getElementById('proposalSuccess');
    
    // Escribir nombre de la empresa objetivo
    document.getElementById('modalTargetName').innerText = targetName;
    
    // Resetear visuales del modal por si se abrió antes
    document.getElementById('b2bForm').reset();
    formContent.classList.remove('hidden');
    formContent.style.opacity = '1';
    
    successMsg.classList.add('hidden');
    successMsg.classList.remove('flex');
    successMsg.style.opacity = '0';
    
    const btn = document.getElementById('btnSubmitProposal');
    btn.innerHTML = 'Firmar y Enviar Petición Oficial';
    btn.classList.remove('pointer-events-none');

    // Mostrar modal con z-index alto
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Pequeño delay para la transición CSS de escalado
    setTimeout(() => {
        modalWindow.classList.add('modal-show');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('proposalModal');
    const modalWindow = document.getElementById('modalWindow');
    
    modalWindow.classList.remove('modal-show');
    
    // Esperar a que acabe la transición CSS antes de ocultar el contenedor
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

// Enviar formulario de propuesta
function initProposalForm() {
    const form = document.getElementById('b2bForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = document.getElementById('btnSubmitProposal');
            const content = document.getElementById('proposalFormContent');
            const success = document.getElementById('proposalSuccess');

            // 1. Simular carga
            btn.innerHTML = '<span class="loading-spinner black-border w-4 h-4"></span> Encriptando documento (NDA)...';
            btn.classList.add('pointer-events-none');

            // 2. Simular éxito
            setTimeout(() => {
                content.style.opacity = '0';
                
                setTimeout(() => {
                    content.classList.add('hidden');
                    success.classList.remove('hidden');
                    success.classList.add('flex');
                    
                    // Trigger fade in del éxito
                    setTimeout(() => success.style.opacity = '1', 50);
                }, 300); // Tiempo de fade out del contenido
                
            }, 1800);
        });
    }
}

// ==========================================
// CONTROL DEL FORMULARIO DEL DOSSIER EJECUTIVO
// ==========================================
function initDossierForm() {
    const form = document.getElementById('dossierForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = document.getElementById('btnSubmitDossier');
            const content = document.getElementById('formContent');
            const success = document.getElementById('dossierSuccess');

            // 1. Simular carga
            btn.innerHTML = '<span class="loading-spinner black-border w-4 h-4"></span> Generando PDF seguro...';
            btn.classList.add('pointer-events-none');

            // 2. Mostrar éxito
            setTimeout(() => {
                content.style.opacity = '0'; // Ocultar formulario
                
                setTimeout(() => {
                    content.classList.add('hidden'); // Sacar del layout
                    
                    success.classList.remove('hidden');
                    success.classList.add('flex');
                    
                    // Fade in del mensaje de éxito
                    setTimeout(() => success.style.opacity = '1', 50);
                }, 300);
            }, 1500);
        });
    }
}

// ==========================================
// ANIMACIONES AL SCROLL (Reveal)
// ==========================================
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    reveals.forEach(reveal => observer.observe(reveal));

    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('navbar-scrolled');
        else navbar.classList.remove('navbar-scrolled');
    });
}
