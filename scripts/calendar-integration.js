// Calendar Page Integration with Backend
document.addEventListener('DOMContentLoaded', async function() {
    // Ensure user is authenticated
    if (!api.requireAuth()) return;

    // Load calendar data
    await loadCalendarData();
    
    // Set up event creation for instructors
    setupEventCreation();
    
    // Set up real-time updates
    setupCalendarUpdates();
});

// Global events storage
let allEvents = [];

async function loadCalendarData() {
    try {
        // Show loading state
        showCalendarLoading(true);
        
        // Load events from backend
        const response = await api.getEvents();
        allEvents = response.events || [];
        
        // Render calendar components
        renderMiniCalendar();
        renderWeekView();
        renderUpcomingEvents();
        
    } catch (error) {
        console.error('Failed to load calendar data:', error);
        api.showNotification('Failed to load calendar data', 'error');
    } finally {
        showCalendarLoading(false);
    }
}

function renderMiniCalendar() {
    const calendarGrid = document.querySelector('.mini-calendar-grid');
    if (!calendarGrid) return;
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Update month/year display
    const monthYearDisplay = document.getElementById('monthYear');
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
        if (currentYear === today.getFullYear() && 
            currentMonth === today.getMonth() && 
            day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Add events indicator
        const dayDate = new Date(currentYear, currentMonth, day);
        const dayEvents = allEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === dayDate.toDateString();
        });
        
        if (dayEvents.length > 0) {
            dayElement.classList.add('has-events');
            const indicator = document.createElement('div');
            indicator.className = 'event-indicator';
            indicator.textContent = dayEvents.length;
            dayElement.appendChild(indicator);
        }
        
        dayElement.addEventListener('click', () => {
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
        
        const dayEvents = allEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === dayDate.toDateString();
        });
        
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
    
    // Calculate position based on time
    const timeSlot = getTimeSlot(event.startTime);
    if (timeSlot) {
        eventBlock.style.gridRow = timeSlot;
    } else {
        eventBlock.style.gridRow = eventIndex + 2; // Fallback positioning
    }
    
    const isJoined = event.attendees && event.attendees.includes(api.currentUser.id);
    const isFull = event.attendees && event.attendees.length >= event.maxAttendees;
    
    eventBlock.innerHTML = `
        <div class="event-time">${event.startTime} - ${event.endTime}</div>
        <div class="event-title">${event.title}</div>
        <div class="event-instructor">with ${event.instructor.fullName}</div>
        <div class="event-attendees">
            ${event.attendees ? event.attendees.length : 0}/${event.maxAttendees}
            ${isJoined ? '<i class="fas fa-check-circle joined"></i>' : ''}
        </div>
        <div class="event-actions">
            ${!isJoined && !isFull ? 
                `<button class="join-btn" onclick="joinCalendarEvent('${event.id}')">Join</button>` :
                isJoined ? 
                `<button class="joined-btn" disabled>Joined</button>` :
                `<button class="full-btn" disabled>Full</button>`
            }
        </div>
    `;
    
    eventBlock.addEventListener('click', (e) => {
        // Don't show details if clicking on join button
        if (!e.target.classList.contains('join-btn')) {
            showEventDetails(event);
        }
    });
    
    return eventBlock;
}

function getTimeSlot(timeString) {
    try {
        // Parse time string (e.g., "10:00 AM" or "2:30 PM")
        const [time, period] = timeString.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        
        let hour24 = hours;
        if (period === 'PM' && hours !== 12) {
            hour24 += 12;
        } else if (period === 'AM' && hours === 12) {
            hour24 = 0;
        }
        
        // Grid starts at 8 AM (row 2), each hour is one row
        const gridRow = hour24 - 7; // 8 AM = row 2, 9 AM = row 3, etc.
        
        if (gridRow >= 2 && gridRow <= 24) {
            return gridRow;
        }
    } catch (error) {
        console.error('Error parsing time:', timeString);
    }
    
    return null;
}

