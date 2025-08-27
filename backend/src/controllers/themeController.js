const { User } = require('../models');

class ThemeController {
  async getThemeConfig(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await User.findById(userId).select('preferences.theme');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const defaultTheme = {
        mode: 'dark',
        primaryColor: 'cyan',
        accentColor: 'purple'
      };

      const themeConfig = user.preferences?.theme || defaultTheme;

      res.json({
        success: true,
        data: {
          theme: themeConfig
        }
      });
    } catch (error) {
      console.error('Error obteniendo configuración de tema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async updateThemeConfig(req, res) {
    try {
      const userId = req.user.id;
      const themeConfig = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'preferences.theme': themeConfig
          }
        },
        { new: true, runValidators: true }
      ).select('preferences.theme');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Tema actualizado',
        data: {
          theme: user.preferences.theme
        }
      });
    } catch (error) {
      console.error('Error actualizando tema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getPresetThemes(req, res) {
    try {
      const presetThemes = [
        {
          id: 'dark',
          name: 'Dark Mode',
          config: {
            mode: 'dark',
            primaryColor: 'cyan',
            accentColor: 'purple'
          }
        },
        {
          id: 'light',
          name: 'Light Mode',
          config: {
            mode: 'light',
            primaryColor: 'blue',
            accentColor: 'green'
          }
        }
      ];

      res.json({
        success: true,
        data: { themes: presetThemes }
      });
    } catch (error) {
      console.error('Error obteniendo temas predefinidos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async applyPresetTheme(req, res) {
    try {
      const userId = req.user.id;
      const { themeId } = req.params;

      const presetThemes = [
        {
          id: 'dark',
          config: {
            mode: 'dark',
            primaryColor: 'cyan',
            accentColor: 'purple'
          }
        },
        {
          id: 'light',
          config: {
            mode: 'light',
            primaryColor: 'blue',
            accentColor: 'green'
          }
        }
      ];

      const selectedTheme = presetThemes.find(theme => theme.id === themeId);

      if (!selectedTheme) {
        return res.status(404).json({
          success: false,
          message: 'Tema predefinido no encontrado'
        });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'preferences.theme': selectedTheme.config
          }
        },
        { new: true, runValidators: true }
      ).select('preferences.theme');

      res.json({
        success: true,
        message: 'Tema aplicado correctamente',
        data: {
          theme: user.preferences.theme
        }
      });
    } catch (error) {
      console.error('Error aplicando tema predefinido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async syncTheme(req, res) {
    try {
      const userId = req.user.id;
      const { deviceId, platform } = req.body;

      const user = await User.findById(userId).select('preferences.theme');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Tema sincronizado',
        data: {
          theme: user.preferences.theme,
          deviceId,
          platform
        }
      });
    } catch (error) {
      console.error('Error sincronizando tema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = new ThemeController();
