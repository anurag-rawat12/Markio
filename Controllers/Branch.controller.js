import Branch from "../Models/Branches.js";

export const CreateBranch = async (req, res) => {

    try {

        const { collegeId, branchName, sections } = req.body;

        if (!collegeId || !branchName || !sections) {
            return res.status(400).json({ message: "All required fields missing" });
        }

        const newBranch = new Branch({
            collegeId,
            branchName,
            sections
        });

        await newBranch.save();

        return res.status(201).json({ message: "Branch created successfully", branch: newBranch });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const GetBranches = async (req, res) => {

    try {

        const branches = await Branch.find().populate('collegeId', 'name');

        return res.status(200).json({ message: "Branches fetched successfully", branches });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const GetBranchById = async (req, res) => {

    try {
        const { id } = req.params;

        const branch = await Branch.findById(id).populate('collegeId', 'name');

        if (!branch) {
            return res.status(404).json({ message: "Branch not found" });
        }

        return res.status(200).json({ message: "Branch fetched successfully", branch });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

