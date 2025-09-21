import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
    institutionName: {
        type: String,
        required: true
    },
    institutionType: {
        type: String,
        required: true,
        enum: ['University', 'College', 'high-school', 'middle-school', 'elementary', 'other']
    },
    adminName: {
        type: String,
        required: true
    },
    adminEmail: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipCode: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

const College = mongoose.model('College', collegeSchema);
export default College;