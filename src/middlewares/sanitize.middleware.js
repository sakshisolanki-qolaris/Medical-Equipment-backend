import xss from 'xss';

/**
 * Recursively sanitizes strings within an object to prevent XSS attacks.
 */
const cleanObject = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      // Clean the string and trim extra whitespace
      obj[key] = xss(obj[key].trim());
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recursively clean nested objects/arrays
      cleanObject(obj[key]);
    }
  }
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) cleanObject(req.body);
  if (req.query) cleanObject(req.query);
  if (req.params) cleanObject(req.params);
  
  next();
};