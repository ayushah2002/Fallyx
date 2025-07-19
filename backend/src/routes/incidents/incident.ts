import { authenticateUser } from "@/middleware/auth";
import { Router } from "express";
import incidentController from "@/controllers/incidentController";

const router = Router();

// Create Incident
router.post('/', authenticateUser, incidentController.create);

// Update Incident
router.post('/:id', authenticateUser, incidentController.update);

// Get Incidents (All)
router.get('/', authenticateUser, incidentController.getAll);

// Get Incident (One)
router.get('/:id', authenticateUser, incidentController.getOne);

// Generate summary
router.post("/:id/summarize", authenticateUser, incidentController.summarize);

export default router;