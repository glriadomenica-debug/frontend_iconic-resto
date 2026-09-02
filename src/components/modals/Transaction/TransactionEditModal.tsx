interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
  data: any;
  setData: (val: any) => void;
  onSave: () => void;
}

export default function TransactionEditModal({
  open,
  setOpen,
  data,
  setData,
  onSave,
}: Props) {
  if (!open || !data) return null;

  const formatCurrency = (value: number) => {
    return `$${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatStatus = (value: string) => {
    if (!value) return "-";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[450px] p-6 rounded-2xl shadow-xl">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-800">Edit Transaction</h1>

          <p className="text-md text-gray-500 mt-1">
            Queue #0{data.queue_number ?? "-"}
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Customer Name
          </label>

          <input
            type="text"
            className="border border-gray-300 rounded-lg w-full p-2.5 outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            value={data.customer_name || ""}
            onChange={(e) =>
              setData({
                ...data,
                customer_name: e.target.value,
              })
            }
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Table Number
          </label>

          <input
            type="text"
            className="border border-gray-200 bg-gray-100 rounded-lg w-full p-2.5 text-gray-500 cursor-not-allowed"
            value={data.table_number ?? "-"}
            disabled
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Total
          </label>

          <input
            type="text"
            className="border border-gray-200 bg-gray-100 rounded-lg w-full p-2.5 text-gray-500 cursor-not-allowed"
            value={formatCurrency(data.total_price)}
            disabled
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Payment Status
          </label>

          <div
            className={`w-full p-2.5 rounded-lg font-semibold text-sm ${
              data.payment_status === "paid"
                ? "bg-green-100 text-green-700"
                : data.payment_status === "unpaid"
                  ? "bg-yellow-100 text-yellow-700"
                  : data.payment_status === "failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
            }`}
          >
            {formatStatus(data.payment_status)}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Payment status can only be changed through Payment Verification.
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Kitchen Status
          </label>

          <div
            className={`w-full p-2.5 rounded-lg font-semibold text-sm ${
              data.kitchen_status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : data.kitchen_status === "cooking"
                  ? "bg-blue-100 text-blue-700"
                  : data.kitchen_status === "ready"
                    ? "bg-green-100 text-green-700"
                    : data.kitchen_status === "served"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
            }`}
          >
            {formatStatus(data.kitchen_status)}
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Kitchen status is controlled by Live Kitchen.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="bg-green-500 hover:bg-green-600 text-white w-full py-2.5 rounded-xl transition cursor-pointer font-semibold"
          >
            Save Changes
          </button>

          <button
            onClick={() => setOpen(false)}
            className="bg-gray-500 hover:bg-gray-600 text-white w-full py-2.5 rounded-xl transition cursor-pointer font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
