import { Router } from 'express';
import {
    NewProduct,
    allProducts,
    SalesPerson,
    editView,
    detailView,
    deleteProduct
} from "../Controller/NewProduct.controller.js";

import { verifyToken } from '../Middlewares/auth.middlewares.js';
import { roleMiddleware } from '../Middlewares/role.middleware.js';

const router = Router();



const createRoles = ['Admin', 'Sales Manager', 'Inventory Clerk', 'Inventory Manager'];
const viewAllRoles = ['Admin', 'Sales Manager', 'Inventory Manager', 'Inventory Clerk', 'Sales Person', 'Accountant'];
const editRoles = ['Admin', 'Sales Manager', 'Inventory Manager'];
const deleteRoles = ['Admin', 'Inventory Manager'];


router.post(
    '/new',
    verifyToken,
    roleMiddleware(createRoles),
    NewProduct
);


router.get(
    '/new',
    verifyToken,
    roleMiddleware(['Admin', 'Sales Manager', 'Inventory Clerk', 'Inventory Manager']),
    SalesPerson
);


router.get(
    '/list',
    verifyToken,
    roleMiddleware(viewAllRoles),
    allProducts
);


router.get(
    '/view/:id',
    verifyToken,
    roleMiddleware(viewAllRoles),
    detailView
);

router.put(
    '/view/:id',
    verifyToken,
    roleMiddleware(editRoles),
    editView
);


router.delete(
    '/deleted/:id',
    verifyToken,
    roleMiddleware(deleteRoles),
    deleteProduct
);

export default router;
