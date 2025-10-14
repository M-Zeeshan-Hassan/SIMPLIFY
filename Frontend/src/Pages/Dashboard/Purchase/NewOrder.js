import HocInputForm from '../../../Components/HocInputForm'
import NewInvoiceEstimates from '../../../Components/NewInvoiceEstimates'
import { purchaseSupplierDetail } from '../../../Data/Data.js'



const NewOrder = HocInputForm(NewInvoiceEstimates, {
  
  title: "New Purchase Order",
  navigatePath: '/purchases/po/list',
  url : "http://localhost:8000/purchases/po/new",
  url2 : "http://localhost:8000/purchases/po/new/products",
  inputHeader : "Supplier Details",
  Detail : purchaseSupplierDetail,

});

export default NewOrder;