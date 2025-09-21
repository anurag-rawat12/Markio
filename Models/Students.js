import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
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

  enrollmentNumber: {
    type: String,
    required: true,
    unique: true
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

const Students = mongoose.model("Students", studentSchema);

export default Students;
