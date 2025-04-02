import { Router } from 'express';
import authRouter from './auth';
import clientsRouter from './clients';
import sessionRouter from './sessions';
import documentationRouter from './documentation';
import messagesRouter from './messages';
import { protectedRouter } from './protected';
import { adminRouter } from './admin';
import reportsRoutes from './reports';
import telehealthRoutes from './telehealth';
import staffRoutes from './staffRoutes';
import sendGridRoutes from './sendGrid';

const router = Router();

// Mount sub-routers
router.use('/auth', authRouter);
router.use('/clients', clientsRouter);
router.use('/sessions', sessionRouter);
router.use('/documentation', documentationRouter);
router.use('/messages', messagesRouter);
router.use('/protected', protectedRouter);
router.use('/admin', adminRouter);
router.use('/reports', reportsRoutes);
router.use('/telehealth', telehealthRoutes);
router.use('/staffManagement', staffRoutes);
router.use('/sendgrid', sendGridRoutes);

export default router; 