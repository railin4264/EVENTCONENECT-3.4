const { User } = require('../models');
const { logger } = require('../utils/logger');

class ThemeController {
  // ==========================================
  // CONFIGURACIÓN DE TEMA
  // ==========================================

  async getThemeConfig(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select('themeConfig');
      const themeConfig = user?.themeConfig || {
        mode: 'light',
        primaryColor: '#3B82F6',
        secondaryColor: '#6B7280',
        accentColor: '#10B981',
        fontSize: 'medium',
        fontFamily: 'Inter',
        borderRadius: 'medium',
        animations: true,
        reducedMotion: false,
      };

      res.json({
        success: true,
        data: themeConfig,
      });
    } catch (error) {
      logger.error('Error obteniendo configuración de tema:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo configuración de tema',
        error: error.message,
      });
    }
  }

  async updateThemeConfig(req, res) {
    try {
      const userId = req.user.id;
      const themeConfig = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { themeConfig },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Configuración de tema actualizada exitosamente',
        data: updatedUser.themeConfig,
      });
    } catch (error) {
      logger.error('Error actualizando configuración de tema:', error);
      res.status(500).json({
        success: false,
        message: 'Error actualizando configuración de tema',
        error: error.message,
      });
    }
  }

  // ==========================================
  // TEMAS PREDEFINIDOS
  // ==========================================

  async getPresetThemes(req, res) {
    try {
      const presetThemes = [
        {
          id: 'default',
          name: 'Tema Predeterminado',
          description: 'Tema claro con colores azules',
          config: {
            mode: 'light',
            primaryColor: '#3B82F6',
            secondaryColor: '#6B7280',
            accentColor: '#10B981',
            fontSize: 'medium',
            fontFamily: 'Inter',
            borderRadius: 'medium',
            animations: true,
            reducedMotion: false,
          },
        },
        {
          id: 'dark',
          name: 'Tema Oscuro',
          description: 'Tema oscuro elegante',
          config: {
            mode: 'dark',
            primaryColor: '#60A5FA',
            secondaryColor: '#9CA3AF',
            accentColor: '#34D399',
            fontSize: 'medium',
            fontFamily: 'Inter',
            borderRadius: 'medium',
            animations: true,
            reducedMotion: false,
          },
        },
        {
          id: 'high-contrast',
          name: 'Alto Contraste',
          description: 'Tema optimizado para accesibilidad',
          config: {
            mode: 'light',
            primaryColor: '#000000',
            secondaryColor: '#333333',
            accentColor: '#FF6B35',
            fontSize: 'large',
            fontFamily: 'Arial',
            borderRadius: 'none',
            animations: false,
            reducedMotion: true,
          },
        },
        {
          id: 'minimal',
          name: 'Minimalista',
          description: 'Tema limpio y simple',
          config: {
            mode: 'light',
            primaryColor: '#374151',
            secondaryColor: '#9CA3AF',
            accentColor: '#6B7280',
            fontSize: 'medium',
            fontFamily: 'Inter',
            borderRadius: 'small',
            animations: false,
            reducedMotion: true,
          },
        },
      ];

      res.json({
        success: true,
        data: presetThemes,
      });
    } catch (error) {
      logger.error('Error obteniendo temas predefinidos:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo temas predefinidos',
        error: error.message,
      });
    }
  }

  async applyPresetTheme(req, res) {
    try {
      const userId = req.user.id;
      const { themeId } = req.params;

      const presetThemes = [
        {
          id: 'default',
          config: {
            mode: 'light',
            primaryColor: '#3B82F6',
            secondaryColor: '#6B7280',
            accentColor: '#10B981',
            fontSize: 'medium',
            fontFamily: 'Inter',
            borderRadius: 'medium',
            animations: true,
            reducedMotion: false,
          },
        },
        {
          id: 'dark',
          config: {
            mode: 'dark',
            primaryColor: '#60A5FA',
            secondaryColor: '#9CA3AF',
            accentColor: '#34D399',
            fontSize: 'medium',
            fontFamily: 'Inter',
            borderRadius: 'medium',
            animations: true,
            reducedMotion: false,
          },
        },
        {
          id: 'high-contrast',
          config: {
            mode: 'light',
            primaryColor: '#000000',
            secondaryColor: '#333333',
            accentColor: '#FF6B35',
            fontSize: 'large',
            fontFamily: 'Arial',
            borderRadius: 'none',
            animations: false,
            reducedMotion: true,
          },
        },
        {
          id: 'minimal',
          config: {
            mode: 'light',
            primaryColor: '#374151',
            secondaryColor: '#9CA3AF',
            accentColor: '#6B7280',
            fontSize: 'medium',
            fontFamily: 'Inter',
            borderRadius: 'small',
            animations: false,
            reducedMotion: true,
          },
        },
      ];

      const selectedTheme = presetThemes.find(theme => theme.id === themeId);
      if (!selectedTheme) {
        return res.status(404).json({
          success: false,
          message: 'Tema predefinido no encontrado',
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { themeConfig: selectedTheme.config },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Tema predefinido aplicado exitosamente',
        data: updatedUser.themeConfig,
      });
    } catch (error) {
      logger.error('Error aplicando tema predefinido:', error);
      res.status(500).json({
        success: false,
        message: 'Error aplicando tema predefinido',
        error: error.message,
      });
    }
  }

  // ==========================================
  // SINCRONIZACIÓN DE TEMA
  // ==========================================

  async syncTheme(req, res) {
    try {
      const userId = req.user.id;
      const { deviceId, themeConfig } = req.body;

      // Actualizar configuración de tema
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { 
          themeConfig,
          lastThemeSync: new Date(),
        },
        { new: true }
      );

      res.json({
        success: true,
        message: 'Tema sincronizado exitosamente',
        data: {
          themeConfig: updatedUser.themeConfig,
          lastSync: updatedUser.lastThemeSync,
        },
      });
    } catch (error) {
      logger.error('Error sincronizando tema:', error);
      res.status(500).json({
        success: false,
        message: 'Error sincronizando tema',
        error: error.message,
      });
    }
  }
}

module.exports = new ThemeController();
