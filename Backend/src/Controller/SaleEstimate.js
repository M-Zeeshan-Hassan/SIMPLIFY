import { asyncHandler } from "../Utils/AsyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { Product } from "../Models/product.model.js";
import { NewClient } from "../Models/Client.model.js"
import { SaleEstimate } from "../Models/saleEstimate.model.js";
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

export const NewSaleEstimate = asyncHandler(async (req, res) => {

    const {
        clientName,
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

        if ([clientName, currency, vatType].map((item) => item.trim()).includes('')) {
            console.log("client name", clientName, "currency", currency, "vat type", vatType);
            return res.status(400).json(new ApiError(400, "Please fill all the required fields"));
        }


        const client = await NewClient.findOne({ "details.clientName": clientName }).select("_id");

        if (!client) {
            return res.status(404).json(new ApiError(404, "Client not found"));
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


        const clientDetails = {
            clientId: client._id,
            clientName,
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

        const newSaleEstimate = await SaleEstimate.create({
            clientDetails,
            invoiceDetails,
            product: mergedProducts,
            invoiceNotesDetail,
            createdBy
        });

        if (!newSaleEstimate) {
            return res.status(400).json(new ApiError(400, "Failed to create invoice"));
        }

        return res.status(201).json(new ApiResponse(201, newSaleEstimate, "Invoice created successfully"));



    } catch (error) {
        return res.status(500).json(new ApiError(500, "Failed to create invoice", error.message));
    }

})

export const GetSaleEstimate = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 10;

          let query = {};
        if (req.user.userType === 'Sales Person') {
            query = { 'invoiceDetails.assigneTo.id': req.user._id };
        }

        const data = await SaleEstimate.find()
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber).sort({ createdAt: -1 }).select(' -__v -updatedAt');

        res.status(200).json(new ApiResponse({
            message: "Data Fetch Successfully!",
            data: data
        }));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Failed to fetch sale estimate", error.message));
    }
})


export const detailView = asyncHandler(async (req, res) => {

    const { id } = req.params;

    try {
        if (!id) {
            throw new ApiError(400, ' ID is required!');
        }
        const saleEstimate = await SaleEstimate.findById(id).select(' -__v ');

        if (!saleEstimate) {
            throw new ApiError(404, 'SaleEstimate not found!');
        }

        return res.status(200).json(new ApiResponse(
            {
                data: saleEstimate,
                message: 'SaleEstimate fetched successfully!'
            }
        ));

    } catch (error) {
        throw new ApiError(500, error.message);
    }
});


export const SaleEstimates_EditView = asyncHandler(async (req, res) => {

    const { id } = req.params;
    console.log("id", id);


    const {
        clientName,
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

        if ([clientName, currency, vatType].some(item => !item || typeof item !== 'string' || item.trim() === '')) {
            console.log("client name", clientName, "currency", currency, "vat type", vatType);
            return res.status(400).json(new ApiError(400, "Please fill all the required fields"));
        }


        const client = await NewClient.findOne({ "details.clientName": clientName }).select("_id");
        console.log("client", client);

        if (!client) {
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



        const clientDetails = {
            clientId: client._id,
            clientName,
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

        }

        const invoiceNotesDetail = {
            additionalNotes: notes,
            paymentTerm: paymentTerms,
        }

        const updateInvoice = await SaleEstimate.findByIdAndUpdate(
            id,
            {

                clientDetails,
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


export const deleteEstimates = asyncHandler(async (req, res) => {
    console.log("id", req.params.id)

    try {

        const deletedInvoice = await SaleEstimate.findByIdAndDelete(req.params.id);

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

