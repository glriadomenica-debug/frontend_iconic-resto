import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiTwotoneEdit } from "react-icons/ai";
import { AiFillDelete } from "react-icons/ai";

import Modal from "../../../../components/modals/Product/ProdModal";
import ProductModalConfirmation from "../../../../components/modals/Product/ProdModalConfirmation";

interface Category {
  id: number;
  category_name: string;
}

interface Product {
  id: number;
  category_id: number;
  category?: Category;
  product_name: string;
  price: number;
  stock: number;
  image: string;
}

export default function ListProduct() {
  const [product, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [openModal, setOpenModal] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);

  const [formProduct, setFormProduct] = useState({
    category_id: 0,
    product_name: "",
    price: 0,
    stock: 0,
    image: null as File | null,
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [Categories, setCategories] = useState<Category[]>([]);

  const navigate = useNavigate();

  const API_URL = "http://localhost:8000";

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================
  const formatCurrency = (value: number) => {
    return `$${Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================================================
  // IMAGE URL
  // =========================================================
  const getImageUrl = (image?: string) => {
    if (!image) return "";

    // Jika backend sudah mengirim full URL
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    // Jika path dimulai dengan storage/
    if (image.startsWith("storage/")) {
      return `${API_URL}/${image}`;
    }

    // Jika backend hanya mengirim products/xxx.jpg
    return `${API_URL}/storage/${image}`;
  };

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================
  const fetchProduct = async () => {
    try {
      setLoading(true);

      const res = await axios({
        method: "GET",
        url: `${API_URL}/api/products?page=${currentPage}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProduct(res.data.data.data || []);
      setLastPage(res.data.data.last_page || 1);
    } catch (err) {
      console.log("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================
  const fetchCategory = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: `${API_URL}/api/categories`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCategories(response.data.data.data || []);
    } catch (error) {
      console.log("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchCategory();
  }, [currentPage]);

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================
  const handleChangeProduct = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormProduct((prev) => ({
      ...prev,
      [name]:
        name === "category_id" || name === "price" || name === "stock"
          ? Number(value)
          : value,
    }));
  };

  // =========================================================
  // HANDLE IMAGE CHANGE
  // =========================================================
  const handleImageChange = (file: File | null) => {
    setFormProduct((prev) => ({
      ...prev,
      image: file,
    }));
  };

  // =========================================================
  // SUBMIT PRODUCT
  // =========================================================
  const handleSubmitProduct = async () => {
    try {
      if (!formProduct.category_id) {
        alert("Please select a food category.");
        return;
      }

      if (!formProduct.product_name.trim()) {
        alert("Please enter product name.");
        return;
      }

      if (formProduct.price <= 0) {
        alert("Please enter a valid price.");
        return;
      }

      if (formProduct.stock < 0) {
        alert("Stock cannot be negative.");
        return;
      }

      const formData = new FormData();

      formData.append("category_id", String(formProduct.category_id));

      formData.append("product_name", formProduct.product_name);

      formData.append("price", String(formProduct.price));

      formData.append("stock", String(formProduct.stock));

      if (formProduct.image) {
        formData.append("image", formProduct.image);
      }

      await axios({
        method: "POST",
        url: `${API_URL}/api/products`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
        data: formData,
      });

      // Reset form
      setFormProduct({
        category_id: 0,
        product_name: "",
        price: 0,
        stock: 0,
        image: null,
      });

      setOpenModal(false);

      await fetchProduct();
    } catch (error: any) {
      console.log("Failed to create product:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "Failed to create product.";

      alert(message);
    }
  };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================
  const handleDeleteProd = async () => {
    if (!selectedId) return;

    try {
      await axios({
        method: "DELETE",
        url: `${API_URL}/api/products/${selectedId}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      await fetchProduct();

      setSelectedId(null);
      setOpenModalDelete(false);
    } catch (error: any) {
      console.log("Failed to delete product:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "Failed to delete product.";

      alert(message);
    }
  };

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================
  const handleOpenAddModal = () => {
    setFormProduct({
      category_id: 0,
      product_name: "",
      price: 0,
      stock: 0,
      image: null,
    });

    setOpenModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Product List</h1>

            <p className="text-sm text-gray-500">Manage restaurant products</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl transition cursor-pointer font-medium"
          >
            + Add Product
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-orange-100 text-gray-700">
                <th className="text-left px-4 py-3 rounded-l-xl">No</th>

                <th className="text-left px-4 py-3">Food Category</th>

                <th className="text-left px-4 py-3">Product</th>

                <th className="text-left px-4 py-3">Price</th>

                <th className="text-left px-4 py-3">Stock</th>

                <th className="text-left px-4 py-3">Image</th>

                <th className="text-center px-4 py-3 rounded-r-xl">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    Loading products...
                  </td>
                </tr>
              ) : product.length > 0 ? (
                product.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-orange-50 transition"
                  >
                    {/* NO */}
                    <td className="px-4 py-4 text-gray-700">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>

                    {/* CATEGORY */}
                    <td className="px-4 py-4 font-medium text-gray-700">
                      {item.category?.category_name || "-"}
                    </td>

                    {/* PRODUCT */}
                    <td className="px-4 py-4 font-semibold text-gray-800">
                      {item.product_name}
                    </td>

                    {/* PRICE */}
                    <td className="px-4 py-4 font-semibold text-gray-700">
                      {formatCurrency(item.price)}
                    </td>

                    {/* STOCK */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          item.stock === 0
                            ? "bg-red-100 text-red-700"
                            : item.stock <= 5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.stock}
                      </span>
                    </td>

                    {/* IMAGE */}
                    <td className="px-4 py-4">
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-lg transition cursor-pointer"
                          onClick={() => navigate(`/products/edit/${item.id}`)}
                          title="Edit Product"
                        >
                          <AiTwotoneEdit size={18} />
                        </button>

                        <button
                          className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-lg transition cursor-pointer"
                          onClick={() => {
                            setSelectedId(item.id);
                            setOpenModalDelete(true);
                          }}
                          title="Delete Product"
                        >
                          <AiFillDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No product found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-4 py-2 rounded-lg text-white transition ${
              currentPage === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
            }`}
          >
            Prev
          </button>

          <span className="font-medium text-gray-700">
            Page {currentPage} of {lastPage}
          </span>

          <button
            disabled={currentPage === lastPage}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, lastPage))
            }
            className={`px-4 py-2 rounded-lg text-white transition ${
              currentPage === lastPage
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 cursor-pointer"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      <Modal
        openModal={openModal}
        setOpenModal={setOpenModal}
        handleChange={handleChangeProduct}
        handleSubmit={handleSubmitProduct}
        handleImageChange={handleImageChange}
        categories={Categories}
        title="Add New Product"
      />

      {/* DELETE MODAL */}
      <ProductModalConfirmation
        openModal={openModalDelete}
        setOpenModal={setOpenModalDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product?"
        handleSubmit={handleDeleteProd}
      />
    </>
  );
}
