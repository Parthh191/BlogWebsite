const express = require('express');
const https = require('https');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const prisma = new PrismaClient();

// SSL/TLS certificates
const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

// Middleware for parsing JSON with increased limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Update CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Access-Control-Allow-Origin']
}));

const secretKey='Rathithika is a good atrist and she is a great atrist'

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "tyagiparth800@gmail.com",
    pass: "avbsjwvanvrelisg",
  }
});

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
// Modified registration route with better email template
app.post('/api/register', async (req, res) => {
  try {
    const { email, username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role,
        verificationToken,
        verificationExpiry
      }
    });

    const verificationLink = `https://localhost:${PORT}/api/verify/${verificationToken}`;
    
    // Enhanced email template
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Raththika Art Gallery - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Raththika Art Gallery!</h2>
          <p>Hello ${username},</p>
          <p>Thank you for registering. Please click the button below to verify your email and start exploring amazing artworks:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
               Verify Email
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p>${verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `
    });

    res.json({ message: 'Registration successful. Please check your email to verify your account.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Modified verification endpoint with automatic login
app.get('/api/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { verificationToken: token }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    if (user.verificationExpiry < new Date()) {
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
        verificationExpiry: null
      }
    });

    // Generate JWT token for automatic login
    const authToken = jwt.sign({ id: user.id, role: user.role }, secretKey);

    // Redirect to frontend with token
    res.redirect(`http://localhost:5173/home`);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    const user = await prisma.user.findUnique({ 
      where: { username } 
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Invalid password' 
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        username: user.username 
      }, 
      secretKey,
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      role: user.role,
      username: user.username,
      message: 'Login successful'
    }); 
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

app.post('/api/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, verificationExpiry }
    });

    const verificationLink = `https://localhost:${PORT}/api/verify/${verificationToken}`;
    await transporter.sendMail({
      from: "tyagiparth800@gmail.com",
      to: email,
      subject: 'Verify your email',
      html: `Please click this link to verify your email: <a href="${verificationLink}">${verificationLink}</a>`
    });

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Artwork Routes
app.post('/api/artworks', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can post artworks' });
    }

    const { title, description, imageUrl } = req.body;
    const artwork = await prisma.artwork.create({
      data: {
        title,
        description,
        imageUrl,
        authorId: req.user.id
      }
    });
    res.json(artwork);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/artworks', async (req, res) => {
  try {
    const artworks = await prisma.artwork.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        author: {
          select: {
            username: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true
          }
        }
      }
    });
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comments Routes
app.get('/api/artworks/:artworkId/comments', async (req, res) => {
  try {
    const { artworkId } = req.params;
    if (!artworkId) {
      return res.status(400).json({ error: 'Artwork ID is required' });
    }

    const comments = await prisma.comment.findMany({
      where: {
        artworkId
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedComments = comments.map(comment => ({
      id: comment.id,          // Changed from _id to id
      text: comment.content,
      user: comment.user.username,
      createdAt: comment.createdAt
    }));

    res.json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/artworks/:artworkId/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const { artworkId } = req.params;

    if (!content || !artworkId) {
      return res.status(400).json({ error: 'Content and artwork ID are required' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user.id,
        artworkId
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    });

    res.json({
      id: comment.id,          // Changed from _id to id
      text: comment.content,
      user: comment.user.username,
      createdAt: comment.createdAt
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(400).json({ error: error.message });
  }
});

// Add this new endpoint before the error handling middleware
app.delete('/api/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    // First check if the comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { user: true }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if the user is the comment author
    if (comment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId }
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Add check-like endpoint
app.get('/api/artworks/:artworkId/check-like', authenticateToken, async (req, res) => {
  try {
    const { artworkId } = req.params;
    const userId = req.user.id;

    const like = await prisma.like.findFirst({
      where: {
        artworkId,
        userId,
      },
    });

    res.json({ isLiked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: 'Failed to check like status' });
  }
});

// Update likes endpoint to handle both like and unlike in one endpoint
app.post('/api/artworks/:artworkId/likes', authenticateToken, async (req, res) => {
  try {
    const { artworkId } = req.params;
    const userId = req.user.id;

    // Check if like exists
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        artworkId
      }
    });

    // Toggle like status
    if (existingLike) {
      // Unlike: Delete existing like
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });
    } else {
      // Like: Create new like
      await prisma.like.create({
        data: {
          userId,
          artworkId
        }
      });
    }

    // Get updated like count
    const updatedArtwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      select: {
        _count: {
          select: { likes: true }
        }
      }
    });

    // Return new like status and count
    res.json({
      isLiked: !existingLike,
      likeCount: updatedArtwork._count.likes
    });

  } catch (error) {
    console.error('Error handling like:', error);
    res.status(400).json({ error: 'Failed to update like status' });
  }
});

// Shares Routes
app.post('/api/artworks/:artworkId/shares', authenticateToken, async (req, res) => {
  try {
    const share = await prisma.share.create({
      data: {
        userId: req.user.id,
        artworkId: req.params.artworkId
      }
    });
    res.json(share);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Create HTTPS server
const httpsServer = https.createServer(options, app);

// Update server listening
const PORT = 3000;
httpsServer.listen(PORT, () => {
    console.log(`HTTPS server is running on https://localhost:${PORT}`);
});
