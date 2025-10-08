import Booking from "../models/Booking.js";
import Resource from "../models/Resource.js";

export const createBooking = async (req, res) => {
  try {
    const {
      resourceId,
      title,
      description,
      startTime,
      endTime,
      recurring,
      priority
    } = req.body;

    const userId = req.user.id;

    if (!resourceId || !title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide resource, title, start time, and end time"
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource || !resource.isActive) {
      return res.status(404).json({
        success: false,
        message: "Resource not found or inactive"
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time"
      });
    }

    if (start < now) {
      return res.status(400).json({
        success: false,
        message: "Cannot book in the past"
      });
    }

    const advanceBookingDays = resource.bookingRestrictions?.advanceBookingDays || 30;
    const maxAdvanceDate = new Date(now.getTime() + advanceBookingDays * 24 * 60 * 60 * 1000);
    
    if (start > maxAdvanceDate) {
      return res.status(400).json({
        success: false,
        message: `Bookings can only be made up to ${advanceBookingDays} days in advance`
      });
    }

    const minNoticeHours = resource.bookingRestrictions?.minBookingNotice || 1;
    const minNoticeTime = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);
    
    if (start < minNoticeTime) {
      return res.status(400).json({
        success: false,
        message: `Bookings require at least ${minNoticeHours} hour(s) notice`
      });
    }

    const day = start.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    const startTimeStr = start.toTimeString().slice(0, 5);
    const endTimeStr = end.toTimeString().slice(0, 5);

    const isAvailable = resource.isAvailableForSlot(day, startTimeStr, endTimeStr);
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Resource is not available during the requested time slot"
      });
    }

    const conflicts = await Booking.findConflicts(resourceId, start, end);
    
    if (conflicts.length > 0) {

      const alternatives = await Resource.findAvailable(day, startTimeStr, endTimeStr, resource.type)
        .where('_id').ne(resourceId)
        .limit(5);

      return res.status(409).json({
        success: false,
        message: "Booking conflict detected",
        conflicts: conflicts.map(conflict => ({
          id: conflict._id,
          title: conflict.title,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
          user: conflict.user
        })),
        alternatives: alternatives.map(alt => ({
          id: alt._id,
          name: alt.name,
          type: alt.type,
          location: alt.location,
          capacity: alt.capacity
        })),
        suggestedSlots: await findAlternativeSlots(resourceId, start, end)
      });
    }

    const requiresApproval = resource.requiresApproval;
    const status = requiresApproval ? 'pending' : 'confirmed';

    const booking = await Booking.create({
      user: userId,
      resource: resourceId,
      title,
      description,
      startTime: start,
      endTime: end,
      priority: priority || 'medium',
      recurring: recurring || { isRecurring: false },
      status,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        bookingSource: 'web'
      }
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email department')
      .populate('resource', 'name type location capacity');

    res.status(201).json({
      success: true,
      message: requiresApproval ? 
        "Booking request submitted. Waiting for approval." : 
        "Booking confirmed successfully",
      data: populatedBooking,
      requiresApproval
    });

  } catch (error) {
    console.error('Create Booking Error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getBookings = async (req, res) => {
  try {
    const {
      user,
      resource,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sort = '-startTime'
    } = req.query;

    let query = {};

    if (req.user.role !== 'admin') {
      query.user = req.user.id;
    } else if (user) {
      query.user = user;
    }

  
    if (resource) {
      query.resource = resource;
    }

  
    if (status) {
      query.status = { $in: status.split(',') };
    }

  
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.startTime = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.startTime = { $lte: new Date(endDate) };
    }

  
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const bookings = await Booking.find(query)
      .populate('user', 'name email department')
      .populate('resource', 'name type location capacity features')
      .populate('conflictStatus.conflictingBookings', 'title startTime endTime user')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      data: bookings
    });

  } catch (error) {
    console.error('Get Bookings Error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings"
    });
  }
};

