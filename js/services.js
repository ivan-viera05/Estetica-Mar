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
  // Extract host name from Calendly event data
  const hostName = event.data.payload?.invitee?.full_name || "Ivan Viera"; // Default to Ivan if no name found
  return {
    name: hostName,
    phone: hostNumbers[hostName] || hostNumbers["Ivan Viera"] // Default to Ivan's number if host not found
  };
}

// Function to create service card HTML
function createServiceCard(service, isFeatured = false) {
    return `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
            <div class="service-card h-100">
                <div class="service-image">
                    <img src="assets/img/${service.mainImage}" 
                         alt="${service.name}" 
                         class="img-fluid container-fluid" 
                         loading="lazy">
                </div>
                <div class="card-body d-flex flex-column py-3">
                    <h3 class="card-title h5 mb-2">${service.name}</h3>
                    <p class="card-text small mb-3">${service.shortDescription}</p>
                    <div class="service-tags mb-2">
                        ${service.benefits.slice(0, 2).map(benefit => 
                            `<span class="tag">${benefit}</span>`
                        ).join('')}
                    </div>
                    <div class="mt-auto">
                        <div class="d-flex gap-2">
                            <a href="html/service-detail.html?id=${service.id}" 
                               class="btn btn-outline-primary btn-sm flex-grow-1">Ver más</a>
                            <button class="btn btn-primary btn-sm" 
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

// Updated function to handle Calendly events
function handleCalendlyEvent(e) {
    if (e.data.event && e.data.event === "calendly.event_scheduled") {
        const host = getHostInfo(e);
        const message = `¡Hola ${host.name}! He agendado una cita en Mar Estética. ¡Gracias por la confirmación!`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${host.phone}?text=${encodedMessage}`;
        
        // Open WhatsApp in a new tab
        window.open(whatsappURL, '_blank');
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