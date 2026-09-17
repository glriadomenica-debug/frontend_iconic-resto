import { useEffect, useState } from "react";
import axios from "axios";
import { AiTwotoneEdit, AiFillDelete, AiFillFile } from "react-icons/ai";
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

  const formatCurrency = (value: number) => {
    return `$${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPaymentStatus = (value: string) => {
    if (!value) return "-";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatKitchenStatus = (value: string) => {
    if (!value) return "-";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

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

  const openEditModal = (transaction: Transaction) => {
    setEditData(transaction);
    setOpenEdit(true);
  };

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
            ? {
                ...t,
                customer_name: editData.customer_name,
              }
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
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Transaction List
            </h1>
          </div>

          <Link
            to="/transactions/report"
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition cursor-pointer hover:bg-orange-600"
          >
            <AiFillFile />
            Report
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-md">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3">Queue</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Table Number</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Kitchen</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="px-4 py-3">
                      <span className="font-medium text-orange-600">
                        #{String(t.queue_number).padStart(2, "0")}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800">
                      {t.customer_name || "-"}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {t.table_number ?? "-"}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {formatCurrency(t.total_price)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="text-gray-600">
                          {formatPaymentStatus(t.payment_method)}
                        </div>

                        <div>
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
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
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
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
                        {formatKitchenStatus(t.kitchen_status)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {new Date(t.created_at).toLocaleDateString("id-ID")}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openDetail(t.id)}
                          className="rounded-lg p-2 text-blue-500 transition cursor-pointer hover:bg-blue-50"
                          title="View Detail"
                        >
                          <AiFillFile size={20} />
                        </button>

                        <button
                          type="button"
                          onClick={() => updatePaid(t)}
                          disabled={t.payment_status === "paid"}
                          className={`rounded-lg p-2 transition ${
                            t.payment_status === "paid"
                              ? "cursor-not-allowed text-gray-400"
                              : "cursor-pointer text-green-500 hover:bg-green-50"
                          }`}
                          title={
                            t.payment_status === "paid"
                              ? "Already Paid"
                              : "Verify Payment"
                          }
                        >
                          <span className="text-sm font-semibold">
                            {t.payment_status === "paid" ? "Paid" : "Verify"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(t)}
                          className="rounded-lg p-2 text-yellow-500 transition cursor-pointer hover:bg-yellow-50"
                          title="Edit Transaction"
                        >
                          <AiTwotoneEdit size={20} />
                        </button>

                        <button
                          type="button"
                          onClick={() => openDeleteModal(t)}
                          className="rounded-lg p-2 text-red-500 transition cursor-pointer hover:bg-red-50"
                          title="Delete Transaction"
                        >
                          <AiFillDelete size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="cursor-pointer rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="px-3 text-sm text-gray-600">
            Page {page} of {lastPage}
          </span>

          <button
            type="button"
            disabled={page === lastPage}
            onClick={() => setPage((prev) => prev + 1)}
            className="cursor-pointer rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
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
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                  <AiFillDelete className="text-2xl text-red-600" />
                </div>
              </div>

              <h2 className="text-center text-xl font-bold text-gray-800">
                Delete Transaction?
              </h2>

              <p className="mt-2 text-center text-sm text-gray-500">
                Are you sure you want to delete this transaction?
              </p>

              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Queue</span>

                  <span className="font-bold text-orange-600">
                    #{String(deleteData.queue_number).padStart(2, "0")}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Customer</span>

                  <span className="font-semibold text-gray-800">
                    {deleteData.customer_name || "-"}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Table</span>

                  <span className="font-semibold text-gray-800">
                    {deleteData.table_number ?? "-"}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total</span>

                  <span className="font-bold text-gray-800">
                    {formatCurrency(deleteData.total_price)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenDeleteConfirm(false);
                    setDeleteData(null);
                  }}
                  disabled={deleting}
                  className="w-full cursor-pointer rounded-xl bg-gray-200 px-4 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={deleteTransaction}
                  disabled={deleting}
                  className="w-full cursor-pointer rounded-xl bg-red-500 px-4 py-2.5 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
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
