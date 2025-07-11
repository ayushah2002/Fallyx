import { Router } from "express";
import incidentsRouter from './incidents/create'

const router = Router();

router.use('/incidents', incidentsRouter);

export default router;