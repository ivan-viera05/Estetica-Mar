// Agregar al inicio de script.js
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Usar throttling para eventos scroll
function throttle(func, limit) {
    let inThrottle;
    return function() {
        if (!inThrottle) {
            func.apply(this, arguments);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

window.addEventListener('scroll', throttle(() => {
    // Tu código de scroll
}, 50));

// Función para manejar el caché mediante cookies
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Feature detection for WebP support
async function supportsWebp() {
    if (!self.createImageBitmap) return false;
    
    const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
    const blob = await fetch(webpData).then(r => r.blob());
    
    return createImageBitmap(blob).then(() => true, () => false);
}

// Function to update image sources based on browser support
async function initializeImageSupport() {
    const supportsWebP = await supportsWebp();
    
    if (!supportsWebP) {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Replace WebP with PNG in src and srcset
            if (img.src.endsWith('.webp')) {
                img.src = img.src.replace('.webp', '.png');
            }
            if (img.srcset) {
                img.srcset = img.srcset.split(',')
                    .map(src => src.replace('.webp', '.png'))
                    .join(',');
            }
        });

        // Update background images in CSS
        const elementsWithBgImage = document.querySelectorAll('[class*="hero"], [class*="background"]');
        elementsWithBgImage.forEach(el => {
            const style = window.getComputedStyle(el);
            const bgImage = style.backgroundImage;
            if (bgImage.includes('.webp')) {
                el.style.backgroundImage = bgImage.replace('.webp', '.png');
            }
        });
    }
}

// Función para cachear las imágenes más usadas
async function cacheImages() {
    const imageExt = await supportsWebp() ? '.webp' : '.png';
    const imagesToCache = [
        `assets/img/logoMarEstetica-Photoroom${imageExt}`,
        `assets/img/MujerParaBackGround${imageExt}`,
        // Agrega aquí las imágenes más importantes
    ];

    // Verificar si ya están cacheadas
    const cachedImages = getCookie('cachedImages');
    if (!cachedImages) {
        imagesToCache.forEach(imgSrc => {
            const img = new Image();
            img.src = imgSrc;
        });
        setCookie('cachedImages', 'true', 7); // Caché por 7 días
    }
}

// Función para cachear datos de la página
function cachePageData() {
    // Guardar datos importantes en cookies
    const pageData = {
        lastVisit: new Date().toISOString(),
        theme: 'light',
        // Otros datos que quieras guardar
    };
    setCookie('pageData', JSON.stringify(pageData), 7);
}

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize image format support
    await initializeImageSupport();
    
    // Iniciar caché de imágenes
    cacheImages();
    
    // Cachear datos de la página
    cachePageData();
    
    // Inicializar solo componentes visibles
    if (isInViewport('#servicesCarousel')) {
        initializeCarousel();
    }
    
    // Lazy load para componentes no visibles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === 'servicesCarousel') {
                    initializeCarousel();
                }
                observer.unobserve(entry.target);
            }
        });
    });

    observer.observe(document.querySelector('#servicesCarousel'));

    // Initialize Calendly
    initializeCalendly();

    // Inicializar el banner de cookies cuando se carga la página
    initCookieConsent();
});

// Carousel initialization
function initializeCarousel() {
    const carousel = document.querySelector('#servicesCarousel .carousel-inner');
    if (!carousel) return;

    // Clone all items and append them to create the continuous effect
    const items = Array.from(carousel.querySelectorAll('.service-card'));
    items.forEach(item => {
        const clone = item.cloneNode(true);
        carousel.appendChild(clone);
    });

    let isScrolling = true;
    let animationFrame;
    let scrollPosition = 0;
    let isMouseDown = false;
    let startX;
    let scrollLeft;

    function animate() {
        if (isScrolling && !isMouseDown) {
            scrollPosition += 1;
            
            // Reset position when reaching the end
            if (scrollPosition >= carousel.scrollWidth / 2) {
                scrollPosition = 0;
            }
            
            carousel.scrollLeft = scrollPosition;
        }
        animationFrame = requestAnimationFrame(animate);
    }

    // Start animation
    animate();

    // Touch event handlers
    carousel.addEventListener('touchstart', (e) => {
        isMouseDown = true;
        isScrolling = false;
        startX = e.touches[0].clientX;
        scrollLeft = carousel.scrollLeft;
    }, { passive: true });

    carousel.addEventListener('touchmove', (e) => {
        if (!isMouseDown) return;
        
        const x = e.touches[0].clientX;
        const walk = (startX - x);
        carousel.scrollLeft = scrollLeft + walk;
    }, { passive: true });

    carousel.addEventListener('touchend', () => {
        isMouseDown = false;
        isScrolling = true;
        scrollPosition = carousel.scrollLeft;
    });

    // Mouse event handlers
    carousel.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        isScrolling = false;
        startX = e.pageX - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        carousel.style.cursor = 'grabbing';
    });

    carousel.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });

    carousel.addEventListener('mouseup', () => {
        isMouseDown = false;
        isScrolling = true;
        carousel.style.cursor = 'grab';
        scrollPosition = carousel.scrollLeft;
    });

    carousel.addEventListener('mouseleave', () => {
        isMouseDown = false;
        isScrolling = true;
        carousel.style.cursor = 'grab';
    });

    // Stop animation when tab/window is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else {
            animate();
        }
    });
}

