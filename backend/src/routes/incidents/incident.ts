import { authenticateUser } from "../../middleware/auth";
import { Router, Response, Request } from "express";
import Incident from "../../models/incident";
import openai from "../../config/openai";

const router = Router();


// Create Incident
router.post('/', authenticateUser, async (req, res) => {
    try {
        const user = (req as any).user;

        if (!user || !user.uid) {
            res.status(401).json({ message: "Unauthorized user"});
            return;
        }

        const userId = user.uid;
        const { id, type, description, summary } = req.body;

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
        return;
    } catch (error) {
        console.log("Incident creation failed: ", error);
        res.status(500).json({ error: "Failed to create incident" });
        return;
    }
})

// Update Incident
router.post('/:id', authenticateUser, async (req, res) => {
    try {
        const user = (req as any).user;

        if (!user || !user.uid) {
            res.status(401).json({ message: "Unauthorized user"});
            return;
        }

        const id = req.params.id;
        console.log(id);
        const { type, description, summary } = req.body;

        const incident = await Incident.findByPk(id);

        if (!incident) {
            res.status(404).json({ message: "Incident not found"});
            return;
        } else {
        
            incident.type = type ?? incident.type;
            incident.description = description ?? incident.description;
            incident.summary = summary !== undefined ? summary : incident.summary;

            await incident.save();

            console.log("Sample incident updated: ", incident.toJSON());
            res.status(201).json({ message: "Incident updated", incident });
            return;
        }
    } catch (error) {
        console.log("Incident update failed: ", error);
        res.status(500).json({ error: "Failed to update incident" });
        return;
    }
})

// Get Incidents (All)
router.get('/', authenticateUser, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        if (!user || !user.uid) {
            res.status(401).json({ message: "Unauthorized user"});
            return;
        }

        const userId = user.uid;

        const incidents = await Incident.findAll({
            where: { userId }
        })
        console.log("All incidents retrieved");
        res.json(incidents);
        return;

    } catch (error) {
        console.log("Incident retrieval failed: ", error);
        res.status(500).json({ error: "Failed to get incidents" });
        return;
    }
})

// Get Incident (One)
router.get('/:id', authenticateUser, async (req, res) => {
    const id = req.params.id;

    try {
        const user = (req as any).user;

        if (!user || !user.uid) {
            res.status(401).json({ message: "Unauthorized user"});
            return;
        }

        const incident = await Incident.findByPk(id);
        if(!incident) {
            res.status(404).json({ message: "Incident not found"} );
            return;
        }
        console.log("Incident Retrieved");
        res.json(incident);
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get incident." });
        return;
    }
});

router.post("/:id/summarize", authenticateUser, async (req, res) => {
    try {
        const id = req.params.id;

        const incident = await Incident.findByPk(id);
        if(!incident) {
            res.status(404).json({ message: "Incident not found"} );
            return;
        }

        else {
            const generate = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Given the medical incident description and incident, a summary is required from a medical assistant perspective."
                    },
                    {
                        role: "user",
                        content: `Using 2 sentences, summarize the following incident description: \n${incident.description} and ${incident.type}.`
                    }
                ],
                temperature: 0.4,
            })

            const summarized = generate.choices[0].message.content;

            incident.summary = summarized ?? undefined;
            await incident.save();

            console.log("Sample incident updated: ", incident.toJSON());
            res.status(201).json({ message: "Summary generated for incident", summarized });
            return;
        }

    } catch (error) {
        console.log("Incident summary generation failed: ", error);
        res.status(500).json({ error: "Failed to generate summary for incident" });
        return;
    }
})

export default router;