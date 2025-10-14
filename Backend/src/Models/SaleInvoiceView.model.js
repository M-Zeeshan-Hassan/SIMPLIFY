import mongoose from "mongoose";

export const createSaleInvoiceView = async () => {
  const db = mongoose.connection.db;

  try {


   const collections = await db.listCollections({ name: "SaleInvoiceView" }).toArray();


   if (!collections.length) {
      await db.createCollection("SaleInvoiceView", {
        viewOn: "SaleInvoice",
        pipeline: [
          {
            $project: {
               _id: 1,
              SINumber: 1,
              issueDate: "$invoiceDetails.date",
              client: "$clientDetails.clientName",
              country: "$clientDetails.shipToAddress",
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

      console.log(" View created successfully!");
    } else {
      console.log(" View already exists, skipping creation.");
    }

  } catch (error) {
    console.error(" Error creating SaleInvoiceView:", error.message);
  }
};

// Read-only Mongoose schema for the view
const SaleInvoiceViewSchema = new mongoose.Schema(
  {
  
    SINumber: String,
    issueDate: Date,
    client: String,
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
  { collection: "SaleInvoiceView", versionKey: false }
);

export const SaleInvoiceView = mongoose.model("SaleInvoiceView", SaleInvoiceViewSchema);
