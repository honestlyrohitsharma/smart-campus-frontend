// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    const actionCards = document.querySelectorAll('.action-card');

    // Navigation between sections
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        navButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        const targetButton = document.querySelector(`[data-section="${sectionId}"]`);
        
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }

    // Add click listeners to navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Add click listeners to action cards
    actionCards.forEach(card => {
        card.addEventListener('click', () => {
            const sectionId = card.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Campus Map functionality
    const buildings = document.querySelectorAll('.building');
    const locationInfo = document.getElementById('locationInfo');
    const locationName = document.getElementById('locationName');
    const locationDetails = document.getElementById('locationDetails');
    const closeInfoBtn = document.getElementById('closeInfo');
    const locationSearch = document.getElementById('locationSearch');
    const searchBtn = document.getElementById('searchBtn');
    const mapFilters = document.querySelectorAll('.map-filters .filter-btn');

    // Building click functionality
    buildings.forEach(building => {
        building.addEventListener('click', () => {
            const name = building.getAttribute('data-name');
            const info = building.getAttribute('data-info');
            
            locationName.textContent = name;
            locationDetails.textContent = info;
            locationInfo.classList.remove('hidden');
        });
    });

    // Close location info
    closeInfoBtn.addEventListener('click', () => {
        locationInfo.classList.add('hidden');
    });

    // Location search functionality
    function searchLocation() {
        const searchTerm = locationSearch.value.toLowerCase();
        let found = false;

        buildings.forEach(building => {
            const name = building.getAttribute('data-name').toLowerCase();
            const info = building.getAttribute('data-info').toLowerCase();
            
            if (name.includes(searchTerm) || info.includes(searchTerm)) {
                building.style.border = '3px solid #e74c3c';
                building.style.backgroundColor = '#fff3cd';
                
                if (!found) {
                    building.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    found = true;
                }
            } else {
                building.style.border = '';
                building.style.backgroundColor = '';
            }
        });

        if (!found && searchTerm) {
            alert('Location not found. Please try a different search term.');
        }
    }

    searchBtn.addEventListener('click', searchLocation);
    locationSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchLocation();
        }
    });

    // Map filter functionality
    mapFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            mapFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            
            const filterType = filter.getAttribute('data-filter');
            
            buildings.forEach(building => {
                if (filterType === 'all' || building.classList.contains(filterType)) {
                    building.style.display = 'flex';
                } else {
                    building.style.display = 'none';
                }
            });
        });
    });

    // Announcements filtering
    const announcementFilters = document.querySelectorAll('.announcement-filters .filter-btn');
    const announcementCards = document.querySelectorAll('.announcement-card');

    announcementFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            announcementFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            
            const filterType = filter.getAttribute('data-filter');
            
            announcementCards.forEach(card => {
                if (filterType === 'all' || card.classList.contains(filterType)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Directory functionality
    const directorySearch = document.getElementById('directorySearch');
    const departmentFilter = document.getElementById('departmentFilter');
    const contactCards = document.querySelectorAll('.contact-card');

    function filterDirectory() {
        const searchTerm = directorySearch.value.toLowerCase();
        const selectedDepartment = departmentFilter.value;

        contactCards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const designation = card.querySelector('.designation').textContent.toLowerCase();
            const department = card.querySelector('.department').textContent.toLowerCase();
            const cardClass = card.className.split(' ')[1]; // Get department class
            
            const matchesSearch = name.includes(searchTerm) || 
                                designation.includes(searchTerm) || 
                                department.includes(searchTerm);
            
            const matchesDepartment = selectedDepartment === 'all' || 
                                    cardClass === selectedDepartment;
            
            if (matchesSearch && matchesDepartment) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    directorySearch.addEventListener('input', filterDirectory);
    departmentFilter.addEventListener('change', filterDirectory);

    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    const faqSearch = document.getElementById('faqSearch');
    const categoryButtons = document.querySelectorAll('.category-btn');

    // FAQ accordion functionality
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => faq.classList.remove('active'));
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // FAQ search functionality
    function filterFAQs() {
        const searchTerm = faqSearch.value.toLowerCase();
        const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
            const itemClass = item.className.split(' ')[1]; // Get category class
            
            const matchesSearch = question.includes(searchTerm) || answer.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || itemClass === activeCategory;
            
            if (matchesSearch && matchesCategory) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    faqSearch.addEventListener('input', filterFAQs);

    // FAQ category filtering
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterFAQs();
        });
    });

    // Smooth scrolling for footer links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add loading animation for better UX
    function showLoading(element) {
        element.style.opacity = '0.5';
        element.style.pointerEvents = 'none';
    }

    function hideLoading(element) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
    }

    // Add search highlighting
    function highlightSearchTerm(text, term) {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Initialize tooltips for buildings
    buildings.forEach(building => {
        building.setAttribute('title', building.getAttribute('data-info'));
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            locationInfo.classList.add('hidden');
            faqItems.forEach(item => item.classList.remove('active'));
        }
    });

    // Add responsive menu toggle for mobile
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // Add transition to header
    header.style.transition = 'transform 0.3s ease-in-out';

    console.log('SVIST Smart Campus Assistant loaded successfully!');
});
