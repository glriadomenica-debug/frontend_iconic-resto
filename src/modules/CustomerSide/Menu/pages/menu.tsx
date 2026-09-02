import { useEffect, useState } from "react";
import axios from "axios";
import { FaCartPlus } from "react-icons/fa";
import MenuDetailModal from "../../../../components/modals/CustomerSide/Menu/MenuDetailModal";

interface Product {
  id: number;
  product_name: string;
  price: number;
  stock: number;
  image: string;
  category?: {
    id: number;
    category_name: string;
  };
}

interface CartItem extends Product {
  qty: number;
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutError, setCheckoutError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cashier_payment");
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getCustomerToken = () => {
    let token = localStorage.getItem("customer_token");

    if (!token) {
      token = crypto.randomUUID();

      localStorage.setItem("customer_token", token);
    }

    return token;
  };

  // FETCH PRODUCT
  const fetchProducts = async (page = 1) => {
    try {
      const res = await axios({
        method: "GET",
        url: `http://localhost:8000/api/products?page=${page}`,
      });

      setProducts(res.data.data.data || []);
      setTotalPages(res.data.data.last_page);
      // setCurrentPage(res.data.data.current_page);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // add to cart
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === product.id);

      if (exist) {
        if (exist.qty >= product.stock) {
          alert("Stock limit reached!");
          return prev;
        }
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }

      return [...prev, { ...product, qty: 1 }];
    });
  };

  // ubah qty
  const changeQty = (id: number, qty: number) => {
    const product = products.find((p) => p.id === id);

    if (!product) return;

    if (qty <= 0) {
      setCart(cart.filter((i) => i.id !== id));
      return;
    }

    if (qty > product.stock) {
      alert("Stock not enough!");
      return;
    }

    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  // Total
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // CO
  const checkout = async () => {
    if (cart.length === 0) {
      setCheckoutError(
        "Your cart is empty. Please add at least one item before checkout.",
      );
      return;
    }

    setCheckoutError("");

    if (!customerName || !tableNumber) {
      setCheckoutError("Please enter customer name and table number.");
      return;
    }

    try {
      const payload = {
        customer_name: customerName,
        table_number: tableNumber,
        payment_method: paymentMethod,
        customer_token: getCustomerToken(),

        items: cart.map((i) => ({
          product_id: i.id,
          qty: i.qty,
        })),
      };

      const res = await axios({
        method: "POST",
        url: "http://localhost:8000/api/transactions",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: payload,
      });

      setCart([]);

      const id = res.data.data.id;

      const detail = await axios({
        method: "GET",
        url: `http://localhost:8000/api/transactions/${id}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSelectedTransaction(detail.data.data);

      setOpenDetail(true);
      // Kalau self payment, akan direct ke WhatsApp
      if (paymentMethod === "self_payment") {
        const adminPhone = "628211695844"; // ganti nomor admin

        const message = `
            Hello Admin, Saya ingin melakukan pembayaran self payment.
            Nama Customer : ${customerName}
            Nomor Meja : ${tableNumber}
            Total Payment : $${total.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            Mohon kirim nomor rekening pembayaran.

            Terima kasih 🙌`;

        window.open(
          `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`,
          "_blank",
        );
      }

      setCustomerName("");
      setTableNumber("");
    } catch (err: any) {
      console.log(err);

      const message =
        err?.response?.data?.message ||
        "Some items are no longer available in the requested quantity.";

      setCheckoutError(message);

      // Refresh latest stock
      await fetchProducts(currentPage);
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
        {/* Menu product */}
        <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-md p-4 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Restaurant Menu
            </h1>

            <p className="text-sm text-gray-500">
              Choose your favorite food & drinks
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-5">
            {products.map((p) => (
              <div
                key={p.id}
                className="relative h-64 rounded-2xl overflow-hidden shadow-md group"
              >
                {/* Background Image */}
                <img
                  src={p.image}
                  alt={p.product_name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative flex flex-col justify-end h-full p-4 text-white">
                  <h2 className="font-bold text-lg">{p.product_name}</h2>
                  <p className="text-sm mt-1">
                    $
                    {p.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  {p.stock > 0 ? (
                    <p className="text-xs opacity-80 mt-1">
                      {p.stock} available
                    </p>
                  ) : (
                    <p className="text-xs font-semibold text-red-300 mt-1">
                      SOLD OUT
                    </p>
                  )}
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.stock === 0}
                    className={`mt-4 py-2 rounded-xl flex items-center justify-center transition ${
                      p.stock === 0
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    <FaCartPlus className="text-white text-lg" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Page */}
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className={`px-4 py-2 rounded-lg text-white transition ${
                currentPage === 1
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              Prev
            </button>

            <span className="font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className={`px-4 py-2 rounded-lg text-white transition ${
                currentPage === totalPages
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Card order */}
        <div className="w-full lg:w-1/3 bg-white rounded-2xl shadow-md p-4 lg:p-6 h-fit">
          <h1 className="text-2xl font-bold text-gray-800 mb-5">Cart Order</h1>

          {/* Cust */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">
              Customer Name
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Input customer name"
              className="border border-gray-300 rounded-xl p-3 w-full mt-2 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* table */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">
              Table Number
            </label>

            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Input table number"
              className="border border-gray-300 rounded-xl p-3 w-full mt-2 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* items card */}
          <div className="space-y-4">
            {cart.length > 0 ? (
              cart.map((i) => (
                <div key={i.id} className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-800">
                        {i.product_name}
                      </h2>

                      <p className="text-sm text-gray-500">
                        $
                        {i.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => changeQty(i.id, i.qty - 1)}
                        className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-lg"
                      >
                        -
                      </button>

                      <span className="font-semibold">{i.qty}</span>

                      <button
                        onClick={() => changeQty(i.id, i.qty + 1)}
                        className="bg-green-500 hover:bg-green-600 text-white w-8 h-8 rounded-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">Cart is empty</p>
            )}
          </div>

          {checkoutError && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-700">
              <div className="text-lg">⚠️</div>

              <div>
                <p className="font-semibold">Checkout unavailable</p>
                <p className="text-sm mt-1">{checkoutError}</p>
              </div>
            </div>
          )}

          {/* Payment method */}
          <div className="mt-5">
            <label className="text-sm font-medium text-gray-700">
              Payment Method
            </label>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border border-gray-300 rounded-xl p-3 w-full mt-2 outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="cashier_payment">Cashier Payment</option>

              <option value="self_payment">Self Payment</option>
            </select>
          </div>

          {/* total */}
          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Total</h2>

            <h2 className="text-lg font-bold text-orange-500">
              $
              {total.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>

          {/* button */}
          <button
            onClick={checkout}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-xl mt-5 transition text-white ${cart.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 cursor-pointer"}`}
          >
            {" "}
            Checkout
          </button>
        </div>
      </div>

      {/* modal */}
      <MenuDetailModal
        open={openDetail}
        setOpen={setOpenDetail}
        data={selectedTransaction}
      />
    </>
  );
}
