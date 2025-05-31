document.addEventListener('DOMContentLoaded', () => {
    const dataFile = 'https://mercado-digital-page.github.io/admin/clientes/data.json';
    const companyId = window.companyProfileConfig?.companyId || ''; // Usa el ID configurado

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

    function safeSetContent(elementId, content) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = content;
        } else {
            console.warn(`Elemento con ID ${elementId} no encontrado`);
        }
    }

    function safeSetHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        } else {
            console.warn(`Elemento con ID ${elementId} no encontrado`);
        }
    }

    fetch(dataFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(companies => {
            // Buscar la empresa específica por id
            const companyData = companies.find(company => company.id === companyId);
            if (!companyData) {
                throw new Error(`No se encontró la empresa con id: ${companyId}`);
            }

            const root = document.documentElement;
            if (companyData.primaryColor && companyData.accentColor) {
                root.style.setProperty('--primary-color', companyData.primaryColor);
                root.style.setProperty('--accent-color', companyData.accentColor);
                
                const primaryRgb = hexToRgb(companyData.primaryColor);
                if (primaryRgb) {
                    root.style.setProperty('--rgb-primary-color', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
                }
            }
            populatePage(companyData);
        })
        .catch(error => {
            console.error("Error al cargar el archivo JSON:", error);
            document.body.innerHTML = `<div class="text-center p-10 bg-red-100 text-red-700"><h1>Error al cargar la información.</h1><p>${error.message}</p>Por favor, verifica que el archivo 'data.json' exista y esté bien formado.</div>`;
        });

    function populatePage(data) {
        // Verificar y establecer valores seguros
        safeSetContent('pageTitle', `${data.name} | ${data.platformName || 'Perfil'}`);
        
        // Banner y perfil
        const bannerImg = document.getElementById('bannerImg');
        if (bannerImg) {
            bannerImg.src = `multimedia/${data.id}/banner.png`;
            bannerImg.alt = `Banner de ${data.name}`;
        }
        
        const profileImg = document.getElementById('profileImg');
        if (profileImg) {
            profileImg.src = `multimedia/${data.id}/profile.png`;
            profileImg.alt = `Perfil de ${data.name}`;
        }
        
        safeSetContent('companyName', data.name || '');
        safeSetContent('companyTagline', data.slogan || '');
        safeSetContent('companyDescription', data.about || '');

        // Why Choose Us
        const whyChooseUsContent = document.getElementById('whyChooseUsContent');
        if (whyChooseUsContent) {
            whyChooseUsContent.innerHTML = '';
            if (data.whyChooseUs && data.whyChooseUs.length > 0) {
                data.whyChooseUs.forEach(item => {
                    const itemEl = `
                        <div class="flex items-start space-x-3">
                            <span class="iconify text-4xl mt-1 text-dynamic-accent" data-icon="${item.icon || 'mdi:check-circle-outline'}"></span>
                            <div>
                                <h4 class="font-semibold text-dynamic-primary">${item.title || ''}</h4>
                                <p class="text-sm text-secondary-text-color">${item.text || ''}</p>
                            </div>
                        </div>
                    `;
                    whyChooseUsContent.innerHTML += itemEl;
                });
            } else {
                const whyChooseUsContainer = document.getElementById('whyChooseUsContainer');
                if (whyChooseUsContainer) whyChooseUsContainer.style.display = 'none';
            }
        }

        // Reliability Score
        const reliabilityScore = data.reliabilityScore || 0;
        const circleProgress = document.getElementById('reliabilityCircleProgress');
        const reliabilityText = document.getElementById('reliabilityText');
        if (circleProgress && reliabilityText) {
            const circumference = 2 * Math.PI * 15.9155;
            const offset = circumference - (reliabilityScore / 100) * circumference;
            circleProgress.style.strokeDasharray = `${circumference - offset}, ${circumference}`;
            reliabilityText.textContent = `${reliabilityScore}%`;
        }

        // Services
        const servicesContainer = document.getElementById('servicesContainer');
        if (servicesContainer) {
            servicesContainer.innerHTML = '';
            if (data.services && data.services.length > 0) {
                data.services.forEach((service, index) => {
                    const serviceCard = `
                        <div class="bg-background-card-color p-4 rounded-lg shadow-md card-hover-effect animate-fadeIn flex flex-col" style="animation-delay: ${0.3 + index * 0.1}s;">
                            <img src="${service.image || ''}" alt="${service.name || ''}" class="w-full service-image mb-3">
                            <div class="flex items-center mb-2">
                                <span class="iconify text-2xl mr-2 text-dynamic-accent" data-icon="${service.icon || ''}"></span>
                                <h3 class="text-lg font-semibold text-dynamic-primary">${service.name || ''}</h3>
                            </div>
                            <p class="text-secondary-text-color text-xs flex-grow">${service.description || ''}</p>
                        </div>
                    `;
                    servicesContainer.innerHTML += serviceCard;
                });
            }
        }

        // Contact Email
        const contactEmailLink = document.getElementById('contactEmail')?.querySelector('a');
        if (contactEmailLink && data.emails && data.emails.length > 0) {
            contactEmailLink.href = `mailto:${data.emails[0] || ''}`;
            contactEmailLink.textContent = data.emails[0] || '';
        }

        // Contact Phones
        const phonesContainer = document.getElementById('contactPhonesContainer');
        if (phonesContainer && data.phones) {
            phonesContainer.innerHTML = '';
            data.phones.forEach(phone => {
                const phoneEl = document.createElement('div');
                phoneEl.classList.add('flex', 'items-center', 'text-sm');
                phoneEl.innerHTML = `
                    <span class="iconify mr-3 text-xl text-dynamic-primary" data-icon="mdi:phone-outline"></span>
                    <span class="text-secondary-text-color">${phone.number || ''}</span>
                `;
                phonesContainer.appendChild(phoneEl);
            });
        }

        // Contact Location with Google Maps iframe
        const contactLocation = document.getElementById('contactLocation');
        if (contactLocation && data.mapsLink) {
            contactLocation.innerHTML = `
                <div class="flex items-start">
                    <span class="iconify mr-3 text-xl text-dynamic-primary" data-icon="mdi:map-marker-outline"></span>
                    <div>
                        <span class="text-secondary-text-color text-sm">${data.location || ''}</span>
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
                    </div>
                </div>
            `;
        }

        // Social Media Links
        const socialMediaContainer = document.getElementById('socialMediaContainer');
        if (socialMediaContainer) {
            socialMediaContainer.innerHTML = '';
            
            const socialLinks = [
                { platform: 'facebook', icon: 'fa-brands fa-facebook-f' },
                { platform: 'instagram', icon: 'fa-brands fa-instagram' },
                { platform: 'tiktok', icon: 'fa-brands fa-tiktok' },
                { platform: 'youtube', icon: 'fa-brands fa-youtube' },
                { platform: 'website', icon: 'fa-solid fa-globe' }
            ];
            
            socialLinks.forEach(social => {
                if (data[social.platform]) {
                    const link = document.createElement('a');
                    link.href = data[social.platform];
                    link.target = '_blank';
                    link.className = 'inline-flex items-center justify-center w-10 h-10 rounded-full bg-dynamic-primary text-white hover:bg-dynamic-accent transition-colors duration-300';
                    link.innerHTML = `<i class="${social.icon}"></i>`;
                    socialMediaContainer.appendChild(link);
                }
            });
        }

        // CTA Section
        safeSetContent('ctaTitle', data.callToAction?.title || '');
        safeSetContent('ctaText', data.callToAction?.text || '');

        // Contact Buttons
        const mainContactButtonsContainer = document.getElementById('mainContactButtonsContainer');
        const floatingWhatsappButtonContainer = document.getElementById('floatingWhatsappButtonContainer');
        if (mainContactButtonsContainer && data.phones) {
            mainContactButtonsContainer.innerHTML = '';
            let primaryWhatsappPhone = null;

            data.phones.forEach(phone => {
                if (phone.whatsapp) {
                    const isPrimary = phone.isPrimaryCta;
                    if (isPrimary) primaryWhatsappPhone = phone;

                    const buttonBaseClasses = "font-semibold py-3 px-6 rounded-lg shadow-lg btn-contact-effect flex items-center justify-center min-w-[240px] text-base hover-bg-dynamic-primary";
                    const primaryButtonClasses = `bg-dynamic-accent text-dynamic-primary primary-cta-button ${buttonBaseClasses}`;
                    const secondaryButtonClasses = `bg-transparent border-2 border-dynamic-accent hover-bg-dynamic-primary hover-text-dynamic-primary text-dynamic-accent ${buttonBaseClasses}`;
                    
                    const buttonClass = isPrimary ? primaryButtonClasses : secondaryButtonClasses;

                    const whatsappButton = `
                        <a href="https://wa.me/${phone.whatsapp}?text=${encodeURIComponent('Hola, me gustaría más información sobre sus servicios.')}" target="_blank" class="${buttonClass}">
                            <i class="fa-brands fa-whatsapp cta-button-icon"></i> ${phone.ctaText || `WhatsApp ${phone.number || ''}`}
                        </a>`;
                    mainContactButtonsContainer.innerHTML += whatsappButton;
                }
            });
            
            if (data.emails && data.emails.length > 0) {
                const emailMainCtaButton = `
                    <a href="mailto:${data.emails[0] || ''}" class="bg-gray-100 hover:bg-gray-200 text-dynamic-primary font-semibold py-3 px-6 rounded-lg shadow-lg btn-contact-effect flex items-center justify-center min-w-[240px] text-base">
                        <span class="iconify cta-button-icon" data-icon="mdi:email-outline"></span> Enviar Correo
                    </a>`;
                mainContactButtonsContainer.innerHTML += emailMainCtaButton;
            }

            if (primaryWhatsappPhone && floatingWhatsappButtonContainer) {
                floatingWhatsappButtonContainer.innerHTML = `
                    <a href="https://wa.me/${primaryWhatsappPhone.whatsapp}?text=${encodeURIComponent('Hola, necesito una cotización!')}" target="_blank"
                       class="bg-dynamic-accent hover-bg-yellow-400 text-dynamic-primary p-4 rounded-full shadow-xl flex items-center justify-center primary-cta-button btn-contact-effect h-16 w-16"
                       aria-label="Contactar por WhatsApp para cotización">
                        <i class="fa-brands fa-whatsapp text-3xl"></i>
                    </a>`;
            }
        }

        // Footer
        const currentYear = new Date().getFullYear();
        safeSetContent('footerYear', currentYear);
        safeSetHTML('footerCreditsPrefix', 'Un perfil en <a href="https://mercado-digital-page.github.io/espacio/" class="text-dynamic-accent font-bold hover:underline">Mercado Digital | Espacio</a>');

        // Escanear íconos de Font Awesome
        if (window.FontAwesome) {
            window.FontAwesome.dom.watch();
        }
    }
});