import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  start: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"]
  },
  end: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"]
  }
});

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    lowercase: true
  },
  slots: [timeSlotSchema],
  isAvailable: {
    type: Boolean,
    default: true
  }
});

const resourceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Resource name is required"],
    trim: true,
    minlength: [2, "Resource name must be at least 2 characters"],
    maxlength: [100, "Resource name cannot exceed 100 characters"]
  },
  type: { 
    type: String, 
    enum: ["room", "lab", "equipment", "auditorium", "studio", "workshop"], 
    required: [true, "Resource type is required"] 
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  capacity: {
    type: Number,
    min: [1, "Capacity must be at least 1"],
    max: [1000, "Capacity cannot exceed 1000"],
    required: function() {
      return this.type === 'room' || this.type === 'lab' || this.type === 'auditorium';
    }
  },
  location: {
    type: String,
    required: [true, "Location is required"],
    trim: true,
    maxlength: [200, "Location cannot exceed 200 characters"]
  },
  building: {
    type: String,
    trim: true,
    maxlength: [100, "Building name cannot exceed 100 characters"]
  },
  floor: {
    type: String,
    trim: true
  },
  equipment: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"]
    },
    isFunctional: {
      type: Boolean,
      default: true
    }
  }],
  features: [{
    type: String,
    trim: true,
    enum: ["projector", "whiteboard", "ac", "wifi", "sound-system", "video-conference", "computers", "specialized-software"]
  }],
  availability: [availabilitySchema],
  images: [{
    url: String,
    alt: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  maxBookingHours: {
    type: Number,
    default: 4,
    min: [1, "Max booking hours must be at least 1"],
    max: [24, "Max booking hours cannot exceed 24"]
  },
  bookingRestrictions: {
    advanceBookingDays: {
      type: Number,
      default: 30,
      min: [1, "Advance booking days must be at least 1"],
      max: [365, "Advance booking days cannot exceed 365"]
    },
    minBookingNotice: {
      type: Number,
      default: 1, 
      min: [0, "Min booking notice cannot be negative"]
    },
    maxConcurrentBookings: {
      type: Number,
      default: 1,
      min: [1, "Max concurrent bookings must be at least 1"]
    }
  },
  utilization: {
    totalBookings: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    peakUsage: { type: String, default: "09:00-17:00" }
  },
  maintainedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  maintenanceSchedule: {
    lastMaintenance: Date,
    nextMaintenance: Date,
    maintenanceNotes: String
  }
}, {
  timestamps: true
});


resourceSchema.index({ location: 1, type: 1 });
resourceSchema.index({ isActive: 1 });
resourceSchema.index({ "availability.day": 1 });


resourceSchema.virtual('status').get(function() {
  const now = new Date();
  const currentDay = now.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); 
  
  const todayAvailability = this.availability.find(avail => avail.day === currentDay);
  
  if (!todayAvailability || !todayAvailability.isAvailable) {
    return 'unavailable';
  }
  
  const isInSlot = todayAvailability.slots.some(slot => 
    currentTime >= slot.start && currentTime <= slot.end
  );
  
  return isInSlot ? 'available' : 'unavailable';
});


resourceSchema.virtual('nextAvailable').get(function() {
  
  
  return null; 
});


resourceSchema.methods.isAvailableForSlot = function(day, startTime, endTime) {
  const dayAvailability = this.availability.find(avail => 
    avail.day.toLowerCase() === day.toLowerCase() && avail.isAvailable
  );
  
  if (!dayAvailability) return false;
  
  return dayAvailability.slots.some(slot => 
    startTime >= slot.start && endTime <= slot.end
  );
};


resourceSchema.methods.getUtilizationRate = function() {
  if (this.utilization.totalHours === 0) return 0;
  
  const totalPossibleHours = 8 * 5 * 4; 
  return (this.utilization.totalHours / totalPossibleHours) * 100;
};


resourceSchema.statics.findAvailable = function(day, startTime, endTime, type) {
  const query = {
    isActive: true,
    availability: {
      $elemMatch: {
        day: day.toLowerCase(),
        isAvailable: true,
        slots: {
          $elemMatch: {
            start: { $lte: startTime },
            end: { $gte: endTime }
          }
        }
      }
    }
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query);
};


resourceSchema.statics.findByLocation = function(location) {
  return this.find({ 
    location: new RegExp(location, 'i'),
    isActive: true 
  });
};


resourceSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model("Resource", resourceSchema);