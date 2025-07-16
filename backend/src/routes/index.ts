import { Router } from "express";
import incidentsRouter from './incidents/incident'

const router = Router();

router.use('/incidents', incidentsRouter);

export default router;