import { useEffect, useState } from "react";

interface ProductModal {
  title: string;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: () => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleImageChange: (file: File | null) => void;
  categories: {
    id: number;
    category_name: string;
  }[];
}

export default function Modal({
  title,
  openModal,
  setOpenModal,
  handleSubmit,
  handleChange,
  handleImageChange,
  categories,
}: ProductModal) {
  const [previewImage, setPreviewImage] = useState<string>("");

  // =========================================================
  // RESET PREVIEW WHEN MODAL CLOSES
  // =========================================================
  useEffect(() => {
    if (!openModal) {
      setPreviewImage("");
    }
  }, [openModal]);

  // =========================================================
  // HANDLE IMAGE
  // =========================================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setPreviewImage("");
      handleImageChange(null);
      return;
    }

    // Validate image
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must not exceed 5MB.");
      e.target.value = "";
      return;
    }

    handleImageChange(file);

    const previewUrl = URL.createObjectURL(file);

    setPreviewImage(previewUrl);
  };

  // =========================================================
  // UI
  // =========================================================
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        openModal ? "" : "hidden"
      }`}
      onClick={() => setOpenModal(false)}
    >
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* MODAL */}
      <div
        className="relative bg-white p-6 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TITLE */}
        <h2 className="text-xl font-bold mb-5 text-gray-800">{title}</h2>

        {/* CATEGORY */}
        <div className="mb-4">
          <label
            htmlFor="category_id"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Food Category
          </label>

          <select
            id="category_id"
            name="category_id"
            className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
            onChange={handleChange}
            defaultValue=""
          >
            <option value="">-- Select Food Category --</option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCT */}
        <div className="mb-4">
          <label
            htmlFor="product_name"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Product Name
          </label>

          <input
            type="text"
            id="product_name"
            name="product_name"
            placeholder="Enter product name"
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* PRICE */}
        <div className="mb-4">
          <label
            htmlFor="price"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Price
          </label>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
              $
            </span>

            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              placeholder="0.00"
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 pl-8 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>

        {/* STOCK */}
        <div className="mb-4">
          <label
            htmlFor="stock"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Stock
          </label>

          <input
            type="number"
            id="stock"
            name="stock"
            min="0"
            placeholder="0"
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* IMAGE */}
        <div className="mb-5">
          <label
            htmlFor="image"
            className="block text-sm font-semibold text-gray-700 mb-1"
          >
            Product Image
          </label>

          {/* PREVIEW */}
          {previewImage && (
            <div className="mb-3">
              <img
                src={previewImage}
                alt="Product preview"
                className="w-full h-48 object-cover rounded-xl border border-gray-200"
              />
            </div>
          )}

          {/* FILE */}
          <input
            type="file"
            id="image"
            name="image"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={handleFileChange}
            className="w-full border border-gray-300 p-2.5 rounded-xl cursor-pointer bg-gray-50"
          />

          <p className="text-xs text-gray-500 mt-1">
            JPG, JPEG, PNG, WEBP. Maximum 5MB.
          </p>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleSubmit}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl transition cursor-pointer font-semibold"
          >
            Save
          </button>

          <button
            onClick={() => setOpenModal(false)}
            className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2.5 rounded-xl transition cursor-pointer font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