export const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email department phone')
      .populate('resource', 'name type location capacity building features')
      .populate('conflictStatus.conflictingBookings', 'title startTime endTime user')
      .populate('verification.verifiedBy', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking"
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Get Booking Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching booking"
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const validTransitions = {
      'pending': ['confirmed', 'rejected'],
      'confirmed': ['cancelled', 'active'],
      'active': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': [],
      'rejected': []
    };

    if (!validTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${booking.status} to ${status}`
      });
    }

    booking.status = status;
    
    if (notes) {
      booking.verification.notes = (booking.verification.notes || '') + ` Status Update: ${notes}`;
    }

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('resource', 'name type location');

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: populatedBooking
    });

  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({
      success: false,
      message: "Error updating booking status"
    });
  }
};

export const verifyCheckIn = async (req, res) => {
  try {
    const { notes } = req.body;

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    booking.verifyCheckIn(req.user.id, notes);
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking checked in successfully",
      data: booking
    });

  } catch (error) {
    console.error('Check-in Error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking"
      });
    }

    booking.cancelBooking(reason);
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking
    });

  } catch (error) {
    console.error('Cancel Booking Error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getBookingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const [totalBookings, statusCounts, resourceUtilization, recentConflicts] = await Promise.all([
      Booking.countDocuments({
        startTime: { $gte: start, $lte: end }
      }),
      
      Booking.aggregate([
        {
          $match: {
            startTime: { $gte: start, $lte: end }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      
      Booking.aggregate([
        {
          $match: {
            startTime: { $gte: start, $lte: end },
            status: { $in: ['confirmed', 'active', 'completed'] }
          }
        },
        {
          $group: {
            _id: '$resource',
            totalHours: { $sum: '$duration' },
            bookingCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'resources',
            localField: '_id',
            foreignField: '_id',
            as: 'resource'
          }
        },
        {
          $unwind: '$resource'
        },
        {
          $project: {
            resourceName: '$resource.name',
            resourceType: '$resource.type',
            totalHours: { $divide: ['$totalHours', 60] }, // Convert minutes to hours
            bookingCount: 1,
            utilizationRate: {
              $multiply: [
                { $divide: [{ $divide: ['$totalHours', 60] }, 160] }, // 160 = 8 hours * 5 days * 4 weeks
                100
              ]
            }
          }
        },
        {
          $sort: { totalHours: -1 }
        }
      ]),
      
      
      Booking.find({
        'conflictStatus.hasConflict': true,
        'conflictStatus.resolved': false
      })
      .populate('resource', 'name type location')
      .populate('conflictStatus.conflictingBookings', 'title startTime user')
      .limit(10)
      .sort({ startTime: 1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: { start, end },
        totalBookings,
        statusBreakdown: statusCounts,
        resourceUtilization,
        recentConflicts,
        summary: {
          conflictRate: totalBookings > 0 ? 
            (recentConflicts.length / totalBookings * 100).toFixed(2) : 0,
          avgBookingDuration: resourceUtilization.length > 0 ?
            resourceUtilization.reduce((sum, item) => sum + item.totalHours, 0) / resourceUtilization.length : 0
        }
      }
    });

  } catch (error) {
    console.error('Booking Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking analytics"
    });
  }
};


async function findAlternativeSlots(resourceId, originalStart, originalEnd, maxAttempts = 5) {
  const resource = await Resource.findById(resourceId);
  const suggestions = [];
  
  
  for (let i = 1; i <= maxAttempts && suggestions.length < 3; i++) {
    const newStart = new Date(originalStart);
    const newEnd = new Date(originalEnd);
    newStart.setDate(newStart.getDate() + i);
    newEnd.setDate(newEnd.getDate() + i);
    
    const conflicts = await Booking.findConflicts(resourceId, newStart, newEnd);
    if (conflicts.length === 0) {
      suggestions.push({
        startTime: newStart,
        endTime: newEnd,
        type: 'same_time_later_date'
      });
    }
  }
  
  return suggestions;
}