import Teacher from '../Models/Teachers.js';

// ✅ Get all teachers of a specific colleg
export const getTeachers = async (req, res) => {
  try {
    const { id } = req.params; 

    // Find all teachers belonging to this college
    const teachers = await Teacher.find({ institutionName: id });

    if (!teachers || teachers.length === 0) {
      return res.status(404).json({ message: 'No teachers found for this college' });
    }

    console.log(teachers); 
    return res.status(200).json({
      message: "Teachers fetched successfully",
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get a teacher by teacher ID
export const getTeacherById = async (req, res) => {
  try {
    console.log("inside getTeacherById, teacherId:", req.params.id);
    const { id } = req.params;
    const teacher = await Teacher.findById(id).populate('institutionName', 'name');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    return res.status(200).json({
      message: "Teacher fetched successfully",
      teacher,
    });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get teacher profile (for authenticated teacher)
export const getTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.user.id; // from auth middleware
    const teacher = await Teacher.findById(teacherId)
      .populate('institutionName', 'name')
      .select('-password'); // exclude password from response

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    return res.status(200).json({
      message: "Teacher profile fetched successfully",
      teacher,
    });
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
