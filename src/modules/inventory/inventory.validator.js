import Joi from 'joi';

const addEquipmentSchema = Joi.object({
  equipment_id: Joi.string().required(),
  category_id: Joi.number().integer().required(),
  purchase_date: Joi.date().iso().optional()
});

const updatePricingSchema = Joi.object({
  deposit_amount: Joi.number().integer().min(0).optional(),
  daily_rent: Joi.number().integer().min(0).optional()
});

export const validateAddEquipment = (req, res, next) => {
  const { error } = addEquipmentSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

export const validateUpdatePricing = (req, res, next) => {
  const { error } = updatePricingSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};