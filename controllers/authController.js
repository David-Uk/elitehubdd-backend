import authService from '../services/authService.js';

class AuthController {
  /**
   * Register a new admin (Limited to 4 total)
   */
  async registerAdmin(req, res) {
    try {
      const result = await authService.registerAdmin(req.body);
      res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Register new staff
   */
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Staff registered successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Login staff
   */
  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get current staff profile
   */
  async getProfile(req, res) {
    try {
      const staff = await authService.getStaffById(req.user.id);
      res.status(200).json({
        success: true,
        data: staff
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.id, oldPassword, newPassword);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new AuthController();
