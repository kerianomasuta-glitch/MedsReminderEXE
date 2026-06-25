import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: true,
        unique: true,
        enum: ['patient', 'caregiver', 'admin'],
    }
}, {
    timestamps: true
});

const Role = mongoose.model('Role', roleSchema);

export default Role;