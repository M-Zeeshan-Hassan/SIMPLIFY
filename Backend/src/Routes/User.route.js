import {Router} from 'express';
import {Login, Logout,resetPasswordLink} from '../Controller/Login.controller.js';
import {verifyToken} from '../Middlewares/auth.middlewares.js';



const router = Router();


router.route('/login').post(Login);
router.route('/logout').post(verifyToken,Logout);
router.route('/reset-password').post(resetPasswordLink);

export default router;
