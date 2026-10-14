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