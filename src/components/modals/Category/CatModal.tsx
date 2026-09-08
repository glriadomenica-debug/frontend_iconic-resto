import { AiFillCloseCircle, AiFillSave } from "react-icons/ai";

interface CategoryModal {
  title: string;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  onClose?: () => void;
}

export default function Modal({
  title,
  openModal,
  setOpenModal,
  handleSubmit,
  handleChange,
  loading = false,
  onClose,
}: CategoryModal) {
  if (!openModal) return null;

  const handleClose = () => {
    if (loading) return;

    if (onClose) {
      onClose();
    } else {
      setOpenModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={handleClose}
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

            <p className="mt-1 text-sm text-gray-500">
              Add a new category to your restaurant.
            </p>
          </div>

          <button type="button" onClick={handleClose} disabled={loading} className=" rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed ">
            <AiFillCloseCircle className="text-2xl" />
          </button>
        </div>

        <div>
          <label htmlFor="category_name" className="mb-2 block text-sm font-medium text-gray-700"
          > Category Name
          </label>

          <input id="category_name" type="text" name="category_name" placeholder="e.g. Main Course" onChange={handleChange} disabled={loading} autoFocus className=" w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 "/>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={handleClose} disabled={loading} className=" rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          > Cancel
          </button>

          <button type="button" onClick={handleSubmit} disabled={loading} className=" flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:bg-orange-300" >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <AiFillSave className="text-lg" />
                Save Category
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
