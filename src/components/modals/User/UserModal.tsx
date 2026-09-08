import { useState } from "react";
import {
  AiFillCloseCircle,
  AiFillSave,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";

interface ModalProps {
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
}: ModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!openModal) return null;

  const handleClose = () => {
    if (loading) return;

    setShowPassword(false);
    setShowConfirmPassword(false);

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
        px-4 py-6
      "
      onClick={handleClose}
    >
      <div
        className="
          relative max-h-[90vh]
          w-full max-w-2xl
          overflow-y-auto
          rounded-2xl bg-white
          p-6 shadow-2xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

            <p className="mt-1 text-sm text-gray-500">
              Create a new user account for the system.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="
              rounded-full p-1.5
              text-gray-400 transition
              hover:bg-gray-100 hover:text-gray-600
              disabled:cursor-not-allowed
            "
          >
            <AiFillCloseCircle className="text-2xl" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="e.g. John Doe"
              onChange={handleChange}
              disabled={loading}
              className="
                w-full rounded-lg
                border border-gray-300
                px-4 py-2.5
                text-sm text-gray-800
                outline-none transition
                placeholder:text-gray-400
                focus:border-orange-500
                focus:ring-2 focus:ring-orange-100
                disabled:bg-gray-100
              "
            />
          </div>

          <div className="sm:col-span-2">
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
                outline-none transition
                placeholder:text-gray-400
                focus:border-orange-500
                focus:ring-2 focus:ring-orange-100
                disabled:bg-gray-100
              "
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Minimum 8 characters"
                onChange={handleChange}
                disabled={loading}
                className="
                  w-full rounded-lg
                  border border-gray-300
                  px-4 py-2.5 pr-11
                  text-sm text-gray-800
                  outline-none transition
                  placeholder:text-gray-400
                  focus:border-orange-500
                  focus:ring-2 focus:ring-orange-100
                  disabled:bg-gray-100
                "
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-gray-400
                  hover:text-gray-600
                "
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible className="text-xl" />
                ) : (
                  <AiOutlineEye className="text-xl" />
                )}
              </button>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              Use at least 8 characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="password_confirmation"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="password_confirmation"
                type={showConfirmPassword ? "text" : "password"}
                name="password_confirmation"
                placeholder="Re-enter password"
                onChange={handleChange}
                disabled={loading}
                className="
                  w-full rounded-lg
                  border border-gray-300
                  px-4 py-2.5 pr-11
                  text-sm text-gray-800
                  outline-none transition
                  placeholder:text-gray-400
                  focus:border-orange-500
                  focus:ring-2 focus:ring-orange-100
                  disabled:bg-gray-100
                "
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-gray-400
                  hover:text-gray-600
                "
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible className="text-xl" />
                ) : (
                  <AiOutlineEye className="text-xl" />
                )}
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="role_id"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Role
            </label>

            <select
              id="role_id"
              name="role_id"
              onChange={handleChange}
              disabled={loading}
              defaultValue=""
              className="
                w-full rounded-lg
                border border-gray-300
                bg-white
                px-4 py-2.5
                text-sm text-gray-800
                outline-none transition
                focus:border-orange-500
                focus:ring-2 focus:ring-orange-100
                disabled:bg-gray-100
              "
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="1">Admin</option>
              <option value="2">Cashier</option>
              <option value="3">Kitchen</option>
            </select>
          </div>
        </div>

        <div
          className="
            mt-7 flex flex-col-reverse
            gap-3 sm:flex-row
            sm:justify-end
          "
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="
              rounded-lg
              border border-gray-300
              bg-white
              px-5 py-2.5
              text-sm font-medium
              text-gray-700
              transition hover:bg-gray-100
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
              flex items-center
              justify-center gap-2
              rounded-lg
              bg-orange-500
              px-5 py-2.5
              text-sm font-medium
              text-white
              transition hover:bg-orange-600
              focus:outline-none
              focus:ring-2
              focus:ring-orange-300
              disabled:cursor-not-allowed
              disabled:bg-orange-300
            "
          >
            {loading ? (
              <>
                <div
                  className="
                    h-4 w-4 animate-spin
                    rounded-full border-2
                    border-white
                    border-t-transparent
                  "
                />
                Saving...
              </>
            ) : (
              <>
                <AiFillSave className="text-lg" />
                Save User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
