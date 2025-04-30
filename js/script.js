document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top on page load/refresh
    window.scrollTo(0, 0);
    
    // Background shiny effect
    const shinyEffect = document.querySelector(".shiny-effect");
    const shinyButton = document.querySelector(".shiny");
    
    // Mouse movement effects
    
    // Shiny button effect
    if (shinyButton) {
        shinyButton.addEventListener("mousemove", (e) => {
            const { x, y } = shinyButton.getBoundingClientRect();
            shinyButton.style.setProperty("--x", e.clientX - x);
            shinyButton.style.setProperty("--y", e.clientY - y);
        });
    }
    
    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    const elementsWithSpecificStyle = document.querySelectorAll('.hero-card, .job-card, .project-card, .education-card');
    
    // Add hover effects to the specific elements
    elementsWithSpecificStyle.forEach(element => {
        // Store original styles
        const originalBackground = window.getComputedStyle(element).backgroundColor;
        const originalBoxShadow = window.getComputedStyle(element).boxShadow;
        const originalTransform = window.getComputedStyle(element).transform;
        
       /* // Add hover animations
        element.addEventListener('mouseenter', function() {
            // Enhanced hover effect
            this.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            this.style.boxShadow = "0 15px 40px rgba(0, 0, 0, 0.5)";
            this.style.backgroundColor = "rgba(59, 16, 104, 0.3)"; // Slightly brighter purple
            this.style.borderColor = "rgba(82, 0, 107, 0.3)";
            
            // Add a subtle glow effect
            this.style.filter = "drop-shadow(0 0 15px rgba(106, 17, 203, 0.3))";
        });
        */

        element.addEventListener('mouseleave', function() {
            this.style.transform = originalTransform === 'none' ? 'translateY(0)' : originalTransform;
            this.style.boxShadow = originalBoxShadow;
            this.style.backgroundColor = "rgba(16, 63, 104, 0)"; // Slightly brighter purple
            this.style.borderColor = "rgba(0, 0, 0, 0)";
            this.style.filter = "none";
        });
    });
    
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.skill-icon');
            if (icon) {
                icon.style.transition = "all 0.3s ease";
                icon.style.transform = 'scale(1.05)';
                icon.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.4)';
                icon.style.filter = "brightness(1.2)";
                icon.style.backgroundColor = "rgba(0, 65, 112, 0.34)";
                icon.style.borderColor = "rgba(255, 255, 255, 0.5)";
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.skill-icon');
            if (icon) {
                icon.style.transform = 'scale(1)';
                icon.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.37)';
                icon.style.filter = "brightness(1)";
                icon.style.backgroundColor = "rgba(42, 42, 90, 0)";
                icon.style.borderColor = "rgba(255, 255, 255, 0.5)";

            }
        });
    });
    
    // Scroll animation for elements
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.job-card, .project-card, .education-card, .skill-item');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = 1;
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Initialize animation properties with staggered delay
    const elements = document.querySelectorAll('.job-card, .project-card, .education-card, .skill-item');
    
    elements.forEach((element, index) => {
        element.style.opacity = 0;
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.3s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s, 
                                  background-color 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease, border-color 0.3s ease`;
    });
    
    // Run animations once on load
    setTimeout(animateOnScroll, 300);
    
    // Add scroll event listener with throttling for better performance
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(function() {
                animateOnScroll();
                scrollTimeout = null;
            }, 20);
        }
    });
    

    
    // Add hover effect to download button
    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('mouseenter', function() {
            this.style.transition = "all 0.3s ease";
            this.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
            this.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.3)";
        });
        
        downloadBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
            this.style.boxShadow = "none";
        });
    }
});

// Assuming this code exists somewhere in your JS file
const shinyEffect = document.querySelector('.shiny-effect');
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
const easeAmount = 0.5; // Lower value = slower movement (try values between 0.01 and 0.1)

// Event listener for mouse movement
document.addEventListener('mousemove', (e) => {
    // Set target position based on cursor
    targetX = e.clientX;
    targetY = e.clientY;
});

// Animation loop for smooth movement
function animateShiny() {
    // Calculate distance between current and target position
    let dx = targetX - currentX;
    let dy = targetY - currentY;
    
    // Move current position a small step toward target position
    currentX += dx * easeAmount;
    currentY += dy * easeAmount;
    
    // Apply the new position to the shiny effect
    shinyEffect.style.left = `${currentX}px`;
    shinyEffect.style.top = `${currentY}px`;
    
    // Continue the animation loop
    requestAnimationFrame(animateShiny);
}

// Start the animation loop
animateShiny();

// Modal functionality
function openModal(img) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    modal.style.display = "block";
    modalImg.src = img.src;
}

// Close modal when clicking the close button
document.querySelector(".close").onclick = function() {
    document.getElementById("imageModal").style.display = "none";
}

// Close modal when clicking outside the image
document.getElementById("imageModal").onclick = function(e) {
    if (e.target === this) {
        this.style.display = "none";
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
        document.getElementById("imageModal").style.display = "none";
    }
});