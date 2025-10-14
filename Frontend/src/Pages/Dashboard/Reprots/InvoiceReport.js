import React, { useEffect, useState } from "react";
import ReportlistView from "../../../Components/ReportListView.js";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ChevronDown, ChevronUp } from "lucide-react";
import { purchaseInvoiceViewHeader } from "../Sale/Data.js";

const InvoiceReport = ({ searchTerm, allData, lengthData }) => {
  const user = useSelector((state) => state.auth.user);
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const filteredData = allData?.filter((saleInvoice) => {
    return (
      saleInvoice?.SINumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      saleInvoice?.product?.some((prod) =>
        prod?.productServiceName?.toLowerCase().includes(searchTerm?.toLowerCase())
      )
    );
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
      <Helmet title="Purchase Invoice Report" />

      <tbody className="rounded-lg border border-gray-200 shadow-sm">
        {filteredData?.map((field) => (
          <React.Fragment key={field._id}>
            {/* Main Row */}
            <tr
              className="hover:bg-gray-100 border-b border-gray-200 transition-colors duration-150"
            >
              <td className="px-3 py-3 text-xs font-semibold text-blue-700 whitespace-nowrap">
                <Link
                  to={`/sales/si/edit/${field?._id}`}
                  className="hover:underline hover:text-blue-500 transition-colors"
                >
                  {field?.SINumber}
                </Link>
              </td>

              <td className="px-3 py-3 text-xs font-semibold text-gray-700">
                {formatDate(field?.issueDate)}
              </td>

             
                <td className="px-3 py-3 text-xs font-semibold text-blue-700 whitespace-nowrap">
                  <Link
                    to={`/teams/edit/${field?._id}`}
                    className="hover:underline hover:text-blue-500 transition-colors"
                  >
                    {field?.supplier || field?.client || "---"}
                  </Link>
                </td>


                <td className="px-3 py-3 text-xs font-medium text-gray-600">
                  {field?.country || "---"}
                </td>

                <td className="px-3 py-3 text-xs font-medium text-gray-600">
                  {field?.refNumber || "---"}
                </td>

                <td className="px-3 py-3 text-xs font-medium text-gray-700">
                  {field?.product?.map((pr) => pr?.productServiceName).join(", ")}
                </td>

                <td className="px-3 py-3 text-xs font-semibold text-gray-800">
                  <div className="flex items-center justify-between">
                    <span>{field?.product?.reduce((sum, pr) => sum + (pr?.quantity || 0), 0)}</span>

                    <button
                      onClick={() => toggleExpand(field._id)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {expandedRow === field._id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                </td>
              </tr>

              {/* Expanded Product Detail */}
              {expandedRow === field._id && (
                <tr>
                  <td colSpan="8" className="bg-gray-50 px-4 py-2 shadow-sm ">
                    <table className="w-full text-sm border border-gray-300 rounded-md">
                      <thead className="bg-gray-400 text-white">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold text-xs">SKU</th>
                          <th className="text-left px-3 py-2 font-semibold text-xs">Name</th>
                          <th className="text-left px-3 py-2 font-semibold text-xs">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {field?.product?.map((prod, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-300 bg-white hover:bg-gray-100"
                          >
                            <td className="px-3 py-2 text-gray-700 text-xs font-medium">
                              {prod?.sku || "---"}
                            </td>
                            <td className="px-3 py-2 text-gray-700 text-xs font-medium">
                              {prod?.productServiceName || "---"}
                            </td>
                            <td className="px-3 py-2 text-gray-700 text-xs font-medium">
                              {prod?.quantity || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
          </React.Fragment>
        ))}
      </tbody>
    </>
  );
};

export default ReportlistView(
  InvoiceReport,

);
