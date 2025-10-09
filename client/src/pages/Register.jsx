import { useState } from "react";
import { authAPI } from "../api/axios"; // Changed import
import { useNavigate, Link } from "react-router-dom";
import { motion } from 'framer-motion';

// Named motion components
const MContainer = motion.div;
const MForm = motion.form;
const MInput = motion.input;
const MButton = motion.button;
const MCard = motion.div;
const MText = motion.p;

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    phone: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) newErrors.phone = "Please enter a valid phone number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const { confirmPassword, ...submitData } = formData;
      
      // Use authAPI instead of direct axios
      const res = await authAPI.register(submitData);
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      // Success animation before navigation
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
      
    } catch (err) {
      console.error("Registration error:", err);
      setErrors({ 
        submit: err.response?.data?.message || "Registration failed. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of your component remains exactly the same
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const inputVariants = {
    focus: { 
      scale: 1.02,
      boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-20 -right-20 w-60 h-60 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            scale: [1.1, 1, 1.1],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
      </div>

      <MContainer
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <MCard
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8"
          whileHover={{ y: -5 }}
        >
          {/* Header */}
          <MContainer variants={itemVariants} className="text-center mb-8">
            <motion.div
              className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-2xl text-white">🚀</span>
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Create Account
            </h1>
            <MText variants={itemVariants} className="text-gray-600 mt-2">
              Join Smart Resource Scheduler today
            </MText>
          </MContainer>

          <MForm onSubmit={handleSubmit} variants={itemVariants}>
            {/* Name Input */}
            <MContainer variants={itemVariants} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <MInput
                type="text"
                name="name"
                placeholder="Enter your full name"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.name 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                value={formData.name}
                onChange={handleChange}
                whileFocus="focus"
                variants={inputVariants}
              />
              {errors.name && (
                <motion.p 
                  className="text-red-500 text-sm mt-2 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="mr-1">⚠️</span> {errors.name}
                </motion.p>
              )}
            </MContainer>

            {/* Email Input */}
            <MContainer variants={itemVariants} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <MInput
                type="email"
                name="email"
                placeholder="Enter your email"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.email 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                value={formData.email}
                onChange={handleChange}
                whileFocus="focus"
                variants={inputVariants}
              />
              {errors.email && (
                <motion.p 
                  className="text-red-500 text-sm mt-2 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="mr-1">⚠️</span> {errors.email}
                </motion.p>
              )}
            </MContainer>

            {/* Department Input */}
            <MContainer variants={itemVariants} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <MInput
                type="text"
                name="department"
                placeholder="e.g., Computer Science, Engineering"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none"
                value={formData.department}
                onChange={handleChange}
                whileFocus="focus"
                variants={inputVariants}
              />
            </MContainer>

            {/* Phone Input */}
            <MContainer variants={itemVariants} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <MInput
                type="tel"
                name="phone"
                placeholder="+1 (555) 123-4567"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.phone 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                value={formData.phone}
                onChange={handleChange}
                whileFocus="focus"
                variants={inputVariants}
              />
              {errors.phone && (
                <motion.p 
                  className="text-red-500 text-sm mt-2 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="mr-1">⚠️</span> {errors.phone}
                </motion.p>
              )}
            </MContainer>

            {/* Password Input */}
            <MContainer variants={itemVariants} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <MInput
                type="password"
                name="password"
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.password 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                value={formData.password}
                onChange={handleChange}
                whileFocus="focus"
                variants={inputVariants}
              />
              {errors.password && (
                <motion.p 
                  className="text-red-500 text-sm mt-2 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="mr-1">⚠️</span> {errors.password}
                </motion.p>
              )}
            </MContainer>

            {/* Confirm Password Input */}
            <MContainer variants={itemVariants} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <MInput
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                  errors.confirmPassword 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 focus:border-blue-500"
                } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                value={formData.confirmPassword}
                onChange={handleChange}
                whileFocus="focus"
                variants={inputVariants}
              />
              {errors.confirmPassword && (
                <motion.p 
                  className="text-red-500 text-sm mt-2 flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="mr-1">⚠️</span> {errors.confirmPassword}
                </motion.p>
              )}
            </MContainer>

            {/* Submit Error */}
            {errors.submit && (
              <motion.div 
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="mr-2">❌</span> {errors.submit}
              </motion.div>
            )}

            {/* Submit Button */}
            <MButton
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </span>
              
              {/* Animated background shine */}
              {!isLoading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </MButton>
          </MForm>

          {/* Footer */}
          <MContainer variants={itemVariants} className="text-center mt-6">
            <MText className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link 
                to="/login"
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-300"
              >
                Sign in
              </Link>
            </MText>
          </MContainer>
        </MCard>
      </MContainer>
    </div>
  );
}