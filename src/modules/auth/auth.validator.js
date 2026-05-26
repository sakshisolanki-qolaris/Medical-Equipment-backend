import Joi from 'joi';


// The Strong Password Regular Expression
// (?=.*[a-z])     : Must contain at least one lowercase letter
// (?=.*[A-Z])     : Must contain at least one uppercase letter
// (?=.*\d)        : Must contain at least one digit
// (?=.*[@$!%*?&]) : Must contain at least one special character
// .{10,}          : Must be at least 10 characters long
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;

const strongPassword = Joi.string()
  .pattern(passwordRegex)
  .required()
  .messages({
    'string.pattern.base': 'Password must be at least 10 characters long, and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
    'string.empty': 'Password cannot be empty.',
    'any.required': 'Password is required.'
  });


const loginSchema = Joi.object({
  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be exactly 10 digits.',
      'any.required': 'Phone number is required.'
    }),
  password: Joi.string().required()
});

export const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const registerViewerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().optional(),
  phone_number: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be exactly 10 digits.',
      'any.required': 'Phone number is required.'
    }),
  password: strongPassword
});

export const validateRegisterViewer = (req, res, next) => {
  const { error } = registerViewerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};