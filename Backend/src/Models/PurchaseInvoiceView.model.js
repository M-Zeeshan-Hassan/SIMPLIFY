import mongoose from "mongoose";

export const createPurchaseInvoiceView = async () => {
  const db = mongoose.connection.db;

  try {

   
   const collections = await db.listCollections({ name: "PurchaseInvoiceView" }).toArray();
  
  
     if (!collections.length) {
      await db.createCollection("PurchaseInvoiceView", {
        viewOn: "PurchaseInvoice",
        pipeline: [
          {
            $project: {
              _id: 1,
              SINumber: 1,
              issueDate: "$invoiceDetails.date",
              supplier : "$supplierDetails.supplierName",
              country: "$supplierDetails.shipToAddress",
              refNumber: "$invoiceDetails.purchaseRefernce",
              product: {
                $map: {
                  input: "$product",
                  as: "p",
                  in: {
                    productServiceName: "$$p.productServiceName",
                    sku: "$$p.sku",
                    quantity: "$$p.quantity",
                  },
                },
              },
            },
          },
        ],
      });

      console.log("✅ View created successfully!");
    } else {
     console.log(" View already exists, skipping creation.");
  } 
    
  } catch (error) {
    console.error(" Error creating SaleInvoiceView:", error.message);
  }
};

// Read-only Mongoose schema for the view
const PurchaseInvoiceViewSchema = new mongoose.Schema(
  {
   
    SINumber: String,
    issueDate: Date,
    supplier: String,
    country: String,
    refNumber: String,
     product: [
      {
        productServiceName: String,
        sku: String,
        quantity: Number,
      },
    ],
  },
  { collection: "PurchaseInvoiceView", versionKey: false }
);

export const PurchasenvoiceView = mongoose.model("PurchaseInvoiceView", PurchaseInvoiceViewSchema);
