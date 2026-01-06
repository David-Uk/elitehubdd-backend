import dashboardService from '../services/dashboardService.js';

class DashboardController {
  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStats(req, res) {
    // Check if streaming is requested
    if (req.query.stream === 'true') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const sendEvent = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      try {
        // stream initialization
        sendEvent('start', { timestamp: new Date().toISOString() });

        // Stream each section independently
        const tasks = [
          { name: 'overview', fn: () => dashboardService.getOverviewStats() },
          { name: 'today', fn: () => dashboardService.getTodayStats() },
          { name: 'periods', fn: () => dashboardService.getPeriodStats() },
          { name: 'revenue', fn: () => dashboardService.getRevenueData() },
          { name: 'inventory', fn: () => dashboardService.getInventoryStats() },
          { name: 'orders', fn: () => dashboardService.getOrderStats() },
          { name: 'notifications', fn: () => dashboardService.getNotificationStats() },
          { name: 'recentActivity', fn: () => dashboardService.getRecentActivity() }
        ];

        for (const task of tasks) {
            try {
                const data = await task.fn();
                sendEvent(task.name, data);
            } catch (err) {
                console.error(`Error streaming ${task.name}:`, err);
                sendEvent('error', { section: task.name, message: err.message });
            }
        }

        sendEvent('end', { success: true });
        res.end();
      } catch (error) {
        console.error('Streaming error:', error);
        res.end();
      }
      return;
    }

    // Default: Return full JSON response
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
