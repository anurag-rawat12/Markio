import mongoose from 'mongoose';

const OTPVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => Date.now() + 10 * 60 * 1000 
    }
});

export default mongoose.model('OTPVerification', OTPVerificationSchema);