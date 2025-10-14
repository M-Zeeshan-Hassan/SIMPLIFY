import dotenv from 'dotenv'
import { connectDB} from "./Config/database.js";
import {app} from "./App.js"
import { createSaleInvoiceView } from "./Models/SaleInvoiceView.model.js";
import { createPurchaseInvoiceView } from "./Models/PurchaseInvoiceView.model.js";


dotenv.config({
    path: './.env'
})



connectDB()
.then(async() => {
    await createSaleInvoiceView();
    await createPurchaseInvoiceView();
    app.listen(process.env.PORT || 5000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log(error.message);
})
    
