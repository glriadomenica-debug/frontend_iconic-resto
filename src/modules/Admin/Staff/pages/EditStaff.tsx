import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AiFillEdit, AiFillSave } from "react-icons/ai";

interface Staff {
  id: number;
  first_name: string;
  last_name: string;
  sex: string;
  phone_number: string;
  email: string;
  position: string;
}

const initialForm = {
  first_name: "",
  last_name: "",
  sex: "",
  phone_number: "",
  email: "",
  position: "",
};

export default function EditStaff() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [formStaff, setFormStaff] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  const fetchStaff = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:8000/api/staff/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = response.data.data;

      setStaff(data);

      setFormStaff({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        sex: data.sex || "",
        phone_number: data.phone_number || "",
        email: data.email || "",
        position: data.position || "",
      });
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStaff();
    }
  }, [id]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormStaff({
      ...formStaff,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmitUpdate = async () => {
    if (
      !formStaff.first_name.trim() ||
      !formStaff.last_name.trim() ||
      !formStaff.sex ||
      !formStaff.phone_number.trim() ||
      !formStaff.email.trim() ||
      !formStaff.position.trim()
    ) {
      alert("Please complete all staff information.");
      return;
    }

    try {
      setSaving(true);

      await axios.put(`http://localhost:8000/api/staff/${id}`, formStaff, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/staff");
    } catch (error: any) {
      console.error("Failed to update staff:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "Failed to update staff.";

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
          Loading staff...
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-md">
        <p className="text-gray-500">Staff information could not be found.</p>

        <button
          type="button"
          onClick={() => navigate("/staff")}
          className="
            mt-4 rounded-lg
            bg-orange-500
            px-5 py-2.5
            text-sm font-medium text-white
            hover:bg-orange-600
          "
        >
          Back to Staff
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <div className="mb-7">
        <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <AiFillEdit className="text-orange-500" />
          Edit Staff
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Update staff information below.
        </p>
      </div>

      <div className="grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
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
            value={formStaff.first_name}
            onChange={handleChange}
            disabled={saving}
            className="
              w-full rounded-lg
              border border-gray-300
              px-4 py-2.5
              text-sm text-gray-800
              outline-none
              transition
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
            value={formStaff.last_name}
            onChange={handleChange}
            disabled={saving}
            className="
              w-full rounded-lg
              border border-gray-300
              px-4 py-2.5
              text-sm text-gray-800
              outline-none
              transition
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
            value={formStaff.sex}
            onChange={handleChange}
            disabled={saving}
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
            <option value="">Choose Gender</option>
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
            value={formStaff.phone_number}
            onChange={handleChange}
            disabled={saving}
            className="
              w-full rounded-lg
              border border-gray-300
              px-4 py-2.5
              text-sm text-gray-800
              outline-none
              transition
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
            value={formStaff.email}
            onChange={handleChange}
            disabled={saving}
            className="
              w-full rounded-lg
              border border-gray-300
              px-4 py-2.5
              text-sm text-gray-800
              outline-none
              transition
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
            value={formStaff.position}
            onChange={handleChange}
            disabled={saving}
            className="
              w-full rounded-lg
              border border-gray-300
              px-4 py-2.5
              text-sm text-gray-800
              outline-none
              transition
              focus:border-orange-500
              focus:ring-2
              focus:ring-orange-100
              disabled:bg-gray-100
            "
          />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/staff")}
          disabled={saving}
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
          onClick={handleSubmitUpdate}
          disabled={
            saving ||
            !formStaff.first_name.trim() ||
            !formStaff.last_name.trim() ||
            !formStaff.sex ||
            !formStaff.phone_number.trim() ||
            !formStaff.email.trim() ||
            !formStaff.position.trim()
          }
          className="
            flex items-center gap-2
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
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Updating...
            </>
          ) : (
            <>
              <AiFillSave className="text-lg" />
              Update Staff
            </>
          )}
        </button>
      </div>
    </div>
  );
}
