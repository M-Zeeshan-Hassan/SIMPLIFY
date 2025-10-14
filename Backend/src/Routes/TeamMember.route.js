import {Router} from 'express';
import {upload} from '../Middlewares/multer.js';
import { detailView ,editView,allMember,createTeamMember,createPassword,deleteTeam} from '../Controller/TeamMember.controller.js';
import { verifyToken } from '../Middlewares/auth.middlewares.js';
import { roleMiddleware } from '../Middlewares/role.middleware.js';

const router = Router();


 
// Allowed roles for sales routes
const TeamRoles = ['Admin'];



 router.route('/new').post(upload.single('userImage'),createTeamMember);
 router.route('/createPassword/:id').put(createPassword);
 router.route('/list').get(allMember);
 router.route('/view/:id').get(detailView);
 router.route('/view/:id').put(upload.single('userImage'),editView);

 router.route('/deleted/:id')
   .delete(verifyToken, roleMiddleware(TeamRoles), deleteTeam);


export default router;