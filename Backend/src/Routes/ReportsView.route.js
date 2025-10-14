import express from "express";
import { getSaleInvoiceView } from "../Controller/SaleInvoiceView.controller.js";
import { getPurchaseInvoiceView } from "../Controller/PurchaseInvoiceView.controller.js";


const router = express.Router();

// GET /api/saleinvoice/view
router.get("/invoice/sales", getSaleInvoiceView);
router.get("/invoice/purchases", getPurchaseInvoiceView);

export default router;
