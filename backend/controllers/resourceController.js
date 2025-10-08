import Resource from "../models/Resource.js";
import Booking from "../models/Booking.js";

export const getResources = async (req, res) => {
  try {
    const {
      type,
      location,
      capacity,
      building,
      features,
      search,
      available,
      day,
      startTime,
      endTime,
      page = 1,
      limit = 10,
      sort = 'name'
    } = req.query;

  
    let query = { isActive: true };

  
    if (type) {
      query.type = { $in: type.split(',') };
    }

  
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

  
    if (building) {
      query.building = { $regex: building, $options: 'i' };
    }

  
    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) };
    }

  
    if (features) {
      query.features = { $in: features.split(',') };
    }

  
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { building: { $regex: search, $options: 'i' } }
      ];
    }

  
    if (available === 'true' && day && startTime && endTime) {
      const availableResources = await Resource.findAvailable(day, startTime, endTime);
      query._id = { $in: availableResources.map(res => res._id) };
    }

  
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const resources = await Resource.find(query)
      .populate('maintainedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Resource.countDocuments(query);

    res.status(200).json({
      success: true,
      count: resources.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      data: resources
    });

  } catch (error) {
    console.error('Get Resources Error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching resources",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('maintainedBy', 'name email department');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

  
    const upcomingBookings = await Booking.find({
      resource: req.params.id,
      startTime: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('user', 'name email')
    .sort({ startTime: 1 })
    .limit(10);

  
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const utilization = await Booking.getUtilizationAnalytics(
      req.params.id, 
      thirtyDaysAgo, 
      new Date()
    );

    res.status(200).json({
      success: true,
      data: {
        ...resource.toObject(),
        upcomingBookings,
        utilization
      }
    });

  } catch (error) {
    console.error('Get Resource Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching resource"
    });
  }
};

export const createResource = async (req, res) => {
  try {
    
    if (!req.body.availability || req.body.availability.length === 0) {
      req.body.availability = [
        { day: 'monday', slots: [{ start: '09:00', end: '17:00' }] },
        { day: 'tuesday', slots: [{ start: '09:00', end: '17:00' }] },
        { day: 'wednesday', slots: [{ start: '09:00', end: '17:00' }] },
        { day: 'thursday', slots: [{ start: '09:00', end: '17:00' }] },
        { day: 'friday', slots: [{ start: '09:00', end: '17:00' }] }
      ];
    }

    const resource = await Resource.create(req.body);

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: resource
    });

  } catch (error) {
    console.error('Create Resource Error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating resource"
    });
  }
};

export const updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true,
        runValidators: true
      }
    ).populate('maintainedBy', 'name email');

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: resource
    });

  } catch (error) {
    console.error('Update Resource Error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating resource"
    });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

  
    const futureBookings = await Booking.findOne({
      resource: req.params.id,
      startTime: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    });

    if (futureBookings) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete resource with future bookings. Cancel bookings first."
      });
    }

  
    await Resource.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully"
    });

  } catch (error) {
    console.error('Delete Resource Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting resource"
    });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { day, startTime, endTime, date } = req.body;
    
    if (!day || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide day, startTime, and endTime"
      });
    }

    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    
    const isAvailable = resource.isAvailableForSlot(day, startTime, endTime);

    if (!isAvailable) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "Resource is not available for the requested time slot"
      });
    }

    
    const conflicts = await Booking.findConflicts(
      req.params.id,
      new Date(`${date}T${startTime}`),
      new Date(`${date}T${endTime}`)
    );

    const hasConflicts = conflicts.length > 0;

    
    let alternatives = [];
    if (hasConflicts) {
      alternatives = await Resource.findAvailable(day, startTime, endTime, resource.type)
        .where('_id').ne(req.params.id)
        .limit(5);
    }

    res.status(200).json({
      success: true,
      available: !hasConflicts,
      hasConflicts,
      conflicts: hasConflicts ? conflicts : [],
      alternatives: hasConflicts ? alternatives : [],
      message: hasConflicts ? 
        "Resource is available but has scheduling conflicts" : 
        "Resource is available for booking"
    });

  } catch (error) {
    console.error('Check Availability Error:', error);
    res.status(500).json({
      success: false,
      message: "Error checking availability"
    });
  }
};

export const getResourceAnalytics = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found"
      });
    }

    
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastQuarter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [weekUtilization, monthUtilization, quarterUtilization] = await Promise.all([
      Booking.getUtilizationAnalytics(req.params.id, lastWeek, now),
      Booking.getUtilizationAnalytics(req.params.id, lastMonth, now),
      Booking.getUtilizationAnalytics(req.params.id, lastQuarter, now)
    ]);

    
    const peakHours = await Booking.aggregate([
      {
        $match: {
          resource: resource._id,
          status: { $in: ['confirmed', 'active', 'completed'] },
          startTime: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: { $hour: "$startTime" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        resource: {
          id: resource._id,
          name: resource.name,
          type: resource.type,
          location: resource.location
        },
        utilization: {
          week: weekUtilization,
          month: monthUtilization,
          quarter: quarterUtilization
        },
        peakHours,
        currentStatus: resource.status,
        utilizationRate: resource.getUtilizationRate()
      }
    });

  } catch (error) {
    console.error('Resource Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching resource analytics"
    });
  }
};

export const getResourceTypes = async (req, res) => {
  try {
    const types = await Resource.distinct('type', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Get Resource Types Error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching resource types"
    });
  }
};