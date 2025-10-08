import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import Schedule from "./pages/Schedule";
import Register from "./pages/Register";

// Named motion components
const MMain = motion.main;

// Page transition animations
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

// Wrapper component for page animations
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <MotionPage>
              <Home />
            </MotionPage>
          } 
        />
        <Route 
          path="/login" 
          element={
            <MotionPage>
              <Login />
            </MotionPage>
          } 
        />
                <Route 
          path="/register" 
          element={
            <MotionPage>
              <Register />
            </MotionPage>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <MotionPage>
              <Dashboard />
            </MotionPage>
          } 
        />
        <Route 
          path="/resources" 
          element={
            <MotionPage>
              <Resources />
            </MotionPage>
          } 
        />
        <Route 
          path="/schedule" 
          element={
            <MotionPage>
              <Schedule />
            </MotionPage>
          } 
        />
        
        {/* 404 Page - Add this for better UX */}
        <Route 
          path="*" 
          element={
            <MotionPage>
              <NotFound />
            </MotionPage>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

// Motion wrapper for page transitions
function MotionPage({ children }) {
  return (
    <MMain
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen"
    >
      {children}
    </MMain>
  );
}

// Simple 404 component
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
        >
          404
        </motion.div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <motion.button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Go Back
        </motion.button>
      </div>
    </div>
  );
}

// Protected Route Wrapper (for future authentication)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return (
      <MotionPage>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-8">Please log in to access this page.</p>
            <motion.button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Login
            </motion.button>
          </div>
        </div>
      </MotionPage>
    );
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">
          <AnimatedRoutes />
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;