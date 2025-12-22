// Global state
let currentSlide = 0;
let currentDate = new Date(2024, 6, 9); // July 9, 2024
let selectedService = null;
let selectedDate = null;
let selectedTime = null;

const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initScrollAnimations();
    initCarousel();
    initCalendar();
    initServiceCards();
    initTimeSlots();
    initContactItems();
    initModal();
});

// Header scroll effect
function initHeader() {
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Logo click scrolls to top
    header.querySelector('div').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Scroll to booking section
function scrollToBooking() {
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Intersection Observer for scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate service cards with delay
                if (entry.target.classList.contains('services-section')) {
                    const cards = entry.target.querySelectorAll('.service-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('visible');
                        }, index * 100);
                    });
                }
                
                // Animate testimonial cards with delay
                if (entry.target.classList.contains('testimonials-section')) {
                    const cards = entry.target.querySelectorAll('.testimonial-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('visible');
                        }, index * 150);
                    });
                }
                
                // Animate contact items with delay
                if (entry.target.classList.contains('contacts-section')) {
                    const items = entry.target.querySelectorAll('.contact-item');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Carousel functionality
function initCarousel() {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;

    const totalSlides = carousel.children.length;

    // Auto-play carousel
    setInterval(() => {
        moveCarousel(1);
    }, 5000);
}

function moveCarousel(direction) {
    const carousel = document.getElementById('carousel');
    if (!carousel) return;

    const totalSlides = carousel.children.length;
    currentSlide += direction;
    
    if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    } else if (currentSlide >= totalSlides) {
        currentSlide = 0;
    }
    
    carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// Calendar functionality
function initCalendar() {
    renderCalendar();
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const calendarMonthEl = document.getElementById('calendarMonth');
    if (calendarMonthEl) {
        calendarMonthEl.textContent = `${monthNames[month]} ${year}`;
    }

    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;

    calendarDays.innerHTML = '';

    // Adjust for Monday as first day
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    // Previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day past';
        day.textContent = prevMonthDays - i;
        calendarDays.appendChild(day);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        const date = new Date(year, month, i);
        date.setHours(0, 0, 0, 0);
        
        if (date.getTime() === today.getTime()) {
            day.className = 'calendar-day today';
        } else if (date < today) {
            day.className = 'calendar-day past';
        } else {
            day.className = 'calendar-day future';
            day.addEventListener('click', () => selectDate(i));
        }
        
        day.textContent = i;
        calendarDays.appendChild(day);
    }

    // Fill remaining cells
    const totalCells = calendarDays.children.length;
    const remaining = 42 - totalCells; // 6 rows * 7 days
    for (let i = 1; i <= remaining; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day past';
        day.textContent = i;
        calendarDays.appendChild(day);
    }
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    selectedDate = null;
    selectedTime = null;
    updateTimeSlots();
    renderCalendar();
    hideConfirmButton();
}

function selectDate(day) {
    // Remove previous selection
    document.querySelectorAll('.calendar-day').forEach(d => {
        if (d.classList.contains('selected')) {
            d.classList.remove('selected');
            if (d.classList.contains('today')) {
                d.classList.add('today');
            }
        }
    });

    // Add selection to clicked day
    const clickedDay = Array.from(document.querySelectorAll('.calendar-day'))
        .find(d => d.textContent == day && d.classList.contains('future'));
    
    if (clickedDay) {
        clickedDay.classList.add('selected');
        clickedDay.classList.remove('future');
    }

    selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    updateTimeSlotsTitle();
    updateTimeSlots();
    hideConfirmButton();
}

function updateTimeSlotsTitle() {
    const titleEl = document.querySelector('.time-slots-title');
    if (titleEl && selectedDate) {
        const day = selectedDate.getDate();
        const month = monthNames[selectedDate.getMonth()];
        titleEl.textContent = `Доступное время - ${day} ${month}`;
    }
}

