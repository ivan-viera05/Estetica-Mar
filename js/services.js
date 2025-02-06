// Add this constant at the top of the file with your WhatsApp number
const WHATSAPP_NUMBER = "54911550246"; 

// Define host numbers mapping
const hostNumbers = {
  "Ivan Viera": "5491159891620",
  "Ana García": "5491123456789", 
  "Carlos López": "5491134567890"
};

// Function to get host info from Calendly event
function getHostInfo(event) {
    const hostName = event.data.payload?.event?.organizer?.name || "Ivan Viera";
    return {
        name: hostName,
        phone: hostNumbers[hostName] || hostNumbers["Ivan Viera"]
    };
}

// Function to create service card HTML
function createServiceCard(service, isFeatured = false) {
    return `
        <div class="col-12 col-sm-6 col-md-6 col-lg-4 mx-auto">
            <div class="card border-0 shadow-sm h-100">
                <div class="position-relative">
                    <img src="assets/img/${service.mainImage}" 
                         alt="${service.name}" 
                         class="card-img-top"
                         style="height: 200px; object-fit: cover;"
                         loading="lazy">
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="flex-grow-1">
                        <h3 class="card-title h5 text-truncate">${service.name}</h3>
                        <p class="card-text text-muted small" style="min-height: 48px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                            ${service.shortDescription}
                        </p>
                        
                        <div class="">
                            ${service.benefits.slice(0, 2).map(benefit => 
                                `<span class="badge bg-primary bg-opacity-10 text-light me-2 mb-1 text-truncate">${benefit}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="">
                        <div class="d-flex gap-2">
                            <a href="html/service-detail.html?id=${service.id}" 
                               class="btn btn-outline-primary flex-fill text-nowrap">Ver más</a>
                            <button class="btn btn-primary flex-fill text-nowrap" 
                                    onclick="openCalendly('${service.id}')">
                                Reservar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Enhanced date formatting function
function formatDateTime(isoString) {
    try {
        if (!isoString) return 'fecha no disponible';
        
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'fecha no válida';
        
        return date.toLocaleString('es-AR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'fecha no disponible';
    }
}

// Updated Calendly event handler
function handleCalendlyEvent(e) {
    if (e.data.event && e.data.event === "calendly.event_scheduled") {
        try {
            const host = getHostInfo(e);
            const startTime = e.data.payload.event.start_time;
            const scheduledTime = formatDateTime(startTime);
            
            console.log('Scheduled event:', {
                host: host.name,
                time: scheduledTime,
                rawTime: startTime
            });
            
            const message = `¡Hola ${host.name}! He agendado una cita en Mar Estética para el ${scheduledTime}. ¡Gracias por la confirmación!`;
            const whatsappURL = `https://api.whatsapp.com/send?phone=${host.phone}&text=${encodeURIComponent(message)}`;
            
            window.open(whatsappURL, '_blank');
        } catch (error) {
            console.error('Error processing Calendly event:', error);
            console.log('Event payload:', e.data.payload);
        }
    }
}

// Add the event listener for Calendly events
window.addEventListener('message', handleCalendlyEvent);

// Function to categorize services
function categorizeServices(services) {
    return services.reduce((acc, service) => {
        if (service.name.toLowerCase().includes('facial') || 
            ['hifu', 'limpieza-cutis', 'lifting-pestanas'].includes(service.id)) {
            acc.facial.push(service);
        } else if (service.name.toLowerCase().includes('corporal') || 
                   ['criofraxis', 'body-vela', 'criolipolisis', 'depilacion-laser'].includes(service.id)) {
            acc.corporal.push(service);
        } else {
            acc.bienestar.push(service);
        }
        return acc;
    }, { facial: [], corporal: [], bienestar: [] });
}

// Function to render services
async function renderServices() {
    try {
        const response = await fetch('data/services.json');
        const data = await response.json();
        
        // Categorize services
        const categorizedServices = categorizeServices(data.services);
        
        // Render each category
        Object.entries(categorizedServices).forEach(([category, services]) => {
            const container = document.querySelector(`#${category} .row`);
            if (!container) return;
            
            // Clear existing content
            container.innerHTML = '';
            
            // Add services to container
            services.forEach(service => {
                container.innerHTML += createServiceCard(service);
            });
        });
        
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Modify the existing openCalendly function to include the event handler
function openCalendly(serviceId) {
    if (CALENDLY_URLS[serviceId]) {
        Calendly.initPopupWidget({
            url: CALENDLY_URLS[serviceId],
            prefill: {},
            utm: {}
        });
    }
}

// Initialize services when DOM is loaded
document.addEventListener('DOMContentLoaded', renderServices);