import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AiFillEdit } from "react-icons/ai";

interface Category {
  id: number;
  category_name: string;
}

interface ProductSize {
  id: number;
  size: "Small" | "Medium" | "Large";
  price: number | string;
}

interface EditProduct {
  id: number;
  category_id: number;
  product_name: string;
  price: number;
  stock: number;
  image: string;
  sizes: ProductSize[];
}

interface SizeForm {
  enabled: boolean;
  price: number;
}

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = "http://localhost:8000";
  const [categories, setCategories] = useState<Category[]>([]);
  const [editProduct, setEditProduct] = useState<EditProduct>({
    id: 0,
    category_id: 0,
    product_name: "",
    price: 0,
    stock: 0,
    image: "",
    sizes: [],
  });

  const [formEditProduct, setFormEditProduct] = useState({
    category_id: 0,
    product_name: "",
    stock: 0,
    image: null as File | null,
    sizes: {
      Small: {
        enabled: false,
        price: 0,
      },
      Medium: {
        enabled: false,
        price: 0,
      },
      Large: {
        enabled: false,
        price: 0,
      },
    } as Record<"Small" | "Medium" | "Large", SizeForm>,
  });

  const [previewImage, setPreviewImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const formatCurrency = (value: number | string) => {
    return `$${Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormEditProduct((prev) => ({
      ...prev,
      [name]:
        name === "category_id" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleSizeToggle = (size: "Small" | "Medium" | "Large") => {
    setFormEditProduct((prev) => ({
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

  const handleSizePriceChange = (
    size: "Small" | "Medium" | "Large",
    value: string,
  ) => {
    setFormEditProduct((prev) => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [size]: {
          ...prev.sizes[size],
          price: Number(value),
        },
      },
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must not exceed 5MB.");
      return;
    }

    setFormEditProduct((prev) => ({
      ...prev,
      image: file,
    }));

    setPreviewImage(URL.createObjectURL(file));
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const response = await axios({
        method: "GET",
        url: `${API_URL}/api/products/${id}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = response.data.data;

      setEditProduct(data);

      const sizes = {
        Small: {
          enabled: false,
          price: 0,
        },
        Medium: {
          enabled: false,
          price: 0,
        },
        Large: {
          enabled: false,
          price: 0,
        },
      };

      if (Array.isArray(data.sizes)) {
        data.sizes.forEach((item: ProductSize) => {
          if (
            item.size === "Small" ||
            item.size === "Medium" ||
            item.size === "Large"
          ) {
            sizes[item.size] = {
              enabled: true,
              price: Number(item.price || 0),
            };
          }
        });
      }

      setFormEditProduct({
        category_id: data.category_id || 0,
        product_name: data.product_name || "",
        stock: Number(data.stock || 0),
        image: null,
        sizes,
      });

      if (data.image) {
        setPreviewImage(getImageUrl(data.image));
      }
    } catch (error) {
      console.log("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

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
    fetchCategory();
    fetchProduct();
  }, [id]);

  const handleSubmitUpdate = async () => {
    try {
      if (!formEditProduct.category_id) {
        alert("Please select a food category.");
        return;
      }

      if (!formEditProduct.product_name.trim()) {
        alert("Please enter product name.");
        return;
      }

      if (formEditProduct.stock < 0) {
        alert("Stock cannot be negative.");
        return;
      }

      const selectedSizes = Object.entries(formEditProduct.sizes).filter(
        ([, data]) => data.enabled,
      );

      if (selectedSizes.length === 0) {
        alert("Please select at least one food size.");
        return;
      }

      for (const [size, data] of selectedSizes) {
        if (data.price <= 0) {
          alert(`Please enter a valid price for ${size}.`);
          return;
        }
      }

      setSaving(true);

      const formData = new FormData();
      formData.append("category_id", String(formEditProduct.category_id));
      formData.append("product_name", formEditProduct.product_name.trim());
      formData.append("stock", String(formEditProduct.stock));

      let sizeIndex = 0;

      selectedSizes.forEach(([size, data]) => {
        formData.append(`sizes[${sizeIndex}][size]`, size);

        formData.append(`sizes[${sizeIndex}][price]`, String(data.price));

        sizeIndex++;
      });

      // Image hanya dikirim jika diganti
      if (formEditProduct.image) {
        formData.append("image", formEditProduct.image);
      }

      // Laravel method spoofing
      formData.append("_method", "PUT");

      const response = await axios({
        method: "POST",
        url: `${API_URL}/api/products/${id}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // "Content-Type": "multipart/form-data",
        },
        data: formData,
      });

      console.log("Product updated:", response.data);

      navigate("/products");
    } catch (error: any) {
      console.log("Failed to update product:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "Failed to update product.";

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex justify-center items-center py-20">
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }
  const sizeList: ("Small" | "Medium" | "Large")[] = [
    "Small",
    "Medium",
    "Large",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center gap-2 text-xl text-orange-600 font-bold mb-6">
        <AiFillEdit size={24} />
        Edit Product
      </div>

      <div className="mb-5">
        <label
          htmlFor="category_id"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Food Category
        </label>

        <select
          id="category_id"
          name="category_id"
          className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
          onChange={handleChange}
          value={formEditProduct.category_id || ""}
        >
          <option value="">-- Select Food Category --</option>

          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.category_name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label
          htmlFor="product_name"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Product Name
        </label>

        <input
          type="text"
          id="product_name"
          name="product_name"
          className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
          onChange={handleChange}
          value={formEditProduct.product_name}
          placeholder="Enter product name"
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Available Sizes & Prices
        </label>

        <div className="space-y-3">
          {sizeList.map((size) => {
            const sizeData = formEditProduct.sizes[size];

            return (
              <div
                key={size}
                className={`border rounded-xl p-4 transition ${
                  sizeData.enabled
                    ? "border-orange-300 bg-orange-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={sizeData.enabled}
                    onChange={() => handleSizeToggle(size)}
                    className="w-5 h-5 accent-orange-500 cursor-pointer"
                  />

                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{size}</p>

                    {!sizeData.enabled && (
                      <p className="text-xs text-gray-400">
                        This size will not be shown to customers
                      </p>
                    )}
                  </div>

                  {sizeData.enabled && (
                    <div className="relative w-40">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                        $
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={sizeData.price || ""}
                        onChange={(e) =>
                          handleSizePriceChange(size, e.target.value)
                        }
                        className="w-full border border-gray-300 p-2.5 pl-8 rounded-lg outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Only selected sizes will be available to customers.
        </p>
      </div>

      <div className="mb-5">
        <label
          htmlFor="stock"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Stock
        </label>

        <input
          type="number"
          id="stock"
          name="stock"
          min="0"
          className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
          onChange={handleChange}
          value={formEditProduct.stock}
          placeholder="0"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="image"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Product Image
        </label>

        {previewImage ? (
          <div className="mb-4">
            <img
              src={previewImage}
              alt={editProduct.product_name}
              className="w-40 h-40 object-cover rounded-2xl border border-gray-200 shadow-sm"
            />
          </div>
        ) : (
          <div className="w-40 h-40 mb-4 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}

        <input
          type="file"
          id="image"
          name="image"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          onChange={handleImageChange}
          className="w-full border border-gray-300 p-2.5 rounded-xl cursor-pointer bg-gray-50"
        />

        <p className="text-xs text-gray-500 mt-2">
          Supported: JPG, JPEG, PNG, WEBP. Maximum 5MB.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-2.5 px-6 rounded-xl transition cursor-pointer disabled:cursor-not-allowed font-semibold"
          onClick={handleSubmitUpdate}
          disabled={saving}
        >
          {saving ? "Updating..." : "Update Product"}
        </button>

        <button
          className="bg-gray-500 hover:bg-gray-600 text-white py-2.5 px-6 rounded-xl transition cursor-pointer font-semibold"
          onClick={() => navigate("/products")}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