function renderUpcomingEvents() {
    const upcomingList = document.querySelector('.upcoming-events-list');
    if (!upcomingList) return;
    
    // Filter and sort upcoming events
    const now = new Date();
    const upcoming = allEvents
        .filter(event => {
            const eventDate = new Date(`${event.date} ${event.startTime}`);
            return eventDate >= now;
        })
        .sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.startTime}`);
            const dateB = new Date(`${b.date} ${b.startTime}`);
            return dateA - dateB;
        })
        .slice(0, 5);
    
    upcomingList.innerHTML = '';
    
    if (upcoming.length === 0) {
        upcomingList.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-plus"></i>
                <p>No upcoming events</p>
                ${api.currentUser.userType === 'instructor' ? 
                    '<button class="btn-primary small" onclick="openCreateEventModal()">Create Event</button>' : 
                    '<a href="#" class="btn-primary small">Browse Classes</a>'
                }
            </div>
        `;
        return;
    }
    
    upcoming.forEach(event => {
        const eventItem = document.createElement('div');
        eventItem.className = 'upcoming-event-item';
        
        const isJoined = event.attendees && event.attendees.includes(api.currentUser.id);
        const isFull = event.attendees && event.attendees.length >= event.maxAttendees;
        
        eventItem.innerHTML = `
            <div class="event-info">
                <div class="event-title">${event.title}</div>
                <div class="event-details">
                    <span class="event-time">${event.startTime} - ${event.endTime}</span>
                    <span class="event-instructor">with ${event.instructor.fullName}</span>
                </div>
                <div class="event-date">${formatEventDate(event.date)}</div>
                <div class="event-tags">
                    ${event.tags ? event.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
            <div class="event-action">
                ${!isJoined && !isFull ? 
                    `<button class="join-btn" onclick="joinCalendarEvent('${event.id}')">
                        Join (${event.attendees ? event.attendees.length : 0}/${event.maxAttendees})
                    </button>` :
                    isJoined ? 
                    `<button class="joined-btn" disabled>
                        <i class="fas fa-check"></i> Joined
                    </button>` :
                    `<button class="full-btn" disabled>
                        Full (${event.attendees.length}/${event.maxAttendees})
                    </button>`
                }
            </div>
        `;
        
        upcomingList.appendChild(eventItem);
    });
}

function setupEventCreation() {
    // Only show create event button for instructors
    const createEventBtn = document.getElementById('createEventBtn');
    if (createEventBtn) {
        if (api.currentUser.userType === 'instructor') {
            createEventBtn.style.display = 'block';
        } else {
            createEventBtn.style.display = 'none';
        }
    }
    
    // Set up event creation form
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const submitBtn = e.target.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            
            try {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
                submitBtn.disabled = true;
                
                const eventData = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    type: formData.get('type'),
                    startTime: formData.get('startTime'),
                    endTime: formData.get('endTime'),
                    date: formData.get('date'),
                    maxAttendees: parseInt(formData.get('maxAttendees')),
                    tags: formData.get('tags')
                };
                
                await api.createEvent(eventData);
                
                api.showNotification('Event created successfully!', 'success');
                closeEventModal();
                
                // Reload calendar data
                await loadCalendarData();
                
            } catch (error) {
                api.showNotification(error.message, 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

function setupCalendarUpdates() {
    // Set up filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter events
            const filterType = this.dataset.filter;
            filterEvents(filterType);
        });
    });
    
    // Set up search
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
    
    // Set up periodic updates
    setInterval(async () => {
        try {
            await loadCalendarData();
        } catch (error) {
            console.error('Failed to update calendar:', error);
        }
    }, 60000); // Update every minute
}