// Service cards selection
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove previous selection
            serviceCards.forEach(c => c.classList.remove('selected'));
            
            // Add selection
            card.classList.add('selected');
            
            // Get service name and price
            const serviceName = card.querySelector('h3').textContent;
            const servicePrice = card.querySelector('.price').textContent;
            selectedService = { name: serviceName, price: servicePrice };
            
            // Scroll to booking if not already there
            const bookingSection = document.getElementById('booking');
            const rect = bookingSection.getBoundingClientRect();
            if (rect.top > window.innerHeight || rect.bottom < 0) {
                bookingSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Time slots selection
function initTimeSlots() {
    const timeSlots = document.querySelectorAll('.time-slot:not(.unavailable)');
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            // Remove previous selection
            document.querySelectorAll('.time-slot').forEach(s => {
                s.classList.remove('selected');
            });
            
            // Add selection
            this.classList.add('selected');
            selectedTime = this.textContent;
            
            // Show confirm button if date and time are selected
            if (selectedDate && selectedTime) {
                showConfirmButton();
            }
        });
    });
}

function updateTimeSlots() {
    // Simulate different available times for different dates
    const timeSlotsGrid = document.querySelector('.time-slots-grid');
    if (!timeSlotsGrid) return;

    const times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    const unavailableTimes = selectedDate ? 
        (selectedDate.getDate() % 3 === 0 ? ['12:00', '16:00'] : ['12:00']) : 
        ['12:00', '16:00'];

    timeSlotsGrid.innerHTML = '';
    times.forEach(time => {
        const slot = document.createElement('button');
        slot.className = 'time-slot';
        if (unavailableTimes.includes(time)) {
            slot.classList.add('unavailable');
        } else {
            slot.addEventListener('click', function() {
                document.querySelectorAll('.time-slot').forEach(s => {
                    s.classList.remove('selected');
                });
                this.classList.add('selected');
                selectedTime = this.textContent;
                if (selectedDate && selectedTime) {
                    showConfirmButton();
                }
            });
        }
        slot.textContent = time;
        timeSlotsGrid.appendChild(slot);
    });
}

function showConfirmButton() {
    let confirmBtn = document.querySelector('.confirm-booking-btn');
    if (!confirmBtn) {
        const timeSlots = document.querySelector('.time-slots');
        confirmBtn = document.createElement('button');
        confirmBtn.className = 'confirm-booking-btn';
        confirmBtn.textContent = 'Подтвердить запись';
        confirmBtn.addEventListener('click', confirmBooking);
        timeSlots.appendChild(confirmBtn);
    }
    confirmBtn.classList.add('visible');
}

function hideConfirmButton() {
    const confirmBtn = document.querySelector('.confirm-booking-btn');
    if (confirmBtn) {
        confirmBtn.classList.remove('visible');
    }
}

// Contact items interaction
function initContactItems() {
    const phoneItem = document.querySelector('.contact-item');
    if (phoneItem) {
        phoneItem.addEventListener('click', () => {
            window.location.href = 'tel:+74951234567';
        });
    }

    const instagramItem = Array.from(document.querySelectorAll('.contact-item'))[1];
    if (instagramItem) {
        instagramItem.addEventListener('click', () => {
            window.open('https://instagram.com/blackbeard.bshop', '_blank');
        });
    }

    const addressItem = Array.from(document.querySelectorAll('.contact-item'))[2];
    if (addressItem) {
        addressItem.addEventListener('click', () => {
            window.open('https://maps.google.com/?q=Москва, ул. Тверская, 1', '_blank');
        });
    }
}

// Modal functionality
function initModal() {
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function confirmBooking() {
    if (!selectedDate || !selectedTime) {
        alert('Пожалуйста, выберите дату и время');
        return;
    }

    const modal = document.getElementById('bookingModal');
    if (!modal) return;

    // Update modal content
    const day = selectedDate.getDate();
    const month = monthNames[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    
    const serviceInfo = selectedService ? 
        `<p><strong>Услуга:</strong> ${selectedService.name} - ${selectedService.price}</p>` : 
        '<p><strong>Услуга:</strong> Не выбрана</p>';

    const detailsHTML = `
        ${serviceInfo}
        <p><strong>Дата:</strong> ${day} ${month} ${year}</p>
        <p><strong>Время:</strong> ${selectedTime}</p>
    `;

    const detailsEl = modal.querySelector('.booking-details');
    if (detailsEl) {
        detailsEl.innerHTML = detailsHTML;
    }

    // Show modal
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Make functions globally available for onclick handlers
window.scrollToBooking = scrollToBooking;
window.moveCarousel = moveCarousel;
window.changeMonth = changeMonth;


