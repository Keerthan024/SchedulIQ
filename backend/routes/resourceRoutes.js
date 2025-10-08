import express from "express";
import { 
  getResources, 
  createResource, 
  getResource, 
  updateResource, 
  deleteResource,
  checkAvailability,
  getResourceAnalytics,
  getResourceTypes
} from "../controllers/resourceController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getResources);

router.get("/types", getResourceTypes);

router.get("/:id", getResource);

router.post("/:id/availability", checkAvailability);

router.get("/:id/analytics", protect, admin, getResourceAnalytics);

router.post("/", protect, admin, createResource);

router.put("/:id", protect, admin, updateResource);

router.delete("/:id", protect, admin, deleteResource);

export default router;