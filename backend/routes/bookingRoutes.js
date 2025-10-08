import express from "express";
import { 
  createBooking, 
  getBookings, 
  getBooking, 
  updateBookingStatus, 
  verifyCheckIn, 
  cancelBooking, 
  getBookingAnalytics 
} from "../controllers/bookingController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createBooking);

router.get("/", getBookings);

router.get("/:id", getBooking);

router.put("/:id/cancel", cancelBooking);

router.put("/:id/status", admin, updateBookingStatus);

router.put("/:id/checkin", admin, verifyCheckIn);

router.get("/analytics/overview", admin, getBookingAnalytics);

export default router;