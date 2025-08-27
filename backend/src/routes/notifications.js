const express = require('express');
const router = express.Router();
const { notificationController } = require('../controllers');

// Test route to see if notificationController is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Notifications route working',
    controller: typeof notificationController,
    methods: Object.keys(notificationController || {})
  });
});

module.exports = router;
