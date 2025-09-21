import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true
    },
    branchCode: {
        type: String,
        required: true
    },
    branchName: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    coordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teachers',
        required: true
    },
    section: {
        type: String,
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Students'
    }]
}, {
    timestamps: true
});

const Branch = mongoose.model('Branch', branchSchema);
export default Branch;