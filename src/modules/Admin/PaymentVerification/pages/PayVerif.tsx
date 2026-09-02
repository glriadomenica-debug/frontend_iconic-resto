import { useEffect, useState } from "react";
import axios from "axios";

interface TransactionDetail {
  id: number;
  qty: number;
  note?: string;
  product: {
    product_name: string;
    price: number;
  };
}

interface Transaction {
  id: number;
  queue_number: number | null;
  queue_date: string | null;
  customer_name: string;
  table_number: string;
  total_price: number;
  payment_method: string;
  payment_status: "unpaid" | "paid";
  kitchen_status: "pending" | "cooking" | "ready" | "served";
  created_at: string;
  transaction_details: TransactionDetail[];
}

export default function PaymentVerificationPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // MODAL
  const [openModal, setOpenModal] = useState(false);
  const [selectedMenus, setSelectedMenus] = useState<TransactionDetail[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const token = localStorage.getItem("token");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  //Fetch Transactions
  const fetchTransactions = async () => {
    try {
      const res = await axios({
        method: "GET",
        url: "http://localhost:8000/api/transactions",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const filtered = res.data.data.data.filter(
        (item: Transaction) => item.payment_status !== undefined,
      );

      setTransactions(filtered);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  //Filter transaction
  const filteredTransactions = transactions.filter((item) => {
    // Filter berdasarkan tanggal
    const transactionDate = new Date(item.created_at).toLocaleDateString(
      "en-CA",
    );

    if (filterDate && transactionDate !== filterDate) {
      return false;
    }

    // Filter berdasarkan PAYMENT status
    if (filterStatus === "paid") {
      return item.payment_status === "paid";
    }

    if (filterStatus === "unpaid") {
      return item.payment_status !== "paid";
    }

    return true;
  });

  //Verify Payment
  const verifyPayment = async (id: number, paymentMethod: string) => {
    try {
      await axios({
        method: "POST",
        url: `http://localhost:8000/api/payment-verifications/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          payment_method: paymentMethod,
          verified_by: user.id,
          created_by: user.id,
          updated_by: user.id,
        },
      });

      await fetchTransactions();
    } catch (error) {
      console.log(error);
    }
  };

  //Fetch Menu detail
  const viewMenus = async (transactionId: number, customer: string) => {
    try {
      const res = await axios({
        method: "GET",
        url: `http://localhost:8000/api/transactions/${transactionId}/details`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(res.data);

      setSelectedMenus(res.data.data);
      setSelectedCustomer(customer);
      setOpenModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  //Payment status label
  const getPaymentStatusLabel = (status: Transaction["payment_status"]) => {
    if (status === "paid") {
      return "Paid";
    }

    return "Unpaid";
  };

  const formatPaymentType = (value: string) => {
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  //Kitchen status label
  const getKitchenStatusLabel = (status: Transaction["kitchen_status"]) => {
    switch (status) {
      case "pending":
        return "Pending";

      case "cooking":
        return "Cooking";

      case "ready":
        return "Ready";

      case "served":
        return "Served";

      default:
        return status;
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="mb-6 flex justify-end items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Date</label>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-400"
        />

        <label className="text-sm font-medium text-gray-700">
          Filter Payment
        </label>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="all">All</option>
          <option value="paid">Already Paid</option>
          <option value="unpaid">Not Paid Yet</option>
        </select>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Payment Verification
        </h1>

        <p className="text-gray-500">Verify customer payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-md p-5">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {t.customer_name}
                    </h2>

                    <p className="text-gray-500">Table {t.table_number}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">Queue</p>

                    <p className="text-xl font-bold text-orange-500">
                      {t.queue_number
                        ? `#${String(t.queue_number).padStart(3, "0")}`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-md">
                <div className="flex justify-between">
                  <span>Total</span>

                  <span className="font-semibold text-orange-500">
                    Rp. {(t.total_price * 1000).toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Payment Type</span>

                  <span className="capitalize">
                    {formatPaymentType(t.payment_method)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Payment Status</span>

                  <span
                    className={`font-semibold capitalize ${
                      t.payment_status === "paid"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {getPaymentStatusLabel(t.payment_status)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Kitchen Status</span>

                  <span
                    className={`font-semibold capitalize ${
                      t.kitchen_status === "ready"
                        ? "text-blue-600"
                        : t.kitchen_status === "cooking"
                          ? "text-orange-600"
                          : t.kitchen_status === "served"
                            ? "text-green-600"
                            : "text-yellow-600"
                    }`}
                  >
                    {getKitchenStatusLabel(t.kitchen_status)}
                  </span>
                </div>

                {/* DATE */}
                <div className="flex justify-between">
                  <span>Date</span>

                  <span>
                    {new Date(t.created_at).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => viewMenus(t.id, t.customer_name)}
                className="w-full mt-5 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl transition cursor-pointer"
              >
                View Ordered Menu
              </button>

              {t.payment_status !== "paid" ? (
                <button
                  onClick={() => verifyPayment(t.id, t.payment_method)}
                  className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl transition cursor-pointer"
                >
                  Verify Payment
                </button>
              ) : (
                <button
                  disabled
                  className="w-full mt-3 bg-gray-400 text-white py-3 rounded-xl cursor-not-allowed"
                >
                  Already Paid
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-2xl shadow-md p-10 text-center text-gray-500">
            No transaction found
          </div>
        )}
      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-lg">
            {/* MODAL HEADER */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-bold">
                Ordered Menu - {selectedCustomer}
              </h2>

              <button
                onClick={() => setOpenModal(false)}
                className="text-red-500 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {selectedMenus.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">
                      {item.product.product_name}
                    </h3>

                    <p className="text-sm text-gray-500">Qty : {item.qty}</p>

                    {item.note && (
                      <p className="text-sm text-orange-500">
                        Note : {item.note}
                      </p>
                    )}
                  </div>

                  <div className="font-semibold text-orange-500">
                    Rp.{" "}
                    {(item.product.price * item.qty * 1000).toLocaleString(
                      "id-ID",
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
