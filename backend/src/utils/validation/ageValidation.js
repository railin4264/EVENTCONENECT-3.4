/**
 * Age validation utilities
 */

/**
 * Calculate age from birth date
 * @param {Date|string} birthDate - Birth date
 * @returns {number} Age in years
 */
const calculateAge = birthDate => {
  try {
    if (!birthDate) {
      return 0;
    }

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return 0;
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return Math.max(0, age);
  } catch (error) {
    return 0;
  }
};

/**
 * Check if age meets minimum requirement
 * @param {Date|string} birthDate - Birth date
 * @param {number} minAge - Minimum age required
 * @returns {boolean} True if age meets minimum requirement
 */
const meetsMinimumAge = (birthDate, minAge) => {
  try {
    if (!birthDate || typeof minAge !== 'number') {
      return false;
    }

    const age = calculateAge(birthDate);
    return age >= minAge;
  } catch (error) {
    return false;
  }
};

/**
 * Check if age is within valid range
 * @param {Date|string} birthDate - Birth date
 * @param {number} minAge - Minimum age
 * @param {number} maxAge - Maximum age
 * @returns {boolean} True if age is within range
 */
const isValidAgeRange = (birthDate, minAge = 0, maxAge = 150) => {
  try {
    if (!birthDate) {
      return false;
    }

    const age = calculateAge(birthDate);
    return age >= minAge && age <= maxAge;
  } catch (error) {
    return false;
  }
};

/**
 * Check if person is adult (18 or older by default)
 * @param {Date|string} birthDate - Birth date
 * @param {number} adultAge - Age of majority (default 18)
 * @returns {boolean} True if person is adult
 */
const isAdult = (birthDate, adultAge = 18) => {
  try {
    return meetsMinimumAge(birthDate, adultAge);
  } catch (error) {
    return false;
  }
};

/**
 * Check if person is minor (under 18 by default)
 * @param {Date|string} birthDate - Birth date
 * @param {number} adultAge - Age of majority (default 18)
 * @returns {boolean} True if person is minor
 */
const isMinor = (birthDate, adultAge = 18) => {
  try {
    return !isAdult(birthDate, adultAge);
  } catch (error) {
    return false;
  }
};

/**
 * Check if person is senior (65 or older by default)
 * @param {Date|string} birthDate - Birth date
 * @param {number} seniorAge - Senior age threshold (default 65)
 * @returns {boolean} True if person is senior
 */
const isSenior = (birthDate, seniorAge = 65) => {
  try {
    return meetsMinimumAge(birthDate, seniorAge);
  } catch (error) {
    return false;
  }
};

/**
 * Get age group classification
 * @param {Date|string} birthDate - Birth date
 * @returns {string} Age group ('infant', 'child', 'teenager', 'adult', 'senior')
 */
const getAgeGroup = birthDate => {
  try {
    if (!birthDate) {
      return 'unknown';
    }

    const age = calculateAge(birthDate);

    if (age < 2) return 'infant';
    if (age < 13) return 'child';
    if (age < 18) return 'teenager';
    if (age < 65) return 'adult';
    return 'senior';
  } catch (error) {
    return 'unknown';
  }
};

/**
 * Calculate age in different units
 * @param {Date|string} birthDate - Birth date
 * @param {string} unit - Unit ('years', 'months', 'days', 'hours')
 * @returns {number} Age in specified unit
 */
const calculateAgeInUnit = (birthDate, unit = 'years') => {
  try {
    if (!birthDate) {
      return 0;
    }

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return 0;
    }

    const today = new Date();
    const diffMs = today.getTime() - birth.getTime();

    switch (unit.toLowerCase()) {
      case 'milliseconds':
        return diffMs;
      case 'seconds':
        return Math.floor(diffMs / 1000);
      case 'minutes':
        return Math.floor(diffMs / (1000 * 60));
      case 'hours':
        return Math.floor(diffMs / (1000 * 60 * 60));
      case 'days':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      case 'weeks':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
      case 'months':
        // Approximate calculation
        let months = (today.getFullYear() - birth.getFullYear()) * 12;
        months += today.getMonth() - birth.getMonth();
        if (today.getDate() < birth.getDate()) {
          months--;
        }
        return Math.max(0, months);
      case 'years':
      default:
        return calculateAge(birthDate);
    }
  } catch (error) {
    return 0;
  }
};

/**
 * Get next birthday
 * @param {Date|string} birthDate - Birth date
 * @returns {Date|null} Next birthday date or null if invalid
 */
const getNextBirthday = birthDate => {
  try {
    if (!birthDate) {
      return null;
    }

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return null;
    }

    const today = new Date();
    const currentYear = today.getFullYear();

    // Create this year's birthday
    const thisYearBirthday = new Date(
      currentYear,
      birth.getMonth(),
      birth.getDate()
    );

    // If this year's birthday has passed, get next year's
    if (thisYearBirthday <= today) {
      return new Date(currentYear + 1, birth.getMonth(), birth.getDate());
    }

    return thisYearBirthday;
  } catch (error) {
    return null;
  }
};

/**
 * Get days until next birthday
 * @param {Date|string} birthDate - Birth date
 * @returns {number} Days until next birthday
 */
