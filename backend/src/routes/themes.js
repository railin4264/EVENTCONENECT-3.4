const express = require('express');

const router = express.Router();
const themeController = require('../controllers/themeController');
const { authenticateToken } = require('../middleware/authMiddleware');

// @route   GET /api/themes/config
// @desc    Obtener configuración de tema del usuario
// @access  Private
router.get('/config', authenticateToken, themeController.getThemeConfig);

// @route   PUT /api/themes/config
// @desc    Actualizar configuración de tema
// @access  Private
router.put('/config', authenticateToken, themeController.updateThemeConfig);

// @route   GET /api/themes/presets
// @desc    Obtener temas predefinidos
// @access  Private
router.get('/presets', authenticateToken, themeController.getPresetThemes);

// @route   POST /api/themes/presets/:themeId/apply
// @desc    Aplicar tema predefinido
// @access  Private
router.post('/presets/:themeId/apply', authenticateToken, themeController.applyPresetTheme);

// @route   POST /api/themes/sync
// @desc    Sincronizar tema entre dispositivos
// @access  Private
router.post('/sync', authenticateToken, themeController.syncTheme);

module.exports = router;
