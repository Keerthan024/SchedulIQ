import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Booking from "../models/Booking.js"; 

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || "7d" 
  });
};

// Send token response with user data
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Remove password from output
  const userData = user.toProfileJSON ? user.toProfileJSON() : {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userData
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password"
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'user',
      department,
      phone
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log registration success
    console.log(`✅ New user registered: ${user.email} (${user.role})`);

    sendTokenResponse(user, 201, res);

  } catch (error) {
    console.error('Register Error:', error);

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error in user registration",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user) {
      console.log(`❌ Failed login attempt for: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact administrator."
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      console.log(`❌ Failed login attempt for: ${email}`);
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log(`✅ User logged in: ${user.email}`);

    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error('Login Error:', error);
    
    res.status(500).json({
      success: false,
      message: "Error in user login",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user: user.toProfileJSON ? user.toProfileJSON() : {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get Me Error:', error);
    
    res.status(500).json({
      success: false,
      message: "Error fetching user data"
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, sort = '-createdAt' } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      data: users
    });

  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching users"
    });
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/auth/users/:id
// @access  Private/Admin
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get user's recent bookings
    const recentBookings = await Booking.find({ user: req.params.id })
      .populate('resource', 'name type location')
      .sort({ startTime: -1 })
      .limit(5);

    // Get user statistics
    const bookingStats = await Booking.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        user,
        recentBookings,
        stats: {
          totalBookings: await Booking.countDocuments({ user: user._id }),
          bookingStatus: bookingStats
        }
      }
    });

  } catch (error) {
    console.error('Get User Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error fetching user"
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, department, phone, isActive, preferences } = req.body;

    // Prevent admin from demoting themselves
    if (req.params.id === req.user.id && role && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: "Cannot remove your own admin privileges"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, department, phone, isActive, preferences },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log(`✅ User updated: ${user.email} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });

  } catch (error) {
    console.error('Update User Error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating user"
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user has future bookings
    const futureBookings = await Booking.findOne({
      user: req.params.id,
      startTime: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    });

    if (futureBookings) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user with future bookings"
      });
    }

    await User.findByIdAndDelete(req.params.id);

    console.log(`🗑️ User deleted: ${user.email} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error('Delete User Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting user"
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      department: req.body.department,
      phone: req.body.phone,
      preferences: req.body.preferences
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { 
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      user: user.toProfileJSON ? user.toProfileJSON() : {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Update Profile Error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating profile"
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    // Prevent using same password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password"
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log(`🔐 Password changed for: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error('Change Password Error:', error);
    
    res.status(500).json({
      success: false,
      message: "Error changing password"
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  console.log(`👋 User logged out: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};