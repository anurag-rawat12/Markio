import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    institutionName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",   // links to the College model
        required: true
    },

    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Teachers = mongoose.model("Teachers", TeacherSchema);

export default Teachers;
