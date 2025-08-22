// Validate coordinates
const validateCoordinates = (latitude, longitude) => {
  try {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return false;
    }

    // Latitude: -90 to 90
    if (latitude < -90 || latitude > 90) {
      return false;
    }

    // Longitude: -180 to 180
    if (longitude < -180 || longitude > 180) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating coordinates:', error);
    return false;
  }
};

// Validate address format
const validateAddressFormat = address => {
  try {
    if (!address || typeof address !== 'string') {
      return false;
    }

    // Basic address validation
    const addressRegex = /^[a-zA-Z0-9\s,.-]+$/;
    return addressRegex.test(address);
  } catch (error) {
    console.error('Error validating address format:', error);
    return false;
  }
};

// Validate city name
const validateCityName = city => {
  try {
    if (!city || typeof city !== 'string') {
      return false;
    }

    // City name validation
    const cityRegex = /^[a-zA-Z\s-']+$/;
    return cityRegex.test(city);
  } catch (error) {
    console.error('Error validating city name:', error);
    return false;
  }
};

// Validate postal code
const validatePostalCode = (postalCode, country = 'US') => {
  try {
    if (!postalCode || typeof postalCode !== 'string') {
      return false;
    }

    let regex;
    switch (country.toUpperCase()) {
      case 'US':
        regex = /^\d{5}(-\d{4})?$/;
        break;
      case 'CA':
        regex = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/;
        break;
      case 'UK':
        regex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
        break;
      default:
        // Generic postal code validation
        regex = /^[A-Z0-9\s-]{3,10}$/i;
    }

    return regex.test(postalCode);
  } catch (error) {
    console.error('Error validating postal code:', error);
    return false;
  }
};
