import authService from '../services/authService.js';

class AuthController {
  /**
   * Register the Super Admin (Limited to 1)
   */
  async registerSuperAdmin(req, res) {
    try {
      const result = await authService.registerSuperAdmin(req.body);
      res.status(201).json({
        success: true,
        message: 'Super Admin registered successfully',
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
      // Access Logic:
      // 1. Super Admin can create Admin
      // 2. Admin can create other roles (but NOT Super Admin and NOT Admin - wait, prompt says "except the superadmin", doesn't explicitly forbid Admin creating Admin, BUT "Only a superadmin can create the admin". This implies Admin CANNOT create Admin.)
      
      const creatorRole = req.user.role;
      const targetRole = req.body.role || 'receptionist'; // Default role if not specified

      // Rules:
      // Only Super Admin can create Admin or Super Admin (self-propagation usually blocked but super_admin serves as strict gatekeeper)
      if (['admin', 'super_admin'].includes(targetRole) && creatorRole !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only Super Admin can create Admin users.'
        });
      }

      // Check for Super Admin creation attempt by anyone (even super admin? Prompt says "Only a superadmin can create the admin". Doesn't say who creates super admin. Usually seeded. Or Super Admin creates another Super Admin. I'll allow Super Admin to create Super Admin if needed, or block it. "admin can create other roles except the superadmin" - this implies admin cannot create super admin.
      if (targetRole === 'super_admin' && creatorRole !== 'super_admin') {
         // Covered by above check, but explicit explicit
         return res.status(403).json({
          success: false,
          message: 'You are not authorized to create this role.'
        });
      }
      
      // If creator is NOT admin or super_admin, they likely can't create anyone.
      // Assuming 'manager' etc cannot create users. Prompt says "MD/HR/Admin... Can Assign user roles".
      // Implies others cannot.
      if (!['super_admin', 'admin'].includes(creatorRole)) {
         return res.status(403).json({
           success: false,
           message: 'Access denied. Only Admins can register staff.'
         });
      }

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


  /**
   * Request password reset
   */
  async forgotPassword(req, res) {
    try {
      const result = await authService.forgotPassword(req.body.email);
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

  /**
   * Reset password
   */
  async resetPassword(req, res) {
    try {
      const result = await authService.resetPassword(req.params.token, req.body.password);
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
