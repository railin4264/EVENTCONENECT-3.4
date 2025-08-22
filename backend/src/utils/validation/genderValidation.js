/**
 * Gender validation utilities
 */

/**
 * List of valid gender options
 */
const VALID_GENDERS = [
  'male',
  'female',
  'non-binary',
  'genderfluid',
  'agender',
  'transgender',
  'other',
  'prefer-not-to-say',
];

/**
 * Gender aliases and mappings
 */
const GENDER_ALIASES = {
  m: 'male',
  man: 'male',
  masculine: 'male',
  f: 'female',
  woman: 'female',
  feminine: 'female',
  nb: 'non-binary',
  nonbinary: 'non-binary',
  enby: 'non-binary',
  fluid: 'genderfluid',
  trans: 'transgender',
  'transgender-male': 'transgender',
  'transgender-female': 'transgender',
  ftm: 'transgender',
  mtf: 'transgender',
  decline: 'prefer-not-to-say',
  none: 'prefer-not-to-say',
  na: 'prefer-not-to-say',
  'n/a': 'prefer-not-to-say',
};

/**
 * Check if gender value is valid
 * @param {string} gender - Gender value to validate
 * @returns {boolean} True if valid gender
 */
const isValidGender = gender => {
  try {
    if (!gender || typeof gender !== 'string') {
      return false;
    }

    const normalizedGender = normalizeGender(gender);
    return VALID_GENDERS.includes(normalizedGender);
  } catch (error) {
    return false;
  }
};

/**
 * Normalize gender input to standard format
 * @param {string} gender - Gender input to normalize
 * @returns {string|null} Normalized gender or null if invalid
 */
