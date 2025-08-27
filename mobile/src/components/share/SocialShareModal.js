import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
  Linking,
  Clipboard,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Copy,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Mail,
  ExternalLink,
  Share2,
  Check
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SocialShareModal = ({ visible, onClose, event, content }) => {
  const [copied, setCopied] = useState(false);

  const shareData = event ? {
    title: event.title,
    description: event.description,
    url: `https://eventconnect.app/events/${event.id}`,
    message: `¡Mira este evento increíble!\n\n${event.title}\n\n📅 ${event.date}\n📍 ${event.location}\n\nEventConnect - Conecta con tu tribu`
  } : content ? {
    title: content.title,
    description: content.description,
    url: content.url || 'https://eventconnect.app',
    message: `${content.title}\n\n${content.description}`
  } : null;

  if (!shareData) return null;

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: shareData.message,
        url: shareData.url,
        title: shareData.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Éxito', 'Enlace copiado al portapapeles');
    } catch (error) {
      Alert.alert('Error', 'No se pudo copiar el enlace');
    }
  };

  const handleSocialShare = (platform) => {
    const encodedMessage = encodeURIComponent(shareData.message);
    const encodedUrl = encodeURIComponent(shareData.url);
    const encodedTitle = encodeURIComponent(shareData.title);

    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        url = `whatsapp://send?text=${encodedMessage}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'instagram':
        // Instagram no permite sharing directo via URL, así que usamos el share nativo
        handleNativeShare();
        return;
      case 'email':
        url = `mailto:?subject=${encodedTitle}&body=${encodedMessage}`;
        break;
      default:
        return;
    }

    if (url) {
      Linking.openURL(url).catch((err) => {
        console.error('Error opening URL:', err);
        Alert.alert('Error', 'No se pudo abrir la aplicación');
      });
    }
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: '#1877f2',
      key: 'facebook'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: '#1da1f2',
      key: 'twitter'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: '#25d366',
      key: 'whatsapp'
    },
    {
      name: 'Telegram',
      icon: Share2,
      color: '#0088cc',
      key: 'telegram'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: '#e4405f',
      key: 'instagram'
    },
    {
      name: 'Email',
      icon: Mail,
      color: '#6b7280',
      key: 'email'
    }
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFillObject}
        />
        
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['rgba(15,15,35,0.95)', 'rgba(26,26,46,0.95)']}
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                Compartir {event ? 'Evento' : 'Contenido'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Content Preview */}
              <View style={styles.contentPreview}>
                <Text style={styles.contentTitle} numberOfLines={2}>
                  {shareData.title}
                </Text>
                <Text style={styles.contentDescription} numberOfLines={3}>
                  {shareData.description}
                </Text>
                {event && (
                  <View style={styles.eventMeta}>
                    <Text style={styles.eventMetaText}>
                      📅 {event.date} • 📍 {event.location}
                    </Text>
                  </View>
                )}
              </View>

              {/* Social Platforms */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Compartir en redes sociales</Text>
                <View style={styles.socialGrid}>
                  {socialPlatforms.map((platform) => (
                    <TouchableOpacity
                      key={platform.name}
                      style={[styles.socialButton, { backgroundColor: platform.color }]}
                      onPress={() => handleSocialShare(platform.key)}
                      activeOpacity={0.8}
                    >
                      <platform.icon size={24} color="#ffffff" />
                      <Text style={styles.socialButtonText}>{platform.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Acciones rápidas</Text>
                
                {/* Copy Link */}
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={handleCopyLink}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickActionContent}>
                    <View style={styles.quickActionIcon}>
                      {copied ? (
                        <Check size={20} color="#10b981" />
                      ) : (
                        <Copy size={20} color="#67e8f9" />
                      )}
                    </View>
                    <Text style={styles.quickActionText}>
                      {copied ? 'Enlace copiado' : 'Copiar enlace'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Native Share */}
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={handleNativeShare}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickActionContent}>
                    <View style={styles.quickActionIcon}>
                      <Share2 size={20} color="#67e8f9" />
                    </View>
                    <Text style={styles.quickActionText}>
                      Más opciones de compartir
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Open in Browser */}
                <TouchableOpacity
                  style={styles.quickAction}
                  onPress={() => Linking.openURL(shareData.url)}
                  activeOpacity={0.8}
                >
                  <View style={styles.quickActionContent}>
                    <View style={styles.quickActionIcon}>
                      <ExternalLink size={20} color="#67e8f9" />
                    </View>
                    <Text style={styles.quickActionText}>
                      Abrir en navegador
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Comparte este {event ? 'evento' : 'contenido'} con tu comunidad
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '80%',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  contentPreview: {
    margin: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  contentDescription: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
    marginBottom: 8,
  },
  eventMeta: {
    marginTop: 8,
  },
  eventMetaText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialButton: {
    width: (width - 80) / 3 - 8,
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  socialButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  quickAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.3)',
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default SocialShareModal;




