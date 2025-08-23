import { Router } from "express";
import rateLimit from "express-rate-limit";
import { 
  recommend, 
  followUpRecommend, 
  getConversationStatus, 
  getAvailableSchools 
} from "../controllers/recommend.controller.js";

const router = Router();

// Rate limiting: 30 requests per minute per IP
const limiter = rateLimit({ 
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
router.use(limiter);

// Main recommendation endpoint
router.post("/recommend", recommend);

// Follow-up recommendation endpoint
router.post("/follow-up", followUpRecommend);

// Get conversation status
router.get("/conversation/:conversationId", getConversationStatus);

// Get available schools
router.get("/schools", getAvailableSchools);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "AI Club Recommendation API",
    version: "2.0.0"
  });
});

export default router;
