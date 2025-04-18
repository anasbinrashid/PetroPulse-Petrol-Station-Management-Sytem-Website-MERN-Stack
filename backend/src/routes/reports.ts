import express from "express";
import asyncHandler from "express-async-handler";
import ReportModel from "../models/admin/ReportModel";

const router = express.Router();

// GET all reports
router.get("/", asyncHandler(async (req, res) => {
  try {
    console.log("API /api/reports hit");
    
    const reports = await ReportModel.find({}).sort({ lastGenerated: -1 });
    
    console.log(`Fetched ${reports.length} reports from database`);
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Failed to fetch reports", error: (error as Error).message });
  }
}));

// GET report by ID
router.get("/:id", asyncHandler(async (req, res) => {
  try {
    console.log(`Fetching report with ID: ${req.params.id}`);
    
    const report = await ReportModel.findById(req.params.id);
    
    if (report) {
      console.log(`Report found: ${report.title}`);
      res.json(report);
    } else {
      console.log("Report not found");
      res.status(404).json({ message: "Report not found" });
    }
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: "Failed to fetch report", error: (error as Error).message });
  }
}));

export default router;