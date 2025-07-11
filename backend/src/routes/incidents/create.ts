import { authenticateUser } from "../../middleware/auth";
import { Router } from "express";
import Incident from "../../models/incident";

const router = Router();

router.post('/', authenticateUser, async (req, res) => {
    try {
        const user = (req as any).user;

        if (!user || !user.uid) {
            res.status(401).json({ message: "Unauthorized user"});
        }

        const userId = user.uid;
        const { id, uid, type, description, summary } = req.body;

        const sum = summary ? summary != "" : null;
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

export default router;