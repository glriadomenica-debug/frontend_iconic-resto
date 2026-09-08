import { AiFillCloseCircle, AiFillDelete } from "react-icons/ai";

interface CategoryConfirmationModal {
  title: string;
  description: string;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: () => void;
  loading?: boolean;
  onClose?: () => void;
}

export default function CategoryModalConfirmation({
  openModal,
  title,
  description,
  setOpenModal,
  handleSubmit,
  loading = false,
  onClose,
}: CategoryConfirmationModal) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"      onClick={handleClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()} >
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AiFillDelete className="text-3xl text-red-600" />
          </div>
        </div>

        <div className="mt-5 text-center">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>

          <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button
            type="button" onClick={handleClose} disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100  disabled:cursor-not-allowed disabled:opacity-50" >
            <AiFillCloseCircle className="text-lg" />
            Cancel
          </button>

          <button type="button" onClick={handleSubmit} disabled={loading} className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:cursor-not-allowed disabled:bg-red-300" >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <AiFillDelete className="text-lg" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
