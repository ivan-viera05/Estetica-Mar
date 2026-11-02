// File: js/service-detail.js

document.addEventListener('DOMContentLoaded', async function() {
    // Get service ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');

    if (!serviceId) {
        console.error('No service ID provided');
        showServiceError('No se especificó un servicio válido.');
        return;
    }

    try {
        // Fetch services data from services.json
        const response = await fetch('../data/services.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Find the specific service
        const service = data.services.find(s => s.id === serviceId);
        
        if (!service) {
            console.error('Service not found:', serviceId);
            showServiceError('El servicio solicitado no fue encontrado.');
            return;
        }

        // Update the DOM with service details
        const nameEl = document.getElementById('serviceName');
        const shortDescEl = document.getElementById('serviceShortDesc');
        const fullDescEl = document.getElementById('serviceFullDesc');
        const durationEl = document.getElementById('serviceDuration');
        const sessionsEl = document.getElementById('serviceSessions');

        if (nameEl) nameEl.textContent = service.name;
        if (shortDescEl) shortDescEl.textContent = service.shortDescription;
        if (fullDescEl) fullDescEl.textContent = service.fullDescription;
        if (durationEl) durationEl.textContent = service.duration;
        if (sessionsEl) sessionsEl.textContent = service.sessions;

        // Add benefits list
        const benefitsList = document.getElementById('serviceBenefits');
        if (benefitsList && Array.isArray(service.benefits)) {
            benefitsList.innerHTML = '';
            service.benefits.forEach(benefit => {
                const li = document.createElement('li');
                li.textContent = benefit;
                benefitsList.appendChild(li);
            });
        }

        // Update main image
        const serviceImage = document.querySelector('.service-image img');
        if (serviceImage) {
            serviceImage.src = `../assets/img/${service.mainImage}`;
            serviceImage.alt = service.name;
        }

        // Actualizar SEO Meta Tags dinámicamente
        const dynamicTitle = `${service.name} en Glew | Mar Estética`;
        document.title = dynamicTitle;
        const pageTitleEl = document.getElementById('pageTitle');
        if (pageTitleEl) pageTitleEl.textContent = dynamicTitle;

        const dynamicDesc = `Tratamiento de ${service.name} en Glew, Buenos Aires. ${service.shortDescription}. ${service.benefits ? service.benefits.slice(0, 3).join(', ') : ''}. ¡Consultá y reservá tu turno!`;
        const metaDescEl = document.querySelector('meta[name="description"]');
        if (metaDescEl) metaDescEl.setAttribute('content', dynamicDesc);

        const canonicalEl = document.getElementById('canonicalUrl');
        if (canonicalEl) canonicalEl.setAttribute('href', `https://estetica-mar.vercel.app/html/service-detail.html?id=${service.id}`);

        const ogTitleEl = document.getElementById('ogTitle');
        if (ogTitleEl) ogTitleEl.setAttribute('content', dynamicTitle);

        const ogDescEl = document.getElementById('ogDesc');
        if (ogDescEl) ogDescEl.setAttribute('content', dynamicDesc);

        const ogImageEl = document.getElementById('ogImage');
        if (ogImageEl) ogImageEl.setAttribute('content', `https://estetica-mar.vercel.app/assets/img/${service.mainImage}`);

        // Inject Structured Data (Schema.org) for this Service and Breadcrumbs
        const schemaData = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Inicio",
                            "item": "https://estetica-mar.vercel.app/"
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "Servicios",
                            "item": "https://estetica-mar.vercel.app/#services"
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": service.name,
                            "item": `https://estetica-mar.vercel.app/html/service-detail.html?id=${service.id}`
                        }
                    ]
                },
                {
                    "@type": "Service",
                    "@id": `https://estetica-mar.vercel.app/html/service-detail.html?id=${service.id}#service`,
                    "name": service.name,
                    "description": service.fullDescription || service.shortDescription,
                    "provider": {
                        "@type": "BeautySalon",
                        "name": "Mar Estética",
                        "telephone": "+5491155024690",
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Mazzini 1431",
                            "addressLocality": "Glew",
                            "addressRegion": "Buenos Aires",
                            "addressCountry": "AR"
                        }
                    },
                    "areaServed": {
                        "@type": "AdministrativeArea",
                        "name": "Glew, Buenos Aires"
                    },
                    "image": `https://estetica-mar.vercel.app/assets/img/${service.mainImage}`
                }
            ]
        };

        let schemaScript = document.getElementById('serviceSchema');
        if (!schemaScript) {
            schemaScript = document.createElement('script');
            schemaScript.id = 'serviceSchema';
            schemaScript.type = 'application/ld+json';
            document.head.appendChild(schemaScript);
        }
        schemaScript.textContent = JSON.stringify(schemaData);


        // Set up action buttons
        const bookBtn = document.getElementById('serviceBookBtn');
        if (bookBtn) {
            bookBtn.addEventListener('click', () => {
                if (typeof openCalendly === 'function') {
                    openCalendly(service.id);
                }
            });
        }

        const contactBtn = document.getElementById('serviceContactBtn');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                window.location.href = '../index.html#contact';
            });
        }

    } catch (error) {
        console.error('Error loading service details:', error);
        showServiceError('Ocurrió un error al cargar la información del servicio.');
    }
});

function showServiceError(message) {
    const serviceInfo = document.querySelector('.service-info');
    if (serviceInfo) {
        serviceInfo.innerHTML = `
            <div class="alert alert-warning text-center my-4">
                <h4><i class="bi bi-exclamation-triangle"></i> Servicio no disponible</h4>
                <p class="mb-3">${message}</p>
                <a href="../index.html#services" class="btn btn-primary">Volver a Servicios</a>
            </div>
        `;
    }
}