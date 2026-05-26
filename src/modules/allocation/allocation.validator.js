import Joi from 'joi';

const allocateSchema = Joi.object({
  equipment_id: Joi.string().required(),
  recipient_name: Joi.string().min(3).max(100).required(),
  recipient_phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  recipient_type: Joi.string().valid('Standard', 'Member', 'Authority').required(),
  deposit_paid: Joi.number().integer().min(0).required(), // The amount actually handed to the staff
  deposit_mode: Joi.string().valid('Cash', 'UPI_QR', 'Direct_Bank', 'None').optional(),

  transaction_reference: Joi.string().allow('', null).when('deposit_mode', {
    is: Joi.valid('UPI_QR', 'Direct_Bank'),
    then: Joi.string().min(5).required().messages({
      'any.required': 'A UTR or Transaction ID is required for digital payments.',
      'string.empty': 'A UTR or Transaction ID cannot be empty for digital payments.'
    }),
    otherwise: Joi.string().allow('', null).optional()
  })
});

export const validateAllocation = (req, res, next) => {
  const { error } = allocateSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};