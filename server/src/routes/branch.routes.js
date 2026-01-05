import express from 'express';
import { getAllBranches, getBranchById } from '../controllers/branch.controller.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  getAllBranchesValidator,
  branchIdValidator,
} from '../validators/branch.validator.js';

const router = express.Router();

// Optional auth - works for both authenticated and guest users
router.use(optionalAuth);

// Get all branches
router.get('/', validate(getAllBranchesValidator), getAllBranches);

// Get branch by ID
router.get('/:id', validate(branchIdValidator), getBranchById);

export default router;