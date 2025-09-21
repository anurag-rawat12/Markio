import Branch from "../Models/Branches.js";
import Students from "../Models/Students.js";

export const CreateBranch = async (req, res) => {
  try {
    const { collegeId, branchCode, branchName, year, coordinator, students, section } = req.body;

    console.log("inside create branch controller")
    // Validate required fields
    if (!collegeId || !branchCode || !branchName || !year || !coordinator || !section) {
      return res.status(400).json({ message: "All required fields are missing" });
    }
    console.log(
      collegeId, branchCode, branchName, year, coordinator, students, section
    )

    // Create branch
    const newBranch = new Branch({
      collegeId,
      branchCode,
      branchName,
      year,
      coordinator,
      section,
      students: students || [], // default to 0 if not provided
    });

    await newBranch.save();

    return res.status(201).json(newBranch);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};


export const GetBranches = async (req, res) => {
  try {
    const branches = await Branch.find()
      .populate("collegeId", "institutionName") // only return college name
      .populate("coordinator", "fullName email") // teacher details
      .populate("students", "fullName email enrollmentNumber"); // student details

    return res.status(200).json({
      message: "Branches fetched successfully",
      branches
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const GetBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find branches of the college and populate references
    console.log("Fetching branches for college ID:", id);
    const branches = await Branch.find({ collegeId: id })
      .populate('collegeId', 'institutionName adminEmail') // only select needed fields
      .populate('coordinator', 'fullName email')           // only select needed fields
      .populate('students', 'fullName email enrollmentNumber'); // only select needed fields

    if (!branches || branches.length === 0) {
      return res.status(404).json({ message: "No branches found for this college" });
    }
    console.log("branch:", branches);
    return res.status(200).json({ message: "Branches fetched successfully", branches });

  } catch (error) {
    console.error("GetBranchById error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const addStudentToBranch = async (req, res) => {
  try {
    const { branchId } = req.params; // <- get branchId from URL
    const { studentId } = req.body;

    if (!branchId || !studentId) {
      return res.status(400).json({ message: "Branch ID and Student ID are required" });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    if (!Array.isArray(branch.students)) branch.students = [];
    console.log("branch found:", branch);

    branch.students.push(studentId);
    await branch.save();

    return res.status(200).json({
      message: "Student added to branch successfully",
      branch
    });
  } catch (error) {
    console.error("Error adding student to branch:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
