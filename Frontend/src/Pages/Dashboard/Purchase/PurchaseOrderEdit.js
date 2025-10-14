import HocInputForm from '../../../Components/HocInputForm'
import EditInvoiceAndEstimate from '../../../Components/InvoiceAndEstimateEdit';
import { purchaseSupplierDetail } from '../../../Data/Data.js'



const EditPurchaseOrder = HocInputForm(EditInvoiceAndEstimate, {
  
  title: "Purchase Order",
  navigatePath: '/purchases/po/list',
  inputHeader : "Supplier Details",
  url : "http://localhost:8000/purchases/po/edit",
  url2 : "http://localhost:8000/purchases/po/new/products",
  url3 : "http://localhost:8000/purchases/po/new/salesPerson",
  Detail : purchaseSupplierDetail,



});

export default EditPurchaseOrder;