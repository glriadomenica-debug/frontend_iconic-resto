import { AiOutlineClose } from "react-icons/ai";

interface TransactionDetail {
  id: number;
  qty: number;
  price: number;
  subtotal: number;
  product?: {
    product_name: string;
  };
}

interface MenuDetailModalProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: {
    id: number;
    queue_number: number | null;
    queue_date?: string | null;
    table_number: number | string;
    customer_name: string;
    total_price: number;
    payment_method: string;
    payment_status: "unpaid" | "paid";
    kitchen_status: "pending" | "cooking" | "ready" | "served";
    created_at?: string;
    transaction_details?: TransactionDetail[];
  } | null;
}

export default function MenuDetailModal({
  open,
  setOpen,
  data,
}: MenuDetailModalProps) {
  if (!open || !data) return null;

  const formatUSD = (value: number) => {
    return `$ ${Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "unpaid":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";

      case "unpaid":
        return "Unpaid";

      default:
        return "-";
    }
  };

  const getKitchenStatusStyle = (status: string) => {
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

  const getKitchenLabel = (status: string) => {
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
        return "-";
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const formattedQueue =
    data.queue_number !== null && data.queue_number !== undefined
      ? String(data.queue_number).padStart(3, "0")
      : "-";

  const formattedPaymentMethod = data.payment_method
    ? data.payment_method.replaceAll("_", " ")
    : "-";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={handleClose}
    >
      <div
        className=" relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5        ">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Order Queue #{formattedQueue}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Table {data.table_number ?? "-"} •{" "}
              {data.customer_name || "Customer"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <AiOutlineClose className="text-xl" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-6 rounded-xl bg-gray-50 p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Payment Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusStyle(data.payment_status)}`}
                >
                  {getPaymentLabel(data.payment_status)}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Kitchen Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getKitchenStatusStyle(data.kitchen_status)} `}
                >
                  {getKitchenLabel(data.kitchen_status)}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-600">Payment Method</span>

                <span className="text-right text-sm font-medium capitalize text-gray-800">
                  {formattedPaymentMethod}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Total
                </p>

                <p className="text-xl font-bold text-orange-500">
                  {formatUSD(data.total_price)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">
                Ordered Items
              </h3>

              <span className="text-sm text-gray-400">
                {data.transaction_details?.length || 0} items
              </span>
            </div>

            {data.transaction_details && data.transaction_details.length > 0 ? (
              <div className="space-y-3">
                {data.transaction_details.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="rounded-xl border border-gray-100 bg-white
                      p-4 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {item.product?.product_name || "Unknown Product"}
                        </h4>

                        <p className="mt-1 text-sm text-gray-500">
                          {item.qty} × {formatUSD(item.price)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-400">Subtotal</p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {formatUSD(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center
                "
              >
                <p className="text-sm text-gray-500">
                  No items found for this transaction.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="w-full rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white transition cursor-pointer hover:bg-gray-700 focus:outline-none
              focus:ring-2 focus:ring-gray-300 "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
