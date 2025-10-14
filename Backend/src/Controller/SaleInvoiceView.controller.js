import { SaleInvoiceView } from "../Models/SaleInvoiceView.model.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";

export const getSaleInvoiceView = asyncHandler(async (req, res) => {
  try {
    const invoices = await SaleInvoiceView.find().sort({ issueDate: -1 });
    console.log("Fetched Invoices:", invoices);
         res.status(200).json(new ApiResponse({
            message: "Data Fetch Successfully!",
            data: invoices
        }));
  } catch (error) {
 return res.status(500).json(new ApiError(500, "Failed to fetch client list", error.message));
  }
});
