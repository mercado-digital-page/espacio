// Función para extraer el ID del cliente de la URL
function getClientIdFromPath() {
  const filePath = window.location.pathname;
  const pathSegments = filePath.split('/').filter(segment => segment !== "");
  
  // La nueva estructura espera: /[categoria]/[cliente-id]/link/index.html
  if (pathSegments.length >= 2 && pathSegments[pathSegments.length-1] === "link") {
    return pathSegments[pathSegments.length-2];
  }
  return null;
}

// Función para cargar los datos del cliente
async function loadClientData(clientId) {
  try {
    if (!clientId) throw new Error('No se pudo determinar el ID del cliente desde la URL');
    
    const response = await fetch(JSON_URL);
    if (!response.ok) throw new Error('Error al cargar datos');
    const data = await response.json();
    const client = data.find(item => item.id === clientId);
    if (!client) throw new Error('Cliente no encontrado');
    return client;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Función para establecer los metadatos
function setMetadata(client) {
  // Título y descripción
  document.title = `${client.name} | ${client.platformName || 'Enlaces'}`;
  document.querySelector('meta[name="description"]').content = client.slogan || client.about || `Contacta con ${client.name}`;
  
  // OpenGraph/Twitter meta tags
  document.querySelector('meta[property="og:title"]').content = client.name;
  document.querySelector('meta[property="og:description"]').content = client.slogan || client.about || `Enlaces de contacto para ${client.name}`;
  document.querySelector('meta[property="og:url"]').content = window.location.href;
  
  // Favicon dinámico
  const faviconUrl = `../../../admin/clientes/multimedia/${client.id}/logo-primario.svg`;
  document.querySelector('link[rel="shortcut icon"]').href = faviconUrl;
  
  // Imagen para redes sociales (intenta con banner, si no con profile)
  const ogImage = document.querySelector('meta[property="og:image"]');
  ogImage.content = `../../../admin/clientes/multimedia/${client.id}/banner.png`;
}

// Función para renderizar el Linktree
function renderLinktree(client) {
  const app = document.getElementById('app');
  
  // Establecer colores CSS variables
  document.documentElement.style.setProperty('--primary', client.primaryColor);
  document.documentElement.style.setProperty('--accent', client.accentColor);
  
  app.innerHTML = `
    <style>
      .bg-primary { background-color: var(--primary); }
      .text-primary { color: var(--primary); }
      .border-primary { border-color: var(--primary); }
      .hover\:bg-primary:hover { background-color: var(--primary); }
      
      .bg-accent { background-color: var(--accent); }
      .text-accent { color: var(--accent); }
      .border-accent { border-color: var(--accent); }
      .hover\:bg-accent:hover { background-color: var(--accent); }
    </style>
    
    <div class="min-h-screen flex flex-col items-center">
      <header class="w-full max-w-md px-4 pt-12 pb-6">
        <div class="flex flex-col items-center">
          <!-- Profile Image -->
          <img 
            src="../../../admin/clientes/multimedia/${client.id}/profile.png" 
            alt="${client.name}"
            class="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover mb-4"
            onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=${client.primaryColor.replace('#', '')}&color=fff&size=128'"
          >
          
          <!-- Business Info -->
          <h1 class="text-2xl font-bold text-primary text-center mb-1">${client.name}</h1>
          ${client.slogan ? `<p class="text-gray-600 text-center mb-6">${client.slogan}</p>` : ''}
        </div>
      </header>
      
      <main class="w-full max-w-md px-4 pb-8 flex-1">
        <div class="space-y-3">
          <!-- WhatsApp Button (Primary) -->
          ${client.phones.filter(p => p.isPrimaryCta).map(phone => `
            <a 
              href="https://wa.me/${phone.whatsapp}" 
              class="block bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors shadow-sm"
            >
              <i class="fab fa-whatsapp mr-2"></i> ${phone.ctaText || 'Contactar por WhatsApp'}
            </a>
          `).join('')}
          
          <!-- Other Contact Buttons -->
          ${client.facebook ? `
            <a 
              href="${client.facebook}" 
              target="_blank"
              class="block bg-[#1877F2] hover:bg-[#166FE5] text-white font-medium py-3 px-4 rounded-lg text-center transition-colors shadow-sm"
            >
              <i class="fab fa-facebook-f mr-2"></i> Facebook
            </a>
          ` : ''}
          
          ${client.instagram ? `
            <a 
              href="${client.instagram}" 
              target="_blank"
              class="block bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors shadow-sm"
            >
              <i class="fab fa-instagram mr-2"></i> Instagram
            </a>
          ` : ''}
          
          ${client.tiktok ? `
            <a 
              href="${client.tiktok}" 
              target="_blank"
              class="block bg-black hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors shadow-sm"
            >
              <i class="fab fa-tiktok mr-2"></i> TikTok
            </a>
          ` : ''}
          
          ${client.youtube ? `
            <a 
              href="${client.youtube}" 
              target="_blank"
              class="block bg-[#FF0000] hover:bg-[#CC0000] text-white font-medium py-3 px-4 rounded-lg text-center transition-colors shadow-sm"
            >
              <i class="fab fa-youtube mr-2"></i> YouTube
            </a>
          ` : ''}
          
          ${client.website ? `
            <a 
              href="${client.website}" 
              target="_blank"
              class="block bg-primary hover:bg-accent text-white font-medium py-3 px-4 rounded-lg text-center transition-colors shadow-sm"
            >
              <i class="fas fa-globe mr-2"></i> Sitio Web
            </a>
          ` : ''}
          
          ${client.mapsLink ? `
            <a 
              href="${client.mapsLink}" 
              target="_blank"
              class="block bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors shadow-sm"
            >
              <i class="fas fa-map-marker-alt mr-2"></i> ${client.location || 'Ubicación'}
            </a>
          ` : ''}
        </div>
      </main>
      
      <footer class="w-full max-w-md px-4 pb-8 text-center">
        <p class="text-gray-500 text-sm">
          © ${new Date().getFullYear()} ${client.platformName}
        </p>
      </footer>
    </div>
  `;
}

// Cargar y renderizar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const clientId = getClientIdFromPath();
    const client = await loadClientData(clientId);
    setMetadata(client);
    renderLinktree(client);
  } catch (error) {
    document.getElementById('app').innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-8">
        <div class="text-center max-w-md">
          <h1 class="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p class="text-gray-700 mb-4">${error.message}</p>
          <p class="text-gray-500 text-sm">La URL debe seguir la estructura: /[categoria]/[cliente-id]/link/</p>
          <p class="text-gray-500 text-sm mt-2">Ejemplo: /construccion/pv-energy/link/</p>
        </div>
      </div>
    `;
  }
});