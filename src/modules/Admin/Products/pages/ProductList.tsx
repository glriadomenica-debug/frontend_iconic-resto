import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiTwotoneEdit, AiFillDelete } from "react-icons/ai";
import Modal from "../../../../components/modals/Product/ProdModal";
import ProductModalConfirmation from "../../../../components/modals/Product/ProdModalConfirmation";

interface Category {
  id: number;
  category_name: string;
}

interface ProductSize {
  id: number;
  size: "Small" | "Medium" | "Large";
  price: number;
}

interface Product {
  id: number;
  category_id: number;
  category?: Category;
  product_name: string;
  stock: number;
  image: string;
  sizes: ProductSize[];
}

type SizeName = "Small" | "Medium" | "Large";

interface SizeForm {
  enabled: boolean;
  price: number;
}

interface FormProduct {
  category_id: number;
  product_name: string;
  stock: number;
  image: File | null;
  sizes: Record<SizeName, SizeForm>;
}

const initialSizes: Record<SizeName, SizeForm> = {
  Small: { enabled: true, price: 0 },
  Medium: { enabled: true, price: 0 },
  Large: { enabled: true, price: 0 },
};

export default function ListProduct() {
  const [product, setProduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [Categories, setCategories] = useState<Category[]>([]);
  const [formProduct, setFormProduct] = useState<FormProduct>({
    category_id: 0,
    product_name: "",
    stock: 0,
    image: null,
    sizes: {
      Small: { enabled: true, price: 0 },
      Medium: { enabled: true, price: 0 },
      Large: { enabled: true, price: 0 },
    },
  });

  const navigate = useNavigate();
  const API_URL = "http://localhost:8000";
  const fetchProduct = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/products?page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const responseData = res.data?.data;
      const products = Array.isArray(responseData)
        ? responseData
        : responseData?.data || [];

      setProduct(products);
      setLastPage(responseData?.last_page || 1);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProduct([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCategories(response.data?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchCategory();
  }, [currentPage]);

  const handleChangeProduct = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "small_price") {
      setFormProduct((prev) => ({
        ...prev,
        sizes: {
          ...prev.sizes,
          Small: {
            ...prev.sizes.Small,
            price: Number(value),
          },
        },
      }));
      return;
    }

    if (name === "medium_price") {
      setFormProduct((prev) => ({
        ...prev,
        sizes: {
          ...prev.sizes,
          Medium: {
            ...prev.sizes.Medium,
            price: Number(value),
          },
        },
      }));
      return;
    }

    if (name === "large_price") {
      setFormProduct((prev) => ({
        ...prev,
        sizes: {
          ...prev.sizes,
          Large: {
            ...prev.sizes.Large,
            price: Number(value),
          },
        },
      }));
      return;
    }

    setFormProduct((prev) => ({
      ...prev,
      [name]:
        name === "category_id" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleSizeToggle = (size: SizeName) => {
    setFormProduct((prev) => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [size]: {
          ...prev.sizes[size],
          enabled: !prev.sizes[size].enabled,
        },
      },
    }));
  };

  const handleImageChange = (file: File | null) => {
    setFormProduct((prev) => ({
      ...prev,
      image: file,
    }));
  };

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

      if (formProduct.stock < 0) {
        alert("Stock cannot be negative.");
        return;
      }

      const selectedSizes = Object.entries(formProduct.sizes).filter(
        ([, data]) => data.enabled,
      );

      if (selectedSizes.length === 0) {
        alert("Please select at least one food size.");
        return;
      }

      for (const [size, data] of selectedSizes) {
        if (Number(data.price) <= 0) {
          alert(`Please enter a valid ${size} price.`);
          return;
        }
      }
      setSaving(true);

      const formData = new FormData();
      formData.append("category_id", String(formProduct.category_id));
      formData.append("product_name", formProduct.product_name.trim());
      formData.append("stock", String(formProduct.stock));
      selectedSizes.forEach(([size, data], index) => {
        formData.append(`sizes[${index}][size]`, size);
        formData.append(`sizes[${index}][price]`, String(data.price));
      });

      if (formProduct.image) {
        formData.append("image", formProduct.image);
      }

      await axios.post(`${API_URL}/api/products`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setFormProduct({
        category_id: 0,
        product_name: "",
        stock: 0,
        image: null,
        sizes: {
          Small: {
            enabled: true,
            price: 0,
          },
          Medium: {
            enabled: true,
            price: 0,
          },
          Large: {
            enabled: true,
            price: 0,
          },
        },
      });

      await fetchProduct();

      setOpenModal(false);
    } catch (error: any) {
      console.error("CREATE PRODUCT ERROR:", error);
      console.error("RESPONSE:", error?.response?.data);

      alert(JSON.stringify(error?.response?.data, null, 2));
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteProd = async () => {
    if (!selectedId) return;

    try {
      await axios.delete(`${API_URL}/api/products/${selectedId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSelectedId(null);
      setOpenModalDelete(false);

      await fetchProduct();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to delete product.");
    }
  };

  const handleOpenAddModal = () => {
    setFormProduct({
      category_id: 0,
      product_name: "",
      stock: 0,
      image: null,
      sizes: {
        Small: {
          enabled: true,
          price: 0,
        },
        Medium: {
          enabled: true,
          price: 0,
        },
        Large: {
          enabled: true,
          price: 0,
        },
      },
    });
    setOpenModal(true);
  };

  const formatCurrency = (value: number) => {
    return `$${Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getImageUrl = (image?: string) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("storage/")) {
      return `${API_URL}/${image}`;
    }
    return `${API_URL}/storage/${image}`;
  };

  return (
    <>
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Product</h1>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition cursor-pointer hover:bg-orange-600"
          >
            Add Product
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-md">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    Loading products...
                  </td>
                </tr>
              ) : product.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                product.map((item) => (
                  <tr key={item.id} className="border-b">
                    {/* image */}
                    <td className="px-4 py-3">
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.product_name}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </td>

                    {/* Product */}
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.product_name}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-gray-600">
                      {item.category?.category_name || "-"}
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-gray-600">{item.stock}</td>

                    {/* size */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {item.sizes?.map((size) => (
                          <div key={size.id}>{size.size}</div>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {item.sizes?.map((size) => (
                          <div key={size.id}>{formatCurrency(size.price)}</div>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`edit/${item.id}`)}
                          className="rounded-lg p-2 text-blue-500 transition cursor-pointer hover:bg-blue-50"
                        >
                          <AiTwotoneEdit size={20} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(item.id);
                            setOpenModalDelete(true);
                          }}
                          className="rounded-lg p-2 text-red-500 transition cursor-pointer hover:bg-red-50"
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
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>

          <span className="px-3 text-sm text-gray-600">
            Page {currentPage} of {lastPage}
          </span>

          <button
            type="button"
            disabled={currentPage === lastPage}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* modal add product/menu */}
      <Modal
        openModal={openModal}
        setOpenModal={setOpenModal}
        handleChange={handleChangeProduct}
        handleSubmit={handleSubmitProduct}
        handleImageChange={handleImageChange}
        handleSizeToggle={handleSizeToggle}
        formProduct={formProduct}
        categories={Categories}
        title="Add New Product"
        saving={saving}
      />

      {/* modal delete*/}
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
