import { authenticateUser } from "../../middleware/auth";
import { Router } from "express";
import Incident from "../../models/incident";

const router = Router();

router.post('/', async (req, res) => {
    try {
        
        const incident = await Incident.create({
            userId: 1234,
            type: "fall",
            description: "hi there",
        })

        console.log("Sample incident created: ", incident.toJSON());
        res.status(201).json({ message: "Incident created", incident });
    } catch (error) {
        console.log("Incident creation failed: ", error);
        res.status(500).json({ error: "Failed to create incident" });
    }
})

export default router;