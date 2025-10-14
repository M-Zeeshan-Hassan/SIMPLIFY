import { asyncHandler } from "../Utils/AsyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { Product } from "../Models/product.model.js";
import {NewSupplier} from "../Models/Supplier.model.js"
import { PurchaseEstimate } from "../Models/purchaseEstimate.model.js"

export const NewPurchaseOrder = asyncHandler(async (req, res) => {

    const {
        supplierName,
        contactPerson,
        email,
        addressType,
        date,
        dueDate,
        purchaseRefernce,
        currency,
        exchangeRate,
        vatType,
        Product: Products,
        shipToAddress,
        notes,
        paymentTerms,
        createdBy,
        assignTo

    } = req.body;

    try {

        if ([supplierName, currency, vatType].map((item) => item.trim()).includes('')) {
            console.log("supplier name", supplierName, "currency", currency, "vat type", vatType);
            return res.status(400).json(new ApiError(400, "Please fill all the required fields"));
        }


        const supplier = await NewSupplier.findOne({ "details.supplierName": supplierName }).select("_id");
        console.log(supplier, "supplier");

        if (!supplier) {
            return res.status(404).json(new ApiError(404, "supplier not found"));
        }

        if (Products.length === 0) {
            return res.status(400).json(new ApiError(400, "Please add at least one product"));
        }

        if (
            Products.some((item) =>
                item.productServiceName.trim() === '' ||
                item.sku.trim() === ''
            )
        ) {
            return res.status(400).json(new ApiError(400, "Please fill all the required fields in product"));
        }

        const productNames = Products.map(item => item.productServiceName);

        const products = await Product.find({ "details.productServiceName": { $in: productNames } }).select("_id");

        if (products.length !== Products.length) {
            return res.status(400).json(new ApiError(400, "Some products not found in database"));
        }

        const mergedProducts = Products.map((item, index) => ({
            ...item,
            productID: products[index]._id
        }));

        console.log(mergedProducts, "merged products");

         let assignedSalesPerson = assignTo;
        
                console.log(assignedSalesPerson);
                if (assignTo) {
                    const salesPerson = await TeamMember.findOne({ fullName: assignTo }).select("_id fullName");
        
                    if (salesPerson) {
                        assignedSalesPerson = {
                            id: salesPerson._id,
                            name: salesPerson.fullName,
                        };
                    }
                }


        const supplierDetails = {
            supplierId: supplier._id,
            supplierName,
            contactPerson,
            email,
            addressType,
            shipToAddress
        };
        const invoiceDetails = {
            date,
            dueDate,
            purchaseRefernce,
            currency,
            exchangeRate,
            vatType,
            assigneTo: assignedSalesPerson,

        }

        const invoiceNotesDetail = {
            additionalNotes: notes,
            paymentTerm: paymentTerms,
        }

        const newPurchaseInvoice = await PurchaseEstimate.create({
            supplierDetails,
            invoiceDetails,
            product: mergedProducts,
            invoiceNotesDetail,
            createdBy
        });

        if (!newPurchaseInvoice) {
            return res.status(400).json(new ApiError(400, "Failed to create invoice"));
        }

        return res.status(201).json(new ApiResponse(201, newPurchaseInvoice, "Invoice created successfully"));



    } catch (error) {
        return res.status(500).json(new ApiError(500, "Failed to create invoice", error.message));
    }

})

export const GetPurchaseOrder = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 10;

        const data = await PurchaseEstimate.find()
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber).sort({ createdAt: -1 }).select(' -__v -updatedAt');

        res.status(200).json(new ApiResponse({
            message: "Data Fetch Successfully!",
            data: data
        }));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Failed to fetch purchase orders", error.message));
    }
})



