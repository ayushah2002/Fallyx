import { Request, Response, NextFunction } from "express";
import admin from 'firebase-admin';

export async function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ message: 'Unauthorized user' });
        return;
    }

    const token = authHeader.split('Bearer ')[1];

    try {
        const verify = await admin.auth().verifyIdToken(token);
        (req as any).user = {
            uid: verify.uid,
            email: verify.email,
        };
        next();
    } catch (error) {
        console.error('Error verifiying User', error);
        res.status(403).json({ message: 'Unauthorized user' });
        return;
    }
}