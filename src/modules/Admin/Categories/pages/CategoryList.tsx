import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import Modal from "../../../../components/modals/Category/CatModal";
import CategoryModalConfirmation from "../../../../components/modals/Category/CatModalConfirmation";

interface Category {
  id: number;
  category_name: string;
}

export default function ListCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);
  const [formCategory, setFormCategory] = useState({
    category_name: "",
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:8000/api/categories?page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCategories(res.data.data.data || []);
      setLastPage(res.data.data.last_page || 1);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage]);

  const handleChangeCategory = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormCategory({
      ...formCategory,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpenAddModal = () => {
    setFormCategory({
      category_name: "",
    });

    setOpenModal(true);
  };

  const handleCloseAddModal = () => {
    if (saveLoading) return;

    setOpenModal(false);

    setFormCategory({
      category_name: "",
    });
  };

  const handleSubmitCategory = async () => {
    if (!formCategory.category_name.trim()) {
      return;
    }

    try {
      setSaveLoading(true);

      await axios.post(
        "http://localhost:8000/api/categories",
        {
          category_name: formCategory.category_name.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOpenModal(false);

      setFormCategory({
        category_name: "",
      });

      await fetchCategories();
    } catch (error: any) {
      console.error("Failed to create category:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "Failed to create category.";

      alert(message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleOpenDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setOpenModalDelete(true);
  };

  const handleCloseDeleteModal = () => {
    if (deleteLoading) return;

    setOpenModalDelete(false);
    setSelectedCategory(null);
  };

  const handleDeleteCat = async () => {
    if (!selectedCategory) return;

    try {
      setDeleteLoading(true);

      await axios.delete(
        `http://localhost:8000/api/categories/${selectedCategory.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOpenModalDelete(false);
      setSelectedCategory(null);

      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchCategories();
      }
    } catch (error: any) {
      console.error("Failed to delete category:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "This category cannot be deleted.";

      alert(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl bg-white p-6 shadow-md">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Categories List
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage restaurant categories
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            + Add Category
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-orange-100 text-gray-700">
                <th className="rounded-l-xl px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Category Name</th>
                <th className="rounded-r-xl px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                      Loading categories...
                    </div>
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((category, index) => (
                  <tr
                    key={category.id}
                    className=" border-b border-gray-100 transition hover:bg-orange-50"
                  >
                    <td className="px-4 py-4 text-gray-600">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-700">
                      {category.category_name}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* EDIT */}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/categories/edit/${category.id}`)
                          }
                          className="
                            flex items-center gap-1.5
                            rounded-lg
                            bg-blue-500
                            px-3.5 py-2
                            text-sm font-medium text-white
                            transition
                            hover:bg-blue-600
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-300
                          "
                        >
                          <AiFillEdit />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(category)}
                          className="
                            flex items-center gap-1.5
                            rounded-lg
                            bg-red-500
                            px-3.5 py-2
                            text-sm font-medium text-white
                            transition
                            hover:bg-red-600
                            focus:outline-none
                            focus:ring-2
                            focus:ring-red-300
                          "
                        >
                          <AiFillDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className={`
              rounded-lg px-4 py-2
              text-sm font-medium text-white
              transition
              ${
                currentPage === 1
                  ? "cursor-not-allowed bg-gray-300"
                  : "bg-orange-500 hover:bg-orange-600"
              }
            `}
          >
            Prev
          </button>

          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {lastPage}
          </span>

          <button
            type="button"
            disabled={currentPage === lastPage}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className={`
              rounded-lg px-4 py-2
              text-sm font-medium text-white
              transition
              ${
                currentPage === lastPage
                  ? "cursor-not-allowed bg-gray-300"
                  : "bg-orange-500 hover:bg-orange-600"
              }
            `}
          >
            Next
          </button>
        </div>
      </div>

      <Modal
        openModal={openModal}
        setOpenModal={setOpenModal}
        handleChange={handleChangeCategory}
        handleSubmit={handleSubmitCategory}
        title="Add New Category"
        loading={saveLoading}
        onClose={handleCloseAddModal}
      />

      <CategoryModalConfirmation
        openModal={openModalDelete}
        setOpenModal={setOpenModalDelete}
        title="Delete Category?"
        description={
          selectedCategory
            ? `Are you sure you want to delete "${selectedCategory.category_name}"? This action cannot be undone.`
            : "Are you sure you want to delete this category?"
        }
        handleSubmit={handleDeleteCat}
        loading={deleteLoading}
        onClose={handleCloseDeleteModal}
      />
    </>
  );
}
