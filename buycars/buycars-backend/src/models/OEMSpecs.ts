import mongoose from 'mongoose';

const OEMSpecsSchema = new mongoose.Schema({
    modelName: { type: String, required: true },
    year: { type: Number, required: true },
    listPrice: { type: Number, required: true },
    availableColors: [String],
    mileage: { type: Number, required: true },
    power: { type: Number, required: true },
    maxSpeed: { type: Number, required: true },
});

export default mongoose.model('OEMSpecs', OEMSpecsSchema);
