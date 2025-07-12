import { authenticateUser } from "../../middleware/auth";
import { Router, Response, Request } from "express";
import Incident from "../../models/incident";

const router = Router();


// Create Incident
router.post('/', authenticateUser, async (req, res) => {
    try {
        const user = (req as any).user;

        if (!user || !user.uid) {
            res.status(401).json({ message: "Unauthorized user"});
        }

        const userId = user.uid;
        const { id, uid, type, description, summary } = req.body;

        const sum = summary && summary.trim() !== "" ? summary : null;
        const incident = await Incident.create({
            id: id,
            userId: userId,
            type: type,
            description: description,
            summary: sum,
        })

        console.log("Sample incident created: ", incident.toJSON());
        res.status(201).json({ message: "Incident created", incident });
    } catch (error) {
        console.log("Incident creation failed: ", error);
        res.status(500).json({ error: "Failed to create incident" });
    }
})

// Update Incident
router.post('/:id', authenticateUser, async (req, res) => {
    try {
        const user = (req as any).user;

        if (!user || !user.uid) {
            res.status(401).json({ message: "Unauthorized user"});
        }

        const id = req.params.id;
        console.log(id);
        const { type, description, summary } = req.body;

        const sum = summary ? summary != "" : null;

        const incident = await Incident.findByPk(id);

        if (!incident) {
            res.status(404).json({ message: "Incident not found"});
        } else {
        
            incident.type = type ?? incident.type;
            incident.description = description ?? incident.description;
            incident.summary = summary !== undefined ? summary : incident.summary;

            await incident.save();

            console.log("Sample incident updated: ", incident.toJSON());
            res.status(201).json({ message: "Incident updated", incident });
        }
    } catch (error) {
        console.log("Incident update failed: ", error);
        res.status(500).json({ error: "Failed to update incident" });
    }
})

// Get Incidents (All)
router.get('/', authenticateUser, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        if (!user || !user.uid) {
            res.status(401).json({ message: "Unauthorized user"});
        }

        const userId = user.uid;

        const incidents = await Incident.findAll({
            where: { userId }
        })
        console.log("All incidents retrieved");
        res.json(incidents);

    } catch (error) {
        console.log("Incident retrieval failed: ", error);
        res.status(500).json({ error: "Failed to get incidents" });
    }
})

// Get Incident (One)
router.get('/:id', authenticateUser, async (req, res) => {
    const id = req.params.id;

    try {
        const incident = await Incident.findByPk(id);
        if(!incident) {
            res.status(404).json({ message: "Incident not found"} );
        }
        console.log("Incident Retrieved");
        res.json(incident);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to get incident." });
    }
});

export default router;