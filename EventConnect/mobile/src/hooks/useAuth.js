import { useAuth as useAuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const auth = useAuthContext();
  
  // Funciones de conveniencia
  const isLoggedIn = auth.isAuthenticated;
  const isGuest = !auth.isAuthenticated;
  const hasRole = (role) => auth.user?.role === role;
  const hasPermission = (permission) => {
    if (!auth.user) return false;
    return auth.user.permissions?.includes(permission) || false;
  };
  
  // Validaciones de usuario
  const isProfileComplete = () => {
    if (!auth.user) return false;
    return !!(auth.user.firstName && auth.user.lastName && auth.user.email);
  };
  
  const isEmailVerified = () => {
    return auth.user?.emailVerified || false;
  };
  
  const isPhoneVerified = () => {
    return auth.user?.phoneVerified || false;
  };
  
  // Funciones de estado
  const isOnline = () => {
    return auth.user?.status === 'online';
  };
  
  const isAway = () => {
    return auth.user?.status === 'away';
  };
  
  const isOffline = () => {
    return auth.user?.status === 'offline';
  };
  
  // Funciones de verificación
  const canCreateEvent = () => {
    return hasPermission('create:event') || hasRole('admin') || hasRole('moderator');
  };
  
  const canEditEvent = (event) => {
    if (!event) return false;
    if (hasRole('admin') || hasRole('moderator')) return true;
    return event.host === auth.user?._id;
  };
  
  const canDeleteEvent = (event) => {
    if (!event) return false;
    if (hasRole('admin')) return true;
    if (hasRole('moderator')) return true;
    return event.host === auth.user?._id;
  };
  
  const canJoinEvent = (event) => {
    if (!event) return false;
    if (event.status !== 'active') return false;
    if (event.attendees?.includes(auth.user?._id)) return false;
    if (event.capacity && event.attendees?.length >= event.capacity) return false;
    return true;
  };
  
  const canLeaveEvent = (event) => {
    if (!event) return false;
    return event.attendees?.includes(auth.user?._id) || false;
  };
  
  const canCreateTribe = () => {
    return hasPermission('create:tribe') || hasRole('admin') || hasRole('moderator');
  };
  
  const canEditTribe = (tribe) => {
    if (!tribe) return false;
    if (hasRole('admin') || hasRole('moderator')) return true;
    return tribe.owner === auth.user?._id || tribe.moderators?.includes(auth.user?._id);
  };
  
  const canDeleteTribe = (tribe) => {
    if (!tribe) return false;
    if (hasRole('admin')) return true;
    return tribe.owner === auth.user?._id;
  };
  
  const canJoinTribe = (tribe) => {
    if (!tribe) return false;
    if (tribe.status !== 'active') return false;
    if (tribe.members?.includes(auth.user?._id)) return false;
    return true;
  };
  
  const canLeaveTribe = (tribe) => {
    if (!tribe) return false;
    return tribe.members?.includes(auth.user?._id) || false;
  };
  
  // Funciones de notificaciones
  const canReceiveNotifications = () => {
    return auth.user?.notificationPreferences?.enabled !== false;
  };
  
  const canReceivePushNotifications = () => {
    return auth.user?.notificationPreferences?.push !== false;
  };
  
  const canReceiveEmailNotifications = () => {
    return auth.user?.notificationPreferences?.email !== false;
  };
  
  const canReceiveSMSSNotifications = () => {
    return auth.user?.notificationPreferences?.sms !== false;
  };
  
  // Funciones de chat
  const canSendMessage = (chat) => {
    if (!chat) return false;
    if (chat.type === 'private') {
      return chat.participants?.includes(auth.user?._id);
    }
    if (chat.type === 'group') {
      return chat.members?.includes(auth.user?._id);
    }
    if (chat.type === 'event') {
      return chat.event?.attendees?.includes(auth.user?._id);
    }
    if (chat.type === 'tribe') {
      return chat.tribe?.members?.includes(auth.user?._id);
    }
    return false;
  };
  
  const canDeleteMessage = (message) => {
    if (!message) return false;
    if (hasRole('admin') || hasRole('moderator')) return true;
    return message.sender === auth.user?._id;
  };
  
  // Funciones de moderación
  const canModerateContent = () => {
    return hasRole('admin') || hasRole('moderator');
  };
  
  const canBanUser = (targetUser) => {
    if (!targetUser) return false;
    if (hasRole('admin')) return true;
    if (hasRole('moderator')) {
      return targetUser.role !== 'admin' && targetUser.role !== 'moderator';
    }
    return false;
  };
  
  const canUnbanUser = (targetUser) => {
    if (!targetUser) return false;
    if (hasRole('admin')) return true;
    if (hasRole('moderator')) {
      return targetUser.role !== 'admin' && targetUser.role !== 'moderator';
    }
    return false;
  };
  
  // Funciones de reportes
  const canReportContent = () => {
    return isLoggedIn;
  };
  
  const canViewReports = () => {
    return hasRole('admin') || hasRole('moderator');
  };
  
  const canResolveReports = () => {
    return hasRole('admin') || hasRole('moderator');
  };
  
  // Funciones de analytics
  const canViewAnalytics = () => {
    return hasRole('admin') || hasRole('moderator');
  };
  
  const canViewUserAnalytics = () => {
    return hasRole('admin');
  };
  
  const canViewEventAnalytics = (event) => {
    if (!event) return false;
    if (hasRole('admin') || hasRole('moderator')) return true;
    return event.host === auth.user?._id;
  };
  
  const canViewTribeAnalytics = (tribe) => {
    if (!tribe) return false;
    if (hasRole('admin') || hasRole('moderator')) return true;
    return tribe.owner === auth.user?._id || tribe.moderators?.includes(auth.user?._id);
  };
  
  // Funciones de configuración
  const canChangeAppSettings = () => {
    return hasRole('admin');
  };
  
  const canManageUsers = () => {
    return hasRole('admin');
  };
  
  const canManageRoles = () => {
    return hasRole('admin');
  };
  
  const canManagePermissions = () => {
    return hasRole('admin');
  };
  
  // Funciones de backup y restore
  const canCreateBackup = () => {
    return hasRole('admin');
  };
  
  const canRestoreBackup = () => {
    return hasRole('admin');
  };
  
  const canViewBackups = () => {
    return hasRole('admin');
  };
  
  // Funciones de logs
  const canViewLogs = () => {
    return hasRole('admin') || hasRole('moderator');
  };
  
  const canViewSecurityLogs = () => {
    return hasRole('admin');
  };
  
  const canViewAuditLogs = () => {
    return hasRole('admin');
  };
  
  // Funciones de API
  const canUseAPI = () => {
    return isLoggedIn;
  };
  
  const canGenerateAPIToken = () => {
    return hasRole('admin') || hasRole('moderator');
  };
  
  const canRevokeAPIToken = () => {
    return hasRole('admin') || hasRole('moderator');
  };
  
  // Funciones de integración
  const canManageIntegrations = () => {
    return hasRole('admin');
  };
  
  const canConfigureWebhooks = () => {
    return hasRole('admin');
  };
  
  const canManageThirdPartyServices = () => {
    return hasRole('admin');
  };
  
  return {
    ...auth,
    // Funciones de conveniencia
    isLoggedIn,
    isGuest,
    hasRole,
    hasPermission,
    
    // Validaciones de usuario
    isProfileComplete,
    isEmailVerified,
    isPhoneVerified,
    
    // Funciones de estado
    isOnline,
    isAway,
    isOffline,
    
    // Funciones de verificación
    canCreateEvent,
    canEditEvent,
    canDeleteEvent,
    canJoinEvent,
    canLeaveEvent,
    canCreateTribe,
    canEditTribe,
    canDeleteTribe,
    canJoinTribe,
    canLeaveTribe,
    
    // Funciones de notificaciones
    canReceiveNotifications,
    canReceivePushNotifications,
    canReceiveEmailNotifications,
    canReceiveSMSSNotifications,
    
    // Funciones de chat
    canSendMessage,
    canDeleteMessage,
    
    // Funciones de moderación
    canModerateContent,
    canBanUser,
    canUnbanUser,
    
    // Funciones de reportes
    canReportContent,
    canViewReports,
    canResolveReports,
    
    // Funciones de analytics
    canViewAnalytics,
    canViewUserAnalytics,
    canViewEventAnalytics,
    canViewTribeAnalytics,
    
    // Funciones de configuración
    canChangeAppSettings,
    canManageUsers,
    canManageRoles,
    canManagePermissions,
    
    // Funciones de backup y restore
    canCreateBackup,
    canRestoreBackup,
    canViewBackups,
    
    // Funciones de logs
    canViewLogs,
    canViewSecurityLogs,
    canViewAuditLogs,
    
    // Funciones de API
    canUseAPI,
    canGenerateAPIToken,
    canRevokeAPIToken,
    
    // Funciones de integración
    canManageIntegrations,
    canConfigureWebhooks,
    canManageThirdPartyServices,
  };
};