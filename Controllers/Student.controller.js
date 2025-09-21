import Students from "../Models/Students.js";

export const GetStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Students.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json({ student });
    } catch (error) {
        console.error("❌ Error fetching student:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};