import "dotenv/config";
import express from "express";
import cors from "cors";
import recommendRoutes from "./server/routes/recommend.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.use("/api", recommendRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ 
    error: "Unexpected server error.",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ 
    error: "Endpoint not found",
    availableEndpoints: [
      "POST /api/recommend",
      "POST /api/follow-up", 
      "GET /api/conversation/:conversationId",
      "GET /api/schools",
      "GET /api/health"
    ]
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Improved AI Club Recommendation Server running on port ${PORT}`);
  console.log(`📊 Rate limiting: 30 requests per minute per IP`);
  console.log(`🔒 CORS enabled for all origins`);
  console.log(`🤖 AI Status: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /api/recommend - Get club recommendations`);
  console.log(`   POST /api/follow-up - Follow-up recommendations`);
  console.log(`   GET /api/schools - Get available schools`);
  console.log(`   GET /api/health - Health check`);
});
