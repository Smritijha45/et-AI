import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Report } from '../models/Report';

/**
 * @desc    Create a new fraud report
 * @route   POST /api/report
 * @access  Public
 */
export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      victimId,
      victimName,
      phoneNumber,
      upiId,
      bankAccount,
      deviceFingerprint,
      reportTimestamp
    } = req.body;

    // Validation
    if (!victimId) {
      res.status(400).json({ success: false, message: 'victimId is required' });
      return;
    }
    if (!victimName) {
      res.status(400).json({ success: false, message: 'victimName is required' });
      return;
    }

    const report = new Report({
      victimId,
      victimName,
      phoneNumber,
      upiId,
      bankAccount,
      deviceFingerprint,
      reportTimestamp: reportTimestamp ? new Date(reportTimestamp) : undefined
    });

    const savedReport = await report.save();
    res.status(201).json({ success: true, data: savedReport });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: (error as Error).message
    });
  }
};

/**
 * @desc    Get all fraud reports
 * @route   GET /api/report
 * @access  Public
 */
export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    // Optionally implement filters, e.g. /api/report?victimId=xyz
    const filters: Record<string, unknown> = {};
    if (req.query.victimId) {
      filters.victimId = req.query.victimId;
    }
    if (req.query.phoneNumber) {
      filters.phoneNumber = req.query.phoneNumber;
    }

    const reports = await Report.find(filters).sort({ reportTimestamp: -1 });
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports',
      error: (error as Error).message
    });
  }
};

/**
 * @desc    Get a specific fraud report by ID
 * @route   GET /api/report/:id
 * @access  Public
 */
export const getReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // We can search either by MongoDB ObjectId OR by victimId
    let report = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      report = await Report.findById(id);
    }

    // Fallback: search by victimId if not found or if the id was not a valid ObjectId
    if (!report) {
      report = await Report.findOne({ victimId: id });
    }

    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found' });
      return;
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve report',
      error: (error as Error).message
    });
  }
};

/**
 * @desc    Delete a fraud report by ID
 * @route   DELETE /api/report/:id
 * @access  Public
 */
export const deleteReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let deletedReport = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      deletedReport = await Report.findByIdAndDelete(id);
    }

    // Fallback: delete by victimId if not deleted by ObjectId
    if (!deletedReport) {
      deletedReport = await Report.findOneAndDelete({ victimId: id });
    }

    if (!deletedReport) {
      res.status(404).json({ success: false, message: 'Report not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Report successfully deleted', data: deletedReport });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: (error as Error).message
    });
  }
};
