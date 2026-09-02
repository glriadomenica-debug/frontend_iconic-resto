import { useEffect, useState } from "react";
import axios from "axios";
import { MdRestaurantMenu } from "react-icons/md";
import { IoCheckmarkDoneCircle } from "react-icons/io5";

interface OrderItem {
  id: number;
  qty: number;
  product?: {
    product_name: string;
  };
}
type PaymentStatus = "unpaid" | "paid";
type KitchenStatus = "pending" | "cooking" | "ready" | "served";

interface KitchenOrder {
  id: number;
  customer_name: string;
  table_number: number | string;
  queue_number: number | null;
  queue_date: string | null;
  payment_status: PaymentStatus;
  kitchen_status: KitchenStatus;
  transaction_details?: OrderItem[];
}

export default function LiveOrder() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);

  // Default filter = hari ini
  const getLocalDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [filterDate, setFilterDate] = useState(getLocalDate());

  const token = localStorage.getItem("token");

  //Fetch Kitchen orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/kitchen/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      const activeOrders = data.filter(
        (item: KitchenOrder) =>
          item.kitchen_status === "pending" ||
          item.kitchen_status === "cooking",
      );

      setOrders(activeOrders);
    } catch (error) {
      console.error("Failed to fetch kitchen orders:", error);
    }
  };

  //Auto refresh every 3 seconds
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  //filter date
  const filteredOrders = orders.filter((order) => {
    if (!order.queue_date) {
      return false;
    }

    return order.queue_date.substring(0, 10) === filterDate;
  });

  //accept order from pending -> cooking
  const acceptOrder = async (id: number) => {
    try {
      await axios.put(
        `http://localhost:8000/api/transactions/${id}`,
        {
          kitchen_status: "cooking",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchOrders();
    } catch (error) {
      console.error("Failed to accept order:", error);
    }
  };

  //from cooking -> ready
  const finishOrder = async (id: number) => {
    try {
      await axios.put(
        `http://localhost:8000/api/transactions/${id}`,
        {
          kitchen_status: "ready",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchOrders();
    } catch (error) {
      console.error("Failed to finish order:", error);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <MdRestaurantMenu className="text-4xl text-orange-500" />

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Live Kitchen Orders
          </h1>

          <p className="text-gray-500">Incoming customer orders</p>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3 mb-6">
        <label className="text-sm font-medium text-gray-700">Date</label>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-md p-5 border-l-8 border-orange-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="font-bold text-xl text-orange-500">
                    Queue #
                    {order.queue_number !== null
                      ? String(order.queue_number).padStart(3, "0")
                      : "-"}
                  </h1>

                  <p className="text-sm text-gray-500">
                    Table Number {String(order.table_number).padStart(2, "0")}
                  </p>

                  <p className="text-sm text-gray-500">{order.customer_name}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.kitchen_status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.kitchen_status === "pending" ? "Pending" : "Cooking"}
                </span>
              </div>

              <div className="space-y-3">
                {order.transaction_details?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <h2 className="font-semibold text-gray-800">
                        {item.product?.product_name ?? "Unknown Product"}
                      </h2>

                      <p className="text-sm text-gray-500">Qty : {item.qty}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                {order.kitchen_status === "pending" ? (
                  <button
                    onClick={() => acceptOrder(order.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition cursor-pointer"
                  >
                    Accept Order
                  </button>
                ) : (
                  <button
                    onClick={() => finishOrder(order.id)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <IoCheckmarkDoneCircle className="text-xl" />
                    Ready To Serve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-10 text-center text-gray-500">
          No active kitchen orders
        </div>
      )}
    </div>
  );
}
