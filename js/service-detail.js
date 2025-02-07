// File: js/service-detail.js

document.addEventListener('DOMContentLoaded', async function() {
    // Get service ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('id');

    if (!serviceId) {
        console.error('No service ID provided');
        return;
    }

    try {
        // Fetch services data from services.json
        const response = await fetch('../data/services.json');
        const data = await response.json();
        
        // Find the specific service
        const service = data.services.find(s => s.id === serviceId);
        
        if (!service) {
            console.error('Service not found');
            return;
        }

        // Update the DOM with service details
        document.getElementById('serviceName').textContent = service.name;
        document.getElementById('serviceShortDesc').textContent = service.shortDescription;
        document.getElementById('serviceFullDesc').textContent = service.fullDescription;
        document.getElementById('serviceDuration').textContent = service.duration;
        document.getElementById('serviceSessions').textContent = service.sessions;

        // Add benefits list
        const benefitsList = document.getElementById('serviceBenefits');
        service.benefits.forEach(benefit => {
            const li = document.createElement('li');
            li.textContent = benefit;
            benefitsList.appendChild(li);
        });

        // Update main image
        const serviceImage = document.querySelector('.service-image img');
        serviceImage.src = `../assets/img/${service.mainImage}`;
        serviceImage.alt = service.name;

        // Set up action buttons
        const bookBtn = document.getElementById('serviceBookBtn');
        bookBtn.addEventListener('click', () => {
            // Using the Calendly function from script.js
            openCalendly(service.id);
        });

        const contactBtn = document.getElementById('serviceContactBtn');
        contactBtn.addEventListener('click', () => {
            window.location.href = '../index.html#contact';
        });

    } catch (error) {
        console.error('Error loading service details:', error);
    }
});