const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { DataAPIClient } = require('@datastax/astra-db-ts');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'openrockets_secret_key_2024';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('.'));

// AstraDB Client
const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT);

// Collections
const users = db.collection('users');
const posts = db.collection('posts');
const comments = db.collection('comments');
const events = db.collection('events');
const messages = db.collection('messages');
const notifications = db.collection('notifications');

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

// Initialize collections if they don't exist
async function initializeCollections() {
  try {
    await users.insertOne({ _id: 'test', email: 'test@test.com' });
    await users.deleteOne({ _id: 'test' });
    console.log('Collections initialized successfully');
  } catch (error) {
    console.log('Collections may already exist:', error.message);
  }
}

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, fullName, studentId, role = 'student' } = req.body;

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
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

    await users.insertOne(newUser);

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: newUser._id,
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

    const user = await users.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last active
    await users.updateOne(
      { _id: user._id },
      { $set: { lastActive: new Date().toISOString() } }
    );

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
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
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await users.findOne({ _id: req.user.userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
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
app.put('/api/profile', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const { fullName, status, bio, location, website } = req.body;
    const updateData = { fullName, status, bio, location, website };

    if (req.file) {
      updateData.profilePicture = imageToDataURI(req.file.buffer, req.file.mimetype);
    }

    await users.updateOne(
      { _id: req.user.userId },
      { $set: updateData }
    );

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Create Post
app.post('/api/posts', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { content, tags } = req.body;
    
    const newPost = {
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

    const result = await posts.insertOne(newPost);
    
    // Get the author details
    const author = await users.findOne({ _id: req.user.userId });
    
    res.json({
      success: true,
      post: {
        ...newPost,
        _id: result.insertedId,
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
app.get('/api/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const postList = await posts.find({}, { 
      sort: { createdAt: -1 },
      limit,
      skip 
    }).toArray();

    // Get author details for each post
    for (let post of postList) {
      const author = await users.findOne({ _id: post.authorId });
      post.author = {
        fullName: author.fullName,
        profilePicture: author.profilePicture,
        verified: author.verified
      };
    }

    res.json({ success: true, posts: postList });
  } catch (error) {
    console.error('Posts fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch posts' });
  }
});

// Like/Unlike Post
app.post('/api/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await posts.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const liked = post.likes.includes(userId);
    
    if (liked) {
      await posts.updateOne(
        { _id: postId },
        { $pull: { likes: userId } }
      );
    } else {
      await posts.updateOne(
        { _id: postId },
        { $addToSet: { likes: userId } }
      );
    }

    res.json({ success: true, liked: !liked });
  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle like' });
  }
});

// Add Comment
app.post('/api/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    const newComment = {
      _id: Date.now().toString(),
      authorId: req.user.userId,
      content,
      createdAt: new Date().toISOString()
    };

    await posts.updateOne(
      { _id: postId },
      { $push: { comments: newComment } }
    );

    // Get author details
    const author = await users.findOne({ _id: req.user.userId });
    
    res.json({
      success: true,
      comment: {
        ...newComment,
        author: {
          fullName: author.fullName,
          profilePicture: author.profilePicture,
          verified: author.verified
        }
      }
    });
  } catch (error) {
    console.error('Comment creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
});

// Get Comments for a Post
app.get('/api/posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await posts.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Get author details for each comment
    for (let comment of post.comments) {
      const author = await users.findOne({ _id: comment.authorId });
      comment.author = {
        fullName: author.fullName,
        profilePicture: author.profilePicture,
        verified: author.verified
      };
    }

    res.json({ success: true, comments: post.comments });
  } catch (error) {
    console.error('Comments fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
});

// Create Event
app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const { title, description, date, time, location, type } = req.body;
    
    const newEvent = {
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

    await events.insertOne(newEvent);
    
    res.json({ success: true, event: newEvent });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
});

// Get Events
app.get('/api/events', async (req, res) => {
  try {
    const eventList = await events.find({}, { 
      sort: { date: 1, time: 1 } 
    }).toArray();

    // Get organizer details for each event
    for (let event of eventList) {
      const organizer = await users.findOne({ _id: event.organizerId });
      event.organizer = {
        fullName: organizer.fullName,
        verified: organizer.verified
      };
    }

    res.json({ success: true, events: eventList });
  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events' });
  }
});

// Join Event
app.post('/api/events/:eventId/join', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    await events.updateOne(
      { _id: eventId },
      { $addToSet: { attendees: userId } }
    );

    res.json({ success: true, message: 'Successfully joined event' });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ success: false, message: 'Failed to join event' });
  }
});

// Search
app.get('/api/search', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    const results = {};

    if (type === 'all' || type === 'posts') {
      results.posts = await posts.find({
        $or: [
          { content: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } }
        ]
      }).limit(10).toArray();
    }

    if (type === 'all' || type === 'users') {
      results.users = await users.find({
        $or: [
          { fullName: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ]
      }, {
        projection: { password: 0 }
      }).limit(10).toArray();
    }

    if (type === 'all' || type === 'events') {
      results.events = await events.find({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      }).limit(10).toArray();
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
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
async function startServer() {
  try {
    await initializeCollections();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Access the website at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
