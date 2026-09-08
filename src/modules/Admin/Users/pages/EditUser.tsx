import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  AiFillEdit,
  AiFillSave,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role?: {
    id: number;
    name: string;
  };
}

interface FormUser {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const initialForm: FormUser = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
};

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formUser, setFormUser] = useState<FormUser>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:8000/api/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log(response, "response");

      const data = response.data.data;

      setUser(data);

      setFormUser({
        name: data.name || "",
        email: data.email || "",
        password: "",
        password_confirmation: "",
      });
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormUser({
      ...formUser,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmitUpdate = async () => {
    if (!formUser.name.trim() || !formUser.email.trim()) {
      alert("Name and email are required.");
      return;
    }

    if (formUser.password) {
      if (formUser.password.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
      }

      if (formUser.password !== formUser.password_confirmation) {
        alert("Password confirmation does not match.");
        return;
      }
    }

    try {
      setSaving(true);

      const data: any = {
        name: formUser.name,
        email: formUser.email,
      };

      if (formUser.password) {
        data.password = formUser.password;
        data.password_confirmation = formUser.password_confirmation;
      }

      const response = await axios.put(
        `http://localhost:8000/api/users/${id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log(response, "response");

      navigate("/admin/user");
    } catch (error: any) {
      console.error("Failed to update user:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "Failed to update user.";

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 shadow-md">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <div
            className="
              h-5 w-5 animate-spin
              rounded-full border-2
              border-orange-500
              border-t-transparent
            "
          />
          Loading user...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-md">
        <p className="text-gray-500">User information could not be found.</p>

        <button
          type="button"
          onClick={() => navigate("/admin/user")}
          className="
            mt-4 rounded-lg
            bg-orange-500
            px-5 py-2.5
            text-sm font-medium
            text-white
            hover:bg-orange-600
          "
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <div className="mb-7">
        <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <AiFillEdit className="text-orange-500" />
          Edit User
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Update user account information below.
        </p>
      </div>

      <div className="grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
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
            value={formUser.name}
            onChange={handleChange}
            disabled={saving}
            className="
              w-full rounded-lg
              border border-gray-300
              px-4 py-2.5
              text-sm text-gray-800
              outline-none transition
              focus:border-orange-500
              focus:ring-2 focus:ring-orange-100
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
            value={formUser.email}
            onChange={handleChange}
            disabled={saving}
            className="
              w-full rounded-lg
              border border-gray-300
              px-4 py-2.5
              text-sm text-gray-800
              outline-none transition
              focus:border-orange-500
              focus:ring-2 focus:ring-orange-100
              disabled:bg-gray-100
            "
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Role
          </label>

          <input
            id="role"
            type="text"
            disabled
            value={
              user.role?.name
                ? user.role.name.charAt(0).toUpperCase() +
                  user.role.name.slice(1)
                : "-"
            }
            className="
              w-full rounded-lg
              border border-gray-300
              bg-gray-100
              px-4 py-2.5
              text-sm text-gray-600
              cursor-not-allowed
            "
          />

          <p className="mt-1 text-xs text-gray-400">
            User role cannot be changed from this page.
          </p>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            New Password
            <span className="ml-1 text-xs font-normal text-gray-400">
              (optional)
            </span>
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formUser.password}
              onChange={handleChange}
              disabled={saving}
              placeholder="Leave blank to keep current"
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
        </div>

        <div>
          <label
            htmlFor="password_confirmation"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Confirm New Password
          </label>

          <div className="relative">
            <input
              id="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              name="password_confirmation"
              value={formUser.password_confirmation}
              onChange={handleChange}
              disabled={saving}
              placeholder="Re-enter new password"
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
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate("/admin/user")}
          disabled={saving}
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
          onClick={handleSubmitUpdate}
          disabled={saving || !formUser.name.trim() || !formUser.email.trim()}
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
          {saving ? (
            <>
              <div
                className="
                  h-4 w-4 animate-spin
                  rounded-full border-2
                  border-white
                  border-t-transparent
                "
              />
              Updating...
            </>
          ) : (
            <>
              <AiFillSave className="text-lg" />
              Update User
            </>
          )}
        </button>
      </div>
    </div>
  );
}
