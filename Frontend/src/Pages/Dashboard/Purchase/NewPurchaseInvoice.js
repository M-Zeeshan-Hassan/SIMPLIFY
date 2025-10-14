import HocInputForm from '../../../Components/HocInputForm'
import NewInvoiceEstimates from '../../../Components/NewInvoiceEstimates'
import { purchaseSupplierDetail } from '../../../Data/Data.js'




const NewPurchaseInvoice = HocInputForm(NewInvoiceEstimates, {
  
  title: "New Purchase Invoice",
  navigatePath: '/purchases/pi/list',
  inputHeader : "Supplier Details",
  url : "http://localhost:8000/purchases/pi/new",
  url2 : "http://localhost:8000/purchases/pi/new/products",
    url3 : "http://localhost:8000/purchases/pi/new/salesPerson",

  Detail : purchaseSupplierDetail,
  

});

export default NewPurchaseInvoice;