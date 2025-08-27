const express = require('express');

const { AppError } = require('../middleware/errorHandler');
const { User } = require('../models');

const router = express.Router();

// Simple auth guard that expects req.user
const requireAuth = (req, res, next) => {
  if (!req.user) return next(new AppError('Autenticación requerida', 401));
  next();
};

// POST /api/watchlist/sync
// Body: { items: [{ id: string, updatedAt: string }], updatedAt: string }
// Server applies last-write-wins by comparing timestamps
router.post('/sync', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items = [], updatedAt } = req.body || {};

    const user = await User.findById(userId).select(
      'watchlist watchlistUpdatedAt'
    );
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const clientUpdatedAt = new Date(updatedAt || 0).getTime();
    const serverUpdatedAt = new Date(user.watchlistUpdatedAt || 0).getTime();

    // Ensure fields exist
    user.watchlist = Array.isArray(user.watchlist) ? user.watchlist : [];

    if (clientUpdatedAt >= serverUpdatedAt) {
      // Accept client state
      const dedup = new Map();
      for (const it of items) {
        if (it && it.id)
          dedup.set(it.id, {
            id: it.id,
            updatedAt: it.updatedAt || new Date().toISOString(),
          });
      }
      user.watchlist = Array.from(dedup.values());
      user.watchlistUpdatedAt = new Date();
      await user.save();
    }

    return res.json({
      success: true,
      data: {
        items: user.watchlist || [],
        updatedAt: user.watchlistUpdatedAt || new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
