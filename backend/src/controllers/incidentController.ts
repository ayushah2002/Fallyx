import { Request, Response } from "express";
import incidentService from "../services/incidentService";

class IncidentController {

    // Create Incident
    async create(req: Request, res: Response) {
        try {
            const user = (req as any).user;

            if (!user || !user?.uid) {
                res.status(401).json({ message: "Unauthorized user" });
                return;
            }

            const incident = await incidentService.create(user.uid, req.body);
            // console.log("Sample incident created: ", incident.toJSON());
            res.status(201).json({ message: "Incident created", incident });
            return;
        } catch (error) {
            console.error("Incident creation failed:", error);
            res.status(500).json({ error: "Failed to create incident" });
            return;
        }
    }

    // Update Incident
    async update(req: Request, res: Response) {
        try {
            const user = (req as any).user;
        
            if (!user || !user?.uid) {
                res.status(401).json({ message: "Unauthorized user" });
                return;
            }

            const updated = await incidentService.update(req.params.id, req.body);
            if (!updated) {
                res.status(404).json({ message: "Incident not found" });
                return;
            }
        
            //console.log("Sample incident updated: ", updated.toJSON());
            res.status(200).json({ message: "Incident updated", incident: updated });
            return;
        } catch (error) {
            console.error("Incident update failed:", error);
            res.status(500).json({ error: "Failed to update incident" });
            return;
        }
    }

    // Get all incidents
    async getAll(req: Request, res: Response) {
        try {
            const user = (req as any).user;

            if (!user || !user?.uid) {
                res.status(401).json({ message: "Unauthorized user" });
                return;
            }

            const incidents = await incidentService.findAllByUser(user.uid);
            //console.log("All incidents retrieved");
            res.json(incidents);
            return;
        } catch (error) {
            console.error("Incident retrieval failed:", error);
            res.status(500).json({ error: "Failed to get incidents" });
            return;
        }
    }

    // Get one singular incident
    async getOne(req: Request, res: Response) {
        try {
            const user = (req as any).user;
            
            if (!user || !user?.uid) {
                res.status(401).json({ message: "Unauthorized user" });
                return;
            }

            const incident = await incidentService.findById(req.params.id);
            if(!incident) {
                res.status(404).json({ message: "Incident not found"} );
                return;
            }
        
            // console.log("Incident Retrieved");
            res.json(incident);
            return;
        } catch (error) {
            console.error("Incident retrieval failed:", error);
            res.status(500).json({ error: "Failed to get incident" });
            return;
        }
    }

    // Get summary of Incident
    async summarize(req: Request, res: Response) {
        try {
            const user = (req as any).user;
        
            if (!user || !user?.uid) {
                res.status(401).json({ message: "Unauthorized user" });
                return;
            }

            const summary = await incidentService.generateSummary(req.params.id);
            if (!summary) {
                res.status(404).json({ message: "Incident not found" });
                return;
            }
        
            // console.log("Sample summary generated: ", summary.toJSON());
            res.status(200).json({ message: "Summary generated", summary });
            return;
        } catch (error) {
            console.error("Summary generation failed:", error);
            res.status(500).json({ error: "Failed to generate summary" });
            return;
        }
    }
}

export default new IncidentController();