function filterEvents(type) {
    const eventBlocks = document.querySelectorAll('.event-block');
    
    eventBlocks.forEach(block => {
        if (type === 'all' || block.classList.contains(type)) {
            block.style.display = 'block';
        } else {
            block.style.display = 'none';
        }
    });
    
    // Also filter upcoming events
    const upcomingItems = document.querySelectorAll('.upcoming-event-item');
    upcomingItems.forEach(item => {
        const eventTitle = item.querySelector('.event-title').textContent.toLowerCase();
        const shouldShow = type === 'all' || 
                         (type === 'lecture' && eventTitle.includes('lecture')) ||
                         (type === 'workshop' && eventTitle.includes('workshop')) ||
                         (type === 'lab' && eventTitle.includes('lab'));
        
        item.style.display = shouldShow ? 'block' : 'none';
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

// Global functions for calendar interactions
window.joinCalendarEvent = async (eventId) => {
    try {
        await api.joinEvent(eventId);
        api.showNotification('Successfully joined event!', 'success');
        
        // Reload calendar data
        await loadCalendarData();
        
    } catch (error) {
        api.showNotification(error.message, 'error');
    }
};

window.showEventDetails = (event) => {
    const modal = document.getElementById('eventModal');
    if (!modal) return;
    
    // Populate modal with event details
    const modalTitle = document.getElementById('modalEventTitle');
    const modalInstructor = document.getElementById('modalEventInstructor');
    const modalTime = document.getElementById('modalEventTime');
    const modalDate = document.getElementById('modalEventDate');
    const modalDescription = document.getElementById('modalEventDescription');
    const modalAttendees = document.getElementById('modalEventAttendees');
    const modalTags = document.getElementById('modalEventTags');
    
    if (modalTitle) modalTitle.textContent = event.title;
    if (modalInstructor) modalInstructor.textContent = event.instructor.fullName;
    if (modalTime) modalTime.textContent = `${event.startTime} - ${event.endTime}`;
    if (modalDate) modalDate.textContent = formatEventDate(event.date);
    if (modalDescription) modalDescription.textContent = event.description;
    if (modalAttendees) modalAttendees.textContent = `${event.attendees ? event.attendees.length : 0}/${event.maxAttendees} attendees`;
    
    if (modalTags) {
        modalTags.innerHTML = '';
        if (event.tags) {
            event.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'event-tag';
                tagElement.textContent = tag;
                modalTags.appendChild(tagElement);
            });
        }
    }
    
    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
};

window.openCreateEventModal = () => {
    const modal = document.getElementById('eventModal');
    if (modal) {
        // Clear existing content and show create form
        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2><i class="fas fa-plus"></i> Create New Event</h2>
                <button class="close-modal" onclick="closeEventModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="eventForm" class="event-form">
                <div class="form-group">
                    <label for="eventTitle">Event Title</label>
                    <input type="text" id="eventTitle" name="title" required>
                </div>
                <div class="form-group">
                    <label for="eventDescription">Description</label>
                    <textarea id="eventDescription" name="description" rows="3" required></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="eventType">Type</label>
                        <select id="eventType" name="type" required>
                            <option value="lecture">Lecture</option>
                            <option value="workshop">Workshop</option>
                            <option value="lab">Lab Session</option>
                            <option value="seminar">Seminar</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="maxAttendees">Max Attendees</label>
                        <input type="number" id="maxAttendees" name="maxAttendees" min="1" max="100" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="eventDate">Date</label>
                        <input type="date" id="eventDate" name="date" required>
                    </div>
                    <div class="form-group">
                        <label for="startTime">Start Time</label>
                        <input type="time" id="startTime" name="startTime" required>
                    </div>
                    <div class="form-group">
                        <label for="endTime">End Time</label>
                        <input type="time" id="endTime" name="endTime" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="eventTags">Tags (comma-separated)</label>
                    <input type="text" id="eventTags" name="tags" placeholder="React, JavaScript, Frontend">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeEventModal()">Cancel</button>
                    <button type="submit" class="btn-primary submit-btn">
                        <i class="fas fa-plus"></i>
                        Create Event
                    </button>
                </div>
            </form>
        `;
        
        // Re-setup form handler
        setupEventCreation();
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
};

window.closeEventModal = () => {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
};

// Helper functions
function getCurrentWeekStart() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    return weekStart;
}

function updateWeekRange(weekStart) {
    const weekRangeDisplay = document.getElementById('weekRange');
    if (!weekRangeDisplay) return;
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    const startStr = weekStart.toLocaleDateString('en-US', options);
    const endStr = weekEnd.toLocaleDateString('en-US', options);
    
    weekRangeDisplay.textContent = `${startStr} - ${endStr}`;
}

function selectDay(date) {
    console.log('Selected day:', date);
    // Could implement day view or filter events for selected day
}

function formatEventDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function showCalendarLoading(show) {
    const loadingElements = document.querySelectorAll('.week-grid, .upcoming-events-list, .mini-calendar-grid');
    
    loadingElements.forEach(element => {
        if (show) {
            api.showLoadingSpinner(element, true);
        } else {
            api.showLoadingSpinner(element, false);
        }
    });
}
