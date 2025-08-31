const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// In-memory storage (replace with actual database)
const users = new Map();
const posts = new Map();
const comments = new Map();
const chatMessages = new Map();
const studyGroups = new Map();
const activeUsers = new Map();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Initialize sample data
const initializeSampleData = () => {
    // Add sample posts
    const samplePosts = [
        {
            id: '1',
            title: 'Getting Started with React Hooks',
            content: 'Just finished learning about useState and useEffect. The way React handles state management is amazing! Here\'s what I learned...',
            author: {
                id: 'user1',
                fullName: 'Sarah Chen',
                profileImage: null,
                verified: true
            },
            category: 'React',
            tags: ['React', 'JavaScript', 'Frontend'],
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            likes: 24,
            shares: 5,
            images: []
        },
        {
            id: '2',
            title: '',
            content: 'Anyone else excited about the new Python 3.12 features? The performance improvements are incredible! 🚀\n\nJust migrated our backend and saw 15% speed improvement.',
            author: {
                id: 'user2',
                fullName: 'Mike Johnson',
                profileImage: null,
                verified: false
            },
            category: 'Python',
            tags: ['Python', 'Backend', 'Performance'],
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            likes: 18,
            shares: 3,
            images: []
        },
        {
            id: '3',
            title: 'My First Machine Learning Project',
            content: 'Built a sentiment analysis model using TensorFlow! It can classify movie reviews as positive or negative with 89% accuracy. Super proud of this milestone 💪',
            author: {
                id: 'user3',
                fullName: 'Emma Davis',
                profileImage: null,
                verified: false
            },
            category: 'Machine Learning',
            tags: ['ML', 'TensorFlow', 'Python', 'NLP'],
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            likes: 42,
            shares: 12,
            images: []
        }
    ];

    samplePosts.forEach(post => {
        posts.set(post.id, post);
    });

    // Add sample users
    const sampleUsers = [
        { id: 'user1', fullName: 'Sarah Chen', status: 'online' },
        { id: 'user2', fullName: 'Mike Johnson', status: 'coding' },
        { id: 'user3', fullName: 'Emma Davis', status: 'studying' },
        { id: 'guest', fullName: 'Guest User', status: 'browsing' }
    ];

    sampleUsers.forEach(user => {
        users.set(user.id, user);
    });

    console.log('✅ Sample data initialized');
};

// JWT middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // Allow guest access for community features
        req.user = { userId: 'guest', fullName: 'Guest User', role: 'guest' };
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key', (err, user) => {
        if (err) {
            req.user = { userId: 'guest', fullName: 'Guest User', role: 'guest' };
        } else {
            req.user = user;
        }
        next();
    });
};

