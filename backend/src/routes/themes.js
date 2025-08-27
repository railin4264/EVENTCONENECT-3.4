const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const { protect } = require('../middleware/auth');

// @route   GET /api/themes/config
// @desc    Obtener configuración de tema del usuario
// @access  Private
router.get('/config', protect, themeController.getThemeConfig);

// @route   PUT /api/themes/config
// @desc    Actualizar configuración de tema
// @access  Private
router.put('/config', protect, themeController.updateThemeConfig);

// @route   GET /api/themes/presets
// @desc    Obtener temas predefinidos
// @access  Private
router.get('/presets', protect, themeController.getPresetThemes);

// @route   POST /api/themes/presets/:themeId/apply
// @desc    Aplicar tema predefinido
// @access  Private
router.post('/presets/:themeId/apply', protect, themeController.applyPresetTheme);

// @route   POST /api/themes/sync
// @desc    Sincronizar tema entre dispositivos
// @access  Private
router.post('/sync', protect, themeController.syncTheme);

module.exports = router;
