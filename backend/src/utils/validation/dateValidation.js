/**
 * Date validation utilities
 */

/**
 * Check if a value is a valid date
 * @param {*} date - Value to check
 * @returns {boolean} True if valid date
 */
const isValidDate = date => {
  try {
    if (!date) {
      return false;
    }

    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Check if date is in the past
 * @param {*} date - Date to check
 * @returns {boolean} True if date is in the past
 */
const isDateInPast = date => {
  try {
    if (!isValidDate(date)) {
      return false;
    }

    const dateObj = new Date(date);
    const now = new Date();
    return dateObj < now;
  } catch (error) {
    return false;
  }
};

/**
 * Check if date is in the future
 * @param {*} date - Date to check
 * @returns {boolean} True if date is in the future
 */
const isDateInFuture = date => {
  try {
    if (!isValidDate(date)) {
      return false;
    }

    const dateObj = new Date(date);
    const now = new Date();
    return dateObj > now;
  } catch (error) {
    return false;
  }
};

/**
 * Check if date is today
 * @param {*} date - Date to check
 * @returns {boolean} True if date is today
 */
const isDateToday = date => {
  try {
    if (!isValidDate(date)) {
      return false;
    }

    const dateObj = new Date(date);
    const today = new Date();

    return (
      dateObj.getFullYear() === today.getFullYear() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getDate() === today.getDate()
    );
  } catch (error) {
    return false;
  }
};

/**
 * Check if date is within a range
 * @param {*} date - Date to check
 * @param {*} startDate - Start of range
 * @param {*} endDate - End of range
 * @returns {boolean} True if date is within range
 */
const isDateInRange = (date, startDate, endDate) => {
  try {
    if (
      !isValidDate(date) ||
      !isValidDate(startDate) ||
      !isValidDate(endDate)
    ) {
      return false;
    }

    const dateObj = new Date(date);
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);

    return dateObj >= startObj && dateObj <= endObj;
  } catch (error) {
    return false;
  }
};

/**
 * Check if age is valid based on birthdate
 * @param {*} birthDate - Birth date
 * @param {number} minAge - Minimum age
 * @param {number} maxAge - Maximum age
 * @returns {boolean} True if age is valid
 */
const isValidAge = (birthDate, minAge = 0, maxAge = 150) => {
  try {
    if (!isValidDate(birthDate)) {
      return false;
    }

    const age = calculateAge(birthDate);
    return age >= minAge && age <= maxAge;
  } catch (error) {
    return false;
  }
};

/**
 * Calculate age from birth date
 * @param {*} birthDate - Birth date
 * @returns {number} Age in years
 */
const calculateAge = birthDate => {
  try {
    if (!isValidDate(birthDate)) {
      return 0;
    }

    const birthObj = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birthObj.getFullYear();
    const monthDiff = today.getMonth() - birthObj.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthObj.getDate())
    ) {
      age--;
    }

    return Math.max(0, age);
  } catch (error) {
    return 0;
  }
};

/**
 * Check if date format matches expected format
 * @param {string} dateString - Date string to validate
 * @param {string} format - Expected format ('YYYY-MM-DD', 'MM/DD/YYYY', etc.)
 * @returns {boolean} True if format matches
 */
const isValidDateFormat = (dateString, format = 'YYYY-MM-DD') => {
  try {
    if (!dateString || typeof dateString !== 'string') {
      return false;
    }

    const formatPatterns = {
      'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
      'MM/DD/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
      'DD/MM/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
      'YYYY/MM/DD': /^\d{4}\/\d{2}\/\d{2}$/,
      'DD-MM-YYYY': /^\d{2}-\d{2}-\d{4}$/,
      'MM-DD-YYYY': /^\d{2}-\d{2}-\d{4}$/,
      'YYYY.MM.DD': /^\d{4}\.\d{2}\.\d{2}$/,
      'DD.MM.YYYY': /^\d{2}\.\d{2}\.\d{4}$/,
    };

    const pattern = formatPatterns[format];
    if (!pattern) {
      return false;
    }

    return pattern.test(dateString);
  } catch (error) {
    return false;
  }
};

/**
 * Parse date string according to format
 * @param {string} dateString - Date string to parse
 * @param {string} format - Date format
 * @returns {Date|null} Parsed date or null if invalid
 */
