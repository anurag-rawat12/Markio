import express from 'express';
import { addStudentToBranch, CreateBranch, GetBranchById, GetBranches } from '../Controllers/Branch.controller.js';
import authorize, { collegeOnly } from '../Middleware/auth.middleware.js';

const BranchRouter = express.Router();

BranchRouter.post('/create', authorize, collegeOnly, CreateBranch);
BranchRouter.get('/get', authorize, collegeOnly, GetBranches);
BranchRouter.get('/get/:id', authorize, GetBranchById);
BranchRouter.put('/:branchId/add-student', addStudentToBranch);
// BranchRouter.delete('/delete/:id', deleteBranch);

export default BranchRouter;