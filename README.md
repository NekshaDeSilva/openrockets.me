# OpenRockets LMS - Complete Learning Management System

A modern, full-stack Learning Management System built with Node.js, Express, and AstraDB. Features include user authentication, course management, community interactions, real-time messaging, and calendar-based event scheduling.

![preview](https://github.com/user-attachments/assets/c6b74ca6-0056-41fe-b895-41ccc0d123cc)

### Coding meets collaboration. Level up your skills through weekly challenges, open-source teamwork, live sessions, Discussions & peer events!

## 🚀 Features

### Authentication & User Management
- **User Registration & Login** with JWT authentication
- **Profile Management** with image upload (converted to DataURI)
- **Role-based Access** (Student Learners & Student Lecturers)
- **Verified Status** system
- **User Status** indicators (online, busy, studying, coding, etc.)

### Community Features
- **Post Creation** with rich content, images, and tags
- **Comments System** with likes and replies
- **Real-time Interactions** 
- **Trending Topics** and hashtag support
- **Study Groups** functionality
- **User Search** and discovery

### Calendar & Events
- **Event Scheduling** (for instructors)
- **Calendar Views** (week, month, mini-calendar)
- **Event Registration** with capacity limits
- **Real-time Updates** of event status
- **Event Filtering** by type and category

### Messaging System
- **Direct Messaging** between users
- **Message History** persistence
- **Real-time Notifications**
- **Message Status** tracking

### Dashboard Features
- **Personalized Dashboard** with progress tracking
- **Upcoming Events** overview
- **Community Highlights**
- **Study Statistics** and progress bars
- **Quick Actions** for common tasks

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **AstraDB** (Cassandra) for data persistence
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Multer** for file uploads
- **CORS** for cross-origin requests

### Frontend
- **Vanilla JavaScript** (ES6+)
- **CSS3** with CSS Grid and Flexbox
- **Font Awesome** for icons
- **Google Fonts** (Inter, Space Mono)
- **Responsive Design** for all devices

### Database Collections
- `users` - User profiles and authentication
- `posts` - Community posts and content
- `comments` - Post comments and replies
- `events` - Calendar events and classes
- `messages` - Direct messages between users
- `notifications` - System notifications
- `study_groups` - Study group management
- `user_progress` - Learning progress tracking

## 📁 Project Structure

```
openrockets.me/
├── server.js                 # Main backend server
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables
├── landing.html              # Landing page
├── dashboard.html            # User dashboard
├── community.html            # Community page
├── calendar.html             # Calendar page
├── about.html               # About page (PDF viewer)
├── scripts/
│   ├── api.js               # API client and utilities
│   ├── auth.js              # Authentication modals and forms
│   ├── landing.js           # Landing page interactions
│   ├── dashboard.js         # Dashboard UI functionality
│   ├── dashboard-integration.js # Dashboard backend integration
│   ├── community.js         # Community UI functionality
│   ├── community-integration.js # Community backend integration
│   ├── calendar.js          # Calendar UI functionality
│   └── calendar-integration.js  # Calendar backend integration
├── styles/
│   ├── lms-main.css         # Landing page styles
│   ├── dashboard.css        # Dashboard styles
│   ├── community.css        # Community styles
│   ├── calendar.css         # Calendar styles
│   ├── components.css       # Shared components
│   ├── main.css            # Global styles
│   └── responsive.css       # Mobile responsiveness
└── v/                      # Static assets (images, etc.)
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- AstraDB account and database

### 1. Clone and Install
```bash
git clone <repository-url>
cd openrockets.me
npm install
```

### 2. Environment Setup
The `.env` file is already configured with AstraDB credentials:
```env
ASTRA_DB_ID=35eb48e5-0472-4568-9f3d-a452a1c8ab2c
ASTRA_DB_KEYSPACE=default_keyspace
ASTRA_DB_API_ENDPOINT=https://35eb48e5-0472-4568-9f3d-a452a1c8ab2c-eu-west-1.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN=AstraCS:lNoNTboZjvbvFGrJWTyJwZqp:8a244f6afa4acf88c1a43b4c9e25e6a56dc384caa5176b3141e93dc9375c5c4a
```

### 3. Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 4. Access the Application
- Open http://localhost:3000 in your browser
- Create an account or sign in
- Explore the features!

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Posts & Community
- `POST /api/posts` - Create new post
- `GET /api/posts` - Get posts (with filtering)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment
- `GET /api/posts/:id/comments` - Get comments

### Events & Calendar
- `POST /api/events` - Create new event (instructors only)
- `GET /api/events` - Get events (with filtering)
- `POST /api/events/:id/join` - Join event

### Messaging
- `POST /api/messages` - Send message
- `GET /api/messages/:userId` - Get conversation

### Search & Discovery
- `GET /api/search` - Search posts, events, and users

## 🎨 UI Features

### Design System
- **Dark Mode** by default with Microsoft Teams inspiration
- **Responsive Layout** that works on all devices
- **Smooth Animations** and micro-interactions
- **Consistent Typography** using Inter and Space Mono fonts
- **Programming-focused** color scheme and iconography

### Interactive Elements
- **Modal Dialogs** for forms and details
- **Loading States** with spinners and skeletons
- **Toast Notifications** for user feedback
- **Dropdown Menus** for navigation
- **Image Galleries** with lightbox functionality
- **Real-time Updates** without page refresh

### Accessibility
- **Keyboard Navigation** support
- **ARIA Labels** for screen readers
- **Focus Management** in modals
- **Color Contrast** compliance
- **Responsive Text** sizing

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **Password Hashing** using bcryptjs
- **Input Validation** on frontend and backend
- **File Upload Security** with type checking
- **CORS Configuration** for cross-origin requests
- **SQL Injection Prevention** through parameterized queries

## 📱 Mobile Support

- **Responsive Grid** layouts
- **Touch-friendly** interface elements
- **Mobile-optimized** navigation
- **Swipe Gestures** for image galleries
- **Adaptive Typography** for small screens

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm start
```

### Environment Variables
Make sure to set these in production:
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT tokens
- `ASTRA_DB_*` - AstraDB connection details

## 📖 Usage Guide

### For Students (Learners)
1. **Register** with your email and create a profile
2. **Browse Events** in the calendar to find interesting classes
3. **Join Classes** by clicking the join button
4. **Participate** in community discussions
5. **Track Progress** on your dashboard

### For Students (Lecturers)
1. **Register** as a "Student Lecturer"
2. **Create Events** using the calendar interface
3. **Manage Attendees** and event capacity
4. **Share Knowledge** through community posts
5. **Monitor Engagement** through analytics

### Community Interaction
1. **Create Posts** with rich content and images
2. **Comment and Like** to engage with content
3. **Use Hashtags** to categorize content
4. **Join Study Groups** for collaborative learning
5. **Follow Trending Topics** to stay updated

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify AstraDB credentials in `.env`
   - Check network connectivity
   - Ensure keyspace exists

2. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify user credentials

3. **File Upload Problems**
   - Check file size (max 5MB)
   - Verify file type (images only)
   - Ensure proper form encoding

### Development Tips

- Use browser DevTools for debugging
- Check console for JavaScript errors
- Monitor network requests in DevTools
- Use Postman for API testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**OpenRockets LMS** - Empowering the next generation of programmers through collaborative learning! 🚀

#### OpenRockets.me is the present official domain of the OpenRockets Open-Source Software Foundation, though this may be subject to change in the future.
=======
<a href="https://openrockets.me/v/2025"><img src="https://openrockets.me/v/gitstarts2025v.png"></a>
