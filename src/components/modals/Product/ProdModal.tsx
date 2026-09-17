import { useEffect, useState } from "react";
import { AiFillCloseCircle } from "react-icons/ai";

interface Category {
  id: number;
  category_name: string;
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

interface ProductModalProps {
  title: string;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: () => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleImageChange: (file: File | null) => void;
  handleSizeToggle: (size: SizeName) => void;
  formProduct: FormProduct;
  categories: Category[];
  saving: boolean;
}

export default function ProductModal({
  title,
  openModal,
  setOpenModal,
  handleSubmit,
  handleChange,
  handleImageChange,
  handleSizeToggle,
  formProduct,
  categories,
  saving,
}: ProductModalProps) {
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (!formProduct.image) {
      setPreviewImage("");
      return;
    }

    const url = URL.createObjectURL(formProduct.image);
    setPreviewImage(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [formProduct.image]);

  if (!openModal) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must not exceed 5MB.");
      return;
    }

    handleImageChange(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={() => setOpenModal(false)}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

          <button
            type="button"
            onClick={() => setOpenModal(false)}
            disabled={saving}
            className="text-gray-500 hover:text-red-500 disabled:opacity-50 cursor-pointer"
          >
            <AiFillCloseCircle size={25} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5 px-6 py-6">
          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              name="category_id"
              value={formProduct.category_id}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500"
            >
              <option value={0}>Select Category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Product Name
            </label>

            <input
              type="text"
              name="product_name"
              value={formProduct.product_name}
              onChange={handleChange}
              disabled={saving}
              placeholder="Enter product name"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500"
            />
          </div>

          {/* Stock */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Stock
            </label>

            <input
              type="number"
              name="stock"
              min="0"
              value={formProduct.stock}
              onChange={handleChange}
              disabled={saving}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500"
            />
          </div>

          {/* Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Product Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={saving}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm"
            />

            {previewImage && (
              <div className="mt-4">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="h-40 w-40 rounded-xl object-cover"
                />
              </div>
            )}
          </div>

          {/* Sizes */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Sizes & Prices
            </label>

            <div className="space-y-3">
              {(["Small", "Medium", "Large"] as SizeName[]).map((size) => (
                <div
                  key={size}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 p-3"
                >
                  <input
                    type="checkbox"
                    checked={formProduct.sizes[size].enabled}
                    onChange={() => handleSizeToggle(size)}
                    disabled={saving}
                    className="h-4 w-4"
                  />

                  <span className="w-20 text-sm font-medium">{size}</span>

                  <input
                    type="number"
                    min="0"
                    name={`${size.toLowerCase()}_price`}
                    value={formProduct.sizes[size].price}
                    onChange={handleChange}
                    disabled={!formProduct.sizes[size].enabled || saving}
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-2 outline-none focus:border-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
          <button
            type="button"
            onClick={() => setOpenModal(false)}
            disabled={saving}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition cursor-pointer hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition cursor-pointer hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {saving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
