const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'openrockets_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('.'));

// In-memory storage for demo (replace with AstraDB later)
let users = [];
let posts = [];
let events = [];
let comments = [];

// Helper function to convert image to DataURI
function imageToDataURI(imageBuffer, mimeType) {
  return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
}

// Multer setup for image uploads (in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, fullName, studentId, role = 'student' } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      fullName,
      studentId,
      role,
      profilePicture: '',
      status: '',
      verified: false,
      joinedDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      bio: '',
      location: '',
      website: ''
    };

    users.push(newUser);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
        verified: newUser.verified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last active
    user.lastActive = new Date().toISOString();

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        verified: user.verified,
        profilePicture: user.profilePicture,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Get User Profile
app.get('/api/profile', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        studentId: user.studentId,
        role: user.role,
        profilePicture: user.profilePicture,
        status: user.status,
        verified: user.verified,
        bio: user.bio,
        location: user.location,
        website: user.website,
        joinedDate: user.joinedDate
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
});

// Update User Profile
app.put('/api/profile', authenticateToken, upload.single('profilePicture'), (req, res) => {
  try {
    const { fullName, status, bio, location, website } = req.body;
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.fullName = fullName || user.fullName;
    user.status = status || user.status;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.website = website || user.website;

    if (req.file) {
      user.profilePicture = imageToDataURI(req.file.buffer, req.file.mimetype);
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Create Post
app.post('/api/posts', authenticateToken, upload.single('image'), (req, res) => {
  try {
    const { content, tags } = req.body;
    
    const newPost = {
      id: Date.now().toString(),
      authorId: req.user.userId,
      content,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (req.file) {
      newPost.image = imageToDataURI(req.file.buffer, req.file.mimetype);
    }

    posts.push(newPost);
    
    // Get the author details
    const author = users.find(u => u.id === req.user.userId);
    
    res.json({
      success: true,
      post: {
        ...newPost,
        author: {
          fullName: author.fullName,
          profilePicture: author.profilePicture,
          verified: author.verified
        }
      }
    });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

// Get Posts
app.get('/api/posts', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const sortedPosts = posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const postList = sortedPosts.slice(startIndex, endIndex);

    // Get author details for each post
    postList.forEach(post => {
      const author = users.find(u => u.id === post.authorId);
      post.author = {
        fullName: author ? author.fullName : 'Unknown User',
        profilePicture: author ? author.profilePicture : '',
        verified: author ? author.verified : false
      };
    });

    res.json({ success: true, posts: postList });
  } catch (error) {
    console.error('Posts fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

// Like/Unlike Post
app.post('/api/posts/:postId/like', authenticateToken, (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(userId);
    const liked = likeIndex === -1;
    
    if (liked) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    res.json({ success: true, liked });
  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle like' });
  }
});

// Create Event
app.post('/api/events', authenticateToken, (req, res) => {
  try {
    const { title, description, date, time, location, type } = req.body;
    
    const newEvent = {
      id: Date.now().toString(),
      title,
      description,
      date,
      time,
      location,
      type,
      organizerId: req.user.userId,
      attendees: [],
      createdAt: new Date().toISOString()
    };

    events.push(newEvent);
    
    res.json({ success: true, event: newEvent });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

// Get Events
app.get('/api/events', (req, res) => {
  try {
    // Sort events by date and time
    const sortedEvents = events.sort((a, b) => {
      const dateA = new Date(a.date + ' ' + a.time);
      const dateB = new Date(b.date + ' ' + b.time);
      return dateA - dateB;
    });

    // Get organizer details for each event
    sortedEvents.forEach(event => {
      const organizer = users.find(u => u.id === event.organizerId);
      event.organizer = {
        fullName: organizer ? organizer.fullName : 'Unknown User',
        verified: organizer ? organizer.verified : false
      };
    });

    res.json({ success: true, events: sortedEvents });
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// Join Event
app.post('/api/events/:eventId/join', authenticateToken, (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (!event.attendees.includes(userId)) {
      event.attendees.push(userId);
    }

    res.json({ success: true, message: 'Successfully joined event' });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ success: false, message: 'Failed to join event' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OpenRockets LMS Server running on port ${PORT}`);
  console.log(`📚 Access the website at: http://localhost:${PORT}`);
  console.log(`🔧 API endpoints available at: http://localhost:${PORT}/api/`);
});
