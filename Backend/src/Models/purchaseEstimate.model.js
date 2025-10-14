import mongoose from "mongoose"
import { Counter } from "./Counter.model.js";

mongoose.pluralize(null);

const supplierDetails = new mongoose.Schema({
    supplierId : {
        type : mongoose.Types.ObjectId,
        ref : "Supplier",
        required : true
    },
    supplierName: {
        type: String,
        required: [true, "Supplier name is required"],
    },
    contactPerson : {
        type : String,
    },
    shipToAddress : {
        type : String,
    },
    email : {
        type : String,
      
    },
    addressType : {
        type : String,
        enum : [
            "Bill To Address", 
            "Ship To Address"
        ]
    }


});

const product = new mongoose.Schema({
    productID: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    sku: {
        type: String,
        required: [true, "Product SKU is required"],
    },
    productServiceName: {
        type: String,
        required: [true, "Product name is required"],
    },
    category: {
        type: String,
        enum: ["General Sales", "Goodwill", "Insurance Claims", "Stock", "Rent Income", "Sales of Assets",
            "Royalties Recived", "Plant and Machinery", "Office Equipment", "Motor Vehicles",
            "Bank Charges", "Capital Expenditure", "Commissions Received", "Credit Charges (Late Payments)",
            "Discounts Allowed", "Distribution and Carriage", "Flat Rate VAT Sales Adjustment",
            "Furniture and Fixtures", "General Export Sales", "Goodwill Amortisation", "Intangible Asset Amortisation",
            "Miscellaneous Income",
        ]

    },
    quantity: {
        type: Number,
        required: [true, "Product quantity is required"],
    },
    unitPrice: {
        type: Number,
        required: [true, "Product unit price is required"],
    },
    vatRate : {
        type: Number,
    },
    vatAmount: {
        type: mongoose.Schema.Types.Decimal128,
    },
    grossTotal: {
        type: mongoose.Schema.Types.Decimal128,

        required: [true, "Product gross total is required"],

    }
})


const invoiceDetails = new mongoose.Schema({
    date : {
        type : Date,
    },
    dueDate : {
        type : Date,
    },
    purchaseRefernce : {
        type : String,
    },
    currency: {
        type: String,
        required: [true, "Currency is required"],
    },
    exchangeRate : {
        type : Number,
        required : true,
    },
    vatType : {
        required : true,
        type : String,
        enum : [
            "Standard VAT", "Margin VAT", "Reverse Charge","EC Sales","Zero Rate VAT",
        ]
    },
    assigneTo: {
        id: {
            type: mongoose.Types.ObjectId,
            ref: "TeamMember",
        },

        name: {
            type: String,

        }
    }
});

const invoiceNotesDetail = new mongoose.Schema({
    
    additionalNotes : {
        type: String,
    },
    paymentTerm : {
        type : String,
    },

    totalQuantity : {
        type : Number
    },
    dispatched : {
        type : Number,
    },
    subAmount : {
        type : String,
    },
    totalAmount : {
        type : String,
    }
})


const purchaseEstimate = new mongoose.Schema({
        
    SINumber: { type: String, unique: true },


    supplierDetails : supplierDetails,

    invoiceDetails : invoiceDetails,

    product : [product],

    invoiceNotesDetail : invoiceNotesDetail,

     createdBy: {
            id: {
                type: mongoose.Types.ObjectId,
                ref: "TeamMember",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
        } , 
        updatedBy: {
                id: {
                    type: mongoose.Types.ObjectId,
                    ref: "TeamMember",
                },
                name: {
                    type: String,
                },
            }
        

    
},{timestamps: true});


purchaseEstimate.pre('save', async function (next) {
    if (this.isNew) {
        const currentYear = new Date().getFullYear();

        let counter = await Counter.findOne({ name: 'purchaseEstimate', year: currentYear });

        if (!counter) {
            counter = await Counter.create({
                name: 'purchaseEstimate',
                year: currentYear,
                seq: 1
            });
            
        } else {
            counter.seq++;
            await counter.save();
        }


        this.SINumber = `PO-${currentYear}-${counter.seq}`;
    }

    next();
});



export const PurchaseEstimate = mongoose.model("PurchaseEstimate",purchaseEstimate)