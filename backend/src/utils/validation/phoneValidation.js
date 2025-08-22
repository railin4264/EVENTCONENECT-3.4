/**
 * Phone validation utilities
 */

/**
 * Normalize phone number by removing non-numeric characters
 * @param {string} phone - Phone number to normalize
 * @returns {string|null} Normalized phone number or null if invalid
 */
const normalizePhoneNumber = phone => {
  try {
    if (!phone || typeof phone !== 'string') {
      return null;
    }

    // Remove all non-numeric characters except +
    let normalized = phone.replace(/[^\d+]/g, '');

    // If starts with +, keep it
    if (phone.startsWith('+')) {
      normalized = `+${normalized.replace(/\+/g, '')}`;
    }

    return normalized;
  } catch (error) {
    return null;
  }
};

/**
 * Validate basic phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
const isValidPhoneFormat = phone => {
  try {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    const normalized = normalizePhoneNumber(phone);
    if (!normalized) {
      return false;
    }

    // Basic format validation - 7 to 15 digits (ITU-T E.164)
    const phoneRegex = /^\+?[1-9]\d{6,14}$/;
    return phoneRegex.test(normalized);
  } catch (error) {
    return false;
  }
};

/**
 * Validate US phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid US phone format
 */
const isValidUSPhone = phone => {
  try {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    const normalized = normalizePhoneNumber(phone);
    if (!normalized) {
      return false;
    }

    // US phone format: +1XXXXXXXXXX or XXXXXXXXXX (10 digits)
    const usPhoneRegex = /^(\+1)?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
    return usPhoneRegex.test(normalized);
  } catch (error) {
    return false;
  }
};

/**
 * Validate international phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid international phone format
 */
const isValidInternationalPhone = phone => {
  try {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    const normalized = normalizePhoneNumber(phone);
    if (!normalized) {
      return false;
    }

    // International format must start with + and have 7-15 digits
    const intlPhoneRegex = /^\+[1-9]\d{6,14}$/;
    return intlPhoneRegex.test(normalized);
  } catch (error) {
    return false;
  }
};

/**
 * Extract country code from phone number
 * @param {string} phone - Phone number
 * @returns {string|null} Country code or null if not found
 */
