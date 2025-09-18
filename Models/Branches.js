import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true
    },
    branchName: {
        type: String,
        required: true
    },
    sections: [{
        type: String //ex a , b ,c
    }],
    student: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

const Branch = mongoose.model('Branch', branchSchema);
export default Branch;