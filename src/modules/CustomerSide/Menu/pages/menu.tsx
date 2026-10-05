import { useEffect, useState } from "react";
import axios from "axios";
import { FaCartPlus } from "react-icons/fa";
import MenuDetailModal from "../../../../components/modals/CustomerSide/Menu/MenuDetailModal";

interface Category {
  id: number;
  category_name: string;
}

interface Product {
  id: number;
  product_name: string;
  price: number;
  stock: number;
  image: string;
  category?: Category;
}

interface CartItem extends Product {
  qty: number;
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [checkoutError, setCheckoutError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cashier_payment");
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // null = All Categories
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const getCustomerToken = () => {
    let token = localStorage.getItem("customer_token");

    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("customer_token", token);
    }

    return token;
  };

  /**
   * Fetch Products
   */
  const fetchProducts = async (
    page = 1,
    categoryId: number | null = selectedCategory,
  ) => {
    try {
      let url = `http://192.168.101.4:8000/api/products?page=${page}`;

      if (categoryId !== null) {
        url += `&category_id=${categoryId}`;
      }

      const res = await axios.get(url);

      setProducts(res.data?.data?.data || []);
      setTotalPages(res.data?.data?.last_page || 1);
    } catch (error) {
      console.log("Error fetching products:", error);

      setProducts([]);
      setTotalPages(1);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://192.168.101.4:8000/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("CATEGORY RESPONSE:", res.data);

      const categoryData = res.data?.data?.data || res.data?.data || [];

      setCategories(categoryData);
    } catch (error) {
      console.log("Error fetching categories:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, selectedCategory);
  }, [currentPage, selectedCategory]);

  /**
   * Fetch categories once when page loads
   */
  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * Handle category dropdown
   */
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "") {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(Number(value));
    }

