/**
 * Middleware to filter staff data based on user role
 * - Super admins can see all staff except other super admins
 * - Admins can only see their own admin info and other non-admin staff
 * - Other roles can only see non-admin staff
 */

export const filterStaffData = (req, res, next) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Attach filtering function to request object
  req.staffFilter = {
    getWhereClause: () => {
      const whereClause = {};
      
      // Always exclude super admins unless the user is a super admin
      if (user.role !== 'super_admin') {
        whereClause.role = { [db.Sequelize.Op.ne]: 'super_admin' };
      }
      
      // If user is admin, they can only see themselves and non-admin staff
      if (user.role === 'admin') {
        whereClause[db.Sequelize.Op.or] = [
          { id: user.id }, // Can see themselves
          { role: { [db.Sequelize.Op.notIn]: ['super_admin', 'admin'] } } // Can see non-admin staff
        ];
      }
      
      return whereClause;
    },
    
    canAccessStaff: (staffId) => {
      // Super admin can access anyone except other super admins
      if (user.role === 'super_admin') {
        return true;
      }
      
      // Admin can only access themselves or non-admin staff
      if (user.role === 'admin') {
        return staffId === user.id;
      }
      
      // Other roles can only access non-admin staff
      return false;
    },
    
    filterStaffArray: (staffArray) => {
      if (!staffArray || !Array.isArray(staffArray)) {
        return staffArray;
      }
      
      return staffArray.filter(staff => {
        // Always exclude super admins unless user is super admin
        if (staff.role === 'super_admin' && user.role !== 'super_admin') {
          return false;
        }
        
        // If user is admin, only show themselves and non-admin staff
        if (user.role === 'admin') {
          return staff.id === user.id || !['super_admin', 'admin'].includes(staff.role);
        }
        
        // For other roles, exclude admins and super admins
        return !['super_admin', 'admin'].includes(staff.role);
      });
    }
  };
  
  next();
};
