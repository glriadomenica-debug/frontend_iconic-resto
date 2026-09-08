import { AiFillCloseCircle, AiFillSave } from "react-icons/ai";

interface StaffModal {
  title: string;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: () => void;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
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
}: StaffModal) {
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
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50
        px-4
        py-6
      "
      onClick={handleClose}
    >
      <div
        className="
          relative
          max-h-[90vh]
          w-full max-w-2xl
          overflow-y-auto
          rounded-2xl
          bg-white
          p-6
          shadow-2xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

            <p className="mt-1 text-sm text-gray-500">
              Add a new staff member to your restaurant.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="
              rounded-full
              p-1.5
              text-gray-400
              transition cursor-pointer
              hover:bg-gray-100
              hover:text-gray-600
              disabled:cursor-not-allowed
            "
          >
            <AiFillCloseCircle className="text-2xl" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="first_name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              First Name
            </label>

            <input
              id="first_name"
              type="text"
              name="first_name"
              placeholder="e.g. John"
              onChange={handleChange}
              disabled={loading}
              className="
                w-full rounded-lg
                border border-gray-300
                px-4 py-2.5
                text-sm text-gray-800
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-100
                disabled:bg-gray-100
              "
            />
          </div>

          <div>
            <label
              htmlFor="last_name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>

            <input
              id="last_name"
              type="text"
              name="last_name"
              placeholder="e.g. Doe"
              onChange={handleChange}
              disabled={loading}
              className="
                w-full rounded-lg
                border border-gray-300
                px-4 py-2.5
                text-sm text-gray-800
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-100
                disabled:bg-gray-100
              "
            />
          </div>

          <div>
            <label
              htmlFor="sex"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Gender
            </label>

            <select
              id="sex"
              name="sex"
              defaultValue=""
              onChange={handleChange}
              disabled={loading}
              className="
                w-full rounded-lg
                border border-gray-300
                bg-white
                px-4 py-2.5
                text-sm text-gray-800
                outline-none
                transition
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-100
                disabled:bg-gray-100
              "
            >
              <option value="" disabled>
                Choose Gender
              </option>

              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="phone_number"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>

            <input
              id="phone_number"
              type="tel"
              name="phone_number"
              placeholder="e.g. 77234567"
              onChange={handleChange}
              disabled={loading}
              className="
                w-full rounded-lg
                border border-gray-300
                px-4 py-2.5
                text-sm text-gray-800
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-100
                disabled:bg-gray-100
              "
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="e.g. john@email.com"
              onChange={handleChange}
              disabled={loading}
              className="
                w-full rounded-lg
                border border-gray-300
                px-4 py-2.5
                text-sm text-gray-800
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-100
                disabled:bg-gray-100
              "
            />
          </div>

          <div>
            <label
              htmlFor="position"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Position
            </label>

            <input
              id="position"
              type="text"
              name="position"
              placeholder="e.g. Cashier"
              onChange={handleChange}
              disabled={loading}
              className="
                w-full rounded-lg
                border border-gray-300
                px-4 py-2.5
                text-sm text-gray-800
                outline-none
                transition
                placeholder:text-gray-400
                focus:border-orange-500
                focus:ring-2
                focus:ring-orange-100
                disabled:bg-gray-100
              "
            />
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="
              rounded-lg
              border border-gray-300
              bg-white
              px-5 py-2.5
              text-sm font-medium text-gray-700
              transition cursor-pointer
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="
              flex items-center justify-center gap-2
              rounded-lg
              bg-orange-500
              px-5 py-2.5
              text-sm font-medium text-white
              transition cursor-pointer
              hover:bg-orange-600
              focus:outline-none
              focus:ring-2
              focus:ring-orange-300
              disabled:cursor-not-allowed
              disabled:bg-orange-300
            "
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <AiFillSave className="text-lg" />
                Save Staff
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
