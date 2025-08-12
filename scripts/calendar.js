// Calendar Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize calendar data
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    // Calendar navigation
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const monthYearDisplay = document.getElementById('monthYear');
    
    // Week view navigation
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');
    const weekRangeDisplay = document.getElementById('weekRange');
    
    // View toggles
    const viewToggles = document.querySelectorAll('.view-toggle');
    let currentView = 'week';
    
    // Event modal
    const eventModal = document.getElementById('eventModal');
    const closeEventModal = document.getElementById('closeEventModal');
    const eventForm = document.getElementById('eventForm');
    
    // Sample events data
    const sampleEvents = [
        {
            id: 1,
            title: 'Advanced React Patterns',
            type: 'lecture',
            instructor: 'Sarah Chen',
            time: '10:00 AM - 11:30 AM',
            date: new Date(2024, 11, 23),
            description: 'Deep dive into advanced React patterns including HOCs, render props, and custom hooks.',
            attendees: 45,
            maxAttendees: 50,
            tags: ['React', 'JavaScript', 'Frontend']
        },
        {
            id: 2,
            title: 'Python Data Structures',
            type: 'workshop',
            instructor: 'Mike Johnson',
            time: '2:00 PM - 4:00 PM',
            date: new Date(2024, 11, 23),
            description: 'Hands-on workshop covering lists, dictionaries, sets, and tuples in Python.',
            attendees: 32,
            maxAttendees: 40,
            tags: ['Python', 'Data Structures', 'Backend']
        },
        {
            id: 3,
            title: 'Node.js Performance',
            type: 'lecture',
            instructor: 'Alex Rodriguez',
            time: '11:00 AM - 12:30 PM',
            date: new Date(2024, 11, 24),
            description: 'Optimization techniques for Node.js applications including clustering and caching.',
            attendees: 28,
            maxAttendees: 35,
            tags: ['Node.js', 'Performance', 'Backend']
        },
        {
            id: 4,
            title: 'CSS Grid Masterclass',
            type: 'workshop',
            instructor: 'Emma Davis',
            time: '1:00 PM - 3:30 PM',
            date: new Date(2024, 11, 25),
            description: 'Complete guide to CSS Grid layout with practical examples and exercises.',
            attendees: 38,
            maxAttendees: 45,
            tags: ['CSS', 'Layout', 'Frontend']
        },
        {
            id: 5,
            title: 'Database Design Principles',
            type: 'lecture',
            instructor: 'Dr. James Wilson',
            time: '9:00 AM - 10:30 AM',
            date: new Date(2024, 11, 26),
            description: 'Fundamental principles of database design, normalization, and optimization.',
            attendees: 52,
            maxAttendees: 60,
            tags: ['Database', 'SQL', 'Backend']
        }
    ];
    
    // Initialize calendar
    initializeCalendar();
    renderMiniCalendar();
    renderWeekView();
    renderUpcomingEvents();
    
    // Event listeners
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderMiniCalendar();
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderMiniCalendar();
        });
    }
    
    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
            // Navigate to previous week
            const currentWeekStart = getCurrentWeekStart();
            currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            updateWeekView(currentWeekStart);
        });
    }
    
    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', () => {
            // Navigate to next week
            const currentWeekStart = getCurrentWeekStart();
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            updateWeekView(currentWeekStart);
        });
    }
    
    // View toggle functionality
    viewToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            // Remove active from all toggles
            viewToggles.forEach(t => t.classList.remove('active'));
            
            // Add active to clicked toggle
            toggle.classList.add('active');
            
            // Update current view
            currentView = toggle.dataset.view;
            
            // Show/hide appropriate view
            toggleView(currentView);
        });
    });
    
    // Event modal functionality
    if (closeEventModal) {
        closeEventModal.addEventListener('click', closeModal);
    }
    
    if (eventModal) {
        eventModal.addEventListener('click', (e) => {
            if (e.target === eventModal) {
                closeModal();
            }
        });
    }
    
    if (eventForm) {
        eventForm.addEventListener('submit', handleEventSubmit);
    }
    
    function initializeCalendar() {
        const today = new Date();
        updateTodayDisplay(today);
    }
    
    function updateTodayDisplay(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        const todayElement = document.querySelector('.today-date');
        if (todayElement) {
            todayElement.textContent = date.toLocaleDateString('en-US', options);
        }
    }
    
    function renderMiniCalendar() {
        const calendarGrid = document.querySelector('.mini-calendar-grid');
        if (!calendarGrid) return;
        
        // Update month/year display
        if (monthYearDisplay) {
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        }
        
        // Clear existing calendar
        calendarGrid.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            // Highlight today
            const today = new Date();
            if (currentYear === today.getFullYear() && 
                currentMonth === today.getMonth() && 
                day === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Add events indicator
            const dayDate = new Date(currentYear, currentMonth, day);
            const dayEvents = sampleEvents.filter(event => 
                event.date.toDateString() === dayDate.toDateString()
            );
            
            if (dayEvents.length > 0) {
                dayElement.classList.add('has-events');
                const indicator = document.createElement('div');
                indicator.className = 'event-indicator';
                indicator.textContent = dayEvents.length;
                dayElement.appendChild(indicator);
            }
            
            dayElement.addEventListener('click', () => {
                // Navigate to selected day
                selectDay(dayDate);
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    function renderWeekView() {
        const weekGrid = document.querySelector('.week-grid');
        if (!weekGrid) return;
        
        const weekStart = getCurrentWeekStart();
        updateWeekRange(weekStart);
        
        // Clear existing events
        weekGrid.querySelectorAll('.event-block').forEach(block => block.remove());
        
        // Render events for the week
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + i);
            
            const dayEvents = sampleEvents.filter(event => 
                event.date.toDateString() === dayDate.toDateString()
            );
            
            dayEvents.forEach((event, index) => {
                const eventBlock = createEventBlock(event, i, index);
                weekGrid.appendChild(eventBlock);
            });
        }
    }
    
    function createEventBlock(event, dayIndex, eventIndex) {
        const eventBlock = document.createElement('div');
        eventBlock.className = `event-block ${event.type}`;
        eventBlock.style.gridColumn = dayIndex + 2; // +2 because first column is time
        eventBlock.style.gridRow = eventIndex + 2; // +2 to account for header
        
        const timeSlot = getTimeSlot(event.time);
        if (timeSlot) {
            eventBlock.style.gridRow = timeSlot;
        }
        
        eventBlock.innerHTML = `
            <div class="event-time">${event.time}</div>
            <div class="event-title">${event.title}</div>
            <div class="event-instructor">${event.instructor}</div>
            <div class="event-attendees">${event.attendees}/${event.maxAttendees}</div>
        `;
        
        eventBlock.addEventListener('click', () => {
            showEventDetails(event);
        });
        
        return eventBlock;
    }
    
    function getTimeSlot(timeString) {
        // Convert time string to grid row number
        // This is a simplified implementation
        const hour = parseInt(timeString.split(':')[0]);
        const ampm = timeString.includes('PM') ? 'PM' : 'AM';
        
        let gridHour = hour;
        if (ampm === 'PM' && hour !== 12) {
            gridHour += 12;
        } else if (ampm === 'AM' && hour === 12) {
            gridHour = 0;
        }
        
        // Assuming grid starts at 8 AM
        return gridHour - 7;
    }
    
    function renderUpcomingEvents() {
        const upcomingList = document.querySelector('.upcoming-events-list');
        if (!upcomingList) return;
        
        // Sort events by date and take next 5
        const upcoming = sampleEvents
            .filter(event => event.date >= new Date())
            .sort((a, b) => a.date - b.date)
            .slice(0, 5);
        
        upcomingList.innerHTML = '';
        
        upcoming.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'upcoming-event-item';
            eventItem.innerHTML = `
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-details">
                        <span class="event-time">${event.time}</span>
                        <span class="event-instructor">with ${event.instructor}</span>
                    </div>
                    <div class="event-date">${formatDate(event.date)}</div>
                </div>
                <button class="join-btn" onclick="joinEvent(${event.id})">
                    Join (${event.attendees}/${event.maxAttendees})
                </button>
            `;
            
            upcomingList.appendChild(eventItem);
        });
    }
    
    function getCurrentWeekStart() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek);
        return weekStart;
    }
    
    function updateWeekRange(weekStart) {
        if (!weekRangeDisplay) return;
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const options = { month: 'short', day: 'numeric' };
        const startStr = weekStart.toLocaleDateString('en-US', options);
        const endStr = weekEnd.toLocaleDateString('en-US', options);
        
        weekRangeDisplay.textContent = `${startStr} - ${endStr}`;
    }
    
    function updateWeekView(newWeekStart) {
        updateWeekRange(newWeekStart);
        renderWeekView();
    }
    
    function selectDay(date) {
        console.log('Selected day:', date);
        // Update week view to show selected day
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        updateWeekView(weekStart);
    }
    
    function toggleView(view) {
        const weekView = document.querySelector('.week-view');
        const monthView = document.querySelector('.month-view');
        
        if (view === 'week') {
            if (weekView) weekView.style.display = 'block';
            if (monthView) monthView.style.display = 'none';
        } else if (view === 'month') {
            if (weekView) weekView.style.display = 'none';
            if (monthView) monthView.style.display = 'block';
            renderMonthView();
        }
    }
    
    function renderMonthView() {
        // Implement month view rendering
        console.log('Rendering month view');
    }
    
    function showEventDetails(event) {
        const modalTitle = document.getElementById('modalEventTitle');
        const modalInstructor = document.getElementById('modalEventInstructor');
        const modalTime = document.getElementById('modalEventTime');
        const modalDate = document.getElementById('modalEventDate');
        const modalDescription = document.getElementById('modalEventDescription');
        const modalAttendees = document.getElementById('modalEventAttendees');
        const modalTags = document.getElementById('modalEventTags');
        
        if (modalTitle) modalTitle.textContent = event.title;
        if (modalInstructor) modalInstructor.textContent = event.instructor;
        if (modalTime) modalTime.textContent = event.time;
        if (modalDate) modalDate.textContent = formatDate(event.date);
        if (modalDescription) modalDescription.textContent = event.description;
        if (modalAttendees) modalAttendees.textContent = `${event.attendees}/${event.maxAttendees} attendees`;
        
        if (modalTags) {
            modalTags.innerHTML = '';
            event.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'event-tag';
                tagElement.textContent = tag;
                modalTags.appendChild(tagElement);
            });
        }
        
        openModal();
    }
    
    function openModal() {
        if (eventModal) {
            eventModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeModal() {
        if (eventModal) {
            eventModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    function handleEventSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const eventData = {
            title: formData.get('title'),
            type: formData.get('type'),
            instructor: formData.get('instructor'),
            time: formData.get('time'),
            date: new Date(formData.get('date')),
            description: formData.get('description'),
            maxAttendees: parseInt(formData.get('maxAttendees')),
            attendees: 0,
            tags: formData.get('tags').split(',').map(tag => tag.trim())
        };
        
        console.log('Creating new event:', eventData);
        
        // Add to sample events (in real app, this would be an API call)
        sampleEvents.push({
            ...eventData,
            id: sampleEvents.length + 1
        });
        
        // Refresh views
        renderWeekView();
        renderUpcomingEvents();
        
        // Close modal and reset form
        closeModal();
        e.target.reset();
        
        // Show success message
        showNotification('Event created successfully!', 'success');
    }
    
    function formatDate(date) {
        const options = { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-primary);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Filter functionality
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all filter buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            
            // Add active to clicked button
            this.classList.add('active');
            
            // Filter events
            const filterType = this.dataset.filter;
            filterEvents(filterType);
        });
    });
    
    function filterEvents(type) {
        const eventBlocks = document.querySelectorAll('.event-block');
        
        eventBlocks.forEach(block => {
            if (type === 'all' || block.classList.contains(type)) {
                block.style.display = 'block';
            } else {
                block.style.display = 'none';
            }
        });
    }
    
    // Search functionality
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.toLowerCase();
            
            searchTimeout = setTimeout(() => {
                searchEvents(query);
            }, 300);
        });
    }
    
    function searchEvents(query) {
        const eventBlocks = document.querySelectorAll('.event-block');
        
        eventBlocks.forEach(block => {
            const title = block.querySelector('.event-title').textContent.toLowerCase();
            const instructor = block.querySelector('.event-instructor').textContent.toLowerCase();
            
            if (query === '' || title.includes(query) || instructor.includes(query)) {
                block.style.display = 'block';
            } else {
                block.style.display = 'none';
            }
        });
    }
    
    // Create new event button
    const createEventBtn = document.getElementById('createEventBtn');
    if (createEventBtn) {
        createEventBtn.addEventListener('click', () => {
            // Clear form and open modal for new event
            if (eventForm) {
                eventForm.reset();
            }
            openModal();
        });
    }
    
    // Time slot highlighting
    function highlightCurrentTimeSlot() {
        const now = new Date();
        const currentHour = now.getHours();
        
        // Remove previous highlights
        document.querySelectorAll('.time-slot.current').forEach(slot => {
            slot.classList.remove('current');
        });
        
        // Highlight current time slot
        const currentSlot = document.querySelector(`[data-hour="${currentHour}"]`);
        if (currentSlot) {
            currentSlot.classList.add('current');
        }
    }
    
    // Update current time slot every minute
    setInterval(highlightCurrentTimeSlot, 60000);
    highlightCurrentTimeSlot();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'n':
                    e.preventDefault();
                    if (createEventBtn) createEventBtn.click();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (currentView === 'week' && prevWeekBtn) prevWeekBtn.click();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (currentView === 'week' && nextWeekBtn) nextWeekBtn.click();
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// Global functions for HTML onclick handlers
function joinEvent(eventId) {
    console.log('Joining event:', eventId);
    
    const event = sampleEvents.find(e => e.id === eventId);
    if (event && event.attendees < event.maxAttendees) {
        event.attendees++;
        
        // Update UI
        renderUpcomingEvents();
        renderWeekView();
        
        showNotification(`Successfully joined "${event.title}"!`, 'success');
    } else {
        showNotification('Event is full or not found', 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : 'var(--accent-primary)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
