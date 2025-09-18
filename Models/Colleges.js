import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
    CollegeName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    address: {
        type: String
    },
    Verified: {
        type: Boolean,
        default: false
    },
    settings: {
        warningThreshold: { type: Number, default: 3 },
        qrExpirySeconds: { type: Number, default: 15 },
    }
});

const College = mongoose.model('College', collegeSchema);
export default College;