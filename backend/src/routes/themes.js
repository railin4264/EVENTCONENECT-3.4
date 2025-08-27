const express = require('express');

const router = express.Router();
const themeController = require('../controllers/themeController');
const { auth } = require('../middleware');

// @route   GET /api/themes/config
// @desc    Obtener configuración de tema del usuario
// @access  Private
router.get('/config', auth, themeController.getThemeConfig);

// @route   PUT /api/themes/config
// @desc    Actualizar configuración de tema
// @access  Private
router.put('/config', auth, themeController.updateThemeConfig);

// @route   GET /api/themes/presets
// @desc    Obtener temas predefinidos
// @access  Private
router.get('/presets', auth, themeController.getPresetThemes);

// @route   POST /api/themes/presets/:themeId/apply
// @desc    Aplicar tema predefinido
// @access  Private
router.post('/presets/:themeId/apply', auth, themeController.applyPresetTheme);

// @route   POST /api/themes/sync
// @desc    Sincronizar tema entre dispositivos
// @access  Private
router.post('/sync', auth, themeController.syncTheme);

module.exports = router;
