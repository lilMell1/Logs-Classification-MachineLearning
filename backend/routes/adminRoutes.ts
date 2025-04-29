import { Router } from 'express';
import { authorizeAdmin } from '../middleware/authorizeAdmin';
import authenticate from '../middleware/authenticate';
import { getAllUsers, updateUserRole } from '../controllers/adminController';

const router = Router();
router.use(authenticate); 
router.use(authorizeAdmin); 

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

export default router;
