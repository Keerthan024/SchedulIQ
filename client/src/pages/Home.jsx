import { motion } from 'framer-motion';

// Create named motion components to avoid unused imports
const MContainer = motion.div;
const MShape = motion.div;
const MHeading = motion.h1;
const MText = motion.p;
const MButton = motion.button;
const MCard = motion.div;
const MScroll = motion.div;

export default function Home() {
  // Floating animation variants
  const floatingAnimation = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Stagger children animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <MShape
          className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <MShape
          className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <MContainer
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Main heading with gradient text */}
          <MHeading
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Smart Resource
            <br />
            <motion.span
              className="inline-block mt-2"
              variants={floatingAnimation}
              animate="animate"
            >
              Allocation
            </motion.span>
          </MHeading>

          {/* Subtitle with smooth entrance */}
          <MText
            variants={itemVariants}
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Optimize and manage campus resources intelligently — rooms, labs,
            equipment, and more. Avoid conflicts and maximize utilization efficiency.
          </MText>

          {/* CTA Button with hover effects */}
          <MContainer variants={itemVariants}>
            <MButton
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Shine effect on hover */}
              <span className="relative z-10">Get Started</span>
              
              {/* Animated background shine */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </MButton>
          </MContainer>

          {/* Feature highlights with icons */}
          <MContainer
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
          >
            {[
              { icon: "⚡", text: "Real-time Availability" },
              { icon: "🎯", text: "Conflict Detection" },
              { icon: "📊", text: "Smart Analytics" }
            ].map((feature, index) => (
              <MCard
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <p className="text-gray-700 font-medium">{feature.text}</p>
              </MCard>
            ))}
          </MContainer>
        </MContainer>

        {/* Scroll indicator */}
        <MScroll
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-gray-400 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </MScroll>
      </div>
    </div>
  );
}