const extractCountryCode = phone => {
  try {
    if (!phone || typeof phone !== 'string') {
      return null;
    }

    const normalized = normalizePhoneNumber(phone);
    if (!normalized || !normalized.startsWith('+')) {
      return null;
    }

    // Common country codes (simplified)
    const countryCodes = {
      '+1': 'US/CA',
      '+44': 'GB',
      '+33': 'FR',
      '+49': 'DE',
      '+39': 'IT',
      '+34': 'ES',
      '+81': 'JP',
      '+86': 'CN',
      '+91': 'IN',
      '+55': 'BR',
      '+52': 'MX',
      '+61': 'AU',
      '+7': 'RU/KZ',
      '+82': 'KR',
      '+90': 'TR',
      '+31': 'NL',
      '+46': 'SE',
      '+47': 'NO',
      '+45': 'DK',
      '+358': 'FI',
      '+41': 'CH',
      '+43': 'AT',
      '+32': 'BE',
      '+351': 'PT',
      '+30': 'GR',
      '+48': 'PL',
      '+420': 'CZ',
      '+36': 'HU',
      '+40': 'RO',
      '+385': 'HR',
      '+386': 'SI',
      '+421': 'SK',
      '+372': 'EE',
      '+371': 'LV',
      '+370': 'LT',
    };

    // Find matching country code
    for (const [code, _country] of Object.entries(countryCodes)) {
      if (normalized.startsWith(code)) {
        return code;
      }
    }

    // If no exact match, try to extract first 1-4 digits after +
    const codeMatch = normalized.match(/^\+(\d{1,4})/);
    return codeMatch ? `+${codeMatch[1]}` : null;
  } catch (error) {
    return null;
  }
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @param {string} format - Format type ('international', 'national', 'e164')
 * @returns {string|null} Formatted phone number or null if invalid
 */
const formatPhoneNumber = (phone, format = 'international') => {
  try {
    if (!phone || typeof phone !== 'string') {
      return null;
    }

    const normalized = normalizePhoneNumber(phone);
    if (!normalized) {
      return null;
    }

    // Handle different formats
    switch (format.toLowerCase()) {
      case 'e164':
        return normalized.startsWith('+') ? normalized : `+${normalized}`;

      case 'national':
        // Remove country code for national format
        const countryCode = extractCountryCode(normalized);
        if (countryCode) {
          const nationalNumber = normalized.replace(countryCode, '');
          // Basic formatting for US numbers
          if (countryCode === '+1' && nationalNumber.length === 10) {
            return `(${nationalNumber.slice(0, 3)}) ${nationalNumber.slice(3, 6)}-${nationalNumber.slice(6)}`;
          }
          return nationalNumber;
        }
        return normalized;

      case 'international':
      default:
        const e164 = normalized.startsWith('+') ? normalized : `+${normalized}`;
        // Basic international formatting
        const code = extractCountryCode(e164);
        if (code) {
          const number = e164.replace(code, '');
          return `${code} ${number}`;
        }
        return e164;
    }
  } catch (error) {
    return null;
  }
};

/**
 * Validate phone number length
 * @param {string} phone - Phone number to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {boolean} True if length is valid
 */
const isValidPhoneLength = (phone, minLength = 7, maxLength = 15) => {
  try {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    const normalized = normalizePhoneNumber(phone);
    if (!normalized) {
      return false;
    }

    // Count only digits (exclude + sign)
    const digitCount = normalized.replace(/\+/, '').length;
    return digitCount >= minLength && digitCount <= maxLength;
  } catch (error) {
    return false;
  }
};

/**
 * Check if phone number is mobile format (basic check)
 * @param {string} phone - Phone number to check
 * @returns {boolean} True if appears to be mobile format
 */
const isMobilePhone = phone => {
  try {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    const normalized = normalizePhoneNumber(phone);
    if (!normalized) {
      return false;
    }

    // This is a simplified check - in production use a proper mobile detection library
    const countryCode = extractCountryCode(normalized);

    // Basic mobile patterns for common countries
    const mobilePatterns = {
      '+1': /^\+1[2-9]\d{9}$/, // US/Canada mobile
      '+44': /^\+447\d{9}$/, // UK mobile
      '+33': /^\+33[67]\d{8}$/, // France mobile
      '+49': /^\+491[5-7]\d{8}$/, // Germany mobile
      '+81': /^\+81[7-9]\d{8}$/, // Japan mobile
      '+86': /^\+861[3-9]\d{9}$/, // China mobile
      '+91': /^\+91[6-9]\d{9}$/, // India mobile
    };

    if (countryCode && mobilePatterns[countryCode]) {
      return mobilePatterns[countryCode].test(normalized);
    }

    // Default mobile check - if no specific pattern, assume mobile if valid phone
    return isValidPhoneFormat(phone);
  } catch (error) {
    return false;
  }
};

/**
 * Comprehensive phone validation
 * @param {string} phone - Phone number to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
const validatePhoneNumber = (phone, options = {}) => {
  try {
    if (!phone || typeof phone !== 'string') {
      return {
        isValid: false,
        errors: ['Phone number is required'],
      };
    }

    const errors = [];
    const warnings = [];

    const rules = {
      requireInternational: options.requireInternational || false,
      requireMobile: options.requireMobile || false,
      allowedCountries: options.allowedCountries || [],
      minLength: options.minLength || 7,
      maxLength: options.maxLength || 15,
    };

    const normalized = normalizePhoneNumber(phone);
    if (!normalized) {
      errors.push('Invalid phone number format');
      return { isValid: false, errors, warnings };
    }

    // Basic format validation
    if (!isValidPhoneFormat(phone)) {
      errors.push('Phone number format is invalid');
    }

    // Length validation
    if (!isValidPhoneLength(phone, rules.minLength, rules.maxLength)) {
      errors.push(
        `Phone number must be between ${rules.minLength} and ${rules.maxLength} digits`
      );
    }

    // International format requirement
    if (rules.requireInternational && !isValidInternationalPhone(phone)) {
      errors.push(
        'International phone number format required (must start with +)'
      );
    }

    // Mobile requirement
    if (rules.requireMobile && !isMobilePhone(phone)) {
      errors.push('Mobile phone number required');
    }

    // Country restrictions
    if (rules.allowedCountries.length > 0) {
      const countryCode = extractCountryCode(normalized);
      if (!countryCode || !rules.allowedCountries.includes(countryCode)) {
        errors.push(
          `Phone number must be from allowed countries: ${rules.allowedCountries.join(', ')}`
        );
      }
    }

    // Extract metadata
    const countryCode = extractCountryCode(normalized);
    const formatted = formatPhoneNumber(phone);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      normalized,
      formatted,
      countryCode,
      isMobile: isMobilePhone(phone),
      isInternational: isValidInternationalPhone(phone),
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Phone validation failed'],
      warnings: [],
    };
  }
};

/**
 * Generate phone number suggestions for common typos
 * @param {string} phone - Phone number
 * @returns {Array<string>} Array of suggested phone numbers
 */
const suggestPhoneCorrections = phone => {
  try {
    if (!phone || typeof phone !== 'string') {
      return [];
    }

    const suggestions = [];
    const normalized = normalizePhoneNumber(phone);

    if (!normalized) {
      return suggestions;
    }

    // Add + if missing for international format
    if (!phone.startsWith('+') && normalized.length > 10) {
      suggestions.push(`+${normalized}`);
    }

    // Add country code if missing (assume +1 for US/Canada)
    if (!phone.startsWith('+') && normalized.length === 10) {
      suggestions.push(`+1${normalized}`);
    }

    // Format suggestions
    const formatted = formatPhoneNumber(phone, 'international');
    if (formatted && formatted !== phone) {
      suggestions.push(formatted);
    }

    const nationalFormatted = formatPhoneNumber(phone, 'national');
    if (nationalFormatted && nationalFormatted !== phone) {
      suggestions.push(nationalFormatted);
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  } catch (error) {
    return [];
  }
};

/**
 * Check if phone number might be a spam/invalid number
 * @param {string} phone - Phone number to check
 * @returns {boolean} True if phone might be spam
 */
const isLikelySpamPhone = phone => {
  try {
    if (!phone || typeof phone !== 'string') {
      return false;
    }

    const normalized = normalizePhoneNumber(phone);
    if (!normalized) {
      return true; // Invalid format is suspicious
    }

    // Check for suspicious patterns
    const spamPatterns = [
      /^(\+1)?1{10}$/, // All 1s
      /^(\+1)?0{10}$/, // All 0s
      /^(\+1)?\d(\1){9}$/, // Repeated digit
      /^(\+1)?123456789\d?$/, // Sequential numbers
      /^(\+1)?555\d{7}$/, // Movie phone numbers
      /^(\+1)?000\d{7}$/, // Starts with 000
      /^(\+1)?999\d{7}$/, // Starts with 999
    ];

    return spamPatterns.some(pattern => pattern.test(normalized));
  } catch (error) {
    return false;
  }
};

module.exports = {
  normalizePhoneNumber,
  isValidPhoneFormat,
  isValidUSPhone,
  isValidInternationalPhone,
  extractCountryCode,
  formatPhoneNumber,
  isValidPhoneLength,
  isMobilePhone,
  validatePhoneNumber,
  suggestPhoneCorrections,
  isLikelySpamPhone,
};
