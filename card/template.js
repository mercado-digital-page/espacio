// template.js - Plantilla reusable para tarjetas de clientes

// Función para cargar los datos del JSON y renderizar la tarjeta
async function loadCardData(clientId) {
  try {
    const response = await fetch('https://mercado-digital-page.github.io/admin/clientes/data.json');
    const data = await response.json();
    
    // Buscar el cliente específico en el array
    const clientData = data.find(item => item.id === clientId);
    
    if (clientData) {
      updateMetaTags(clientData);
      renderCard(clientData);
      updateRootColors(clientData.primaryColor, clientData.accentColor);
    } else {
      console.error(`No se encontraron datos para el cliente con ID: ${clientId}`);
      renderErrorCard();
    }
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    renderErrorCard();
  }
}

// Función para actualizar las meta tags
function updateMetaTags(data) {
  document.title = `${data.name} | ${data.slogan}`;
  
  // Crear o actualizar meta tags
  const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta');
  metaDescription.name = "description";
  metaDescription.content = data.about;
  document.head.appendChild(metaDescription);
  
  const metaKeywords = document.querySelector('meta[name="keywords"]') || document.createElement('meta');
  metaKeywords.name = "keywords";
  metaKeywords.content = `${data.name}, ${data.category}, ${data.location}, ${data.services.map(s => s.name).join(', ')}`;
  document.head.appendChild(metaKeywords);
  
  const metaOgTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
  metaOgTitle.setAttribute('property', 'og:title');
  metaOgTitle.content = `${data.name} | ${data.slogan}`;
  document.head.appendChild(metaOgTitle);
  
  const metaOgDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
  metaOgDescription.setAttribute('property', 'og:description');
  metaOgDescription.content = data.about;
  document.head.appendChild(metaOgDescription);
  
  const metaOgImage = document.querySelector('meta[property="og:image"]') || document.createElement('meta');
  metaOgImage.setAttribute('property', 'og:image');
  metaOgImage.content = `https://mercado-digital-page.github.io/admin/clientes/multimedia/${data.id}/profile.png`;
  document.head.appendChild(metaOgImage);
  
  const metaOgUrl = document.querySelector('meta[property="og:url"]') || document.createElement('meta');
  metaOgUrl.setAttribute('property', 'og:url');
  metaOgUrl.content = window.location.href;
  document.head.appendChild(metaOgUrl);
}

// Función para actualizar las variables CSS con los colores del cliente
function updateRootColors(primaryColor, accentColor) {
  document.documentElement.style.setProperty('--primary-color', primaryColor);
  document.documentElement.style.setProperty('--accent-color', accentColor);
}