export const detailView = asyncHandler(async (req, res) => {

    const { id } = req.params;
    console.log(id);

    try {
        if (!id) {
            throw new ApiError(400, ' ID is required!');
        }
        const purchaseOrder = await PurchaseEstimate.findById(id).select(' -__v ');

        if (!purchaseOrder) {
            throw new ApiError(404, 'PurchaseOrder not found!');
        }

        return res.status(200).json(new ApiResponse(
            {
                data: purchaseOrder,
                message: 'purchaseOrder fetched successfully!'
            }
        ));

    } catch (error) {
        throw new ApiError(500, error.message);
    }
});



export const PurchaseOrder_EditView = asyncHandler(async (req, res) => {

    const { id } = req.params;
    console.log("id", id);


    const {
        supplierName,
        contactPerson,
        email,
        addressType,
        date,
        dueDate,
        purchaseRefernce,
        currency,
        exchangeRate,
        vatType,
        Product: Products,
        shipToAddress,
        notes,
        paymentTerms,
        createdBy,
        updatedBy,
        assignTo

    } = req.body;

    try {

        if ([supplierName, currency, vatType].some(item => !item || typeof item !== 'string' || item.trim() === '')) {
            console.log("supplier name", supplierName, "currency", currency, "vat type", vatType);
            return res.status(400).json(new ApiError(400, "Please fill all the required fields"));
        }


        const supplier = await NewSupplier.findOne({ "details.supplierName": supplierName }).select("_id");
        console.log("supplier", supplier);

        if (!supplier) {
            return res.status(404).json(new ApiError(404, "Supplier not found"));
        }

       
        if (Products.length === 0) {
            return res.status(400).json(new ApiError(400, "Please add at least one product"));
        }

        console.log("Products", Products);

        if (
            Products.some((item) =>
                item.productServiceName === '' ||
                item.sku === ''
            )
        ) {
            return res.status(400).json(new ApiError(400, "Please fill all the required fields in product"));
        }

        const productNames = Products.map(item => item.productServiceName);
        console.log("productNames", productNames);

        const products = await Product.find({ "details.productServiceName": { $in: productNames } }).select("_id");

        console.log("products", products);
        
        if (products.length !== Products.length) {
            return res.status(400).json(new ApiError(400, "Some products not found in database"));
        }

                console.log("products0", products);

        const mergedProducts = Products.map((item, index) => ({
            ...item,
            productID: products[index]._id
        }));
                console.log("products1", products);


        console.log("mergedProducts", mergedProducts);

        let assignedSalesPerson = assignTo;

        console.log("assign",assignedSalesPerson);

        if (assignTo) {
            const salesPerson = await TeamMember.findOne({ fullName: assignTo }).select("_id fullName");

            if (salesPerson) {
                assignedSalesPerson = {
                    id: salesPerson._id,
                    name: salesPerson.fullName,
                };
            }
        }


   console.log("assignedSalesPerson", assignedSalesPerson);
        const supplierDetails = {
            supplierId: supplier._id,
            supplierName: supplierName,
            contactPerson,
            email,
            addressType,
            shipToAddress
        };
        console.log("supplierDetails", supplierDetails);
        const invoiceDetails = {
            date,
            dueDate,
            purchaseRefernce,
            currency,
            exchangeRate,
            vatType,

        }

        console.log("invoiceDetails", invoiceDetails);
        const invoiceNotesDetail = {
            additionalNotes: notes,
            paymentTerm: paymentTerms,
        }
        console.log("invoiceNotesDetail", invoiceNotesDetail);

        const updateInvoice = await PurchaseEstimate.findByIdAndUpdate(
            id,
            {

                supplierDetails,
                invoiceDetails,
                product: mergedProducts,
                invoiceNotesDetail,
                createdBy,
                updatedBy,
            }, { new: true }
        );

        if (!updateInvoice) {
            return res.status(400).json(new ApiError(400, "Failed to create invoice"));
        }

        return res.status(200).json(new ApiResponse({
            data: updateInvoice, message: "Invoice created successfully"
        })
        );



    } catch (error) {
        res.status(500).json(
            new ApiResponse({
                data: null,
                message: error.message
            })
        );
    }

})
