import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Named motion components
const MFooter = motion.footer;
const MContainer = motion.div;
const MLink = motion(Link);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
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
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  const quickLinks = [
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
    { name: "Schedule", path: "/schedule" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  const supportLinks = [
    { name: "Help Center", path: "/help" },
    { name: "Contact Us", path: "/contact" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" },
  ];

  return (
    <MFooter
      className="bg-gradient-to-r from-blue-900 to-purple-900 text-white relative overflow-hidden"
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.3) 2%, transparent 40%)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <MContainer variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                SmartScheduler
              </h3>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed mb-4">
              Optimizing campus resource allocation with intelligent scheduling and conflict-free bookings for enhanced productivity.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: "📧", label: "Email" },
                { icon: "🐦", label: "Twitter" },
                { icon: "💼", label: "LinkedIn" },
                { icon: "📘", label: "Facebook" }
              ].map((social, index) => (
                <motion.button
                  key={social.label}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-lg">{social.icon}</span>
                </motion.button>
              ))}
            </div>
          </MContainer>

          {/* Quick Links */}
          <MContainer variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <motion.li key={link.name} variants={itemVariants}>
                  <MLink
                    to={link.path}
                    className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group"
                    whileHover={{ x: 5 }}
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {link.name}
                  </MLink>
                </motion.li>
              ))}
            </ul>
          </MContainer>

          {/* Support */}
          <MContainer variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <motion.li key={link.name} variants={itemVariants}>
                  <MLink
                    to={link.path}
                    className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group"
                    whileHover={{ x: 5 }}
                  >
                    <span className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    {link.name}
                  </MLink>
                </motion.li>
              ))}
            </ul>
          </MContainer>

          {/* Contact Info */}
          <MContainer variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact Info</h4>
            <div className="space-y-3 text-blue-200">
              <div className="flex items-center space-x-3">
                <span className="text-lg">📍</span>
                <span className="text-sm">Srinivas Institute of Technology, Mangaluru</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg">📞</span>
                <span className="text-sm">8078334593</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg">✉️</span>
                <span className="text-sm">plasmacoltd@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg">🕒</span>
                <span className="text-sm">Mon - Fri: 8:00 AM - 6:00 PM</span>
              </div>
            </div>
          </MContainer>
        </div>

        {/* Newsletter Subscription */}
        <MContainer
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-semibold text-white mb-2">Stay Updated</h4>
              <p className="text-blue-200 text-sm">Get the latest features and updates delivered to your inbox.</p>
            </div>
            <div className="flex space-x-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </MContainer>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.p
              variants={itemVariants}
              className="text-blue-200 text-sm mb-4 md:mb-0 text-center md:text-left"
            >
              © {currentYear} Smart Resource Scheduler. All Rights Reserved.
            </motion.p>
            
            <div className="flex items-center space-x-6">
              <motion.span
                variants={itemVariants}
                className="flex items-center text-blue-200 text-sm"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                System Operational
              </motion.span>
              
              <div className="flex space-x-4">
                {["🔒", "🌐", "⚡"].map((icon, index) => (
                  <motion.span
                    key={index}
                    className="text-blue-200 text-sm"
                    variants={itemVariants}
                    transition={{ delay: index * 0.1 }}
                  >
                    {icon}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <motion.div
        className="absolute bottom-10 left-10 w-4 h-4 bg-blue-400 rounded-full opacity-20"
        animate={{
          y: [0, -20, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-10 right-20 w-6 h-6 bg-purple-400 rounded-full opacity-30"
        animate={{
          y: [0, 15, 0],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
    </MFooter>
  );
}