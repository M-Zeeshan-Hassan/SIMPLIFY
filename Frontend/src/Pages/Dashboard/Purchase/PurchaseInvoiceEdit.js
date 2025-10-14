import HocInputForm from '../../../Components/HocInputForm'
import EditInvoiceAndEstimate from '../../../Components/InvoiceAndEstimateEdit';
import { purchaseSupplierDetail } from '../../../Data/Data.js'



const EditPurchaseInvoice = HocInputForm(EditInvoiceAndEstimate, {
  
  title: "Purchase Invoice",
  navigatePath: '/purchases/pi/list',
  inputHeader : "Supplier Details",
  url : "http://localhost:8000/purchases/pi/edit",
  url2 : "http://localhost:8000/purchases/pi/new/products",
  url3 : "http://localhost:8000/purchases/pi/new/salesPerson",
  Detail : purchaseSupplierDetail,



});

export default EditPurchaseInvoice;