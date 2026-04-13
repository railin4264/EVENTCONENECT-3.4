const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

// Configuración del transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar conexión
transporter.verify(function (error, success) {
  if (error) {
    logger.error('Error verificando email:', error);
  } else {
    logger.info('Servidor de email listo');
  }
});

// Función para enviar email de bienvenida
const sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'EventConnect <noreply@eventconnect.com>',
      to: user.email,
      subject: '¡Bienvenido a EventConnect! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">¡Bienvenido a EventConnect!</h1>
          <p>Hola ${user.firstName || user.username},</p>
          <p>¡Gracias por unirte a nuestra comunidad de eventos!</p>
          <p>Tu cuenta ha sido creada exitosamente.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Próximos pasos:</h3>
            <ul>
              <li>Completa tu perfil</li>
              <li>Explora eventos cerca de ti</li>
              <li>Únete a tribus que te interesen</li>
              <li>¡Crea tu primer evento!</li>
            </ul>
          </div>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p>¡Nos vemos en los eventos!</p>
          <p>El equipo de EventConnect</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email de bienvenida enviado:', info.messageId);
    return true;
  } catch (error) {
    logger.error('Error enviando email de bienvenida:', error);
    return false;
  }
};

// Función para enviar email de reset de contraseña
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'EventConnect <noreply@eventconnect.com>',
      to: user.email,
      subject: 'Reset de Contraseña - EventConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Reset de Contraseña</h1>
          <p>Hola ${user.firstName || user.username},</p>
          <p>Has solicitado resetear tu contraseña.</p>
          <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Resetear Contraseña
            </a>
          </div>
          <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
          <p>Este enlace expira en 1 hora.</p>
          <p>El equipo de EventConnect</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email de reset de contraseña enviado:', info.messageId);
    return true;
  } catch (error) {
    logger.error('Error enviando email de reset de contraseña:', error);
    return false;
  }
};

// Función para enviar email de verificación
const sendVerificationEmail = async (user, verificationToken) => {
  try {
    const verificationUrl = `${process.env.CLIENT_URL}/auth/verify?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'EventConnect <noreply@eventconnect.com>',
      to: user.email,
      subject: 'Verifica tu cuenta - EventConnect',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Verifica tu cuenta</h1>
          <p>Hola ${user.firstName || user.username},</p>
          <p>Gracias por registrarte en EventConnect.</p>
          <p>Por favor, verifica tu cuenta haciendo clic en el botón de abajo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verificar Cuenta
            </a>
          </div>
          <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
          <p>El equipo de EventConnect</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email de verificación enviado:', info.messageId);
    return true;
  } catch (error) {
    logger.error('Error enviando email de verificación:', error);
    return false;
  }
};

// Función para enviar email de notificación de evento
const sendEventNotification = async (user, event) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'EventConnect <noreply@eventconnect.com>',
      to: user.email,
      subject: `Nuevo evento: ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Nuevo evento disponible</h1>
          <p>Hola ${user.firstName || user.username},</p>
          <p>Hay un nuevo evento que podría interesarte:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${event.title}</h3>
            <p><strong>Fecha:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
            <p><strong>Hora:</strong> ${new Date(event.startDate).toLocaleTimeString()}</p>
            <p><strong>Ubicación:</strong> ${event.location?.address || 'No especificada'}</p>
            <p>${event.description}</p>
          </div>
          <p>¡No te lo pierdas!</p>
          <p>El equipo de EventConnect</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email de notificación de evento enviado:', info.messageId);
    return true;
  } catch (error) {
    logger.error('Error enviando email de notificación de evento:', error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendEventNotification,
};