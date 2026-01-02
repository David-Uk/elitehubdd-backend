import guestService from '../services/guestService.js';

class GuestController {
  /**
   * Create a new guest
   */
  async createGuest(req, res) {
    try {
      const guest = await guestService.createGuest(req.body);
      res.status(201).json({
        success: true,
        message: 'Guest created successfully',
        data: guest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all guests
   */
  async getAllGuests(req, res) {
    try {
      const filters = {
        search: req.query.search,
        nationality: req.query.nationality,
        idType: req.query.idType
      };
      
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const result = await guestService.getAllGuests(filters, pagination);
      
      res.status(200).json({
        success: true,
        data: result.guests,
        meta: result.meta
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get guest by ID
   */
  async getGuestById(req, res) {
    try {
      const guest = await guestService.getGuestById(req.params.id);
      res.status(200).json({
        success: true,
        data: guest
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update guest
   */
  async updateGuest(req, res) {
    try {
      const guest = await guestService.updateGuest(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Guest updated successfully',
        data: guest
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete guest (soft delete)
   */
  async deleteGuest(req, res) {
    try {
      await guestService.deleteGuest(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Guest deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Search guests
   */
  async searchGuests(req, res) {
    try {
      const { query } = req.query;
      const guests = await guestService.searchGuests(query);
      res.status(200).json({
        success: true,
        data: guests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new GuestController();
