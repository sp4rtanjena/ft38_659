import { query } from 'express-validator';

export const validateOEMSpecsQuery = [
    query('model_name').isString().notEmpty().withMessage('Model name must be a non-empty string'),
    query('year').isNumeric().notEmpty().withMessage('Year must be a valid number'),
];
