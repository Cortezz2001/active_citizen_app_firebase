// First, let's create a new file: lib/genders.js

// genders.js
// Configuration file for gender options with translations

export const GENDER_KEYS = {
    MALE: 'male',
    FEMALE: 'female'
  };
  
  // This is the mapping we'll use for database operations
  // Always store the gender key (e.g., 'male') in the database
  export const genders = [
    {
      key: GENDER_KEYS.MALE,
      translations: {
        en: 'Male',
        ru: 'Мужской',
        kz: 'Ер'
      }
    },
    {
      key: GENDER_KEYS.FEMALE,
      translations: {
        en: 'Female',
        ru: 'Женский',
        kz: 'Әйел'
      }
    }
  ];
  
  /**
   * Get gender display name by key and language
   * @param {string} genderKey - The gender key (e.g., 'male')
   * @param {string} language - Language code ('en', 'ru', or 'kk')
   * @returns {string} Translated gender name
   */
  export const getGenderNameByKey = (genderKey, language = 'en') => {
    const gender = genders.find(gender => gender.key === genderKey);
    if (!gender) return genderKey; // Fallback to the key if not found
    return gender.translations[language] || gender.translations.en; // Fallback to English if language not available
  };
  
  /**
   * Get gender key by display name
   * @param {string} genderName - The displayed gender name in any language
   * @returns {string|null} Gender key or null if not found
   */
  export const getGenderKeyByName = (genderName) => {
    for (const gender of genders) {
      const translationValues = Object.values(gender.translations);
      if (translationValues.includes(genderName)) {
        return gender.key;
      }
    }
    return null;
  };
  
  /**
   * Get gender data for dropdown with key-value pairs
   * @param {string} language - Language code ('en', 'ru', or 'kk')
   * @returns {Array<{key: string, value: string}>} Array of gender objects
   */
  export const getGenderDropdownData = (language = 'en') => {
    return genders.map(gender => ({
      key: gender.key,
      value: gender.translations[language] || gender.translations.en
    }));
  };