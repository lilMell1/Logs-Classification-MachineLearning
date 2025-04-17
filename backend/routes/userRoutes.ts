import express from 'express';
import { changeUsername, deleteUser } from '../controllers/userController';
import authenticate from '../middleware/authenticate';

const router = express.Router();

router.put('/change-username', authenticate, changeUsername);
router.delete('/delete-user', authenticate, deleteUser);

export default router;
