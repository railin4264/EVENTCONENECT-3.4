const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { locationService } = require('../services/LocationService');

// Validar y normalizar dirección
router.post('/validate-address', protect, async (req, res) => {
  try {
    const { address } = req.body;
    const result = await locationService.validateAndNormalizeAddress(address);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Buscar lugares cercanos
router.get('/nearby-places', protect, async (req, res) => {
  try {
    const { lat, lng, radius, types } = req.query;
    const places = await locationService.findNearbyPlaces(
      parseFloat(lat), 
      parseFloat(lng), 
      parseInt(radius), 
      types?.split(',')
    );
    res.json({ success: true, data: places });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Calcular ruta
router.post('/calculate-route', protect, async (req, res) => {
  try {
    const { origin, destination, mode } = req.body;
    const route = await locationService.calculateRoute(origin, destination, mode);
    res.json({ success: true, data: route });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Autocompletar dirección
router.get('/autocomplete', protect, async (req, res) => {
  try {
    const { input, sessionToken } = req.query;
    const suggestions = await locationService.autocompleteAddress(input, sessionToken);
    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;