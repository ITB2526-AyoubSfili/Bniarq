// Importar funciones de Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// ==========================================
// 70 PERFILES DEMO DISTRIBUIDOS POR ESPAÑA
// ==========================================
const defaultProfiles = [
    { name: "Aris Studio Barcelona", role: "Diseño Residencial & Passivhaus", location: "Barcelona, España", software: "Revit / PHPP", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop", cert: "Passivhaus Designer" },
    { name: "Structuralia Levante", role: "Cálculo de Estructuras Complejas", location: "Valencia, España", software: "CypeCAD / Tekla", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop", cert: "BIM Level 3 Certified" },
    { name: "EcoBuild Lab Madrid", role: "Consultoría LEED & Energética", location: "Madrid, España", software: "EnergyPlus / Revit", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop", cert: "LEED AP BD+C" },
    { name: "Norte BIM Arquitectura", role: "Urbanismo y Edificación Pública", location: "Bilbao, España", software: "Archicad / Allplan", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop", cert: "ISO 19650 BIM Manager" },
    { name: "Andalucía Design Hub", role: "Arquitectura Hotelera y Resort", location: "Sevilla, España", software: "Revit / 3ds Max", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop", cert: "WELL AP" },
    { name: "Zaragoza Ingenieros", role: "Instalaciones y Climatización", location: "Zaragoza, España", software: "Cype / MEP", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop", cert: "Certified Energy Manager" },
    { name: "Costa del Sol Studio", role: "Villas de Lujo y Sostenibilidad", location: "Málaga, España", software: "Revit / Rhino", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop", cert: "BREEAM Associate" },
    { name: "Galicia Patrimonio", role: "Rehabilitación de Patrimonio", location: "Santiago de Compostela, España", software: "Autocad / Revit", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop", cert: "Especialista en Patrimonio" },
    { name: "Mallorca Build Lab", role: "Arquitectura Bioclimática", location: "Palma de Mallorca, España", software: "Vectorworks", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop", cert: "EnerPHit Consultant" },
    { name: "Basque Engineering", role: "Estructuras Metálicas Singulares", location: "San Sebastián, España", software: "Tekla Structures", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop", cert: "Welding Engineer IWE" },
    { name: "Levante Urban Design", role: "Planeamiento Urbanístico", location: "Alicante, España", software: "ArcGIS / AutoCAD", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop", cert: "Urban Planner Expert" },
    { name: "Asturias Arquitectura", role: "Edificación Industrial Sostenible", location: "Oviedo, España", software: "Revit Structure", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop", cert: "ISO 9001 Auditor" },
    { name: "Murcia Sol Arquitectos", role: "Eficiencia Energética en Clima Cálido", location: "Murcia, España", software: "DesignBuilder", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop", cert: "Certificador Energético A+" },
    { name: "Navarra Passive Design", role: "Vivienda Passivhaus Premium", location: "Pamplona, España", software: "PHPP / Archicad", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop", cert: "Passivhaus Tradesperson" },
    { name: "Canarias Architecture Studio", role: "Arquitectura Turística y Paisaje", location: "Las Palmas de Gran Canaria, España", software: "Lumion / Revit", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop", cert: "Landscape Architect Expert" },
    { name: "Castilla Ingenieros", role: "Cimentaciones y Geotecnia", location: "Valladolid, España", software: "Geotechnical Suite", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop", cert: "Geotechnical Specialist" },
    { name: "Extremadura Design", role: "Arquitectura Rural Contemporánea", location: "Mérida, España", software: "SketchUp / Revit", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop", cert: "Vernacular Architecture Cert" },
    { name: "Cantabria Marítima", role: "Instalaciones Costeras", location: "Santander, España", software: "AutoCAD Civil 3D", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop", cert: "Coastal Engineer" },
    { name: "La Rioja Vinos & Arquitectura", role: "Bodegas y Diseño Enológico", location: "Logroño, España", software: "Revit MEP", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop", cert: "Enological Facilities Expert" },
    { name: "Aragón Prefabricación", role: "Industrialización y Modulares", location: "Huesca, España", software: "Tekla / Precast", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop", cert: "Offsite Construction Master" },
    { name: "Ibiza Luxury Design", role: "Arquitectura Exclusiva Mediterránea", location: "Ibiza, España", software: "Rhino / Grasshopper", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop", cert: "Parametric Design Specialist" },
    { name: "Girona Creative Studio", role: "Intervenciones Paisajísticas", location: "Gerona, España", software: "Vectorworks / Lumion", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop", cert: "Landscape Design Pro" },
    { name: "Tarragona Petrochemical Eng", role: "Seguridad Industrial y Plantas", location: "Tarragona, España", software: "PDMS / Plant3D", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop", cert: "Industrial Safety Auditor" },
    { name: "Almería Invernaderos & Tech", role: "Agro-Arquitectura Avanzada", location: "Almería, España", software: "Revit / AutoDesk", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop", cert: "Agro-Tech Building Cert" },
    { name: "Córdoba Califal Restoration", role: "Restauración Monumental", location: "Córdoba, España", software: "Photogrammetry Suite", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop", cert: "Heritage Conservation Pro" },
    { name: "Granada Alhambra Lab", role: "Estudio de Cerámica y Estructuras", location: "Granada, España", software: "Rhino / Cype", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop", cert: "Traditional Materials Expert" },
    { name: "Alicante Costa BIM", role: "Desarrollos Costeros BIM", location: "Alicante, España", software: "Revit BIM Level 2", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop", cert: "BIM Coordinator RICS" },
    { name: "Toledo Imperial Urbanism", role: "Planeamiento en Cascos Históricos", location: "Toledo, España", software: "AutoCAD / GIS", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop", cert: "Historic Center Planner" },
    { name: "Salamanca Tormes Lab", role: "Arquitectura Universitaria", location: "Salamanca, España", software: "Archicad", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop", cert: "Educational Spaces Designer" },
    { name: "Burgos Catedral Eng", role: "Estructuras de Fábrica y Piedra", location: "Burgos, España", software: "Ansys / CypeCAD", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop", cert: "Stone Mechanics Specialist" },
    { name: "León Minería & Estructuras", role: "Ingeniería Geotécnica y Civil", location: "León, España", software: "Civil 3D", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop", cert: "Civil Works Master" },
    { name: "Badajoz Frontera Design", role: "Arquitectura Transfronteriza", location: "Badajoz, España", software: "Revit", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop", cert: "Euro-Region Planner" },
    { name: "Albacete Plain Studio", role: "Instalaciones Fotovoltaicas", location: "Albacete, España", software: "PVsyst / AutoCAD", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop", cert: "Solar Plant Designer" },
    { name: "Tenerife Volcanic Build", role: "Arquitectura Resiliente", location: "Santa Cruz de Tenerife, España", software: "Revit / Structural", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop", cert: "Resilient Structures Expert" },
    { name: "Murcia Citrus Architecture", role: "Edificios Industriales Agroalimentarios", location: "Cartagena, España", software: "CypeCAD", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop", cert: "Food Industry Facility Cert" },
    { name: "Castellón Ceramic Lab", role: "Innovación en Materiales Cerámicos", location: "Castellón de la Plana, España", software: "Rhino / Revit", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop", cert: "Ceramic Envelope Specialist" },
    { name: "Logroño Ebro Studio", role: "Arquitectura Fluvial y Espacios", location: "Logroño, España", software: "GIS / AutoCAD", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop", cert: "Waterfront Design Expert" },
    { name: "Badalona Maristany BIM", role: "Gestión BIM de Torres Residenciales", location: "Badalona, España", software: "Autodesk Construction Cloud", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop", cert: "BIM Project Manager" },
    { name: "Terrassa Industrial Rev", role: "Lofts y Conversión Industrial", location: "Terrassa, España", software: "Revit", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop", cert: "Industrial Heritage Expert" },
    { name: "Sabadell Structural Group", role: "Cálculo Dinámico de Estructuras", location: "Sabadell, España", software: "SAP2000 / ETABS", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop", cert: "Structural Dynamics Pro" },
    { name: "Vigo Shipyard Architecture", role: "Arquitectura Naval e Ingeniería", location: "Vigo, España", software: "Nupas-Cadmatic", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop", cert: "Marine Architect Cert" },
    { name: "L'Hospitalet Urban Lab", role: "Densificación Urbana Sostenible", location: "L'Hospitalet de Llobregat, España", software: "ArcGIS / Revit", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop", cert: "Urban Density Consultant" },
    { name: "Elche Palm Grove Studio", role: "Paisajismo Protegido", location: "Elche, España", software: "Vectorworks", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop", cert: "Protected Landscape Expert" },
    { name: "Marbella Luxury Estates", role: "Arquitectura de Gran Lujo", location: "Marbella, España", software: "Revit / Lumion Pro", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop", cert: "Luxury Real Estate Design" },
    { name: "Jerez Sherry Cellars", role: "Arquitectura Tradicional Bodeguera", location: "Jerez de la Frontera, España", software: "AutoCAD", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop", cert: "Traditional Winery Master" },
    { name: "Alcalá University Arch", role: "Recintos Académicos Históricos", location: "Alcalá de Henares, España", software: "Revit", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop", cert: "Campus Planner" },
    { name: "Fuenlabrada Prefab Lab", role: "Paneles de Hormigón Arquitectónico", location: "Fuenlabrada, España", software: "Tekla", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop", cert: "Precast Concrete Specialist" },
    { name: "Leganés Robotics Eng", role: "Automatización de Edificios Smart", location: "Leganés, España", software: "BMS / Revit MEP", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop", cert: "Smart Building Integrator" },
    { name: "Getafe Aeronautical Spaces", role: "Instalaciones Aeronáuticas", location: "Getafe, España", software: "Catia / Revit", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop", cert: "Aeronautical Facility Engineer" },
    { name: "Burgos Norte Studio", role: "Passivhaus Clima Continental", location: "Burgos, España", software: "PHPP / Revit", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop", cert: "Cold Climate Passivhaus" },
    { name: "Alcorcón Sustainable Housing", role: "VPO Eficiente y Sostenible", location: "Alcorcón, España", software: "Revit", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop", cert: "Social Housing Expert" },
    { name: "San Sebastián Donostia Lab", role: "Diseño Urbano Costero", location: "San Sebastián, España", software: "Rhino / GIS", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop", cert: "Coastal Urban Planner" },
    { name: "Logroño Rioja Design", role: "Arquitectura del Vino Moderna", location: "Logroño, España", software: "Archicad", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop", cert: "Modern Winery Architect" },
    { name: "Badajoz Guadiana Studio", role: "Puentes e Infraestructura Civil", location: "Badajoz, España", software: "Civil 3D / Cype", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop", cert: "Bridge Engineering Specialist" },
    { name: "Salamanca Plaza Lab", role: "Rehabilitación Comercial Histórica", location: "Salamanca, España", software: "Revit", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop", cert: "Commercial Heritage Pro" },
    { name: "Huelva Atlantic Architecture", role: "Arquitectura en Entornos Portuarios", location: "Huelva, España", software: "AutoCAD / Revit", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop", cert: "Port Infrastructure Planner" },
    { name: "Marbella Hills Studio", role: "Paisajismo y Urbanizaciones de Lujo", location: "Marbella, España", software: "Lumion / Rhino", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop", cert: "High-End Residential Cert" },
    { name: "Lleida Segrià Engineering", role: "Estructuras Agroindustriales", location: "Lleida, España", software: "CypeCAD", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop", cert: "Agro-Industrial Master" },
    { name: "Tarragona Romana Lab", role: "Arqueología y Reconstrucción 3D", location: "Tarragona, España", software: "Blender / Revit", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop", cert: "3D Archaeological Modeler" },
    { name: "Girona Pyrenees Design", role: "Arquitectura de Montaña Sostenible", location: "Gerona, España", software: "Archicad / PHPP", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop", cert: "Mountain Architecture Cert" },
    { name: "Jaén Olivar Architecture", role: "Arquitectura Sostenible Oleícola", location: "Jaén, España", software: "Revit", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop", cert: "Olive Mill Facility Expert" },
    { name: "Ourense Thermal Studio", role: "Balnearios y Arquitectura Termal", location: "Ourense, España", software: "Revit MEP", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop", cert: "Thermal Spa Designer" },
    { name: "Lugo Muralla Lab", role: "Intervención en Murallas y Patrimonio", location: "Lugo, España", software: "Autocad / 3ds Max", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop", cert: "Ancient Wall Restoration Pro" },
    { name: "Cáceres Monumental Studio", role: "Diseño Hotelero en Cascos Antiguos", location: "Cáceres, España", software: "Revit", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop", cert: "Historic Hotel Architect" },
    { name: "Melilla Modernista Lab", role: "Conservación de Arquitectura Modernista", location: "Melilla, España", software: "Archicad", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop", cert: "Modernist Heritage Expert" },
    { name: "Ceuta Strait Studio", role: "Arquitectura Fronteriza y Logística", location: "Ceuta, España", software: "Civil 3D", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop", cert: "Border Logistics Planner" },
    { name: "Menorca Talayotic Design", role: "Arquitectura Tradicional Menorquina", location: "Mahón, España", software: "Vectorworks", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop", cert: "Vernacular Balearic Expert" },
    { name: "Formentera Eco Studio", role: "Autosuficiencia Energética Insular", location: "Formentera, España", software: "PHPP / Revit", photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop", cert: "Off-Grid Island Consultant" },
    { name: "Huesca Pirineos Eng", role: "Estructuras para Refugios de Altura", location: "Huesca, España", software: "CypeCAD", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop", cert: "High Altitude Engineer" },
    { name: "Teruel Mudejar Lab", role: "Conservación Mudéjar", location: "Teruel, España", software: "Autocad", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop", cert: "Mudejar Art Specialist" },
    { name: "Palencia Canal Studio", role: "Ingeniería de Cauces y Riegos", location: "Palencia, España", software: "Civil 3D", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop", cert: "Hydraulic Works Engineer" },
    { name: "Zamora Duero Architecture", role: "Puentes Románicos y Entorno", location: "Zamora, España", software: "Revit", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop", cert: "Romanesque Structure Expert" },
    { name: "Ávila Murallas Lab", role: "Iluminación Arquitectónica Monumental", location: "Ávila, España", software: "Dialux evo / Revit", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop", cert: "Architectural Lighting Designer" },
    { name: "Segovia Acueducto Eng", role: "Cálculo Histórico y Estructural", location: "Segovia, España", software: "Ansys", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop", cert: "Ancient Structural Analyst" },
    { name: "Soria Duero Design", role: "Arquitectura Minimalista Castellana", location: "Soria, España", software: "Archicad", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop", cert: "Minimalist Castilian Design" },
    { name: "Cuenca Hanging Houses Lab", role: "Estructuras en Acantilado", location: "Cuenca, España", software: "Tekla / Cype", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop", cert: "Cliffside Engineering Master" },
    { name: "Guadalajara Henares Studio", role: "Logística y Centros de Datos", location: "Guadalajara, España", software: "Revit MEP", photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop", cert: "Data Center Designer Tier IV" }
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

// ==========================================
// RENDERIZADO CON CERTIFICACIONES Y MENSAJERÍA
// ==========================================
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
                <p class="text-xs font-semibold text-blue-400 mb-2">${p.role}</p>
                <div class="mb-4">
                    <span class="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full font-semibold inline-block">
                        <i data-lucide="award" class="w-3 h-3 inline mr-1"></i> ${p.cert || 'Validado Bniarq'}
                    </span>
                </div>
                <div class="text-xs text-brand-muted flex items-center gap-2 mb-6">
                    <i data-lucide="cpu" class="w-4 h-4"></i> ${p.software}
                </div>
            </div>
            <div class="space-y-2">
                <button onclick="window.openNdaModal('${p.name.replace(/'/g, "\\'")}')" class="w-full bg-brand-dark border border-brand-border hover:bg-blue-600 hover:text-white text-white text-xs font-bold py-2.5 rounded-xl transition">
                    Conectar / Enviar NDA
                </button>
                <button onclick="window.openPeerChat('${p.name.replace(/'/g, "\\'")}')" class="w-full bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                    <i data-lucide="message-square" class="w-3.5 h-3.5"></i> Mensaje P2P
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ==========================================
// FILTRADO MULTICRITERIO AVANZADO
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
// SISTEMA DE MENSAJERÍA P2P EN TIEMPO REAL
// ==========================================
function initPeerMessaging(studioTarget) {
    if (document.getElementById('peerChatModal')) document.getElementById('peerChatModal').remove();

    const chatModalHTML = `
        <div id="peerChatModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
            <div class="bg-brand-card border border-brand-border w-full max-w-lg p-6 rounded-3xl shadow-2xl flex flex-col h-[500px]">
                <div class="flex justify-between items-center border-b border-brand-border pb-4">
                    <div>
                        <h3 class="text-sm font-bold text-white">Canal Seguro P2P Bniarq</h3>
                        <p class="text-xs text-blue-400">Conversación con: <span id="targetStudioChatTitle">${studioTarget}</span></p>
                    </div>
                    <button onclick="document.getElementById('peerChatModal').remove()" class="text-brand-muted hover:text-white">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <div id="peerMessagesList" class="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
                    <!-- Mensajes dinámicos -->
                </div>
                <div class="border-t border-brand-border pt-3 flex gap-2">
                    <input type="text" id="peerInputMsg" onkeypress="window.handlePeerEnter(event, '${studioTarget}')" placeholder="Escribe un mensaje técnico seguro..." class="flex-1 bg-brand-dark border border-brand-border rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500">
                    <button onclick="window.sendPeerMessage('${studioTarget}')" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition">Enviar</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatModalHTML);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    loadPeerMessages(studioTarget);
}

window.openPeerChat = function(studioName) {
    initPeerMessaging(studioName);
};

window.handlePeerEnter = function(e, target) {
    if (e.key === 'Enter') window.sendPeerMessage(target);
};

window.sendPeerMessage = async function(target) {
    const input = document.getElementById('peerInputMsg');
    if (!input || !input.value.trim()) return;
    
    try {
        await addDoc(collection(db, "mensajes_p2p"), {
            destinatario: target,
            remitente: "Estudio Principal",
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
        container.innerHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.destinatario === target || data.remitente === target) {
                const isMe = data.remitente === "Estudio Principal";
                const div = document.createElement('div');
                div.className = isMe ? "text-right" : "text-left";
                div.innerHTML = `
                    <div class="inline-block p-3 rounded-xl max-w-[80%] text-xs ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-brand-dark border border-brand-border text-gray-200 rounded-tl-none'}">
                        <p>${data.texto}</p>
                    </div>
                `;
                container.appendChild(div);
            }
        });
        container.scrollTop = container.scrollHeight;
    });
}

// Compresión de imagen y registro
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

// Utilidades base
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
            btn.innerHTML = '<span class="loading-spinner w-5 h-5 align-middle"></span> <span class="ml-2">Procesando...</span>';
            setTimeout(() => {
                if (content && success) {
                    content.classList.add('hidden'); 
                    success.classList.remove('hidden'); 
                    success.classList.add('flex'); 
                }
            }, 1500);
            fetch(FORMSPREE_URL, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } }).catch(() => {});
        });
    }
}

function initNdaModal() {
    if (document.getElementById('ndaModal')) return;
    const modalHTML = `
        <div id="ndaModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center hidden opacity-0 transition-opacity duration-300">
            <div class="bg-brand-dark border border-brand-border w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
                <button onclick="window.closeNdaModal()" class="absolute top-5 right-5 text-brand-muted hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
                <div id="ndaFormContainer">
                    <h3 class="text-lg font-bold text-white mb-2">Acuerdo de Confidencialidad</h3>
                    <p class="text-xs text-brand-muted mb-4">Conectando con <span id="targetStudioName" class="text-white font-semibold"></span></p>
                    <form onsubmit="window.submitNda(event)" class="space-y-4">
                        <input type="email" required placeholder="tu@empresa.com" class="w-full bg-brand-card border border-brand-border rounded-xl px-4 py-3 text-sm text-white outline-none">
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition text-sm">Firmar NDA y Abrir Data Room</button>
                    </form>
                </div>
                <div id="ndaSuccessContainer" class="hidden text-center py-6">
                    <h4 class="text-xl font-bold text-white mb-2">¡NDA Firmado con Éxito!</h4>
                    <button onclick="window.closeNdaModal()" class="w-full bg-brand-card border border-brand-border text-white text-xs font-bold py-3 rounded-xl">Entendido</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.openNdaModal = function(studioName) {
    document.getElementById('targetStudioName').textContent = studioName;
    document.getElementById('ndaFormContainer').classList.remove('hidden');
    document.getElementById('ndaSuccessContainer').classList.add('hidden');
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