// Calendly configuration
const CALENDLY_URLS = {
    'depilacion-laser': 'https://calendly.com/ivanvieraosvaldo/depilacion-laser',
    'hifu': 'https://calendly.com/ivanvieraosvaldo/hifu',
    'limpieza-cutis': 'https://calendly.com/ivanvieraosvaldo/limpieza-cutis',
    'criofraxis': 'https://calendly.com/ivanvieraosvaldo/criofraxis',
    'lifting-pestanas': 'https://calendly.com/ivanvieraosvaldo/lifting-de-pestanas',
    'body-vela': 'https://calendly.com/ivanvieraosvaldo/body-vela',
    'belleza-pies-manos': 'https://calendly.com/ivanvieraosvaldo/belleza-manos-y-pies',
    'bronceado': 'https://calendly.com/ivanvieraosvaldo/bronceado-saludable-sol-pleno' 
};

// Function to open Calendly for specific service
function openCalendly(service) {
    if (typeof Calendly === 'undefined') {
        console.error('Calendly is not loaded');
        return;
    }

    const url = CALENDLY_URLS[service];
    if (!url) return;

    Calendly.initPopupWidget({
        url: `${url}?hide_gdpr_banner=1&background_color=ecdfdf&text_color=333333&primary_color=680747`
    });
}

// Initialize Calendly
function initializeCalendly() {
    // Add click handler for main CTA button
    const mainCTAButton = document.querySelector('.hero .btn-primary');
    if (mainCTAButton) {
        mainCTAButton.addEventListener('click', function(e) {
            e.preventDefault();
            openCalendly('depilacion-laser'); // Default service
        });
    }

    // Add Calendly event listener
    window.addEventListener('message', function(e) {
        if (e.data.event && e.data.event.indexOf('calendly') === 0) {
            if (e.data.event === 'calendly.date_and_time_selected') {
                // Handle date selection if needed
            }
        }
    });
}

// Function to check if an element is in the viewport
function isInViewport(selector) {
    const element = document.querySelector(selector);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Cookie Consent Management
function initCookieConsent() {
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptBtn = document.getElementById('acceptCookies');
    const rejectBtn = document.getElementById('rejectCookies');
    
    // Check if user has already made a choice
    const cookieChoice = getCookie('cookieConsent');
    
    // Mostrar banner si no hay elección o si rechazó las cookies
    if (!cookieChoice || cookieChoice === 'rejected') {
        setTimeout(() => {
            cookieConsent.classList.add('show');
        }, 1000);
    }
    
    acceptBtn.addEventListener('click', () => {
        setCookie('cookieConsent', 'accepted', 365); // Guarda por 1 año si acepta
        cookieConsent.classList.remove('show');
        initializeCookies();
    });
    
    rejectBtn.addEventListener('click', () => {
        setCookie('cookieConsent', 'rejected', 1); // Guarda solo por 1 día si rechaza
        cookieConsent.classList.remove('show');
        disableNonEssentialCookies();
    });
}

function initializeCookies() {
    cacheImages();
    cachePageData();
}

function disableNonEssentialCookies() {
    console.log('Cookies no esenciales deshabilitadas');
    // Limpiar cookies existentes
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const cookieName = cookie.split('=')[0].trim();
        if (cookieName !== 'cookieConsent') {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
    }
}

// Lazy loading de componentes
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.src = entry.target.dataset.src;
            observer.unobserve(entry.target);
        }
    });
});

// Update image sources in dynamically loaded content
const updateDynamicImages = (container) => {
    if (!supportsWebp()) {
        const images = container.querySelectorAll('img[src$=".webp"]');
        images.forEach(img => {
            img.src = img.src.replace('.webp', '.png');
        });
    }
};