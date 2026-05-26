import Joi from 'joi';

const processReturnSchema = Joi.object({
  amount_received: Joi.number().integer().min(0).default(0),
  refund_mode: Joi.string().valid('Direct_Bank', 'Cash', 'None').optional() ,
  return_time: Joi.date().iso().optional(),
  refund_transaction_reference: Joi.string().allow('', null).when('refund_mode', {
    is: 'Direct_Bank',
    then: Joi.string().min(5).required().messages({
      'any.required': 'A UTR or Transaction ID is required for Direct Bank refunds.',
      'string.empty': 'A UTR or Transaction ID cannot be empty for Direct Bank refunds.'
    }),
    otherwise: Joi.string().allow('', null).optional()
  })
});

export const validateProcessReturn = (req, res, next) => {
  const { error } = processReturnSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};