/**
 * MindHelix AI - Universal Cross-Device Enhancements
 * Enables responsive mobile drawer, virtual keyboard handling, and touch optimizations
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. MOBILE NAVIGATION DRAWER TOGGLE
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');

    if (navbar && navLinks && !document.querySelector('.mobile-nav-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'mobile-nav-toggle';
        toggleBtn.setAttribute('aria-label', 'Toggle Navigation Menu');
        toggleBtn.innerHTML = "<i class='fa-solid fa-bars'></i>";

        // Insert toggle button before nav-actions
        const navActions = navbar.querySelector('.nav-actions');
        if (navActions) {
            navbar.insertBefore(toggleBtn, navActions);
        } else {
            navbar.appendChild(toggleBtn);
        }

        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = navLinks.classList.toggle('active');
            toggleBtn.innerHTML = isActive 
                ? "<i class='fa-solid fa-xmark'></i>" 
                : "<i class='fa-solid fa-bars'></i>";
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                toggleBtn.innerHTML = "<i class='fa-solid fa-bars'></i>";
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                toggleBtn.innerHTML = "<i class='fa-solid fa-bars'></i>";
            }
        });
    }

    // 2. VIRTUAL KEYBOARD OPTIMIZATION FOR MOBILE DEVICES
    if (window.visualViewport) {
        const handleViewportResize = () => {
            const chatContainer = document.querySelector('.chat-input-container');
            if (chatContainer) {
                const offset = window.innerHeight - window.visualViewport.height;
                if (offset > 100) {
                    // Keyboard is open on mobile
                    chatContainer.style.transform = `translateY(-${offset}px)`;
                } else {
                    chatContainer.style.transform = 'none';
                }
            }
        };

        window.visualViewport.addEventListener('resize', handleViewportResize);
        window.visualViewport.addEventListener('scroll', handleViewportResize);
    }
});
