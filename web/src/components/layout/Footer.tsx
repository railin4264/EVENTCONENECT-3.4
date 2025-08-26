'use client';

import Link from 'next/link';
import {
  HeartIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Eventos', href: '/events' },
      { name: 'Tribus', href: '/tribes' },
      { name: 'Feed Social', href: '/feed' },
      { name: 'Mapa Interactivo', href: '/map' },
      { name: 'Chat en Tiempo Real', href: '/chat' },
    ],
    company: [
      { name: 'Acerca de', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Carreras', href: '/careers' },
      { name: 'Prensa', href: '/press' },
      { name: 'Contacto', href: '/contact' },
    ],
    support: [
      { name: 'Centro de Ayuda', href: '/help' },
      { name: 'Comunidad', href: '/community' },
      { name: 'Reportar Bug', href: '/report-bug' },
      { name: 'Sugerencias', href: '/suggestions' },
      { name: 'Estado del Servicio', href: '/status' },
    ],
    legal: [
      { name: 'Términos de Servicio', href: '/terms' },
      { name: 'Política de Privacidad', href: '/privacy' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Licencias', href: '/licenses' },
      { name: 'Cumplimiento', href: '/compliance' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', href: 'https://twitter.com/eventconnect', icon: '🐦' },
    { name: 'Facebook', href: 'https://facebook.com/eventconnect', icon: '📘' },
    {
      name: 'Instagram',
      href: 'https://instagram.com/eventconnect',
      icon: '📷',
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/eventconnect',
      icon: '💼',
    },
    { name: 'YouTube', href: 'https://youtube.com/eventconnect', icon: '📺' },
  ];

  return (
    <footer className='bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8'>
          {/* Brand Section */}
          <div className='lg:col-span-2'>
            <Link href='/' className='flex items-center space-x-2 mb-4'>
              <div className='w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center'>
                <span className='text-white font-bold text-xl'>E</span>
              </div>
              <span className='text-2xl font-bold text-gray-900 dark:text-white'>
                EventConnect
              </span>
            </Link>

            <p className='text-gray-600 dark:text-gray-400 mb-6 max-w-md'>
              Conecta con eventos increíbles, únete a tribus apasionadas y
              descubre experiencias únicas cerca de ti. La plataforma social
              para amantes de los eventos.
            </p>

            {/* Contact Info */}
            <div className='space-y-3'>
              <div className='flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400'>
                <MapPinIcon className='w-4 h-4' />
                <span>Ciudad de México, México</span>
              </div>
              <div className='flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400'>
                <PhoneIcon className='w-4 h-4' />
                <span>+52 (55) 1234-5678</span>
              </div>
              <div className='flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400'>
                <EnvelopeIcon className='w-4 h-4' />
                <span>hola@eventconnect.mx</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className='text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4'>
              Producto
            </h3>
            <ul className='space-y-3'>
              {footerLinks.product.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className='text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4'>
              Empresa
            </h3>
            <ul className='space-y-3'>
              {footerLinks.company.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className='text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4'>
              Soporte
            </h3>
            <ul className='space-y-3'>
              {footerLinks.support.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className='text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4'>
              Legal
            </h3>
            <ul className='space-y-3'>
              {footerLinks.legal.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm'
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className='border-t border-gray-200 dark:border-gray-700 pt-8 mb-8'>
          <div className='max-w-md'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
              Mantente al día
            </h3>
            <p className='text-gray-600 dark:text-gray-400 mb-4 text-sm'>
              Recibe las últimas noticias sobre eventos, nuevas funcionalidades
              y actualizaciones de la plataforma.
            </p>
            <div className='flex space-x-2'>
              <input
                type='email'
                placeholder='Tu correo electrónico'
                className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm'
              />
              <button className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium'>
                Suscribirse
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='border-t border-gray-200 dark:border-gray-700 pt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0'>
            {/* Copyright */}
            <div className='flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400'>
              <span>
                © {currentYear} EventConnect. Todos los derechos reservados.
              </span>
              <span>•</span>
              <span>Hecho con</span>
              <HeartIcon className='w-4 h-4 text-red-500' />
              <span>en México</span>
            </div>

            {/* Social Links */}
            <div className='flex items-center space-x-4'>
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors'
                  title={social.name}
                >
                  <span className='text-lg'>{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
            <div className='flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-xs text-gray-500 dark:text-gray-400'>
              <div className='flex items-center space-x-4'>
                <span>Versión 1.0.0</span>
                <span>•</span>
                <span>
                  Última actualización: {new Date().toLocaleDateString('es-MX')}
                </span>
              </div>

              <div className='flex items-center space-x-4'>
                <span className='flex items-center space-x-1'>
                  <GlobeAltIcon className='w-3 h-3' />
                  <span>Español (MX)</span>
                </span>
                <span>•</span>
                <span>UTC-6</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
