import College from "../Models/Colleges.js";


export const getColleges = async (req, res) => {
    try {
        const colleges = await College.find();
        res.status(200).json(colleges);
    } catch (error) {
        res.status(500).json({ message: "Error fetching colleges" });
    }
};

export const getCollegeById = async (req, res) => {
    try {
        const { id } = req.params;
        const college = await College.findById(id);
        if (!college) {
            return res.status(404).json({ message: "College not found" });
        }
        res.status(200).json(college);
    } catch (error) {
        res.status(500).json({ message: "Error fetching college" });
    }
}