// Load and render services carousel
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch services data
        const response = await fetch('data/services.json');
        const data = await response.json();
        
        // Get carousel container
        const carouselInner = document.querySelector('#servicesCarousel .carousel-inner');
        
        // Render each service card
        data.services.forEach(service => {
            const serviceCard = createServiceCard(service);
            carouselInner.appendChild(serviceCard);
        });

    } catch (error) {
        console.error('Error loading services:', error);
    }
});

// Create service card HTML
function createServiceCard(service) {
    const card = document.createElement('div');
    card.className = 'service-card card h-100';
    
    card.innerHTML = `
        <img src="assets/img/${service.mainImage}" 
             class="card-img-top" 
             alt="${service.name}"
             loading="lazy"
             decoding="async">
        <div class="card-body">
            <h5 class="card-title">${service.name}</h5>
            <p class="card-text">${service.shortDescription}</p>
            <div class="service-features">
                ${createServiceBadges(service.benefits)}
            </div>
            <div class="d-flex gap-2 mt-3">
                <a href="#appointment" class="btn btn-outline-primary flex-grow-1">Reservar</a>
                <a href="html/service-detail.html?id=${service.id}" class="btn btn-primary">Ver más</a>
            </div>
        </div>
    `;
    
    return card;
}

// Create badges for service features
function createServiceBadges(benefits) {
    // Take first two benefits for badges
    return benefits
        .slice(0, 2)
        .map(benefit => `<span class="badge bg-primary">${benefit}</span>`)
        .join('');
}