const parseDateString = (dateString, format = 'YYYY-MM-DD') => {
  try {
    if (!dateString || typeof dateString !== 'string') {
      return null;
    }

    if (!isValidDateFormat(dateString, format)) {
      return null;
    }

    let year, month, day;

    switch (format) {
      case 'YYYY-MM-DD':
      case 'YYYY/MM/DD':
      case 'YYYY.MM.DD':
        [year, month, day] = dateString.split(/[-/.]/);
        break;

      case 'MM/DD/YYYY':
      case 'MM-DD-YYYY':
        [month, day, year] = dateString.split(/[-/]/);
        break;

      case 'DD/MM/YYYY':
      case 'DD-MM-YYYY':
      case 'DD.MM.YYYY':
        [day, month, year] = dateString.split(/[-/.]/);
        break;

      default:
        return null;
    }

    const dateObj = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );

    // Validate that the date is what we expect (handles invalid dates like Feb 30)
    if (
      dateObj.getFullYear() !== parseInt(year) ||
      dateObj.getMonth() !== parseInt(month) - 1 ||
      dateObj.getDate() !== parseInt(day)
    ) {
      return null;
    }

    return dateObj;
  } catch (error) {
    return null;
  }
};

/**
 * Format date to string
 * @param {*} date - Date to format
 * @param {string} format - Output format
 * @returns {string|null} Formatted date string or null if invalid
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  try {
    if (!isValidDate(date)) {
      return null;
    }

    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY/MM/DD':
        return `${year}/${month}/${day}`;
      case 'DD-MM-YYYY':
        return `${day}-${month}-${year}`;
      case 'MM-DD-YYYY':
        return `${month}-${day}-${year}`;
      case 'YYYY.MM.DD':
        return `${year}.${month}.${day}`;
      case 'DD.MM.YYYY':
        return `${day}.${month}.${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  } catch (error) {
    return null;
  }
};

/**
 * Check if year is a leap year
 * @param {number} year - Year to check
 * @returns {boolean} True if leap year
 */
const isLeapYear = year => {
  try {
    if (!year || typeof year !== 'number') {
      return false;
    }

    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  } catch (error) {
    return false;
  }
};

/**
 * Get days in month
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {number} Number of days in month
 */
const getDaysInMonth = (month, year) => {
  try {
    if (
      !month ||
      !year ||
      typeof month !== 'number' ||
      typeof year !== 'number'
    ) {
      return 0;
    }

    if (month < 1 || month > 12) {
      return 0;
    }

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (month === 2 && isLeapYear(year)) {
      return 29;
    }

    return daysInMonth[month - 1];
  } catch (error) {
    return 0;
  }
};

/**
 * Calculate difference between dates
 * @param {*} date1 - First date
 * @param {*} date2 - Second date
 * @param {string} unit - Unit ('days', 'months', 'years', 'hours', 'minutes')
 * @returns {number} Difference in specified unit
 */
const dateDifference = (date1, date2, unit = 'days') => {
  try {
    if (!isValidDate(date1) || !isValidDate(date2)) {
      return 0;
    }

    const dateObj1 = new Date(date1);
    const dateObj2 = new Date(date2);
    const diffMs = Math.abs(dateObj2.getTime() - dateObj1.getTime());

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
        return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
      case 'years':
        // Approximate calculation
        return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
      default:
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }
  } catch (error) {
    return 0;
  }
};

/**
 * Add time to date
 * @param {*} date - Base date
 * @param {number} amount - Amount to add
 * @param {string} unit - Unit ('days', 'months', 'years', 'hours', 'minutes')
 * @returns {Date|null} New date or null if invalid
 */
const addToDate = (date, amount, unit = 'days') => {
  try {
    if (!isValidDate(date) || typeof amount !== 'number') {
      return null;
    }

    const dateObj = new Date(date);

    switch (unit.toLowerCase()) {
      case 'milliseconds':
        dateObj.setMilliseconds(dateObj.getMilliseconds() + amount);
        break;
      case 'seconds':
        dateObj.setSeconds(dateObj.getSeconds() + amount);
        break;
      case 'minutes':
        dateObj.setMinutes(dateObj.getMinutes() + amount);
        break;
      case 'hours':
        dateObj.setHours(dateObj.getHours() + amount);
        break;
      case 'days':
        dateObj.setDate(dateObj.getDate() + amount);
        break;
      case 'weeks':
        dateObj.setDate(dateObj.getDate() + amount * 7);
        break;
      case 'months':
        dateObj.setMonth(dateObj.getMonth() + amount);
        break;
      case 'years':
        dateObj.setFullYear(dateObj.getFullYear() + amount);
        break;
      default:
        dateObj.setDate(dateObj.getDate() + amount);
    }

    return dateObj;
  } catch (error) {
    return null;
  }
};

