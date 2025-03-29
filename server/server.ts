// src/server.ts
import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import staffRoutes from "./routes/staffRoutes";

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Register Staff Routes (all endpoints will be prefixed with /api/staff)
app.use("/api/staff", staffRoutes);

// Optionally, register other routes (auth, patients, etc.)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});