// Service Detail Page Logic
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize cookie consent
    initCookieConsent();
    
    // Get service ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');

    if (!serviceId) {
        window.location.href = '/';
        return;
    }

    try {
        // Fetch services data
        const response = await fetch('../data/services.json'); // Cambiado a ruta relativa
        const data = await response.json();
        
        // Find selected service
        const service = data.services.find(s => s.id === serviceId);
        
        if (!service) {
            window.location.href = '/';
            return;
        }

        // Update page content with correct image paths
        document.getElementById('serviceName').textContent = service.name;
        document.getElementById('serviceDescription').textContent = service.fullDescription;
        document.getElementById('serviceMainImage').src = `../assets/img/${service.mainImage}`; // Agregado ../
        document.getElementById('serviceMainImage').alt = service.name;
        document.getElementById('serviceDuration').textContent = service.duration;
        document.getElementById('serviceSessions').textContent = service.sessions;

        // Add benefits
        const benefitsList = document.getElementById('serviceBenefits');
        service.benefits.forEach(benefit => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="bi bi-check-circle-fill text-primary me-2"></i>${benefit}`;
            benefitsList.appendChild(li);
        });

        // Add gallery images with correct paths
        const gallery = document.getElementById('serviceGallery');
        service.galleryImages.forEach(img => {
            gallery.innerHTML += `
                <div class="col-md-6">
                    <div class="gallery-item">
                        <img src="../assets/img/${img}" alt="${service.name}" class="img-fluid rounded">
                    </div>
                </div>
            `;
        });

        // Update page title
        document.title = `${service.name} - Mar Estética`;

    } catch (error) {
        console.error('Error loading service details:', error);
    }
});

function openServiceCalendly() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');
    openCalendly(serviceId);
}