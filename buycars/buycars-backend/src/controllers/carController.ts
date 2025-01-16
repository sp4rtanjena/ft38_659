import { Request, Response } from 'express';
import OEMSpecs from '../models/OEMSpecs';
import MarketplaceInventory from '../models/MarketPlaceInventory';
import { validationResult } from 'express-validator';

export const getOEMSpecs = async (req: Request, res: Response): Promise<void> => {
    const { model_name, year } = req.query;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    if (!model_name || !year) {
        res.status(400).json({ message: 'Model name and year are required' });
        return;
    }

    try {
        // Find the OEM specs based on model name and year
        const specs = await OEMSpecs.findOne({ model_name, year });

        if (!specs) {
            res.status(404).json({ message: 'Specs not found' });
            return;
        }

        res.json(specs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getInventory = async (req: Request, res: Response): Promise<void> => {
    try {
        const inventory = await MarketplaceInventory.find();
        if (inventory.length === 0) {
            res.status(404).json({ message: 'Inventory is empty' });
            return;
        }
        res.status(200).json({ inventory })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

export const addCarToInventory = async (req: Request, res: Response): Promise<void> => {
    const { model_name, year, price, description } = req.body;

    // Validate that required fields are provided
    if (!model_name || !year || !price || !description) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }

    try {
        // Create a new car inventory item
        const newCar = new MarketplaceInventory({
            model_name,
            year,
            price,
            description,
        });

        await newCar.save();

        res.status(201).json({ message: 'Car added to inventory successfully', car: newCar });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

