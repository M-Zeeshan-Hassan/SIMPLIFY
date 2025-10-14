import React from 'react';
import { productTableHeader } from './Data';
import listView from "../../../Components/listView.js"
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { three_Dots_icon } from '../../../Components/Icons.js';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';



const AllProduct = ({ searchTerm, allData, lengthData }) => {

  const user = useSelector((state) => state.auth.user);

  const filteredData = allData?.filter((product) => {
    return (
      product?.details?.productServiceName?.toLowerCase().includes(searchTerm?.toLowerCase())
      || product?.details?.sku?.toLowerCase().includes(searchTerm?.toLowerCase())
    )
  });

  useEffect(() => {
    if (allData) {
      lengthData(allData?.length);
    }
  }, [allData, lengthData]);

  const formatDate = (isDate) => {
    const date = new Date(isDate);
    return date.toLocaleDateString("en-GB").replace(/\//g, "/");
  };


  return (
    <>

    <Helmet title="All Products" />
    
         <tbody className="rounded border border-searchIcon box-border shadow-sideShadow">
  {filteredData?.map((field) => (
    <tr
      key={field._id}
      className="hover:bg-searchIcon border-b-2 border-b-searchIcon transition-colors"
    >
      {/* Product Name */}
      <td className="px-2.5 py-3 text-xs font-semibold text-textColor whitespace-nowrap">
        <Link
          to={`/product/view/${field._id}`}
          className="hover:underline hover:text-textColor"
        >
          {field.details["productServiceName"]}
        </Link>
      </td>

      {/* SKU */}
      <td className="px-2.5 py-3 text-xs font-medium text-textColor2 whitespace-nowrap">
        {field.details["sku"]}
      </td>

      {/* Created By (with avatar tooltip like Team) */}
      <td className="px-2.5 py-3  align-middle whitespace-nowrap">
        <Link
          to={`/team/view/${field?.createdBy?.id}`}
          className="relative group inline-block"
        >
          <div className="w-[30px] h-[30px] rounded-full bg-heading text-white flex items-center justify-center text-xs mx-auto">
            <span>
              {field?.createdBy?.name
                ?.split(" ")
                ?.map((word) => word[0])
                ?.join("")}
            </span>
          </div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
            {user?.fullName}
          </div>
        </Link>
      </td>

      {/* Created Date */}
      <td className="px-2.5 py-3 text-xs font-medium text-textColor2 whitespace-nowrap">
        {formatDate(field?.createdAt)}
      </td>

      {/* Sales Person */}
      
      {/* <td className="px-2.5 py-3 text-xs font-medium text-textColor2 whitespace-nowrap">
        <Link
          to={`/team/view/${field?.salesPersonAssignment[0]?.id}`}
          className="hover:underline hover:text-textColor"
        >
          {field?.salesPersonAssignment[0]?.name}
        </Link>
      </td>  */}

        <td className="px-2.5 py-3  align-middle whitespace-nowrap">
        <Link
          to={`/team/view/${field?.salesPersonAssignment[0]?.id}`}
          className="relative group inline-block"
        >
          <div className="w-[30px] h-[30px] rounded-full bg-heading text-white flex items-center justify-center text-xs mx-auto">
            <span>
              {field?.salesPersonAssignment[0]?.name
                ?.split(" ")
                ?.map((word) => word[0])
                ?.join("")}
            </span>
          </div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
            {user?.fullName}
          </div>
        </Link>
      </td>


      {/* Type (Tag Badge) */}
      <td className="px-2.5 py-3 text-xs font-semibold text-white whitespace-nowrap">
        <span className="px-2 py-1 rounded bg-heading block text-center">
          {field?.details?.type}
        </span>
      </td>

      {/* Active Checkbox */}
      <td className="px-2.5 py-3 whitespace-nowrap text-center">
        <input
          type="checkbox"
          checked={field?.details?.active ?? false}
          readOnly
          className="toggle-btn"
        />
      </td>

      {/* Brand */}
      <td className="px-2.5 py-3 text-xs font-medium text-textColor2 whitespace-nowrap">
        {field.details["brand"]}
      </td>

      {/* Category */}
      <td className="px-2.5 py-3 text-xs font-medium text-textColor2 whitespace-nowrap">
        {field.details["category"]}
      </td>

      {/* Subcategory */}
      <td className="px-2.5 py-3 text-xs font-medium text-textColor2 whitespace-nowrap">
        {field.details["subCategory"]}
      </td>

      {/* Purchase Cost */}
      <td className="px-2.5 py-3 text-xs font-medium text-textColor2 whitespace-nowrap">
        {field.details["purchaseCost"]}
      </td>

      {/* Sale Price */}
      <td className="px-2.5 py-3 text-xs font-medium text-textColor2 whitespace-nowrap">
        {field.details["salePrice"]}
      </td>

      {/* Actions Menu */}
      <td className="px-2.5 py-3 relative group whitespace-nowrap text-center">
        <span>{three_Dots_icon}</span>
        <div className="absolute  mt-1 right-14 w-28 p-1.5 bg-white rounded shadow-sideShadow hidden group-hover:block z-10">
          <Link
            to={`/product/view/${field._id}`}
            className="p-2 flex items-center gap-2 text-sm text-textColor hover:bg-gray-100 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="text-textColor bi bi-pencil-square"
              viewBox="0 0 16 16"
            >
              <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
              <path
                fillRule="evenodd"
                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
              />
            </svg>
            <span>Edit</span>
          </Link>
        </div>
      </td>
    </tr>
  ))}
</tbody>

    </>
  );
};

export default listView(AllProduct, "http://localhost:8000/product/list", "Products/Services", productTableHeader, '/product/new');