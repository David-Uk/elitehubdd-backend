import db from '../models/index.js';
const { User, Staff } = db;

class UserService {
  /**
   * Get all users (User model)
   */
  async getAllUsers(filters = {}) {
    return await User.findAll({
      where: filters,
      attributes: { exclude: ['password'] }
    });
  }

  /**
   * Get user by ID (User model)
   */
  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  /**
   * Update user
   */
  async updateUser(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');
    
    // Don't allow password update through this method for now
    delete updateData.password;
    
    await user.update(updateData);
    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');
    await user.destroy();
    return { message: 'User deleted successfully' };
  }

  /**
   * Get all staff members
   */
  async getAllStaff(filters = {}, user = null) {
    let whereClause = { ...filters };
    
    // Apply role-based filtering if user is provided
    if (user) {
      if (user.role !== 'super_admin') {
        // Always exclude super admins unless the user is a super admin
        whereClause.role = { [db.Sequelize.Op.ne]: 'super_admin' };
      }
      
      // If user is admin, they can only see themselves and non-admin staff
      if (user.role === 'admin') {
        whereClause[db.Sequelize.Op.or] = [
          { id: user.id }, // Can see themselves
          { role: { [db.Sequelize.Op.notIn]: ['super_admin', 'admin'] } } // Can see non-admin staff
        ];
      }
    }
    
    return await Staff.findAll({
      where: whereClause,
      include: [
        {
          model: db.Department,
          as: 'departmentInfo'
        }
      ],
      attributes: { exclude: ['password'] }
    });
  }

  /**
   * Update staff member
   */
  async updateStaff(id, updateData) {
    const staff = await Staff.findByPk(id);
    if (!staff) throw new Error('Staff member not found');
    
    // Protect password field
    delete updateData.password;
    
    await staff.update(updateData);
    return staff;
  }
}

export default new UserService();
