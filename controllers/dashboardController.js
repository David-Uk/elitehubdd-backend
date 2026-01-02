import dashboardService from '../services/dashboardService.js';

class DashboardController {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(req, res) {
    try {
      const result = await dashboardService.getDashboardStats();
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Dashboard statistics retrieved successfully',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Dashboard controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard statistics',
        error: error.message
      });
    }
  }

  /**
   * Get occupancy statistics
   */
  async getOccupancyStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const result = await dashboardService.getOccupancyStats(startDate, endDate);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Occupancy statistics retrieved successfully',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Occupancy controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve occupancy statistics',
        error: error.message
      });
    }
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats(req, res) {
    try {
      const { period = 'monthly' } = req.query;
      const result = await dashboardService.getRevenueStats(period);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Revenue statistics retrieved successfully',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Revenue controller error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve revenue statistics',
        error: error.message
      });
    }
  }
}

export default new DashboardController();
