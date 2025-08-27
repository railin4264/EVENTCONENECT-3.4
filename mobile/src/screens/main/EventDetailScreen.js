import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
  Modal,
  Linking,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Share2,
  Bookmark,
  MoreVertical,
  Star,
  MessageCircle,
  Camera,
  Navigation,
  Phone,
  Globe,
  Ticket,
  CreditCard,
  UserCheck,
  UserX,
  Edit,
  Settings,
  Flag,
  ExternalLink
} from 'lucide-react-native';

import eventsService from '../../services/EventsService';
import reviewsService from '../../services/ReviewsService';
import { useAuth } from '../../contexts/AuthContext';

const EventDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { eventId } = route.params;
  
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  const [activeTab, setActiveTab] = useState('details'); // details, attendees, reviews
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setIsLoading(true);
      
      const [eventResponse, attendeesResponse, reviewsResponse] = await Promise.all([
        eventsService.getEventById(eventId),
        eventsService.getEventAttendees(eventId),
        reviewsService.getReviewsForEvent(eventId)
      ]);
      
      const eventData = eventResponse.data;
      const attendeesData = attendeesResponse.data || [];
      const reviewsData = reviewsResponse.data || [];
      
      setEvent(eventData);
      setAttendees(attendeesData);
      setReviews(reviewsData);
      
      // Check user status
      setIsAttending(attendeesData.some(a => a._id === user.id || a.id === user.id));
      setIsOwner(eventData.creator?._id === user.id || eventData.creator?.id === user.id);
      setIsLiked(eventData.likedBy?.includes(user.id));
      setIsSaved(eventData.savedBy?.includes(user.id));
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la información del evento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEventDetails();
    setIsRefreshing(false);
  };

  const handleAttendEvent = async () => {
    try {
      if (isAttending) {
        await eventsService.leaveEvent(eventId);
        setIsAttending(false);
        setAttendees(prev => prev.filter(a => a._id !== user.id && a.id !== user.id));
      } else {
        await eventsService.attendEvent(eventId);
        setIsAttending(true);
        setAttendees(prev => [...prev, user]);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLikeEvent = async () => {
    try {
      if (isLiked) {
        await eventsService.unlikeEvent(eventId);
        setIsLiked(false);
      } else {
        await eventsService.likeEvent(eventId);
        setIsLiked(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la acción');
    }
  };

  const handleSaveEvent = async () => {
    try {
      if (isSaved) {
        await eventsService.unsaveEvent(eventId);
        setIsSaved(false);
      } else {
        await eventsService.saveEvent(eventId);
        setIsSaved(true);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el evento');
    }
  };

  const handleShareEvent = async () => {
    try {
      await Share.share({
        message: `¡Mira este evento increíble! ${event.title}\n\n📅 ${formatEventDate()}\n📍 ${event.location}\n\nEventConnect - Conecta con tu tribu`,
        url: `https://eventconnect.app/events/${eventId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDirections = () => {
    if (event.coordinates) {
      const url = Platform.OS === 'ios' 
        ? `maps://?q=${event.coordinates.lat},${event.coordinates.lng}`
        : `geo:${event.coordinates.lat},${event.coordinates.lng}`;
      Linking.openURL(url);
    } else if (event.address) {
      const encodedAddress = encodeURIComponent(event.address);
      const url = Platform.OS === 'ios'
        ? `maps://?q=${encodedAddress}`
        : `geo:0,0?q=${encodedAddress}`;
      Linking.openURL(url);
    }
  };

  const formatEventDate = () => {
    if (!event.date) return '';
    
    const eventDate = new Date(event.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (eventDate.toDateString() === today.toDateString()) {
      return `Hoy, ${eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (eventDate.toDateString() === tomorrow.toDateString()) {
      return `Mañana, ${eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return eventDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getEventStatus = () => {
    if (!event.date) return null;
    
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (eventDate < now) {
      return { text: 'Finalizado', color: '#6b7280' };
    } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { text: 'Próximamente', color: '#f59e0b' };
    } else {
      return { text: 'Próximo', color: '#10b981' };
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Image 
        source={{ 
          uri: event?.image || 
               `https://picsum.photos/400/300?random=${eventId}`
        }}
        style={styles.eventImage}
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(10, 10, 10, 0.8)']}
        style={styles.imageGradient}
      />
      
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color="#ffffff" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.moreButton}
        onPress={() => setShowShareModal(true)}
      >
        <MoreVertical size={24} color="#ffffff" />
      </TouchableOpacity>
      
      <View style={styles.eventInfo}>
        <View style={styles.eventCategory}>
          <Text style={styles.categoryText}>{event?.category || 'Evento'}</Text>
        </View>
        
        <Text style={styles.eventTitle}>{event?.title}</Text>
        
        <View style={styles.eventMeta}>
          <View style={styles.metaItem}>
            <Calendar size={16} color="#67e8f9" />
            <Text style={styles.metaText}>{formatEventDate()}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <MapPin size={16} color="#67e8f9" />
            <Text style={styles.metaText} numberOfLines={1}>
              {event?.location || event?.address}
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Users size={16} color="#67e8f9" />
            <Text style={styles.metaText}>
              {attendees.length} asistentes
            </Text>
          </View>
        </View>

        {getEventStatus() && (
          <View style={[styles.statusBadge, { backgroundColor: getEventStatus().color }]}>
            <Text style={styles.statusText}>{getEventStatus().text}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity 
        style={[
          styles.attendButton,
          isAttending && styles.attendingButton
        ]}
        onPress={handleAttendEvent}
      >
        {isAttending ? <UserCheck size={20} color="#ffffff" /> : <UserX size={20} color="#ffffff" />}
        <Text style={styles.attendButtonText}>
          {isAttending ? 'Asistiendo' : 'Asistir'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={handleLikeEvent}
      >
        <Heart 
          size={20} 
          color={isLiked ? "#ef4444" : "#9ca3af"}
          fill={isLiked ? "#ef4444" : "transparent"}
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={handleSaveEvent}
      >
        <Bookmark 
          size={20} 
          color={isSaved ? "#67e8f9" : "#9ca3af"}
          fill={isSaved ? "#67e8f9" : "transparent"}
        />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={handleShareEvent}
      >
        <Share2 size={20} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'details' && styles.activeTab]}
        onPress={() => setActiveTab('details')}
      >
        <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
          Detalles
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'attendees' && styles.activeTab]}
        onPress={() => setActiveTab('attendees')}
      >
        <Text style={[styles.tabText, activeTab === 'attendees' && styles.activeTabText]}>
          Asistentes ({attendees.length})
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
        onPress={() => setActiveTab('reviews')}
      >
        <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
          Reseñas ({reviews.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDetails = () => (
    <View style={styles.detailsContent}>
      {/* Organizer */}
      <View style={styles.organizerCard}>
        <Text style={styles.sectionTitle}>Organizador</Text>
        <View style={styles.organizerInfo}>
          <Image 
            source={{ 
              uri: event?.creator?.profilePicture || 
                   `https://ui-avatars.com/api/?name=${event?.creator?.name}&background=67e8f9&color=fff`
            }}
            style={styles.organizerAvatar}
          />
          <View style={styles.organizerDetails}>
            <Text style={styles.organizerName}>{event?.creator?.name}</Text>
            <Text style={styles.organizerRole}>Organizador del evento</Text>
          </View>
          <TouchableOpacity style={styles.contactButton}>
            <MessageCircle size={16} color="#67e8f9" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>
          {event?.description || 'No hay descripción disponible para este evento.'}
        </Text>
      </View>

      {/* Location */}
      {(event?.location || event?.address) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación</Text>
          <TouchableOpacity 
            style={styles.locationCard}
            onPress={handleDirections}
          >
            <MapPin size={20} color="#67e8f9" />
            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>{event.location}</Text>
              {event.address && (
                <Text style={styles.locationAddress}>{event.address}</Text>
              )}
            </View>
            <Navigation size={20} color="#67e8f9" />
          </TouchableOpacity>
        </View>
      )}

      {/* Price */}
      {event?.price !== undefined && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Precio</Text>
          <View style={styles.priceCard}>
            <CreditCard size={20} color="#67e8f9" />
            <Text style={styles.priceText}>
              {event.price === 0 ? 'Gratis' : `$${event.price.toLocaleString()}`}
            </Text>
          </View>
        </View>
      )}

      {/* Contact Info */}
      {(event?.contactEmail || event?.contactPhone || event?.website) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de contacto</Text>
          
          {event.contactPhone && (
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => Linking.openURL(`tel:${event.contactPhone}`)}
            >
              <Phone size={16} color="#67e8f9" />
              <Text style={styles.contactText}>{event.contactPhone}</Text>
            </TouchableOpacity>
          )}
          
          {event.website && (
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => Linking.openURL(event.website)}
            >
              <Globe size={16} color="#67e8f9" />
              <Text style={styles.contactText}>{event.website}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderAttendees = () => (
    <View style={styles.attendeesContent}>
      {attendees.map((attendee, index) => (
        <TouchableOpacity 
          key={attendee._id || index}
          style={styles.attendeeCard}
          onPress={() => navigation.navigate('UserProfile', { userId: attendee._id })}
        >
          <Image 
            source={{ 
              uri: attendee.profilePicture || 
                   `https://ui-avatars.com/api/?name=${attendee.name}&background=67e8f9&color=fff`
            }}
            style={styles.attendeeAvatar}
          />
          <View style={styles.attendeeInfo}>
            <Text style={styles.attendeeName}>{attendee.name}</Text>
            {attendee.username && (
              <Text style={styles.attendeeUsername}>@{attendee.username}</Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
      
      {attendees.length === 0 && (
        <View style={styles.emptyState}>
          <Users size={64} color="#6b7280" />
          <Text style={styles.emptyStateTitle}>No hay asistentes aún</Text>
          <Text style={styles.emptyStateText}>
            Sé el primero en confirmar tu asistencia
          </Text>
        </View>
      )}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.reviewsContent}>
      {reviews.map((review, index) => (
        <View key={review._id || index} style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Image 
              source={{ 
                uri: review.user?.profilePicture || 
                     `https://ui-avatars.com/api/?name=${review.user?.name}&background=67e8f9&color=fff`
              }}
              style={styles.reviewerAvatar}
            />
            <View style={styles.reviewerInfo}>
              <Text style={styles.reviewerName}>{review.user?.name}</Text>
              <View style={styles.reviewRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    size={14} 
                    color={star <= review.rating ? "#fbbf24" : "#374151"}
                    fill={star <= review.rating ? "#fbbf24" : "transparent"}
                  />
                ))}
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString('es-ES')}
                </Text>
              </View>
            </View>
          </View>
          
          {review.comment && (
            <Text style={styles.reviewComment}>{review.comment}</Text>
          )}
        </View>
      ))}
      
      {reviews.length === 0 && (
        <View style={styles.emptyState}>
          <Star size={64} color="#6b7280" />
          <Text style={styles.emptyStateTitle}>No hay reseñas aún</Text>
          <Text style={styles.emptyStateText}>
            Las reseñas aparecerán después del evento
          </Text>
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return renderDetails();
      case 'attendees':
        return renderAttendees();
      case 'reviews':
        return renderReviews();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0f0f23', '#1a1a2e', '#16213e']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando evento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f0f23', '#1a1a2e', '#16213e']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#67e8f9"
          />
        }
      >
        {renderHeader()}
        {renderActionButtons()}
        {renderTabs()}
        {renderContent()}
      </ScrollView>

      {isOwner && (
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditEvent', { eventId })}
        >
          <Edit size={24} color="#ffffff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'relative',
    height: 350,
  },
  eventImage: {
    width: '100%',
    height: 250,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  moreButton: {
    position: 'absolute',
    top: 40,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  eventInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  eventCategory: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#67e8f9',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    lineHeight: 28,
  },
  eventMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#d1d5db',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  attendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#67e8f9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    flex: 1,
    justifyContent: 'center',
  },
  attendingButton: {
    backgroundColor: '#10b981',
  },
  attendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  actionButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginRight: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#67e8f9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  activeTabText: {
    color: '#ffffff',
  },
  detailsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  organizerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  organizerDetails: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  organizerRole: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  contactButton: {
    padding: 8,
    backgroundColor: 'rgba(103, 232, 249, 0.2)',
    borderRadius: 8,
  },
  section: {
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#d1d5db',
    lineHeight: 24,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  locationAddress: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#67e8f9',
    marginLeft: 12,
  },
  attendeesContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  attendeeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  attendeeUsername: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  reviewsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  reviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#67e8f9',
    borderRadius: 25,
    padding: 16,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default EventDetailScreen;











