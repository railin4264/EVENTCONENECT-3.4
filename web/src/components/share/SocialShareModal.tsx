'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Check,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  Mail,
  QrCode,
  Download,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    image?: string;
  };
  content?: {
    title: string;
    description: string;
    url?: string;
  };
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  event,
  content
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const shareData = event ? {
    title: event.title,
    description: event.description,
    url: `${window.location.origin}/events/${event.id}`,
    hashtags: ['EventConnect', 'Events', 'Community'],
    image: event.image
  } : content ? {
    title: content.title,
    description: content.description,
    url: content.url || window.location.href,
    hashtags: ['EventConnect'],
  } : null;

  if (!shareData) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareData.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.title)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareData.title}\n\n${shareData.description}`)}&url=${encodeURIComponent(shareData.url)}&hashtags=${shareData.hashtags.join(',')}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareData.title}\n\n${shareData.description}\n\n${shareData.url}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`,
    email: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.description}\n\n${shareData.url}`)}`
  };

  const handleSocialShare = (platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const generateQRCode = () => {
    // Simple QR code generation using qr-server.com API
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareData.url)}`;
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white',
      key: 'facebook' as const
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white',
      key: 'twitter' as const
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      textColor: 'text-white',
      key: 'linkedin' as const
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-white',
      key: 'whatsapp' as const
    },
    {
      name: 'Telegram',
      icon: Share2,
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-white',
      key: 'telegram' as const
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      textColor: 'text-white',
      key: 'email' as const
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md mx-4"
          >
            <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Compartir {event ? 'Evento' : 'Contenido'}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Event/Content Preview */}
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-semibold text-white mb-2 line-clamp-2">
                    {shareData.title}
                  </h4>
                  <p className="text-sm text-gray-300 line-clamp-3">
                    {shareData.description}
                  </p>
                  {event && (
                    <div className="mt-3 flex items-center text-xs text-gray-400">
                      <span>📅 {event.date}</span>
                      <span className="mx-2">•</span>
                      <span>📍 {event.location}</span>
                    </div>
                  )}
                </div>

                {/* Social Platforms */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    Compartir en redes sociales
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {socialPlatforms.map((platform) => (
                      <button
                        key={platform.name}
                        onClick={() => handleSocialShare(platform.key)}
                        className={`${platform.color} ${platform.textColor} p-3 rounded-lg transition-colors flex flex-col items-center gap-2 hover:scale-105 transform transition-transform duration-200`}
                      >
                        <platform.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{platform.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  {/* Copy Link */}
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
                  >
                    <div className="flex items-center space-x-3">
                      {copied ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-400" />
                      )}
                      <span className="text-white font-medium">
                        {copied ? 'Enlace copiado' : 'Copiar enlace'}
                      </span>
                    </div>
                  </button>

                  {/* Native Share (if available) */}
                  {navigator.share && (
                    <button
                      onClick={handleNativeShare}
                      className="w-full flex items-center justify-between p-3 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg transition-colors border border-cyan-400/30"
                    >
                      <div className="flex items-center space-x-3">
                        <Share2 className="w-5 h-5 text-cyan-400" />
                        <span className="text-cyan-400 font-medium">
                          Más opciones de compartir
                        </span>
                      </div>
                    </button>
                  )}

                  {/* QR Code */}
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="w-full flex items-center justify-between p-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors border border-purple-400/30"
                  >
                    <div className="flex items-center space-x-3">
                      <QrCode className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-400 font-medium">
                        {showQR ? 'Ocultar' : 'Mostrar'} código QR
                      </span>
                    </div>
                  </button>

                  {/* QR Code Display */}
                  <AnimatePresence>
                    {showQR && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-col items-center space-y-3 pt-3"
                      >
                        <div className="bg-white p-4 rounded-lg">
                          <img
                            src={generateQRCode()}
                            alt="QR Code"
                            className="w-32 h-32"
                          />
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                          Escanea este código QR para compartir
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-xs text-center text-gray-500">
                    Comparte este {event ? 'evento' : 'contenido'} con tu comunidad
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SocialShareModal;
