import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

const { Staff } = db;

class AuthService {
  /**
   * Register a new staff member
   */
  async register(staffData) {
    const { 
      username, 
      email, 
      password, 
      role, 
      department,
      fullName,
      firstName, 
      lastName, 
      phoneNumber,
      position,
      status,
      gender,
      address,
      hireDate
    } = staffData;

    // Split fullName if provided and firstName/lastName are missing
    let finalFirstName = firstName;
    let finalLastName = lastName;
    
    if (fullName && (!firstName || !lastName)) {
      const parts = fullName.split(' ');
      if (parts.length > 0) finalFirstName = parts[0];
      if (parts.length > 1) finalLastName = parts.slice(1).join(' ');
    }

    if (!finalFirstName || !finalLastName) {
      throw new Error('First Name and Last Name are required (or valid Full Name)');
    }

    // Check if user already exists
    const existingStaff = await Staff.findOne({
      where: {
        [db.Sequelize.Op.or]: [{ email }, { username }]
      }
    });

    if (existingStaff) {
      throw new Error('Staff member with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If departmentId is provided, verify it exists
    if (staffData.departmentId) {
      const department = await db.Department.findByPk(staffData.departmentId);
      if (!department) {
        throw new Error('Invalid Department ID');
      }
    } else if (department) {
      // If code is provided instead of ID, try to find the ID
      const dept = await db.Department.findOne({ where: { code: department } });
      if (dept) {
        staffData.departmentId = dept.id;
      }
    }

    // Create staff member
    const staff = await Staff.create({
      username,
      email,
      password: hashedPassword,
      firstName: finalFirstName,
      lastName: finalLastName,
      phoneNumber,
      role: role || 'receptionist',
      department: department || 'management',
      departmentId: staffData.departmentId,
      position,
      status: status || 'active',
      gender,
      address,
      hireDate
    });

    // Generate token
    const token = this.generateToken(staff);

    return {
      staff: staff.toJSON(),
      token
    };
  }

  /**
   * Register a new admin (Limited to 4 total)
   */
  async registerAdmin(adminData) {
    // Check current admin count
    const adminCount = await Staff.count({ where: { role: 'admin' } });
    if (adminCount >= 4) {
      throw new Error('Maximum limit of 4 admin accounts reached');
    }

    // Set role to admin and reuse register logic
    adminData.role = 'admin';
    return await this.register(adminData);
  }

  /**
   * Login staff member
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find staff by email
    const staff = await Staff.findOne({ where: { email } });

    if (!staff) {
      throw new Error('Invalid credentials');
    }

    // Block login for specific statuses
    const blockedStatuses = ['disabled', 'suspended', 'retired', 'retrenched'];
    if (blockedStatuses.includes(staff.status)) {
      throw new Error(`Account is ${staff.status}. Login not allowed.`);
    }

    // Mark as active if it was inactive
    if (staff.status === 'inactive') {
      await staff.update({ status: 'active' });
    }

    // Double check it's active now
    if (staff.status !== 'active' && staff.status !== 'on leave') {
       // 'on leave' might be allowed login but with limited access later? 
       // User didn't specify blocking 'on leave', but said block the others.
       // We'll allow 'active' and 'on leave' for now.
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, staff.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await staff.update({ lastLogin: new Date() });

    // Generate token
    const token = this.generateToken(staff);

    return {
      staff: staff.toJSON(),
      token
    };
  }

  /**
   * Generate JWT token
   */
  generateToken(staff) {
    return jwt.sign(
      {
        id: staff.id,
        email: staff.email,
        role: staff.role,
        department: staff.department,
        departmentId: staff.departmentId
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || '7d'
      }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new Error('Invalid token');
    }
  }

  /**
   * Get staff by ID
   */
  async getStaffById(id) {
    const staff = await Staff.findByPk(id, {
      include: [
        {
          model: db.Department,
          as: 'departmentInfo'
        }
      ]
    });
    if (!staff) {
      throw new Error('Staff member not found');
    }
    return staff;
  }

  /**
   * Change password
   */
  async changePassword(staffId, oldPassword, newPassword) {
    const staff = await Staff.findByPk(staffId);

    if (!staff) {
      throw new Error('Staff member not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, staff.password);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await staff.update({ password: hashedPassword });

    return { message: 'Password changed successfully' };
  }
}

export default new AuthService();