// Community API Routes
app.get('/api/community/posts', async (req, res) => {
    try {
        const { category, tag, author } = req.query;
        let filteredPosts = Array.from(posts.values());
        
        // Apply filters
        if (category && category !== 'all') {
            filteredPosts = filteredPosts.filter(post => 
                post.category.toLowerCase() === category.toLowerCase()
            );
        }
        
        if (tag) {
            filteredPosts = filteredPosts.filter(post => 
                post.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
            );
        }
        
        if (author) {
            filteredPosts = filteredPosts.filter(post => 
                post.author.fullName.toLowerCase().includes(author.toLowerCase())
            );
        }
        
        // Sort by creation date (newest first)
        filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json({ 
            posts: filteredPosts,
            total: filteredPosts.length
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.post('/api/posts', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const postData = JSON.parse(req.body.data || '{}');
        const imageFiles = req.files || [];
        
        // Generate unique ID
        const postId = uuidv4();
        
        // Process uploaded images
        const imageUrls = imageFiles.map(file => `/uploads/${file.filename}`);
        
        // Create post object
        const newPost = {
            id: postId,
            title: postData.title || '',
            content: postData.content,
            category: postData.category || 'general',
            tags: postData.tags || [],
            author: {
                id: req.user?.userId || 'guest',
                fullName: postData.author?.fullName || 'Anonymous',
                profileImage: postData.author?.profileImage || null,
                verified: false
            },
            images: imageUrls,
            createdAt: new Date().toISOString(),
            likes: 0,
            shares: 0
        };
        
        // Store post
        posts.set(postId, newPost);
        
        // Broadcast to all connected clients
        io.emit('new-post', newPost);
        
        res.status(201).json({ 
            success: true,
            post: newPost
        });
        
        console.log(`📝 New post created: ${postId}`);
        
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

app.post('/api/community/posts/:postId/like', async (req, res) => {
    try {
        const { postId } = req.params;
        const post = posts.get(postId);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // In a real implementation, you'd track which users liked which posts
        post.likes = (post.likes || 0) + 1;
        posts.set(postId, post);
        
        // Broadcast like update
        io.emit('post-liked', { postId, likes: post.likes });
        
        res.json({ 
            success: true,
            likes: post.likes
        });
        
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Failed to like post' });
    }
});

app.get('/api/community/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const postComments = comments.get(postId) || [];
        
        res.json({ 
            comments: postComments,
            total: postComments.length
        });
        
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

app.post('/api/community/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        
        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Comment content is required' });
        }
        
        const post = posts.get(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        const commentId = uuidv4();
        const newComment = {
            id: commentId,
            content: content.trim(),
            author: {
                id: req.user?.userId || 'guest',
                fullName: req.user?.fullName || 'Anonymous',
                profileImage: req.user?.profileImage || null
            },
            createdAt: new Date().toISOString(),
            likes: 0
        };
        
        // Add comment to post
        const postComments = comments.get(postId) || [];
        postComments.push(newComment);
        comments.set(postId, postComments);
        
        // Broadcast new comment
        io.emit('new-comment', { postId, comment: newComment });
        
        res.status(201).json({ 
            success: true,
            comment: newComment
        });
        
        console.log(`💬 New comment on post ${postId}: ${commentId}`);
        
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their rooms
    socket.on('join-user', (userData) => {
        socket.userId = userData.userId;
        socket.username = userData.username;
        
        // Add to active users
        activeUsers.set(socket.id, {
            userId: userData.userId,
            username: userData.username,
            status: 'online',
            lastSeen: new Date()
        });

        // Join general chat
        socket.join('general');

        // Broadcast user joined
        io.emit('user-status-update', {
            userId: userData.userId,
            username: userData.username,
            status: 'online'
        });

        // Send online users count
        io.emit('online-count-update', activeUsers.size);
    });

    // Handle chat messages
    socket.on('send-message', (data) => {
        const message = {
            id: uuidv4(),
            userId: socket.userId,
            username: socket.username,
            message: data.message,
            channel: data.channel || 'general',
            timestamp: new Date(),
            type: 'message'
        };

        // Save message
        const channels = chatMessages.get('channels') || new Map();
        const channelMessages = channels.get(data.channel) || [];
        channelMessages.push(message);
        channels.set(data.channel, channelMessages);
        chatMessages.set('channels', channels);

        // Broadcast to channel
        io.to(data.channel).emit('new-message', message);
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
        socket.to(data.channel).emit('user-typing', {
            userId: socket.userId,
            username: socket.username,
            channel: data.channel
        });
    });

    socket.on('typing-stop', (data) => {
        socket.to(data.channel).emit('user-stop-typing', {
            userId: socket.userId,
            channel: data.channel
        });
    });

    // Handle real-time post updates
    socket.on('post-like', (data) => {
        io.emit('post-update', {
            type: 'like',
            postId: data.postId,
            userId: socket.userId,
            timestamp: new Date()
        });
    });

    socket.on('new-comment', (data) => {
        io.emit('post-update', {
            type: 'comment',
            postId: data.postId,
            comment: data.comment,
            timestamp: new Date()
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove from active users
        const userData = activeUsers.get(socket.id);
        if (userData) {
            activeUsers.delete(socket.id);
            
            // Broadcast user offline
            io.emit('user-status-update', {
                userId: userData.userId,
                username: userData.username,
                status: 'offline'
            });

            // Send updated online count
            io.emit('online-count-update', activeUsers.size);
        }
    });
});

// API Routes

// Authentication
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user (simplified - implement proper authentication)
        const user = Array.from(users.values()).find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                profileImage: user.profileImage,
                verified: user.verified,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Posts
app.get('/api/posts', async (req, res) => {
    try {
        const { category, limit = 20, offset = 0 } = req.query;
        
        let filteredPosts = Array.from(posts.values());
        
        if (category && category !== 'all') {
            filteredPosts = filteredPosts.filter(post => post.category === category);
        }

        // Add author information
        const postsWithAuthors = filteredPosts.map(post => {
            const author = users.get(post.authorId);
            return {
                ...post,
                author: {
                    id: author.id,
                    fullName: author.fullName,
                    profileImage: author.profileImage,
                    verified: author.verified
                }
            };
        });

        // Sort by date
        postsWithAuthors.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Paginate
        const paginatedPosts = postsWithAuthors.slice(offset, offset + parseInt(limit));

        res.json({
            posts: paginatedPosts,
            total: filteredPosts.length,
            hasMore: offset + parseInt(limit) < filteredPosts.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.post('/api/posts', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { title, content, category, tags, visibility = 'public' } = req.body;

        if (!content || !category) {
            return res.status(400).json({ error: 'Content and category are required' });
        }

        const postId = uuidv4();
        const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const post = {
            id: postId,
            authorId: req.user.userId,
            title: title || '',
            content,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            images: imageUrls,
            likes: 0,
            shares: 0,
            visibility,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        posts.set(postId, post);

        // Broadcast new post
        const author = users.get(req.user.userId);
        io.emit('new-post', {
            ...post,
            author: {
                id: author.id,
                fullName: author.fullName,
                profileImage: author.profileImage,
                verified: author.verified
            }
        });

        res.status(201).json({ 
            message: 'Post created successfully', 
            post: {
                ...post,
                author: {
                    id: author.id,
                    fullName: author.fullName,
                    profileImage: author.profileImage,
                    verified: author.verified
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

app.post('/api/posts/:postId/like', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const post = posts.get(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Toggle like (simplified - implement proper like tracking)
        post.likes += 1;
        post.updatedAt = new Date();
        
        posts.set(postId, post);

        // Broadcast like update
        io.emit('post-like-update', {
            postId,
            likes: post.likes,
            likedBy: req.user.userId
        });

        res.json({ 
            message: 'Post liked successfully',
            likes: post.likes
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to like post' });
    }
});

// Comments
app.get('/api/posts/:postId/comments', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.params;
        
        const postComments = Array.from(comments.values())
            .filter(comment => comment.postId === postId)
            .map(comment => {
                const author = users.get(comment.authorId);
                return {
                    ...comment,
                    author: {
                        id: author.id,
                        fullName: author.fullName,
                        profileImage: author.profileImage
                    }
                };
            })
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        res.json({ comments: postComments });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

app.post('/api/posts/:postId/comments', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        const commentId = uuidv4();
        const comment = {
            id: commentId,
            postId,
            authorId: req.user.userId,
            content,
            likes: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        comments.set(commentId, comment);

        // Broadcast new comment
        const author = users.get(req.user.userId);
        io.emit('new-comment', {
            ...comment,
            author: {
                id: author.id,
                fullName: author.fullName,
                profileImage: author.profileImage
            }
        });

        res.status(201).json({ 
            message: 'Comment added successfully',
            comment: {
                ...comment,
                author: {
                    id: author.id,
                    fullName: author.fullName,
                    profileImage: author.profileImage
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Chat
app.get('/api/chat/messages/:channel', authenticateToken, async (req, res) => {
    try {
        const { channel } = req.params;
        const { limit = 50 } = req.query;

        const channels = chatMessages.get('channels') || new Map();
        const channelMessages = channels.get(channel) || [];
        
        const recentMessages = channelMessages
            .slice(-parseInt(limit))
            .reverse();

        res.json({ messages: recentMessages });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Study Groups
app.get('/api/study-groups', authenticateToken, async (req, res) => {
    try {
        const groups = Array.from(studyGroups.values())
            .filter(group => group.isPublic)
            .map(group => ({
                ...group,
                isMember: group.members.includes(req.user.userId)
            }));

        res.json({ groups });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch study groups' });
    }
});

app.post('/api/study-groups/:groupId/join', authenticateToken, async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = studyGroups.get(groupId);

        if (!group) {
            return res.status(404).json({ error: 'Study group not found' });
        }

        if (!group.members.includes(req.user.userId)) {
            group.members.push(req.user.userId);
            group.memberCount = group.members.length;
            studyGroups.set(groupId, group);

            // Broadcast group update
            io.emit('study-group-update', {
                groupId,
                type: 'member-joined',
                memberCount: group.memberCount
            });
        }

        res.json({ message: 'Joined study group successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to join study group' });
    }
});

// Active Users
app.get('/api/users/active', authenticateToken, async (req, res) => {
    try {
        const active = Array.from(activeUsers.values())
            .map(userData => {
                const user = users.get(userData.userId);
                return {
                    id: userData.userId,
                    fullName: user?.fullName || userData.username,
                    status: userData.status,
                    lastSeen: userData.lastSeen
                };
            });

        res.json({ users: active, count: active.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch active users' });
    }
});

// Trending Topics
app.get('/api/trending', authenticateToken, async (req, res) => {
    try {
        // Calculate trending topics based on recent posts and activity
        const recentPosts = Array.from(posts.values())
            .filter(post => {
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return new Date(post.createdAt) > dayAgo;
            });

        const topicCount = new Map();
        
        recentPosts.forEach(post => {
            // Count by category
            const category = post.category;
            topicCount.set(category, (topicCount.get(category) || 0) + 1);
            
            // Count by tags
            post.tags.forEach(tag => {
                topicCount.set(tag, (topicCount.get(tag) || 0) + 1);
            });
        });

        const trending = Array.from(topicCount.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([topic, count], index) => ({
                rank: index + 1,
                topic,
                posts: count,
                trend: Math.random() > 0.5 ? 'up' : 'down' // Simulate trend
            }));

        res.json({ trending });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trending topics' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date(),
        activeConnections: activeUsers.size
    });
});

// Initialize sample data
initializeSampleData();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Community server running on port ${PORT}`);
    console.log(`📡 WebSocket server ready for real-time features`);
});
