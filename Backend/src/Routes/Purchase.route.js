import {Router} from 'express';
import {NewPurchaseInvoice,GetAllPurchasenvoice,Invoice_detailView,SalesPerson,PurchaseInvoice_EditView,deleteInvoice } from "../Controller/PurchaseInvoice.controller.js";
import { NewPurchaseOrder,GetPurchaseOrder, detailView ,PurchaseOrder_EditView} from "../Controller/PurchaseOrder.controller.js";
import {getSupplier} from "../Utils/GetSupplier.js"
import {getProducts} from "../Utils/GetProducts.js"
import { verifyToken } from '../Middlewares/auth.middlewares.js';
import { roleMiddleware } from '../Middlewares/role.middleware.js';




const router = Router();
const salesRoles = ['Admin', 'Sales Manager', 'Sales Person'];

router.route('/pi/new').get(verifyToken,roleMiddleware(salesRoles),getSupplier);
router.route('/pi/new/salesPerson').get(verifyToken, roleMiddleware(salesRoles), SalesPerson);
router.route('/pi/new/products').get( verifyToken,roleMiddleware(salesRoles),getProducts);
router.route('/pi/new').post(verifyToken,roleMiddleware(salesRoles),NewPurchaseInvoice);
router.route('/pi/list').get(verifyToken,roleMiddleware(salesRoles),GetAllPurchasenvoice);
router.route('/pi/edit/:id').get(verifyToken,roleMiddleware(salesRoles),Invoice_detailView);
router.route('/pi/edit/:id').put(verifyToken,roleMiddleware(salesRoles),PurchaseInvoice_EditView);
router.route('/pi/deleted/:id').delete(verifyToken,roleMiddleware(salesRoles),deleteInvoice);

router.route('/po/new').get(getSupplier);
router.route('/po/new/products').get(getProducts);
//router.route('/po/new/sale').get(getProducts);
router.route('/po/new').post(NewPurchaseOrder);
router.route('/po/list').get(GetPurchaseOrder);
router.route('/po/edit/:id').get(detailView);
router.route('/po/edit/:id').put(PurchaseOrder_EditView);


export default router;





