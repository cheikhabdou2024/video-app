const { sequelize } = require('../models/index');
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Video, User } = require('../models/index'); // Changed import
const authMiddleware = require('../middleware/auth');

// Middleware
router.use(authMiddleware);

// Validation Rules (unchanged)
const videoValidationRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title must be < 100 chars'),
  body('url')
    .isURL().withMessage('Must be a valid URL')
    .matches(/\.(mp4|mov|avi)$/).withMessage('Only video URLs allowed'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
];

// GET Endpoint (unchanged)
router.get('/', async (req, res) => {

  try {
    const videos = await Video.findAll({
      include: {
        model: User,
        attributes: ['id', 'username'],
        as: 'author'
      },
     
      order: [['createdAt', 'DESC']]
    });
    res.json(videos);
  } catch (error) {
    console.error('Failed to fetch videos:', error);
    res.status(500).json({ error: 'Failed to load videos' });
  }
});

// Updated POST Endpoint
router.post('/', videoValidationRules, async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    // Create transaction for atomic operation
    const result = await sequelize.transaction(async (t) => {
      const video = await Video.create({
        title: req.body.title,
        url: req.body.url,
        description: req.body.description,
        userId: req.user.id
      }, { transaction: t });

      const videoWithAuthor = await Video.findByPk(video.id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }],
        transaction: t
      });

      return videoWithAuthor;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Video creation failed:', error);
    
    // Specific error handling
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ error: 'Invalid user reference' });
    }
    
    res.status(500).json({ 
      error: 'Failed to create video',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;