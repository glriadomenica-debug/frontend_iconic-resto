import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AiFillEdit, AiFillSave } from "react-icons/ai";

interface Category {
  id: number;
  category_name: string;
}

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category>({
    id: 0,
    category_name: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formCategory, setFormCategory] = useState({
    category_name: "",
  });

  const token = localStorage.getItem("token");

  const fetchCategory = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:8000/api/categories/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = response.data.data;

      setCategory(data);

      setFormCategory({
        category_name: data.category_name || "",
      });
    } catch (error) {
      console.error("Failed to fetch category:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormCategory({
      ...formCategory,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmitUpdate = async () => {
    if (!formCategory.category_name.trim()) {
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `http://localhost:8000/api/categories/${id}`,
        {
          category_name: formCategory.category_name.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      navigate("/categories");
    } catch (error: any) {
      console.error("Failed to update category:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "Failed to update category.";

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 shadow-md">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          Loading category...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <AiFillEdit className="text-orange-500" />
          Edit Category
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Update the category information below.
        </p>
      </div>

      <div className="max-w-xl">
        <label htmlFor="category_name" className="mb-2 block text-sm font-medium text-gray-700"> Category Name
        </label>

        <input id="category_name" type="text" name="category_name" value={formCategory.category_name} onChange={handleChange} disabled={saving} className=" w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100"/>

        <p className="mt-1.5 text-xs text-gray-400">
          Choose a clear name that helps identify this category.
        </p>
      </div>

      <div className="mt-7 flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/categories")}
          disabled={saving}
          className=" rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {" "}
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmitUpdate}
          disabled={saving || !formCategory.category_name.trim()}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:bg-orange-300
          "
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Updating...
            </>
          ) : (
            <>
              <AiFillSave className="text-lg" />
              Update Category
            </>
          )}
        </button>
      </div>
    </div>
  );
}
