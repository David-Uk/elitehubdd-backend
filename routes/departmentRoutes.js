import express from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
} from '../controllers/departmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateDepartment, validateUUID } from '../middleware/validator.js';

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
router.get('/:id', authenticate, validateUUID, getDepartmentById);

/**
 * @route   GET /api/departments/:id/stats
 * @desc    Get department statistics
 * @access  Private (Authenticated users)
 */
router.get('/:id/stats', authenticate, validateUUID, getDepartmentStats);

/**
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Private (Admin only)
 */
/**
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Private (Restricted)
 */
router.post('/', authenticate, authorize('super_admin', 'admin'), validateDepartment, createDepartment);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update department
 * @access  Private (Restricted)
 */
router.put('/:id', authenticate, authorize('super_admin', 'admin'), validateUUID, validateDepartment, updateDepartment);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department (soft delete)
 * @access  Private (Restricted)
 */
router.delete('/:id', authenticate, authorize('super_admin', 'admin'), validateUUID, deleteDepartment);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department (soft delete) - duplicate route clean up
 * @access  Private (Restricted)
 */
// router.delete('/:id', authenticate, authorize('super_admin', 'admin'), deleteDepartment); // Removing duplicate logic if present

export default router;
