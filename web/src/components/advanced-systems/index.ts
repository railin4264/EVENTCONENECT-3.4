// ===== ADVANCED SYSTEMS INDEX =====
// Export all advanced functionality systems for easy importing

// 🎮 Gamification System
export { default as AchievementSystem } from '../gamification/AchievementSystem';
export type { Achievement, UserStats } from '../gamification/AchievementSystem';

// 🤖 AI Recommendation System
export { default as AIRecommendationSystem } from '../ai/AIRecommendationSystem';
export type { AIEvent, UserPreference, AIInsight } from '../ai/AIRecommendationSystem';

// 🌍 Internationalization System
export { default as InternationalizationSystem } from '../internationalization/InternationalizationSystem';
export type { Language, LocalizedContent, CulturalAdaptation } from '../internationalization/InternationalizationSystem';

// ♿ Accessibility System
export { default as AccessibilitySystem } from '../accessibility/AccessibilitySystem';
export type { AccessibilitySettings, AccessibilityFeature } from '../accessibility/AccessibilitySystem';

// ⚡ Performance Optimization System
export { default as PerformanceOptimizationSystem } from '../performance/PerformanceOptimizationSystem';
export type { PerformanceMetrics, OptimizationFeature } from '../performance/PerformanceOptimizationSystem';

// 🔐 Advanced Authentication System (MFA + OAuth)
export { default as AdvancedAuthSystem } from '../auth/AdvancedAuthSystem';
export type { MFASettings, OAuthProvider, AuthMethod } from '../auth/AdvancedAuthSystem';

// 📱 PWA Management System
export { default as PWAManager } from '../pwa/PWAManager';
export type { PWAStatus, ServiceWorkerState, PWAFeatures } from '../pwa/PWAManager';

// 🗺️ Intelligent Location System
export { default as IntelligentLocationSystem } from '../location/IntelligentLocationSystem';
export type { LocationData, Geofence, LocationEvent, LocationAnalytics } from '../location/IntelligentLocationSystem';

// ===== COMPLETE SYSTEM EXPORTS =====
export const AdvancedSystems = {
  AchievementSystem,
  AIRecommendationSystem,
  InternationalizationSystem,
  AccessibilitySystem,
  PerformanceOptimizationSystem,
  AdvancedAuthSystem,
  PWAManager,
  IntelligentLocationSystem
};

export default AdvancedSystems;