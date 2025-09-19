import express from 'express';
import { CreateBranch } from '../Controllers/Branch.controller.js';
import authorize, { collegeOnly } from '../Middleware/auth.middleware.js';

const BranchRouter = express.Router();

BranchRouter.post('/create', authorize, collegeOnly, CreateBranch);
// BranchRouter.get('/get/:id', getBranchById);
// BranchRouter.put('/update/:id', updateBranch);
// BranchRouter.delete('/delete/:id', deleteBranch);

export default BranchRouter;