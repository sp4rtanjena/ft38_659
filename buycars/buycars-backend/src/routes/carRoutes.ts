import express from 'express';
import { getOEMSpecs, addCarToInventory, getInventory } from '../controllers/carController';
import { validateOEMSpecsQuery } from '../middlewares/validationMiddleware';

const router = express.Router();

// GET route for fetching OEM specs
router.get('/oem/specs', validateOEMSpecsQuery, getOEMSpecs);

// POST route for adding a car to the marketplace inventory
router.post('/inventory/add', addCarToInventory);

// GET route for displaying all the cars in inventory
router.get('/inventory', getInventory)

export default router;
