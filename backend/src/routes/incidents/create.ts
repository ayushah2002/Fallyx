import { authenticateUser } from "../../middleware/auth";
import { Router } from "express";

const router = Router();

router.post('/incidents', authenticateUser, async (req, res) => {
    try {

    } catch (error) {

    }
})

export default router;