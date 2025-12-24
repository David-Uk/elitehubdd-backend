import express from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
} from '../controllers/departmentController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/departments
 * @desc    Get all departments
 * @access  Private (Authenticated users)
 */
router.get('/', authenticate, getAllDepartments);

/**
 * @route   GET /api/departments/:id
 * @desc    Get department by ID
 * @access  Private (Authenticated users)
 */
router.get('/:id', authenticate, getDepartmentById);

/**
 * @route   GET /api/departments/:id/stats
 * @desc    Get department statistics
 * @access  Private (Authenticated users)
 */
router.get('/:id/stats', authenticate, getDepartmentStats);

/**
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Private (Admin only)
 */
router.post('/', authenticate, isAdmin, createDepartment);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update department
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, isAdmin, updateDepartment);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, isAdmin, deleteDepartment);

export default router;
