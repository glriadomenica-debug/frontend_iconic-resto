import { useEffect, useState } from "react";
import axios from "axios";
import { AiTwotoneEdit } from "react-icons/ai";
import { AiFillDelete } from "react-icons/ai";
import { AiFillFile } from "react-icons/ai";
import TransactionDetailModal from "../../../../components/modals/Transaction/TransactionDetailModal";
import TransactionEditModal from "../../../../components/modals/Transaction/TransactionEditModal";
import ReportModal from "../../../../components/modals/Transaction/ReportModal";
import { Link } from "react-router-dom";

interface Transaction {
  id: number;
  queue_number: number;
  customer_name: string;
  table_number: number;
  total_price: number;
  payment_method: string;
  payment_status: string;
  kitchen_status: string;
  status?: string;
  created_at: string;
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const token = localStorage.getItem("token");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [openReport, setOpenReport] = useState(false);
  const [reportData, _setReportData] = useState<any>(null);
  const [deleteData, setDeleteData] = useState<Transaction | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  //Format currency
  const formatCurrency = (value: number) => {
    return `$${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  //Format Payment status
  const formatPaymentStatus = (value: string) => {
    if (!value) return "-";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Format kitchen status
  const formatKitchenStatus = (value: string) => {
    if (!value) return "-";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Fetch Transaction
  const fetchTransactions = async (pageNumber: number) => {
    try {
      setLoading(true);

      const res = await axios({
        method: "GET",
        url: `http://localhost:8000/api/transactions?page=${pageNumber}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransactions(res.data.data.data || []);
      setLastPage(res.data.data.last_page || 1);
    } catch (err) {
      console.log("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  // Open detail
  const openDetail = async (id: number) => {
    try {
      const res = await axios({
        method: "GET",
        url: `http://localhost:8000/api/transactions/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSelected(res.data.data);
      setIsDetailOpen(true);
    } catch (err) {
      console.log("Failed to fetch transaction detail:", err);
    }
  };

  // Open edit modal
  const openEditModal = (transaction: Transaction) => {
    setEditData(transaction);
    setOpenEdit(true);
  };

  //Del transaction
  const openDeleteModal = (transaction: Transaction) => {
    setDeleteData(transaction);
    setOpenDeleteConfirm(true);
  };

  const deleteTransaction = async () => {
    if (!deleteData) return;

    try {
      setDeleting(true);

      await axios({
        method: "DELETE",
        url: `http://localhost:8000/api/transactions/${deleteData.id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransactions((prev) => prev.filter((t) => t.id !== deleteData.id));

      setOpenDeleteConfirm(false);
      setDeleteData(null);
    } catch (err) {
      console.log("Failed to delete transaction:", err);
    } finally {
      setDeleting(false);
    }
  };

  // paymnet verification
  const updatePaid = async (transaction: Transaction) => {
    if (transaction.payment_status === "paid") {
      return;
    }

    try {
      await axios({
        method: "POST",
        url: `http://localhost:8000/api/payment-verifications/${transaction.id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          verified_by: localStorage.getItem("user_id") || null,
          payment_method: transaction.payment_method,
        },
      });

      // Only update payment status
      // kitchen status can't be updated here, it will be updated in the kitchen order page
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === transaction.id
            ? {
                ...t,
                payment_status: "paid",
              }
            : t,
        ),
      );
    } catch (error: any) {
      console.log("Payment verification failed:", error);

      if (error?.response?.status === 409) {
        fetchTransactions(page);
      }
    }
  };

  const handleUpdateStatus = async () => {
    if (!editData) return;

    try {
      await axios.put(
        `http://localhost:8000/api/transactions/${editData.id}`,
        {
          customer_name: editData.customer_name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editData.id
            ? { ...t, customer_name: editData.customer_name }
            : t,
        ),
      );

      setOpenEdit(false);
    } catch (err) {
      console.log("Failed to update transaction:", err);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Transaction List
            </h1>

            <p className="text-sm text-gray-500">
              Manage restaurant transactions
            </p>
          </div>

          <div>
            <Link
              to="/transactions/report"
              className="flex items-center justify-between gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl transition"
            >
              <AiFillFile />
              Report
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-orange-100 text-gray-700">
                <th className="text-left px-4 py-3 rounded-l-xl">Queue</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Table Number</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-left px-4 py-3">Kitchen</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-center px-4 py-3 rounded-r-xl">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-100 hover:bg-orange-50 transition"
                  >
                    <td className="px-4 py-4">
                      <span className="font-bold text-orange-600">
                        #0{t.queue_number ?? "-"}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-700">
                      {t.customer_name || "-"}
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-700">
                      {t.table_number ?? "-"}
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-700">
                      {formatCurrency(t.total_price)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-gray-500">
                          {formatPaymentStatus(t.payment_method)}
                        </span>

                        <span
                          className={`w-fit px-3 py-1 rounded-full text-sm font-semibold ${
                            t.payment_status === "paid"
                              ? "bg-green-100 text-green-700"
                              : t.payment_status === "unpaid"
                                ? "bg-yellow-100 text-yellow-700"
                                : t.payment_status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {formatPaymentStatus(t.payment_status)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          t.kitchen_status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : t.kitchen_status === "cooking"
                              ? "bg-blue-100 text-blue-700"
                              : t.kitchen_status === "ready"
                                ? "bg-green-100 text-green-700"
                                : t.kitchen_status === "served"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {" "}
                        {formatKitchenStatus(t.kitchen_status)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-gray-700">
                      {new Date(t.created_at).toLocaleDateString("id-ID")}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openDetail(t.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer"
                        >
                          Detail
                        </button>

                        <button
                          onClick={() => updatePaid(t)}
                          disabled={t.payment_status === "paid"}
                          className={`px-4 py-2 rounded-lg text-sm transition ${
                            t.payment_status === "paid"
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                          }`}
                        >
                          {t.payment_status === "paid" ? "Paid" : "Verify"}
                        </button>

                        <button
                          onClick={() => openEditModal(t)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer"
                        >
                          <AiTwotoneEdit />
                        </button>

                        <button
                          onClick={() => openDeleteModal(t)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer"
                          title="Delete Transaction"
                        >
                          <AiFillDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    No transaction found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end items-center gap-3 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`px-4 py-2 rounded-lg text-white transition ${
              page === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            Prev
          </button>

          <span className="text-sm font-medium text-gray-700">
            Page {page} of {lastPage}
          </span>

          <button
            disabled={page === lastPage}
            onClick={() => setPage(page + 1)}
            className={`px-4 py-2 rounded-lg text-white transition ${
              page === lastPage
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      <TransactionDetailModal
        open={isDetailOpen}
        setOpen={setIsDetailOpen}
        data={selected}
      />

      <TransactionEditModal
        open={openEdit}
        setOpen={setOpenEdit}
        data={editData}
        setData={setEditData}
        onSave={handleUpdateStatus}
      />

      <ReportModal
        open={openReport}
        setOpen={setOpenReport}
        reportData={reportData}
      />

      {openDeleteConfirm && deleteData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                  <AiFillDelete className="text-2xl text-red-600" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-center text-xl font-bold text-gray-800">
                Delete Transaction?
              </h2>

              {/* Description */}
              <p className="mt-2 text-center text-sm text-gray-500">
                Are you sure you want to delete this transaction?
              </p>

              {/* Transaction info */}
              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Queue</span>

                  <span className="font-bold text-orange-600">
                    #{String(deleteData.queue_number).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">Customer</span>

                  <span className="font-semibold text-gray-800">
                    {deleteData.customer_name || "-"}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">Table</span>

                  <span className="font-semibold text-gray-800">
                    {deleteData.table_number ?? "-"}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">Total</span>

                  <span className="font-bold text-gray-800">
                    {formatCurrency(deleteData.total_price)}
                  </span>
                </div>
              </div>


              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setOpenDeleteConfirm(false);
                    setDeleteData(null);
                  }}
                  disabled={deleting}
                  className="w-full rounded-xl bg-gray-200 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={deleteTransaction}
                  disabled={deleting}
                  className="w-full rounded-xl bg-red-500 px-4 py-2.5 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
