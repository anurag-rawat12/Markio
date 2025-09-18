import mongoose from "mongoose";

const PeriodSchema = new mongoose.Schema({
    slot: { type: Number, required: true },
    subject: { type: String, required: true },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    activeCode: {
        code: { type: String },          // OTP/code
        expiresAt: { type: Date }        // expiry time
    }
});
const Period = mongoose.model('Period', PeriodSchema);
export default Period;