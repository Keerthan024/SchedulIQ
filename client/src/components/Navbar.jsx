import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Named motion components
const MNav = motion.nav;
const MLink = motion(Link);
const MContainer = motion.div;
const MButton = motion.button;

export default function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/resources", label: "Resources" },
    { path: "/schedule", label: "Schedule" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/login", label: "Login" },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <>
      <MNav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20' 
            : 'bg-transparent'
        }`}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <MContainer
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <h1 className={`text-xl font-bold ${
                isScrolled ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : 'text-white'
              }`}>
                SmartScheduler
              </h1>
            </MContainer>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <MLink
                    key={item.path}
                    to={item.path}
                    className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      isScrolled
                        ? isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        : isActive
                          ? 'text-white bg-white/20'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                          isScrolled ? 'bg-blue-600' : 'bg-white'
                        } rounded-full`}
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </MLink>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <MButton
              className={`md:hidden p-2 rounded-lg ${
                isScrolled 
                  ? 'bg-gray-100 text-gray-700' 
                  : 'bg-white/20 text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <motion.span
                  className={`w-full h-0.5 rounded-full ${
                    isScrolled ? 'bg-gray-700' : 'bg-white'
                  }`}
                  animate={{ 
                    rotate: isMobileMenuOpen ? 45 : 0, 
                    y: isMobileMenuOpen ? 6 : 0 
                  }}
                />
                <motion.span
                  className={`w-full h-0.5 rounded-full ${
                    isScrolled ? 'bg-gray-700' : 'bg-white'
                  }`}
                  animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                />
                <motion.span
                  className={`w-full h-0.5 rounded-full ${
                    isScrolled ? 'bg-gray-700' : 'bg-white'
                  }`}
                  animate={{ 
                    rotate: isMobileMenuOpen ? -45 : 0, 
                    y: isMobileMenuOpen ? -6 : 0 
                  }}
                />
              </div>
            </MButton>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className={`md:hidden rounded-2xl mt-2 overflow-hidden ${
                  isScrolled 
                    ? 'bg-white/90 backdrop-blur-lg shadow-lg' 
                    : 'bg-white/20 backdrop-blur-lg'
                }`}
                variants={mobileMenuVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                <div className="py-2 space-y-1">
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <MLink
                        key={item.path}
                        to={item.path}
                        className={`block px-4 py-3 mx-2 rounded-xl font-medium transition-all duration-300 ${
                          isScrolled
                            ? isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50'
                            : isActive
                              ? 'bg-white/30 text-white'
                              : 'text-white/80 hover:bg-white/10'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 5 }}
                      >
                        {item.label}
                      </MLink>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </MNav>

      {/* Spacer for fixed navbar */}
      <div className="h-20" />
    </>
  );
}