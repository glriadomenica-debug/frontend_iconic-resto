import { useEffect, useState } from "react";
import axios from "axios";

type PaymentStatus = "unpaid" | "paid";
type KitchenStatus = "pending" | "cooking" | "ready" | "served";

interface TransactionDetail {
  id: number;
  qty: number;
  price: number;
  subtotal: number;
  product?: {
    product_name: string;
  };
}

interface Order {
  id: number;
  queue_number: number | null;
  queue_date: string | null;
  table_number: number | string;
  customer_name: string;
  total_price: number;
  payment_method: string;
  payment_status: PaymentStatus;
  kitchen_status: KitchenStatus;
  created_at: string;
  transaction_details?: TransactionDetail[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const getCustomerToken = () => {
    return localStorage.getItem("customer_token");
  };

  const fetchOrders = async () => {
    try {
      const token = getCustomerToken();

      if (!token) {
        setOrders([]);
        return;
      }

      const res = await axios.get(
        `http://localhost:8000/api/my-orders/${token}`,
      );

      setOrders(res.data.data ?? []);
    } catch (error) {
      console.log("Failed to fetch orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPaymentLabel = (status: PaymentStatus) => {
    return status === "paid" ? "Paid" : "Unpaid";
  };

  const getKitchenLabel = (status: KitchenStatus) => {
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

  const getKitchenStatusClass = (status: KitchenStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "cooking":
        return "bg-blue-100 text-blue-700";

      case "ready":
        return "bg-green-100 text-green-700";

      case "served":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusClass = (status: PaymentStatus) => {
    return status === "paid" ? "text-green-600" : "text-red-500";
  };

  return (
    <div className="p-4 lg:p-6 min-h-screen bg-gray-100">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>

        <p className="text-gray-500 mt-1">
          Track your order and payment status
        </p>
      </div>

      <div className="space-y-5 grid grid-cols-1">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-bold text-xl text-orange-500">
                    {order.queue_number
                      ? `Queue #${String(order.queue_number).padStart(3, "0")}`
                      : "Queue -"}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Table {order.table_number}
                  </p>

                  <p className="text-sm text-gray-500">{order.customer_name}</p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span className="text-xs text-gray-500">Kitchen Status</span>

                  <span
                    className={`px-4 py-1 rounded-full text-sm font-semibold ${getKitchenStatusClass(
                      order.kitchen_status,
                    )}`}
                  >
                    {getKitchenLabel(order.kitchen_status)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Status</span>

                  <span
                    className={`font-semibold ${getPaymentStatusClass(order.payment_status)}`}
                  >
                    {" "}
                    {getPaymentLabel(order.payment_status)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <span className="text-sm font-medium capitalize">
                    {order.payment_method.replaceAll("_", " ")}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {order.transaction_details?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {item.product?.product_name ?? "Unknown Product"}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {item.qty} x Rp{" "}
                        {(item.price * 1000).toLocaleString("id-ID")}
                      </p>
                    </div>

                    <h3 className="font-semibold text-orange-500">
                      Rp {(item.subtotal * 1000).toLocaleString("id-ID")}
                    </h3>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-5 pt-4 border-t">
                <h2 className="font-bold text-lg">Total</h2>

                <h2 className="font-bold text-xl text-orange-500">
                  Rp {(order.total_price * 1000).toLocaleString("id-ID")}
                </h2>
              </div>

              <div className="mt-3 text-right">
                <p className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-500">
            No orders yet
          </div>
        )}
      </div>
    </div>
  );
}
