const express = require('express');

const router = express.Router();
const mockController = require('../controllers/mockController');

// ==========================================
// RUTAS MOCK PARA DESARROLLO
// ==========================================

// Health check
router.get('/health', mockController.healthCheck);

// Autenticación
router.post('/auth/login', mockController.login);
router.post('/auth/register', mockController.register);
router.get('/auth/profile', mockController.getProfile);

// Eventos
router.get('/events', mockController.getEvents);
router.get('/events/:id', mockController.getEvent);
router.post('/events', mockController.createEvent);

// Tribus
router.get('/tribes', mockController.getTribes);
router.get('/tribes/:id', mockController.getTribe);

// Posts
router.get('/posts', mockController.getPosts);

module.exports = router;