// Función para renderizar la tarjeta con los datos
function renderCard(data) {
  const cardContainer = document.getElementById('cardContainer');
  const whatsappButton = document.getElementById('whatsappButton');
  const facebookButton = document.getElementById('facebookButton');
  
  // Obtener el teléfono principal para WhatsApp
  const primaryPhone = data.phones.find(phone => phone.isPrimaryCta) || data.phones[0];
  
  // Generar el HTML de la tarjeta
  cardContainer.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl overflow-hidden card-hover-effect">
      <!-- Encabezado con color primario -->
      <div class="bg-primary text-white p-6 text-center">
        <div class="flex justify-center mb-4">
          <img src="https://mercado-digital-page.github.io/admin/clientes/multimedia/${data.id}/profile.png" alt="Logo ${data.name}" class="w-24 h-24 rounded-full border-4 border-white object-cover">
        </div>
        <h1 class="text-2xl font-bold">${data.name}</h1>
        <p class="text-accent font-medium">${data.slogan}</p>
      </div>
      
      <!-- Contenido -->
      <div class="p-6">
        <!-- Descripción breve -->
        <div class="mb-6">
          <p class="text-gray-700 text-sm">
            ${data.about}
          </p>
        </div>
        
        <!-- Servicios destacados -->
        <div class="mb-6">
          <h3 class="text-primary font-semibold mb-3 border-l-4 border-accent pl-2">Servicios</h3>
          <div class="grid grid-cols-2 gap-2">
            ${data.services.map(service => `
              <div class="flex items-start space-x-2">
                <span class="iconify text-accent mt-1" data-icon="${service.icon}"></span>
                <span class="text-xs">${service.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Contacto -->
        <div class="mb-6">
          <h3 class="text-primary font-semibold mb-3 border-l-4 border-accent pl-2">Contacto</h3>
          <div class="space-y-2">
            ${data.phones.map(phone => `
              <div class="flex items-center">
                <span class="iconify mr-2 text-primary" data-icon="mdi:phone-outline"></span>
                <a href="tel:${phone.number.replace(/\D/g, '')}" class="text-sm hover-text-accent">${phone.number}</a>
              </div>
            `).join('')}
            ${data.emails.map(email => `
              <div class="flex items-center">
                <span class="iconify mr-2 text-primary" data-icon="mdi:email-outline"></span>
                <a href="mailto:${email}" class="text-sm hover-text-accent">${email}</a>
              </div>
            `).join('')}
            <div class="flex items-center">
              <span class="iconify mr-2 text-primary" data-icon="mdi:map-marker-outline"></span>
              <span class="text-sm">${data.location}</span>
            </div>
          </div>
        </div>
        
        <!-- Botones de acción -->
        <div class="flex flex-col space-y-3">
          <a href="https://wa.me/${primaryPhone.whatsapp}?text=Hola,%20me%20gustaría%20más%20información%20sobre%20sus%20servicios" 
             target="_blank" 
             class="bg-accent hover-bg-yellow-400 text-primary font-semibold py-2 px-4 rounded-lg shadow-md btn-contact-effect flex items-center justify-center">
            <span class="iconify mr-2" data-icon="mdi:whatsapp"></span> ${primaryPhone.ctaText || '¡Cotiza GRATIS!'}
          </a>
          ${data.facebook ? `
          <a href="${data.facebook}" 
             target="_blank"
             class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md btn-contact-effect flex items-center justify-center">
            <span class="iconify mr-2" data-icon="mdi:facebook"></span> Visítanos en Facebook
          </a>
          ` : ''}
          <a href="mailto:${data.emails[0]}" 
             class="bg-white border border-primary text-primary hover-bg-primary hover-text-white font-semibold py-2 px-4 rounded-lg shadow-md btn-contact-effect flex items-center justify-center">
            <span class="iconify mr-2" data-icon="mdi:email-outline"></span> Enviar Correo
          </a>
        </div>
      </div>
      
      <!-- Pie de tarjeta -->
      <div class="bg-gray-50 p-4 text-center text-xs text-gray-500">
        <p>© ${new Date().getFullYear()} Mercado Digital. Todos los derechos reservados.</p>
      </div>
    </div>
  `;
  
  // Generar el botón flotante de WhatsApp
  whatsappButton.innerHTML = `
    <a href="https://wa.me/${primaryPhone.whatsapp}?text=Hola,%20necesito%20una%20cotización!" 
       target="_blank"
       class="bg-accent hover-bg-yellow-400 text-primary p-4 rounded-full shadow-xl flex items-center justify-center btn-contact-effect"
       aria-label="Contactar por WhatsApp">
      <span class="iconify text-2xl" data-icon="mdi:whatsapp"></span>
    </a>
  `;
  
  // Generar el botón flotante de Facebook si existe
  if (data.facebook) {
    facebookButton.innerHTML = `
      <a href="${data.facebook}" 
         target="_blank"
         class="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl flex items-center justify-center btn-contact-effect"
         aria-label="Visitar Facebook">
        <span class="iconify text-2xl" data-icon="mdi:facebook"></span>
      </a>
    `;
  }
  
  // Inicializar iconos
  if (window.Iconify) {
    window.Iconify.scan();
  }
}

// Función para mostrar una tarjeta de error si falla la carga
function renderErrorCard() {
  const cardContainer = document.getElementById('cardContainer');
  cardContainer.innerHTML = `
    <div class="bg-white rounded-xl shadow-2xl overflow-hidden p-6 text-center">
      <div class="text-red-500 mb-4">
        <span class="iconify text-4xl inline-block" data-icon="mdi:alert-circle-outline"></span>
      </div>
      <h2 class="text-xl font-bold mb-2">Error al cargar los datos</h2>
      <p class="text-gray-700 mb-4">No se pudieron cargar los datos de la tarjeta. Por favor, inténtalo de nuevo más tarde.</p>
      <button onclick="location.reload()" class="bg-primary text-white py-2 px-4 rounded-lg hover-bg-accent">
        Recargar Página
      </button>
    </div>
  `;
}