    // Reset pagination when category changes
    setCurrentPage(1);
  };

  /**
   * Add Product To Cart
   */
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exist = prev.find((item) => item.id === product.id);

      if (exist) {
        if (exist.qty >= product.stock) {
          alert("Stock limit reached!");
          return prev;
        }

        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          ...product,
          qty: 1,
        },
      ];
    });
  };

  /**
   * Change Cart Quantity
   */
  const changeQty = (id: number, qty: number) => {
    const product = products.find((p) => p.id === id);

    if (!product) return;

    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
      return;
    }

    if (qty > product.stock) {
      alert("Stock not enough!");
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty,
            }
          : item,
      ),
    );
  };

  /**
   * Calculate total
   */
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  /**
   * Checkout
   */
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

        items: cart.map((item) => ({
          product_id: item.id,
          qty: item.qty,
        })),
      };

      const res = await axios({
        method: "POST",
        url: "http://192.168.101.4:8000/api/transactions",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: payload,
      });

      setCart([]);

      const id = res.data.data.id;

      const detail = await axios({
        method: "GET",
        url: `http://192.168.101.4:8000/api/transactions/${id}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSelectedTransaction(detail.data.data);
      setOpenDetail(true);

      if (paymentMethod === "self_payment") {
        const adminPhone = "628211695844";

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

      await fetchProducts(currentPage, selectedCategory);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-4 lg:flex-row lg:p-6">
        {/* =========================
            MENU SECTION
        ========================== */}
        <div className="w-full rounded-2xl bg-white p-4 shadow-md lg:w-2/3 lg:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Restaurant Menu
            </h1>

            <p className="text-sm text-gray-500">
              Choose your favorite food & drinks
            </p>

            {/* =========================
                CATEGORY FILTER DROPDOWN
            ========================== */}
            <div className="mt-5">
              <label
                htmlFor="category-filter"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Filter by Category
              </label>

              <select
                id="category-filter"
                value={selectedCategory ?? ""}
                onChange={handleCategoryChange}
                className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400 sm:w-72"
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* =========================
              PRODUCTS
          ========================== */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="group relative h-64 overflow-hidden rounded-2xl shadow-md"
                >
                  {/* Product Image */}
                  <img
                    src={p.image}
                    alt={p.product_name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40" />

                  {/* Product Information */}
                  <div className="relative flex h-full flex-col justify-end p-4 text-white">
                    <h2 className="text-lg font-bold">{p.product_name}</h2>

                    <p className="mt-1 text-sm">
                      $
                      {p.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>

                    {p.stock > 0 ? (
                      <p className="mt-1 text-xs opacity-80">
                        {p.stock} available
                      </p>
                    ) : (
                      <p className="mt-1 text-xs font-semibold text-red-300">
                        SOLD OUT
                      </p>
                    )}

                    {/* Add To Cart */}
                    <button
                      type="button"
                      onClick={() => addToCart(p)}
                      disabled={p.stock === 0}
                      className={`mt-4 flex items-center justify-center rounded-xl py-2 transition ${
                        p.stock === 0
                          ? "cursor-not-allowed bg-gray-400"
                          : "cursor-pointer bg-orange-500 hover:bg-orange-600"
                      }`}
                    >
                      <FaCartPlus className="text-lg text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* =========================
                EMPTY PRODUCTS
            ========================== */
            <div className="flex min-h-64 items-center justify-center">
              <p className="text-gray-500">
                {selectedCategory !== null
                  ? "No products found in this category."
                  : "No products found."}
              </p>
            </div>
          )}

          {/* =========================
              PAGINATION
          ========================== */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className={`rounded-lg px-4 py-2 text-white transition ${
                currentPage === 1
                  ? "cursor-not-allowed bg-gray-400"
                  : "cursor-pointer bg-orange-500 hover:bg-orange-600"
              }`}
            >
              Prev
            </button>

            <span className="font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className={`rounded-lg px-4 py-2 text-white transition ${
                currentPage === totalPages
                  ? "cursor-not-allowed bg-gray-400"
                  : "cursor-pointer bg-orange-500 hover:bg-orange-600"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* =========================
            CART SECTION
        ========================== */}
        <div className="h-fit w-full rounded-2xl bg-white p-4 shadow-md lg:w-1/3 lg:p-6">
          <h1 className="mb-5 text-2xl font-bold text-gray-800">Cart Order</h1>

          {/* Customer Name */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">
              Customer Name
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Input customer name"
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Table Number */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700">
              Table Number
            </label>

            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Input table number"
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Cart Items */}
          <div className="space-y-4">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.id} className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-gray-800">
                        {item.product_name}
                      </h2>

                      <p className="text-sm text-gray-500">
                        $
                        {item.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => changeQty(item.id, item.qty - 1)}
                        className="h-8 w-8 cursor-pointer rounded-lg bg-red-500 text-white hover:bg-red-600"
                      >
                        -
                      </button>

                      <span className="font-semibold">{item.qty}</span>

                      <button
                        type="button"
                        onClick={() => changeQty(item.id, item.qty + 1)}
                        className="h-8 w-8 cursor-pointer rounded-lg bg-green-500 text-white hover:bg-green-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Cart is empty</p>
            )}
          </div>

          {/* Checkout Error */}
          {checkoutError && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-700">
              <div className="text-lg">⚠️</div>

              <div>
                <p className="font-semibold">Checkout unavailable</p>

                <p className="mt-1 text-sm">{checkoutError}</p>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="mt-5">
            <label className="text-sm font-medium text-gray-700">
              Payment Method
            </label>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="cashier_payment">Cashier Payment</option>

              <option value="self_payment">Self Payment</option>
            </select>
          </div>

          {/* Total */}
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

          {/* Checkout Button */}
          <button
            type="button"
            onClick={checkout}
            disabled={cart.length === 0}
            className={`mt-5 w-full rounded-xl py-3 text-white transition ${
              cart.length === 0
                ? "cursor-not-allowed bg-gray-300"
                : "cursor-pointer bg-orange-500 hover:bg-orange-600"
            }`}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <MenuDetailModal
        open={openDetail}
        setOpen={setOpenDetail}
        data={selectedTransaction}
      />
    </>
  );
}
