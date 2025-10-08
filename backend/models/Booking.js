import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, "User ID is required"] 
  },
  resource: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Resource", 
    required: [true, "Resource ID is required"] 
  },
  title: {
    type: String,
    required: [true, "Booking title is required"],
    trim: true,
    maxlength: [100, "Title cannot exceed 100 characters"]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  startTime: {
    type: Date,
    required: [true, "Start time is required"],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: "Start time must be in the future"
    }
  },
  endTime: {
    type: Date,
    required: [true, "End time is required"],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: "End time must be after start time"
    }
  },
  duration: {
    type: Number,
    min: [15, "Minimum booking duration is 15 minutes"],
    max: [1440, "Maximum booking duration is 24 hours"]
  },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "active", "completed", "cancelled", "rejected", "no-show"], 
    default: "pending" 
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  recurring: {
    isRecurring: { type: Boolean, default: false },
    pattern: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: function() { return this.recurring.isRecurring; }
    },
    endDate: {
      type: Date,
      required: function() { return this.recurring.isRecurring; }
    },
    occurrences: [{
      date: Date,
      status: String
    }]
  },
  verification: {
    checkedIn: { type: Boolean, default: false },
    checkedOut: { type: Boolean, default: false },
    checkInTime: Date,
    checkOutTime: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: String,
    attachments: [{
      filename: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  conflictStatus: {
    hasConflict: { type: Boolean, default: false },
    conflictingBookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    resolved: { type: Boolean, default: false },
    resolutionNotes: String
  },
  waitingList: {
    isFromWaitingList: { type: Boolean, default: false },
    originalRequestTime: Date,
    position: Number
  },
  alternatives: {
    suggestedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],
    userAcceptedAlternative: { type: Boolean, default: false }
  },
  notifications: {
    remindersSent: [{
      type: { type: String, enum: ["email", "sms", "push"] },
      sentAt: Date,
      status: String
    }],
    lastReminderSent: Date
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    bookingSource: {
      type: String,
      enum: ["web", "mobile", "admin", "api"],
      default: "web"
    }
  },
  cost: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    calculatedAt: Date
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date,
    issuesReported: [String]
  }
}, {
  timestamps: true
});


bookingSchema.index({ resource: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ user: 1, startTime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ "conflictStatus.hasConflict": 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });


bookingSchema.pre("save", function(next) {
  
  if (this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  
  
  if (this.duration < 15) {
    next(new Error("Minimum booking duration is 15 minutes"));
  }
  if (this.duration > 1440) {
    next(new Error("Maximum booking duration is 24 hours"));
  }
  
  next();
});


bookingSchema.virtual('isActiveNow').get(function() {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime && this.status === 'confirmed';
});


bookingSchema.virtual('isUpcoming').get(function() {
  return new Date() < this.startTime && this.status === 'confirmed';
});


bookingSchema.virtual('requiresVerification').get(function() {
  return !this.verification.checkedIn && this.status === 'confirmed' && new Date() >= this.startTime;
});


bookingSchema.methods.checkConflicts = async function() {
  const conflictingBookings = await mongoose.model('Booking').find({
    resource: this.resource,
    _id: { $ne: this._id },
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      { startTime: { $lt: this.endTime }, endTime: { $gt: this.startTime } }
    ]
  });
  
  this.conflictStatus.hasConflict = conflictingBookings.length > 0;
  this.conflictStatus.conflictingBookings = conflictingBookings.map(b => b._id);
  this.conflictStatus.resolved = false;
  
  return conflictingBookings;
};


bookingSchema.methods.verifyCheckIn = function(verifiedBy, notes = '') {
  if (this.status !== 'confirmed') {
    throw new Error('Only confirmed bookings can be checked in');
  }
  
  this.verification.checkedIn = true;
  this.verification.checkInTime = new Date();
  this.verification.verifiedBy = verifiedBy;
  this.verification.notes = notes;
  this.status = 'active';
};


bookingSchema.methods.completeCheckOut = function(notes = '') {
  if (!this.verification.checkedIn) {
    throw new Error('Booking must be checked in before checkout');
  }
  
  this.verification.checkedOut = true;
  this.verification.checkOutTime = new Date();
  this.status = 'completed';
  
  if (notes) {
    this.verification.notes = (this.verification.notes || '') + ` Checkout: ${notes}`;
  }
};


bookingSchema.methods.cancelBooking = function(reason = '') {
  if (['completed', 'cancelled'].includes(this.status)) {
    throw new Error('Cannot cancel completed or already cancelled booking');
  }
  
  this.status = 'cancelled';
  if (reason) {
    this.verification.notes = (this.verification.notes || '') + ` Cancelled: ${reason}`;
  }
};


bookingSchema.statics.findConflicts = function(resourceId, startTime, endTime, excludeBookingId = null) {
  const query = {
    resource: resourceId,
    status: { $in: ['pending', 'confirmed', 'active'] },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  return this.find(query).populate('user', 'name email').populate('resource', 'name type location');
};


bookingSchema.statics.getBookingsInRange = function(startDate, endDate, resourceId = null) {
  const query = {
    startTime: { $gte: startDate },
    endTime: { $lte: endDate },
    status: { $in: ['confirmed', 'active'] }
  };
  
  if (resourceId) {
    query.resource = resourceId;
  }
  
  return this.find(query)
    .populate('user', 'name email department')
    .populate('resource', 'name type location capacity')
    .sort({ startTime: 1 });
};


bookingSchema.statics.getUtilizationAnalytics = async function(resourceId, startDate, endDate) {
  const bookings = await this.find({
    resource: resourceId,
    startTime: { $gte: startDate },
    endTime: { $lte: endDate },
    status: { $in: ['confirmed', 'active', 'completed'] }
  });
  
  const totalBookedHours = bookings.reduce((total, booking) => {
    return total + (booking.duration / 60);
  }, 0);
  
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const totalPossibleHours = totalDays * 8; 
  
  return {
    totalBookings: bookings.length,
    totalBookedHours,
    utilizationRate: totalPossibleHours > 0 ? (totalBookedHours / totalPossibleHours) * 100 : 0,
    averageBookingDuration: bookings.length > 0 ? totalBookedHours / bookings.length : 0
  };
};


bookingSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model("Booking", bookingSchema);