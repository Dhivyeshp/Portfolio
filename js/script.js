// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation items
    const navItems = document.querySelectorAll('.nav-item');
    
    // Add click event to each navigation item
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all navigation items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get the section to show
            const sectionId = this.getAttribute('data-section');
            
            // Hide all content sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the selected section
            document.getElementById(sectionId).classList.add('active');
            
            // Scroll to the top of the section
            document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Resume download button functionality
    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            // In a real scenario, this would link to your resume file
            alert('Resume download functionality would be implemented here.');
            // Example: window.open('path/to/your/resume.pdf', '_blank');
        });
    }
    
    // Project links functionality
    const projectLinks = document.querySelectorAll('.project-link');
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                alert('This would link to your project.');
            }
        });
    });
    
    // Social links functionality
    const socialLinks = document.querySelectorAll('.social-item');
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                const socialType = this.querySelector('span').textContent;
                alert(`This would link to your ${socialType} profile.`);
            }
        });
    });
});

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add animation effects for elements when they come into view
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

// Initialize animation properties
document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.job-card, .project-card, .education-card, .skill-item');
    
    elements.forEach(element => {
        element.style.opacity = 0;
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // Run once on load
    animateOnScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', animateOnScroll);
});