const getDaysUntilBirthday = birthDate => {
  try {
    const nextBirthday = getNextBirthday(birthDate);
    if (!nextBirthday) {
      return 0;
    }

    const today = new Date();
    const diffMs = nextBirthday.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
};

/**
 * Check if today is person's birthday
 * @param {Date|string} birthDate - Birth date
 * @returns {boolean} True if today is birthday
 */
const isBirthday = birthDate => {
  try {
    if (!birthDate) {
      return false;
    }

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return false;
    }

    const today = new Date();
    return (
      birth.getMonth() === today.getMonth() &&
      birth.getDate() === today.getDate()
    );
  } catch (error) {
    return false;
  }
};

/**
 * Validate age against business rules
 * @param {Date|string} birthDate - Birth date
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
const validateAge = (birthDate, options = {}) => {
  try {
    if (!birthDate) {
      return {
        isValid: false,
        errors: ['Birth date is required'],
      };
    }

    const errors = [];
    const warnings = [];

    const rules = {
      minAge: options.minAge || 0,
      maxAge: options.maxAge || 150,
      requireAdult: options.requireAdult || false,
      allowFutureBirth: options.allowFutureBirth || false,
      adultAge: options.adultAge || 18,
    };

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      errors.push('Invalid birth date format');
      return { isValid: false, errors, warnings };
    }

    // Check if birth date is in the future
    if (!rules.allowFutureBirth && birth > new Date()) {
      errors.push('Birth date cannot be in the future');
    }

    const age = calculateAge(birthDate);

    // Age range validation
    if (age < rules.minAge) {
      errors.push(`Age must be at least ${rules.minAge} years`);
    }

    if (age > rules.maxAge) {
      errors.push(`Age cannot exceed ${rules.maxAge} years`);
    }

    // Adult requirement
    if (rules.requireAdult && !isAdult(birthDate, rules.adultAge)) {
      errors.push(`Must be at least ${rules.adultAge} years old`);
    }

    // Warnings
    if (age > 100) {
      warnings.push('Age over 100 years detected - please verify');
    }

    if (isBirthday(birthDate)) {
      warnings.push("Today is this person's birthday!");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      age,
      ageGroup: getAgeGroup(birthDate),
      isAdult: isAdult(birthDate, rules.adultAge),
      isMinor: isMinor(birthDate, rules.adultAge),
      isSenior: isSenior(birthDate),
      isBirthday: isBirthday(birthDate),
      daysUntilBirthday: getDaysUntilBirthday(birthDate),
      nextBirthday: getNextBirthday(birthDate),
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Age validation failed'],
      warnings: [],
    };
  }
};

/**
 * Format age for display
 * @param {Date|string} birthDate - Birth date
 * @param {Object} options - Formatting options
 * @returns {string} Formatted age string
 */
const formatAge = (birthDate, options = {}) => {
  try {
    if (!birthDate) {
      return 'Unknown age';
    }

    const age = calculateAge(birthDate);
    const includeMonths = options.includeMonths || false;
    const includeDays = options.includeDays || false;

    if (age === 0 && (includeMonths || includeDays)) {
      const ageInMonths = calculateAgeInUnit(birthDate, 'months');
      const ageInDays = calculateAgeInUnit(birthDate, 'days');

      if (ageInMonths === 0 && includeDays) {
        return `${ageInDays} day${ageInDays !== 1 ? 's' : ''} old`;
      }

      if (includeMonths) {
        return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''} old`;
      }
    }

    if (age === 1) {
      return '1 year old';
    }

    return `${age} years old`;
  } catch (error) {
    return 'Unknown age';
  }
};

/**
 * Check if age verification is required for service
 * @param {Date|string} birthDate - Birth date
 * @param {string} service - Service type
 * @returns {boolean} True if age verification required
 */
const requiresAgeVerification = (birthDate, service) => {
  try {
    if (!birthDate || !service) {
      return true; // Require verification if unclear
    }

    const age = calculateAge(birthDate);

    const serviceAgeRequirements = {
      alcohol: 21,
      tobacco: 18,
      gambling: 18,
      voting: 18,
      driving: 16,
      social_media: 13,
      general: 0,
    };

    const requiredAge = serviceAgeRequirements[service.toLowerCase()] || 18;
    return age < requiredAge;
  } catch (error) {
    return true; // Require verification on error
  }
};

/**
 * Get zodiac sign from birth date
 * @param {Date|string} birthDate - Birth date
 * @returns {string} Zodiac sign
 */
const getZodiacSign = birthDate => {
  try {
    if (!birthDate) {
      return 'unknown';
    }

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) {
      return 'unknown';
    }

    const month = birth.getMonth() + 1; // JavaScript months are 0-indexed
    const day = birth.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19))
      return 'aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20))
      return 'taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
      return 'gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22))
      return 'cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22))
      return 'virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22))
      return 'libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
      return 'scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
      return 'sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
      return 'capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
      return 'aquarius';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20))
      return 'pisces';

    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
};

module.exports = {
  calculateAge,
  meetsMinimumAge,
  isValidAgeRange,
  isAdult,
  isMinor,
  isSenior,
  getAgeGroup,
  calculateAgeInUnit,
  getNextBirthday,
  getDaysUntilBirthday,
  isBirthday,
  validateAge,
  formatAge,
  requiresAgeVerification,
  getZodiacSign,
};
