import userService from '../services/userService.js';

class UserController {
  /**
   * Get all users
   */
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers(req.query);
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update user
   */
  async updateUser(req, res) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req, res) {
    try {
      const result = await userService.deleteUser(req.params.id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all staff (Alternative "User" management)
   */
  async getAllStaff(req, res) {
    try {
      const staff = await userService.getAllStaff(req.query);
      res.status(200).json({
        success: true,
        data: staff
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update staff member
   */
  async updateStaff(req, res) {
    try {
      const staff = await userService.updateStaff(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Staff updated successfully',
        data: staff
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new UserController();
