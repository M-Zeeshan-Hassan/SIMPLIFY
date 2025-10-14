import {Router} from 'express';
import {AllClients, GetAllSaleInvoice,GetAllSaleEstimates,GetAllPurchaseInvoice, AllTeams, AllSupplier,GetAllPurchaseEstimate}
 from "../Controller/Main.controller.js";
 import { verifyToken } from '../Middlewares/auth.middlewares.js';
 import { roleMiddleware } from '../Middlewares/role.middleware.js';


 const salesRoles = ['Admin','Inventory Clerk'];


const router = Router();
router.route('/si/list').get(verifyToken,roleMiddleware(salesRoles),GetAllSaleInvoice);
router.route('/se/list').get(verifyToken,roleMiddleware(salesRoles),GetAllSaleEstimates);
router.route('/pi/list').get(verifyToken,roleMiddleware(salesRoles),GetAllPurchaseInvoice);
router.route('/pe/list').get(verifyToken,roleMiddleware(salesRoles),GetAllPurchaseEstimate);
router.route('/client/list').get(verifyToken,roleMiddleware(salesRoles),AllClients);
router.route('/team/list/').get(verifyToken,roleMiddleware(salesRoles),AllTeams);
router.route('/supplier/list').get(verifyToken,roleMiddleware(salesRoles),AllSupplier);



export default router;





