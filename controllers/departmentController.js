import db from '../models/index.js';

const { Department, Staff } = db;

/**
 * Get all departments
 */
export const getAllDepartments = async (req, res) => {
  try {
    const { status, includeInactive } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    } else if (!includeInactive) {
      where.status = 'active';
    }

    const departments = await Department.findAll({
      where,
      include: [
        {
          model: Staff,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'status']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: departments,
      count: departments.length
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message
    });
  }
};

/**
 * Get department by ID
 */
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id, {
      include: [
        {
          model: Staff,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'position', 'status']
        }
      ]
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department',
      error: error.message
    });
  }
};

/**
 * Create new department (Admin only)
 */
export const createDepartment = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      status,
      headOfDepartment,
      budget,
      contactEmail,
      contactPhone
    } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and code are required'
      });
    }

    // Check if department with same name or code already exists
    const existingDepartment = await Department.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { name },
          { code }
        ]
      }
    });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: 'Department with this name or code already exists'
      });
    }

    // If headOfDepartment is provided, verify the staff exists
    if (headOfDepartment) {
      const staff = await Staff.findByPk(headOfDepartment);
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Head of department staff member not found'
        });
      }
    }

    const department = await Department.create({
      name,
      code: code.toLowerCase(), // Ensure code is lowercase
      description,
      status: status || 'active',
      headOfDepartment,
      budget,
      contactEmail,
      contactPhone
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    console.error('Error creating department:', error);
    
    // Handle unique constraint violations
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Department with this name or code already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create department',
      error: error.message
    });
  }
};

/**
 * Update department (Admin only)
 */
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      description,
      status,
      headOfDepartment,
      budget,
      contactEmail,
      contactPhone
    } = req.body;

    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // If updating name or code, check for conflicts
    if (name || code) {
      const existingDepartment = await Department.findOne({
        where: {
          id: { [db.Sequelize.Op.ne]: id },
          [db.Sequelize.Op.or]: [
            name ? { name } : {},
            code ? { code } : {}
          ]
        }
      });

      if (existingDepartment) {
        return res.status(409).json({
          success: false,
          message: 'Department with this name or code already exists'
        });
      }
    }

    // If headOfDepartment is provided, verify the staff exists
    if (headOfDepartment) {
      const staff = await Staff.findByPk(headOfDepartment);
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Head of department staff member not found'
        });
      }
    }

    await department.update({
      ...(name && { name }),
      ...(code && { code: code.toLowerCase() }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(headOfDepartment !== undefined && { headOfDepartment }),
      ...(budget !== undefined && { budget }),
      ...(contactEmail !== undefined && { contactEmail }),
      ...(contactPhone !== undefined && { contactPhone })
    });

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    console.error('Error updating department:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Department with this name or code already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update department',
      error: error.message
    });
  }
};

/**
 * Delete department (Admin only - soft delete)
 */
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has active staff
    const staffCount = await Staff.count({
      where: {
        departmentId: id,
        status: 'active'
      }
    });

    if (staffCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department with ${staffCount} active staff members. Please reassign staff first.`
      });
    }

    // Soft delete
    await department.destroy();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete department',
      error: error.message
    });
  }
};

/**
 * Get department statistics
 */
export const getDepartmentStats = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id, {
      include: [
        {
          model: Staff,
          as: 'staff',
          attributes: ['id', 'status']
        }
      ]
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const stats = {
      totalStaff: department.staff.length,
      activeStaff: department.staff.filter(s => s.status === 'active').length,
      inactiveStaff: department.staff.filter(s => s.status === 'inactive').length,
      budget: department.budget || 0
    };

    res.status(200).json({
      success: true,
      data: {
        department: {
          id: department.id,
          name: department.name,
          code: department.code
        },
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department statistics',
      error: error.message
    });
  }
};