/**
 * Comprehensive date validation
 * @param {*} date - Date to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
const validateDate = (date, options = {}) => {
  try {
    if (!date) {
      return {
        isValid: false,
        errors: ['Date is required'],
      };
    }

    const errors = [];
    const warnings = [];

    const rules = {
      allowPast: options.allowPast !== false,
      allowFuture: options.allowFuture !== false,
      allowToday: options.allowToday !== false,
      minDate: options.minDate || null,
      maxDate: options.maxDate || null,
      minAge: options.minAge || null,
      maxAge: options.maxAge || null,
      requiredFormat: options.requiredFormat || null,
    };

    // Basic date validation
    if (!isValidDate(date)) {
      errors.push('Invalid date format');
      return { isValid: false, errors, warnings };
    }

    const dateObj = new Date(date);

    // Format validation
    if (rules.requiredFormat && typeof date === 'string') {
      if (!isValidDateFormat(date, rules.requiredFormat)) {
        errors.push(`Date must be in ${rules.requiredFormat} format`);
      }
    }

    // Past/Future validation
    if (!rules.allowPast && isDateInPast(date)) {
      errors.push('Past dates are not allowed');
    }

    if (!rules.allowFuture && isDateInFuture(date)) {
      errors.push('Future dates are not allowed');
    }

    if (!rules.allowToday && isDateToday(date)) {
      errors.push("Today's date is not allowed");
    }

    // Range validation
    if (
      rules.minDate &&
      !isDateInRange(date, rules.minDate, new Date('2100-12-31'))
    ) {
      errors.push(`Date must be after ${formatDate(rules.minDate)}`);
    }

    if (
      rules.maxDate &&
      !isDateInRange(date, new Date('1900-01-01'), rules.maxDate)
    ) {
      errors.push(`Date must be before ${formatDate(rules.maxDate)}`);
    }

    // Age validation (if birth date)
    if (rules.minAge !== null || rules.maxAge !== null) {
      const age = calculateAge(date);

      if (rules.minAge !== null && age < rules.minAge) {
        errors.push(`Age must be at least ${rules.minAge} years`);
      }

      if (rules.maxAge !== null && age > rules.maxAge) {
        errors.push(`Age must not exceed ${rules.maxAge} years`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      date: dateObj,
      formatted: formatDate(dateObj),
      age: calculateAge(dateObj),
      isToday: isDateToday(dateObj),
      isPast: isDateInPast(dateObj),
      isFuture: isDateInFuture(dateObj),
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Date validation failed'],
      warnings: [],
    };
  }
};

/**
 * Get date suggestions for common typos
 * @param {string} dateString - Date string
 * @returns {Array<string>} Array of suggested dates
 */
const suggestDateCorrections = dateString => {
  try {
    if (!dateString || typeof dateString !== 'string') {
      return [];
    }

    const suggestions = [];
    const today = new Date();

    // Try different formats
    const formats = ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD'];

    formats.forEach(format => {
      const parsed = parseDateString(dateString, format);
      if (parsed && isValidDate(parsed)) {
        suggestions.push(formatDate(parsed));
      }
    });

    // If no valid suggestions, suggest today's date
    if (suggestions.length === 0) {
      suggestions.push(formatDate(today));
    }

    // Remove duplicates and limit
    return [...new Set(suggestions)].slice(0, 5);
  } catch (error) {
    return [];
  }
};

module.exports = {
  isValidDate,
  isDateInPast,
  isDateInFuture,
  isDateToday,
  isDateInRange,
  isValidAge,
  calculateAge,
  isValidDateFormat,
  parseDateString,
  formatDate,
  isLeapYear,
  getDaysInMonth,
  dateDifference,
  addToDate,
  validateDate,
  suggestDateCorrections,
};
