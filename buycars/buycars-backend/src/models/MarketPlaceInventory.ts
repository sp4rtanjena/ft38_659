import mongoose from 'mongoose';

const marketplaceInventorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    color: { type: String, required: true },
    mileage: { type: Number, required: true },
    power: { type: Number, required: true },
    maxSpeed: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    description: [String],
    kmOnOdometer: { type: Number, required: true },
    majorScratches: { type: Boolean, required: true },
    originalPaint: { type: Boolean, required: true },
    accidentsReported: { type: Number, required: true },
    previousOwners: { type: Number, required: true },
    registrationPlace: { type: String, required: true },
    dealerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model('MarketplaceInventory', marketplaceInventorySchema);
