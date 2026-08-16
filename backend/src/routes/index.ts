import { Router } from 'express';
import callRoutes from './call.routes';
import emailRoutes from './email.routes';

const router = Router();

router.use('/call', callRoutes);
router.use('/email', emailRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