const normalizeGender = gender => {
  try {
    if (!gender || typeof gender !== 'string') {
      return null;
    }

    const cleaned = gender.toLowerCase().trim().replace(/\s+/g, '-');

    // Check direct match first
    if (VALID_GENDERS.includes(cleaned)) {
      return cleaned;
    }

    // Check aliases
    if (GENDER_ALIASES[cleaned]) {
      return GENDER_ALIASES[cleaned];
    }

    // Check partial matches
    for (const validGender of VALID_GENDERS) {
      if (cleaned.includes(validGender.replace('-', ''))) {
        return validGender;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Get display name for gender
 * @param {string} gender - Gender value
 * @returns {string} Display name
 */
const getGenderDisplayName = gender => {
  try {
    if (!gender || typeof gender !== 'string') {
      return 'Not specified';
    }

    const normalized = normalizeGender(gender);
    if (!normalized) {
      return 'Other';
    }

    const displayNames = {
      male: 'Male',
      female: 'Female',
      'non-binary': 'Non-binary',
      genderfluid: 'Genderfluid',
      agender: 'Agender',
      transgender: 'Transgender',
      other: 'Other',
      'prefer-not-to-say': 'Prefer not to say',
    };

    return displayNames[normalized] || 'Other';
  } catch (error) {
    return 'Not specified';
  }
};

/**
 * Get gender pronouns
 * @param {string} gender - Gender value
 * @returns {Object} Pronouns object
 */
const getGenderPronouns = gender => {
  try {
    if (!gender || typeof gender !== 'string') {
      return {
        subject: 'they',
        object: 'them',
        possessive: 'their',
        reflexive: 'themselves',
      };
    }

    const normalized = normalizeGender(gender);

    const pronouns = {
      male: {
        subject: 'he',
        object: 'him',
        possessive: 'his',
        reflexive: 'himself',
      },
      female: {
        subject: 'she',
        object: 'her',
        possessive: 'her',
        reflexive: 'herself',
      },
      'non-binary': {
        subject: 'they',
        object: 'them',
        possessive: 'their',
        reflexive: 'themselves',
      },
      genderfluid: {
        subject: 'they',
        object: 'them',
        possessive: 'their',
        reflexive: 'themselves',
      },
      agender: {
        subject: 'they',
        object: 'them',
        possessive: 'their',
        reflexive: 'themselves',
      },
      transgender: {
        subject: 'they',
        object: 'them',
        possessive: 'their',
        reflexive: 'themselves',
      },
      other: {
        subject: 'they',
        object: 'them',
        possessive: 'their',
        reflexive: 'themselves',
      },
      'prefer-not-to-say': {
        subject: 'they',
        object: 'them',
        possessive: 'their',
        reflexive: 'themselves',
      },
    };

    return pronouns[normalized] || pronouns['other'];
  } catch (error) {
    return {
      subject: 'they',
      object: 'them',
      possessive: 'their',
      reflexive: 'themselves',
    };
  }
};

/**
 * Check if gender is binary (male/female)
 * @param {string} gender - Gender value
 * @returns {boolean} True if binary gender
 */
const isBinaryGender = gender => {
  try {
    if (!gender || typeof gender !== 'string') {
      return false;
    }

    const normalized = normalizeGender(gender);
    return normalized === 'male' || normalized === 'female';
  } catch (error) {
    return false;
  }
};

/**
 * Check if gender is non-binary
 * @param {string} gender - Gender value
 * @returns {boolean} True if non-binary gender
 */
const isNonBinaryGender = gender => {
  try {
    if (!gender || typeof gender !== 'string') {
      return false;
    }

    const normalized = normalizeGender(gender);
    const nonBinaryGenders = ['non-binary', 'genderfluid', 'agender', 'other'];
    return nonBinaryGenders.includes(normalized);
  } catch (error) {
    return false;
  }
};

/**
 * Get all available gender options
 * @returns {Array} Array of gender options
 */
const getGenderOptions = () => {
  return VALID_GENDERS.map(gender => ({
    value: gender,
    label: getGenderDisplayName(gender),
    pronouns: getGenderPronouns(gender),
  }));
};

/**
 * Validate gender input
 * @param {string} gender - Gender to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
const validateGender = (gender, options = {}) => {
  try {
    if (!gender && !options.required) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
        normalized: null,
        displayName: 'Not specified',
      };
    }

    if (!gender && options.required) {
      return {
        isValid: false,
        errors: ['Gender is required'],
      };
    }

    const errors = [];
    const warnings = [];

    if (typeof gender !== 'string') {
      errors.push('Gender must be a string');
      return { isValid: false, errors, warnings };
    }

    const normalized = normalizeGender(gender);

    if (!normalized) {
      errors.push('Invalid gender value');

      // Suggest alternatives
      const suggestions = suggestGenderCorrections(gender);
      if (suggestions.length > 0) {
        warnings.push(`Did you mean: ${suggestions.join(', ')}?`);
      }

      return { isValid: false, errors, warnings };
    }

    // Business rule validations
    if (options.allowBinaryOnly && !isBinaryGender(normalized)) {
      errors.push('Only binary genders (male/female) are allowed');
    }

    if (options.disallowPreferNotToSay && normalized === 'prefer-not-to-say') {
      errors.push('Gender specification is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      normalized,
      displayName: getGenderDisplayName(normalized),
      pronouns: getGenderPronouns(normalized),
      isBinary: isBinaryGender(normalized),
      isNonBinary: isNonBinaryGender(normalized),
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Gender validation failed'],
      warnings: [],
    };
  }
};

/**
 * Suggest gender corrections for typos
 * @param {string} gender - Gender input
 * @returns {Array} Array of suggested corrections
 */
const suggestGenderCorrections = gender => {
  try {
    if (!gender || typeof gender !== 'string') {
      return [];
    }

    const input = gender.toLowerCase().trim();
    const suggestions = [];

    // Check for partial matches
    for (const validGender of VALID_GENDERS) {
      const distance = calculateLevenshteinDistance(input, validGender);
      if (distance <= 2) {
        suggestions.push(validGender);
      }
    }

    // Check aliases
    for (const [alias, validGender] of Object.entries(GENDER_ALIASES)) {
      const distance = calculateLevenshteinDistance(input, alias);
      if (distance <= 1) {
        suggestions.push(validGender);
      }
    }

    // Remove duplicates and limit
    return [...new Set(suggestions)].slice(0, 3);
  } catch (error) {
    return [];
  }
};

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Edit distance
 */
const calculateLevenshteinDistance = (str1, str2) => {
  try {
    if (!str1 || !str2) {
      return Math.max(str1?.length || 0, str2?.length || 0);
    }

    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  } catch (error) {
    return 999;
  }
};

/**
 * Format gender for display in different contexts
 * @param {string} gender - Gender value
 * @param {string} context - Display context ('formal', 'casual', 'short')
 * @returns {string} Formatted gender string
 */
const formatGenderForContext = (gender, context = 'formal') => {
  try {
    if (!gender || typeof gender !== 'string') {
      return 'Not specified';
    }

    const normalized = normalizeGender(gender);
    if (!normalized) {
      return 'Other';
    }

    const formats = {
      formal: {
        male: 'Male',
        female: 'Female',
        'non-binary': 'Non-binary',
        genderfluid: 'Genderfluid',
        agender: 'Agender',
        transgender: 'Transgender',
        other: 'Other',
        'prefer-not-to-say': 'Prefer not to say',
      },
      casual: {
        male: 'Guy',
        female: 'Gal',
        'non-binary': 'Non-binary',
        genderfluid: 'Genderfluid',
        agender: 'Agender',
        transgender: 'Trans',
        other: 'Other',
        'prefer-not-to-say': 'Private',
      },
      short: {
        male: 'M',
        female: 'F',
        'non-binary': 'NB',
        genderfluid: 'GF',
        agender: 'AG',
        transgender: 'T',
        other: 'O',
        'prefer-not-to-say': 'N/A',
      },
    };

    const contextFormats = formats[context] || formats.formal;
    return contextFormats[normalized] || 'Other';
  } catch (error) {
    return 'Not specified';
  }
};

/**
 * Check if gender data is sensitive/private
 * @param {string} gender - Gender value
 * @returns {boolean} True if gender data should be treated as sensitive
 */
const isGenderDataSensitive = gender => {
  try {
    if (!gender || typeof gender !== 'string') {
      return true; // Treat unknown as sensitive
    }

    const normalized = normalizeGender(gender);
    const sensitiveGenders = [
      'transgender',
      'non-binary',
      'genderfluid',
      'agender',
      'prefer-not-to-say',
    ];

    return sensitiveGenders.includes(normalized);
  } catch (error) {
    return true; // Err on the side of caution
  }
};

module.exports = {
  VALID_GENDERS,
  GENDER_ALIASES,
  isValidGender,
  normalizeGender,
  getGenderDisplayName,
  getGenderPronouns,
  isBinaryGender,
  isNonBinaryGender,
  getGenderOptions,
  validateGender,
  suggestGenderCorrections,
  formatGenderForContext,
  isGenderDataSensitive,
};
