// Add this constant at the top of the file with your WhatsApp number
const WHATSAPP_NUMBER = "54911550246"; 

// Define host numbers mapping
const hostNumbers = {
  "Ivan Viera": "5491155024690",
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
                        <p class="card-text text-muted small">
                            ${service.shortDescription}
                        </p>
                        
                        <div class="mb-3">
                            ${service.benefits.slice(0, 2).map(benefit => 
                                `<span class="badge bg-primary bg-opacity-10 text-light me-2 mb-1">${benefit}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <button class="btn btn-primary w-100" 
                            onclick="openCalendly('${service.id}')">
                        Reservar
                    </button>
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
async function fetchCalendlyData(url) {
    try {
        const response = await fetch(url, {
            headers: {
                "Authorization": "Bearer eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzM4Njk2NTI3LCJqdGkiOiI2N2ZhYTU2NC02ZjUwLTRkMmUtOWZkZi0yNmQ5ZmM1MGJjOTgiLCJ1c2VyX3V1aWQiOiJmZjY3YjdmMC0wNjA1LTQ3NDUtOGE0Ni1iMzA5Mzk1YzQzZGQifQ.N125wmMFENlzvEljMuVcHprIT9O3ThZ4XBams-V0uA2mJxw5X9ljUsYrTVs1cv4bJWCww7w8TUnjQ04M6zaUzw",
                "Content-Type": "application/json"
            }
        });
        return await response.json();
    } catch (error) {
        console.error("❌ Error obteniendo datos de Calendly:", error);
        return null;
    }
}

function formatWhatsAppMessage(data) {
    return encodeURIComponent(
        `¡Hola ${data.invitado}! 👋\n\n` +
        `Tu cita para *${data.evento}* ha sido confirmada para:\n` +
        `📅 ${data.fecha}\n\n` +
        `Tu anfitrión será: ${data.anfitrión}\n` +
        `📞 ${data.teléfono_anfitrión}\n\n` +
        `Por favor, confirma que recibiste este mensaje.\n` +
        `¡Gracias por elegir nuestros servicios! ✨`
    );
}

function openWhatsApp(phoneNumber, message) {
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
}

async function handleCalendlyEvent(e) {
    if (e.data.event && e.data.event === "calendly.event_scheduled") {
        try {
            console.log("📌 Evento recibido de Calendly:", e.data);
            
            // Obtener información del anfitrión
            const host = getHostInfo(e); // Añadir esta línea

            // Obtener las URIs del evento y del invitado
            const eventUri = e.data.payload.event.uri;
            const inviteeUri = e.data.payload.invitee.uri;

            if (!eventUri || !inviteeUri) {
                console.error("❌ No se encontraron URIs del evento o del invitado.");
                return;
            }

            // Obtener los detalles completos del evento
            const eventData = await fetchCalendlyData(eventUri);
            const inviteeData = await fetchCalendlyData(inviteeUri);

            if (!eventData || !inviteeData) {
                console.error("❌ No se pudieron obtener los detalles del evento o del invitado.");
                return;
            }

            // Extraer información del evento, incluyendo la ubicación
            const eventTitle = eventData.resource?.name || "Evento sin nombre";
            const scheduledTime = eventData.resource?.start_time ? formatDateTime(eventData.resource.start_time) : "Fecha no disponible";
            const location = eventData.resource?.location?.location || "Mar Estética, Av. Siempre Viva 742"; // Acceder a location.name
            console.log("Location data:", eventData.resource?.location);

            // Extraer información del invitado
            const inviteeName = inviteeData.resource?.name || "Nombre no disponible";
            const inviteeEmail = inviteeData.resource?.email || "Correo no disponible";
            const inviteePhone = inviteeData.resource?.questions_and_answers?.find(q => q.question.toLowerCase().includes("teléfono"))?.answer || "Número no proporcionado";

            console.log("✅ Datos procesados correctamente:", {
                anfitrión: host.name,
                teléfono_anfitrión: host.phone,
                evento: eventTitle,
                fecha: scheduledTime,
                invitado: inviteeName,
                email: inviteeEmail,
                teléfono_invitado: inviteePhone,
                ubicación: location // Agregar ubicación a los datos procesados
            });

            // Crear el mensaje para WhatsApp del anfitrión
            const hostMessage = 
                `🔔 *Nueva Cita Agendada* 🔔\n\n` +
                `👤 Cliente: ${inviteeName}\n` +
                `📅 Fecha: ${scheduledTime}\n` +
                `💆 Servicio: ${eventTitle}\n\n` +
                `📧 Contacto del cliente:\n` +
                `• Email: ${inviteeEmail}\n` +
                `📍 Lugar: ${location}\n` + // Usar la ubicación del evento
                `✨ ¡No olvides confirmar la cita!`;

            const hostWhatsappURL = `https://api.whatsapp.com/send?phone=${host.phone}&text=${encodeURIComponent(hostMessage)}`;

            // Abrir WhatsApp con el mensaje para el anfitrión
            window.open(hostWhatsappURL, "_blank");

            // Preparar datos para el mensaje al cliente
            const clientMessageData = {
                evento: eventTitle,
                fecha: scheduledTime,
                invitado: inviteeName,
                anfitrión: host.name,
                teléfono_anfitrión: host.phone
            };

            // Format phone number (remove spaces, add country code if needed)
            const phoneNumber = inviteePhone.replace(/\D/g, '');
            if (phoneNumber) {
                const clientMessage = formatWhatsAppMessage(clientMessageData);
                openWhatsApp(phoneNumber, clientMessage);
            }

        } catch (error) {
            console.error("❌ Error al procesar el evento de Calendly:", error);
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