import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoIosAdd } from "react-icons/io";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";
import Modal from "../../../../components/modals/User/UserModal";
import UserModalConfirmation from "../../../../components/modals/User/UserModalConfirmation";

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role: {
    id: number;
    name: string;
  };
}

interface FormUser {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: string;
}

const initialForm: FormUser = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role_id: "",
};

export default function ListUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [formUser, setFormUser] = useState<FormUser>(initialForm);
  const [openModal, setOpenModal] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      setLoading(true);

      const response = await axios.get("http://localhost:8000/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log(response, "response");

      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleChangeUser = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormUser({
      ...formUser,
      [event.target.name]: event.target.value,
    });
  };

  const handleOpenAddModal = () => {
    setFormUser(initialForm);
    setOpenModal(true);
  };

  const handleCloseAddModal = () => {
    if (saveLoading) return;

    setOpenModal(false);
    setFormUser(initialForm);
  };

  const handleSubmitUser = async () => {
    if (
      !formUser.name.trim() ||
      !formUser.email.trim() ||
      !formUser.password ||
      !formUser.password_confirmation ||
      !formUser.role_id
    ) {
      alert("Please complete all user information.");
      return;
    }

    if (formUser.password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (formUser.password !== formUser.password_confirmation) {
      alert("Password confirmation does not match.");
      return;
    }

    try {
      setSaveLoading(true);

      const response = await axios.post(
        "http://localhost:8000/api/users",
        formUser,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log(response, "response");

      setOpenModal(false);
      setFormUser(initialForm);

      await fetchUser();
    } catch (error: any) {
      console.error("Failed to create user:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "Failed to create user.";

      alert(message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setOpenModalDelete(true);
  };

  const handleCloseDeleteModal = () => {
    if (deleteLoading) return;

    setOpenModalDelete(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setDeleteLoading(true);

      await axios.delete(`http://localhost:8000/api/users/${selectedUser.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setOpenModalDelete(false);
      setSelectedUser(null);

      await fetchUser();
    } catch (error: any) {
      console.error("Failed to delete user:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "Failed to delete user.";

      alert(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-md">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Users Data</h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage system users and their roles.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="
              flex items-center justify-center gap-1
              rounded-xl bg-orange-500
              px-5 py-2.5
              text-sm font-medium text-white
              transition hover:bg-orange-600
              focus:outline-none focus:ring-2
              focus:ring-orange-300
            "
          >
            <IoIosAdd className="text-xl" />
            Add New User
          </button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="bg-orange-100 text-gray-700">
                <th className="rounded-l-xl px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="rounded-r-xl px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className="
                          h-5 w-5 animate-spin rounded-full
                          border-2 border-orange-500
                          border-t-transparent
                        "
                      />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="
                      border-b border-gray-100
                      transition hover:bg-orange-50
                    "
                  >
                    <td className="px-4 py-4 text-gray-500">{index + 1}</td>

                    <td className="px-4 py-4 font-medium text-gray-800">
                      {user.name}
                    </td>

                    <td className="px-4 py-4 text-gray-600">{user.email}</td>

                    <td className="px-4 py-4">
                      <span
                        className="
                          inline-flex rounded-full
                          bg-blue-100 px-3 py-1
                          text-xs font-medium
                          capitalize text-blue-700
                        "
                      >
                        {user.role?.name || "-"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/user/edit/${user.id}`)
                          }
                          className="
                            flex items-center gap-1.5
                            rounded-lg bg-blue-500
                            px-3.5 py-2
                            text-sm font-medium text-white
                            transition hover:bg-blue-600
                            focus:outline-none
                            focus:ring-2 focus:ring-blue-300
                          "
                        >
                          <AiFillEdit />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(user)}
                          className="
                            flex items-center gap-1.5
                            rounded-lg bg-red-500
                            px-3.5 py-2
                            text-sm font-medium text-white
                            transition hover:bg-red-600
                            focus:outline-none
                            focus:ring-2 focus:ring-red-300
                          "
                        >
                          <AiFillDelete />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        openModal={openModal}
        setOpenModal={setOpenModal}
        handleChange={handleChangeUser}
        handleSubmit={handleSubmitUser}
        title="Add New User"
        loading={saveLoading}
        onClose={handleCloseAddModal}
      />

      <UserModalConfirmation
        openModal={openModalDelete}
        setOpenModal={setOpenModalDelete}
        title="Delete User?"
        description={
          selectedUser
            ? `Are you sure you want to delete "${selectedUser.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this user?"
        }
        handleSubmit={handleDeleteUser}
        loading={deleteLoading}
        onClose={handleCloseDeleteModal}
      />
    </>
  );
}
