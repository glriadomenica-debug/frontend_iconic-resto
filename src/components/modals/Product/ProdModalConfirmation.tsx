import { AiFillCloseCircle, AiFillDelete } from "react-icons/ai";

interface ProductProps {
  title: string;
  description: string;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: () => void;
}

export default function ProductModalConfirmation({
  openModal,
  title,
  description,
  setOpenModal,
  handleSubmit,
}: ProductProps) {
  if (!openModal) return null;

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleClose}
    >
      <div
        className="
          relative w-full max-w-md
          rounded-xl bg-white
          p-6 shadow-2xl
          animate-in fade-in zoom-in-95 duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AiFillDelete className="text-3xl text-red-600" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">
            {title || "Delete Product?"}
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {description ||
              "Are you sure you want to delete this product? This action cannot be undone."}
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="
              flex items-center justify-center gap-2
              rounded-lg border border-gray-300
              bg-white px-5 py-2.5
              text-sm font-medium text-gray-700
              transition-colors
              hover:bg-gray-100
              focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer
            "
          >
            <AiFillCloseCircle className="text-lg" />
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="
              flex items-center justify-center gap-2
              rounded-lg bg-red-600
              px-5 py-2.5
              text-sm font-medium text-white
              transition-colors
              hover:bg-red-700
              focus:outline-none focus:ring-2 focus:ring-red-300 cursor-pointer
            "
          >
            <AiFillDelete className="text-lg" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
