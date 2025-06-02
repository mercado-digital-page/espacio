document.addEventListener('DOMContentLoaded', () => {
    function hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    fetch(JSON_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(companies => {
            const companyData = companies.find(company => company.id === CLIENT_ID);
            if (!companyData) {
                throw new Error(`No se encontró la empresa con id: ${CLIENT_ID}`);
            }

            // Configurar favicon
            const favicon = document.querySelector('link[rel="shortcut icon"]');
            if (favicon) {
                favicon.href = `../../../admin/clientes/multimedia/${companyData.id}/logo-primario.svg`;
            }

            // Configurar metatags
            document.querySelector('meta[name="description"]').setAttribute('content', companyData.about || companyData.slogan || '');
            document.querySelector('meta[property="og:title"]').setAttribute('content', companyData.name);
            document.querySelector('meta[property="og:description"]').setAttribute('content', companyData.about || companyData.slogan || '');
            document.querySelector('meta[property="og:image"]').setAttribute('content', `../../../admin/clientes/multimedia/${companyData.id}/banner.png`);
            document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);
            
            // Configurar colores
            const root = document.documentElement;
            if (companyData.primaryColor && companyData.accentColor) {
                root.style.setProperty('--primary-color', companyData.primaryColor);
                root.style.setProperty('--accent-color', companyData.accentColor);
                
                const primaryRgb = hexToRgb(companyData.primaryColor);
                if (primaryRgb) {
                    root.style.setProperty('--rgb-primary-color', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
                }
            }

            // Construir la página
            buildPage(companyData);
        })
        .catch(error => {
            console.error("Error al cargar el archivo JSON:", error);
            document.getElementById('app').innerHTML = `
                <div class="flex items-center justify-center min-h-screen p-6">
                    <div class="text-center p-10 bg-red-100 text-red-700 rounded-lg shadow-lg max-w-2xl">
                        <h1 class="text-2xl font-bold mb-4">Error al cargar la información</h1>
                        <p class="mb-4">${error.message}</p>
                        <p>Por favor, verifica que el archivo 'data.json' exista y esté bien formado.</p>
                    </div>
                </div>
            `;
        });

    function buildPage(data) {
        const app = document.getElementById('app');
        
        // Estilos dinámicos para colores
        const dynamicStyles = `
            <style>
                :root {
                    --primary-color: ${data.primaryColor || '#011248'};
                    --accent-color: ${data.accentColor || '#fdb500'};
                    --primary-text-color: #333;
                    --secondary-text-color: #555;
                    --background-light-color: #f0f2f5;
                    --background-card-color: #ffffff;
                }

                .text-dynamic-primary { color: var(--primary-color); }
                .bg-dynamic-primary { background-color: var(--primary-color); }
                .border-dynamic-primary { border-color: var(--primary-color); }
                .text-dynamic-accent { color: var(--accent-color); }
                .bg-dynamic-accent { background-color: var(--accent-color); }
                .border-dynamic-accent { border-color: var(--accent-color); }
                .hover-text-dynamic-accent:hover { color: var(--accent-color); }
                .hover-bg-dynamic-accent:hover { background-color: var(--accent-color); }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 var(--accent-color); opacity: 0.7; }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(253, 181, 0, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(253, 181, 0, 0); }
                }

                .animate-fadeIn {
                    opacity: 0;
                    animation: fadeIn 0.8s ease-out forwards;
                }

                .primary-cta-button {
                    animation: pulse 2s infinite;
                }

                .card-hover-effect {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .card-hover-effect:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(var(--rgb-primary-color, 0, 0), 0.1);
                }

                .btn-contact-effect {
                    transition: all 0.2s ease;
                }

                .btn-contact-effect:hover {
                    transform: translateY(-3px) scale(1.03);
                    filter: brightness(1.1);
                }

                /* Estilo para imágenes de servicios cuadradas */
                .service-image-container {
                    position: relative;
                    width: 100%;
                    padding-top: 100%; /* Crea un contenedor cuadrado */
                    overflow: hidden;
                    background-color: var(--background-light-color); /* Fondo claro para imágenes con transparencia */
                    border-bottom: 1px solid rgba(0, 0, 0, 0.1); /* Línea sutil de separación */
                }

                .service-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover; /* Cubre todo el espacio recortando lo necesario */
                    transition: transform 0.3s ease;
                    object-position: center; /* Centra la imagen */
                }

                .service-image:hover {
                    transform: scale(1.05);
                }

                /* Estilo para banner - ancho completo y altura automática */
                .banner-container {
                    width: 100%;
                    height: auto;
                    position: relative;
                    overflow: hidden;
                }

                .banner-image {
                    width: 100%;
                    height: auto;
                    display: block;
                }

                /* Asegurar que el botón de enviar correo tenga el mismo tamaño */
                .email-button {
                    min-height: 54px; /* Misma altura que los otros botones */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            </style>
        `;
        
        // Estructura principal de la página
        const pageStructure = `
            <div class="w-full">
                <!-- Header con banner (ancho completo y altura automática) -->
                <header class="banner-container shadow-lg">
                    <img id="bannerImg" src="../../../admin/clientes/multimedia/${data.id}/banner.png" alt="Banner de ${data.name}" 
                         class="banner-image">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
                </header>

                <!-- Perfil de la empresa -->
                <div class="bg-white shadow-md">
                    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex flex-col sm:flex-row items-center sm:items-end pt-4 pb-6">
                            <!-- Imagen de perfil -->
                            <div class="relative -mt-20">
                                <img id="profileImg" src="../../../admin/clientes/multimedia/${data.id}/profile.png" alt="Foto de perfil de ${data.name}" 
                                     class="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl">
                            </div>
                            
                            <!-- Nombre y slogan -->
                            <div class="mt-4 sm:mt-0 sm:ml-6 flex-grow text-center sm:text-left">
                                <h1 id="companyName" class="text-2xl md:text-3xl font-bold text-dynamic-primary">${data.name}</h1>
                                <p id="companyTagline" class="text-md text-secondary-text-color opacity-90">${data.slogan || ''}</p>
                            </div>
                            
                            <!-- Navegación -->
                            <nav class="mt-4 sm:mt-0 flex space-x-4 sm:space-x-6">
                                <a href="#about" class="font-medium transition duration-300 text-dynamic-primary hover-text-dynamic-accent">Nosotros</a>
                                <a href="#services" class="font-medium transition duration-300 text-dynamic-primary hover-text-dynamic-accent">Servicios</a>
                                <a href="#contact" class="font-medium transition duration-300 text-dynamic-primary hover-text-dynamic-accent">Contacto</a>
                            </nav>
                        </div>
                    </div>
                </div>

                <!-- Contenido principal -->
                <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Sidebar -->
                    <aside class="lg:col-span-1 space-y-6">
                        <!-- Sobre Nosotros -->
                        <section id="about" class="bg-white p-6 rounded-xl shadow-lg animate-fadeIn card-hover-effect" style="animation-delay: 0.1s;">
                            <h2 class="text-xl font-semibold mb-4 text-dynamic-primary border-l-4 border-dynamic-accent pl-3">Sobre Nosotros</h2>
                            <p id="companyDescription" class="text-secondary-text-color leading-relaxed text-sm">${data.about || ''}</p>
                        </section>

                        <!-- Por Qué Elegirnos -->
                        ${data.whyChooseUs && data.whyChooseUs.length > 0 ? `
                        <section id="whyChooseUs" class="bg-white p-6 rounded-xl shadow-lg animate-fadeIn card-hover-effect" style="animation-delay: 0.15s;">
                            <h2 class="text-xl font-semibold mb-4 text-dynamic-primary border-l-4 border-dynamic-accent pl-3">Por Qué Elegirnos</h2>
                            <div class="space-y-4">
                                ${data.whyChooseUs.map(item => `
                                <div class="flex items-start space-x-3">
                                    <span class="iconify text-3xl mt-1 text-dynamic-accent" data-icon="${item.icon || 'mdi:check-circle-outline'}"></span>
                                    <div>
                                        <h4 class="font-semibold text-dynamic-primary">${item.title || ''}</h4>
                                        <p class="text-sm text-secondary-text-color">${item.text || ''}</p>
                                    </div>
                                </div>
                                `).join('')}
                            </div>
                        </section>
                        ` : ''}

                        <!-- Nivel de Confianza -->
                        <section id="reliability" class="bg-white p-6 rounded-xl shadow-lg animate-fadeIn card-hover-effect" style="animation-delay: 0.2s;">
                            <h2 class="text-xl font-semibold mb-4 text-dynamic-primary border-l-4 border-dynamic-accent pl-3">Nivel de Confianza</h2>
                            <div class="flex flex-col items-center">
                                <svg class="w-32 h-32" viewBox="0 0 36 36">
                                    <path class="text-gray-200" stroke-width="3" fill="none" stroke="currentColor"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path class="text-dynamic-accent" stroke-width="3" fill="none"
                                        stroke="currentColor" stroke-linecap="round" 
                                        stroke-dasharray="${data.reliabilityScore || 0}, 100"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <text x="18" y="20.35" class="text-sm font-bold text-dynamic-primary" fill="currentColor"
                                        text-anchor="middle">${data.reliabilityScore || 0}%</text>
                                </svg>
                                <p class="mt-3 text-secondary-text-color text-center text-sm">Basado en valoraciones y proyectos.</p>
                            </div>
                        </section>

                        <!-- Contacto Directo -->
                        <section id="quickContact" class="bg-white p-6 rounded-xl shadow-lg animate-fadeIn card-hover-effect" style="animation-delay: 0.3s;">
                            <h2 class="text-xl font-semibold mb-4 text-dynamic-primary border-l-4 border-dynamic-accent pl-3">Contacto Directo</h2>
                            ${data.emails && data.emails.length > 0 ? `
                            <div class="flex items-center mb-3">
                                <span class="iconify mr-3 text-xl text-dynamic-primary" data-icon="mdi:email-outline"></span>
                                <a href="mailto:${data.emails[0]}" class="text-secondary-text-color hover-text-dynamic-accent transition duration-300 text-sm">${data.emails[0]}</a>
                            </div>
                            ` : ''}
                            
                            ${data.phones && data.phones.length > 0 ? `
                            <div class="space-y-2 mb-3">
                                ${data.phones.map(phone => `
                                <div class="flex items-center text-sm">
                                    <span class="iconify mr-3 text-xl text-dynamic-primary" data-icon="mdi:phone-outline"></span>
                                    <span class="text-secondary-text-color">${phone.number || ''}</span>
                                </div>
                                `).join('')}
                            </div>
                            ` : ''}
                            
                            ${data.location ? `
                            <div class="flex items-start mb-4">
                                <span class="iconify mr-3 text-xl text-dynamic-primary mt-1" data-icon="mdi:map-marker-outline"></span>
                                <div>
                                    <span class="text-secondary-text-color text-sm">${data.location}</span>
                                    ${data.mapsLink ? `
                                    <div class="mt-3 rounded-lg overflow-hidden">
                                        <iframe 
                                            src="https://maps.google.com/maps?q=${encodeURIComponent(data.location)}&output=embed"
                                            width="100%" 
                                            height="150" 
                                            style="border:0;" 
                                            allowfullscreen="" 
                                            loading="lazy">
                                        </iframe>
                                    </div>
                                    ` : ''}
                                </div>
                            </div>
                            ` : ''}
                            
                            ${(data.facebook || data.instagram || data.tiktok || data.youtube || data.website) ? `
                            <div class="flex justify-start space-x-3 mt-4">
                                ${data.facebook ? `
                                <a href="${data.facebook}" target="_blank" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-dynamic-primary text-dynamic-accent hover:bg-dynamic-accent hover:text-white transition-colors duration-300">
                                    <i class="fab fa-facebook-f"></i>
                                </a>
                                ` : ''}
                                
                                ${data.instagram ? `
                                <a href="${data.instagram}" target="_blank" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-dynamic-primary text-dynamic-accent hover:bg-dynamic-accent hover:text-white transition-colors duration-300">
                                    <i class="fab fa-instagram"></i>
                                </a>
                                ` : ''}
                                
                                ${data.tiktok ? `
                                <a href="${data.tiktok}" target="_blank" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-dynamic-primary text-dynamic-accent hover:bg-dynamic-accent hover:text-white transition-colors duration-300">
                                    <i class="fab fa-tiktok"></i>
                                </a>
                                ` : ''}
                                
                                ${data.youtube ? `
                                <a href="${data.youtube}" target="_blank" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-dynamic-primary text-dynamic-accent hover:bg-dynamic-accent hover:text-white transition-colors duration-300">
                                    <i class="fab fa-youtube"></i>
                                </a>
                                ` : ''}
                                
                                ${data.website ? `
                                <a href="${data.website}" target="_blank" class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-dynamic-primary text-dynamic-accent hover:bg-dynamic-accent hover:text-white transition-colors duration-300">
                                    <i class="fas fa-globe"></i>
                                </a>
                                ` : ''}
                            </div>
                            ` : ''}
                        </section>
                    </aside>

                    <!-- Contenido principal -->
                    <div class="lg:col-span-2 space-y-8">
                        <!-- Servicios -->
                        <section id="services" class="bg-white p-6 rounded-xl shadow-lg animate-fadeIn" style="animation-delay: 0.4s;">
                            <h2 class="text-xl font-semibold mb-6 text-dynamic-primary border-l-4 border-dynamic-accent pl-3">Nuestros Servicios</h2>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                ${data.services && data.services.length > 0 ? data.services.map((service, index) => `
                                <div class="bg-white rounded-lg shadow-md card-hover-effect animate-fadeIn flex flex-col h-full" style="animation-delay: ${0.3 + index * 0.1}s;">
                                    ${service.image ? `
                                    <div class="service-image-container rounded-t-lg bg-white">
                                        <img src="${service.image}" alt="${service.name || ''}" 
                                             class="service-image">
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                                    </div>
                                    ` : ''}
                                    <div class="p-4 flex-grow">
                                        <div class="flex items-center mb-2">
                                            <span class="iconify text-2xl mr-2 text-dynamic-accent" data-icon="${service.icon || ''}"></span>
                                            <h3 class="text-lg font-semibold text-dynamic-primary">${service.name || ''}</h3>
                                        </div>
                                        <p class="text-secondary-text-color text-sm">${service.description || ''}</p>
                                    </div>
                                </div>
                                `).join('') : '<p class="text-secondary-text-color">No hay servicios disponibles.</p>'}
                            </div>
                        </section>

                        <!-- CTA -->
                        <section id="contact" class="bg-dynamic-primary text-white p-8 rounded-xl shadow-2xl animate-fadeIn" style="animation-delay: 0.5s;">
                            <div class="text-center">
                                <span class="iconify text-6xl text-dynamic-accent mx-auto mb-4" data-icon="mdi:handshake-outline"></span>
                                <h2 class="text-2xl md:text-3xl font-bold mb-3">${data.callToAction?.title || '¿Listo para comenzar?'}</h2>
                                <p class="text-lg opacity-90 mb-8 max-w-xl mx-auto">${data.callToAction?.text || 'Contáctanos hoy mismo para más información sobre nuestros servicios.'}</p>
                                
                                <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
                                    ${data.phones && data.phones.filter(phone => phone.whatsapp).map(phone => `
                                    <a href="https://wa.me/${phone.whatsapp}?text=${encodeURIComponent('Hola, me gustaría más información sobre sus servicios.')}" 
                                       target="_blank" 
                                       class="${phone.isPrimaryCta ? 'bg-dynamic-accent text-dynamic-primary primary-cta-button' : 'bg-transparent border-2 border-dynamic-accent text-dynamic-accent'} font-semibold py-3 px-6 rounded-lg shadow-lg btn-contact-effect flex items-center justify-center min-w-[240px]">
                                        <i class="fab fa-whatsapp cta-button-icon text-xl mr-2"></i> ${phone.ctaText || `WhatsApp ${phone.number || ''}`}
                                    </a>
                                    `).join('')}
                                    
                                    ${data.emails && data.emails.length > 0 ? `
                                    <a href="mailto:${data.emails[0]}" class="bg-gray-100 text-dynamic-primary font-semibold py-3 px-6 rounded-lg shadow-lg btn-contact-effect flex items-center justify-center min-w-[240px] email-button">
                                        <span class="iconify cta-button-icon" data-icon="mdi:email-outline"></span> Enviar Correo
                                    </a>
                                    ` : ''}
                                </div>
                            </div>
                        </section>
                    </div>
                </main>

                <!-- Footer -->
                <footer class="bg-dynamic-primary text-gray-300 py-8 text-center mt-12">
                    <p>&copy; ${new Date().getFullYear()} ${data.platformName || 'Mercado Digital'}. Todos los derechos reservados.</p>
                    <p class="text-sm opacity-80 mt-2">
                        Un perfil en <a href="https://mercado-digital-page.github.io/espacio/" class="text-dynamic-accent font-bold hover:underline">Mercado Digital | Espacio</a>
                    </p>
                </footer>
            </div>

            <!-- Botón flotante de WhatsApp -->
            ${data.phones && data.phones.find(phone => phone.whatsapp && phone.isPrimaryCta) ? `
            <div class="fixed bottom-6 right-6 z-50 animate-fadeIn" style="animation-delay: 1s; opacity: 0;">
                <a href="https://wa.me/${data.phones.find(phone => phone.whatsapp && phone.isPrimaryCta).whatsapp}?text=${encodeURIComponent('Hola, necesito una cotización!')}" 
                   target="_blank"
                   class="bg-dynamic-accent hover:bg-dynamic-accent text-dynamic-primary p-4 rounded-full shadow-xl flex items-center justify-center primary-cta-button btn-contact-effect h-16 w-16"
                   aria-label="Contactar por WhatsApp para cotización">
                    <i class="fab fa-whatsapp text-2xl"></i>
                </a>
            </div>
            ` : ''}
        `;

        // Establecer el título de la página
        document.title = `${data.name} | ${data.platformName || 'Perfil'}`;

        // Insertar todo en el DOM
        app.innerHTML = dynamicStyles + pageStructure;

        // Escanear íconos de Font Awesome si está disponible
        if (window.FontAwesome) {
            window.FontAwesome.dom.watch();
        }
    }
});