import { asyncHandler } from "../Utils/AsyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { PurchaseInvoice } from "../Models/purchaseInvoice.model.js";
import { Product } from "../Models/product.model.js";
import { NewSupplier } from "../Models/Supplier.model.js"
import { TeamMember } from "../Models/TeamMember.model.js";



export const SalesPerson = asyncHandler(async (req, res) => {

    try {

        const salesPerson = await TeamMember.find({ userType: "Sales Person" }).select("fullName -_id");

        if (!salesPerson) {
            return res.status(404).json(new ApiError(404, "No sales person found"));
        }

        return res.status(200).json(new ApiResponse(200, salesPerson, "Sales person fetched successfully"));

    }
    catch (error) {

        return res.status(500).json(new ApiError(500, "Failed to fetch sales person", error.message));

    }

});

const assignSalesPerson = async () => {
    // 1. Get all salespersons sorted by creation date
    const salesPersons = await TeamMember.find({ userType: "Sales Person" }).sort({ createdAt: 1 });

    if (salesPersons.length === 0) return null;

    // 2. Get the last SaleInvoice that had an assigned salesperson
    const lastAssignedInvoice = await PurchaseInvoice.findOne({ "assigneTo.id": { $exists: true, $ne: null } })
        .sort({ createdAt: -1 });

    // 3. If no invoice found, assign the first salesperson
    if (!lastAssignedInvoice || !lastAssignedInvoice.assigneTo || !lastAssignedInvoice.assigneTo.id) {
        return {
            id: salesPersons[0]._id,
            name: salesPersons[0].fullName
        };
    }

    // 4. Find the index of the last assigned salesperson
    const lastAssignedId = lastAssignedInvoice.assigneTo.id.toString();
    const lastIndex = salesPersons.findIndex(user => user._id.toString() === lastAssignedId);

    // 5. Calculate next salesperson index in round-robin
    const nextIndex = (lastIndex + 1) % salesPersons.length;

    // 6. Return next salesperson
    return {
        id: salesPersons[nextIndex]._id,
        name: salesPersons[nextIndex].fullName
    };
};


export const NewPurchaseInvoice = asyncHandler(async (req, res) => {

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
            console.log("client name", supplierName, "currency", currency, "vat type", vatType);
            return res.status(400).json(new ApiError(400, "Please fill all the required fields"));
        }


        const supplier = await NewSupplier.findOne({ "details.supplierName": supplierName }).select("_id");

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
        else {
            assignedSalesPerson = await assignSalesPerson();
            console.log("Auto-assigned Sales Person:", assignedSalesPerson);
        }

        const userRole = await TeamMember.findById(createdBy.id).select("userType");
        let Status = "";

        if (userRole && userRole.userType === "Admin") {
            console.log("User is Admin");
            Status = "Approved";
        } else {
            console.log("User is not Admin");
            Status = "Pending";
        }


        const supplierDetails = {
            SupplierId: supplier._id,
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

        const newPurchaseInvoice = await PurchaseInvoice.create({
            Status,
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



export const GetAllPurchasenvoice = asyncHandler(async (req, res) => {
    try {
       // console.log("req",req);
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 10;

        let query = {};
        if (req.user.userType === 'Sales Person') {
            query = { 'invoiceDetails.assigneTo.id': req.user._id };
        }
        // Sales Manager and Admin get all records (default query = {})

        const data = await PurchaseInvoice.find(query)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ createdAt: -1 })
            .select(' -__v -updatedAt');

        res.status(200).json(new ApiResponse({
            message: "Data Fetch Successfully!",
            data: data
        }));

    } catch (error) {
        return res.status(500).json(new ApiError(500, "Failed to fetch Invoices list", error.message));
    }
});


export const Invoice_detailView = asyncHandler(async (req, res) => {

    const { id } = req.params;

    try {
        if (!id) {
            return res.status(404).json({
                success: false,
                message: 'Record not found',
                data: null,
            });
        }
        const saleInvoice = await PurchaseInvoice.findById(id).select(' -__v ');

        if (!saleInvoice) {
            return res.status(404).json({
                success: false,
                message: 'Record not found',
                data: null,
            });
        }

        return res.status(200).json(new ApiResponse(
            {
                data: saleInvoice,
                message: 'Purchase Invoice fetched successfully!'
            }
        ));

    } catch (error) {
        throw new ApiError(500, error.message);
    }
});


export const PurchaseInvoice_EditView = asyncHandler(async (req, res) => {

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
            console.log("client name", supplierName, "currency", currency, "vat type", vatType);
            return res.status(400).json(new ApiError(400, "Please fill all the required fields"));
        }


        const supplier = await NewSupplier.findOne({ "details.supplierName": supplierName }).select("_id");
        console.log("client", supplier);

        if (!supplier) {
            return res.status(404).json(new ApiError(404, "Client not found"));
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

        const mergedProducts = Products.map((item, index) => ({
            ...item,
            productID: products[index]._id
        }));

        console.log("mergedProducts", mergedProducts);

        let assignedSalesPerson = assignTo;

        console.log("assign", assignedSalesPerson);

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
            SupplierId: supplier._id,
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

        const updateInvoice = await PurchaseInvoice.findByIdAndUpdate(
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



export const deleteInvoice = asyncHandler(async (req, res) => {
    console.log("id", req.params.id)

    try {

        const deletedInvoice = await PurchaseInvoice.findByIdAndDelete(req.params.id);

        if (!deletedInvoice) {
            return res.status(404).json({ message: 'Record not found' });
        }



        return res.status(200).json(new ApiResponse({
            message: "Invoice deleted successfully"
        }));

    }
    catch (error) {

        res.status(500).json(
            new ApiResponse({
                data: null,
                message: error.message
            })
        )
    }


})