interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
  data: any;
}

export default function TransactionDetailModal({ open, setOpen, data }: Props) {
  if (!open || !data) return null;

  const formatCurrency = (value: number) => {
    return `$${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[450px] p-6 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4">
          <h1 className="text-xl font-bold text-gray-800">
            Queue #{data.queue_number ?? "-"}
          </h1>

          <p className="text-sm text-gray-500">Transaction ID: #{data.id}</p>
        </div>

        <div className="space-y-1 text-gray-700">
          <p>
            <span className="font-semibold">Customer Name:</span>{" "}
            {data.customer_name || "-"}
          </p>

          <p>
            <span className="font-semibold">Table Number:</span>{" "}
            {data.table_number ?? "-"}
          </p>

          <p>
            <span className="font-semibold">Payment:</span>{" "}
            {data.payment_method
              ? data.payment_method
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (char: string) => char.toUpperCase())
              : "-"}
          </p>

          <p>
            <span className="font-semibold">Status:</span> {data.status || "-"}
          </p>

          <p>
            <span className="font-semibold">Total:</span>{" "}
            {formatCurrency(data.total_price)}
          </p>
        </div>

        <hr className="my-4" />

        <h2 className="font-bold text-gray-800 mb-2">Ordered Items</h2>

        <div className="space-y-2">
          {data.transaction_details?.length > 0 ? (
            data.transaction_details.map((item: any) => (
              <div key={item.id} className="border-b border-gray-200 py-3">
                <p className="font-bold text-gray-800">
                  {item.product?.product_name || "Unknown Product"}
                </p>

                <p className="text-sm text-gray-600">
                  {item.qty} x {formatCurrency(item.price)}
                </p>

                <p className="text-sm font-semibold text-gray-700">
                  Subtotal: {formatCurrency(item.subtotal)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No transaction details found.
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
          <span className="font-bold text-gray-800">Total</span>

          <span className="text-lg font-bold text-orange-600">
            {formatCurrency(data.total_price)}
          </span>
        </div>

        <button
          onClick={() => setOpen(false)}
          className="mt-5 bg-red-500 hover:bg-red-600 text-white w-full py-2.5 rounded-xl transition cursor-pointer font-semibold text-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
