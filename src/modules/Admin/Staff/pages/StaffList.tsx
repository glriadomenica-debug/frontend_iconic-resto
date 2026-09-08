import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";

import Modal from "../../../../components/modals/Staff/StaffModal";
import StaffModalConfirmation from "../../../../components/modals/Staff/StaffModalConfirmation";

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

export default function ListStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [formStaff, setFormStaff] = useState(initialForm);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchStaff = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:8000/api/staff?page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("STAFF API RESPONSE:", res.data);

      setStaff(res.data.data || []);

      setLastPage(res.data.last_page || 1);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [currentPage]);

  const handleChangeStaff = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormStaff({
      ...formStaff,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpenAddModal = () => {
    setFormStaff(initialForm);
    setOpenModal(true);
  };

  const handleCloseAddModal = () => {
    if (saveLoading) return;

    setOpenModal(false);
    setFormStaff(initialForm);
  };

  const handleSubmitStaff = async () => {
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
      setSaveLoading(true);

      await axios.post("http://localhost:8000/api/staff", formStaff, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOpenModal(false);
      setFormStaff(initialForm);

      await fetchStaff();
    } catch (error: any) {
      console.error("Failed to create staff:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "Failed to create staff.";

      alert(message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleOpenDeleteModal = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setOpenModalDelete(true);
  };

  const handleCloseDeleteModal = () => {
    if (deleteLoading) return;

    setOpenModalDelete(false);
    setSelectedStaff(null);
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;

    try {
      setDeleteLoading(true);

      await axios.delete(
        `http://localhost:8000/api/staff/${selectedStaff.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setOpenModalDelete(false);
      setSelectedStaff(null);

      if (staff.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchStaff();
      }
    } catch (error: any) {
      console.error("Failed to delete staff:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "This staff cannot be deleted.";

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
            <h1 className="text-2xl font-bold text-gray-800">Staff List</h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage restaurant staff
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className=" rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition cursor-pointer hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 "
          >
            + Add New Staff
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-orange-100 text-gray-700">
                <th className="rounded-l-xl px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">First Name</th>
                <th className="px-4 py-3 text-left">Last Name</th>
                <th className="px-4 py-3 text-left">Gender</th>
                <th className="px-4 py-3 text-left">Phone Number</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Position</th>
                <th className="rounded-r-xl px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                      Loading staff...
                    </div>
                  </td>
                </tr>
              ) : staff.length > 0 ? (
                staff.map((staffMember, index) => (
                  <tr
                    key={staffMember.id}
                    className="border-b border-gray-100 transition hover:bg-orange-50 "
                  >
                    <td className="px-4 py-4 text-gray-600">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-700">
                      {staffMember.first_name}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {staffMember.last_name}
                    </td>
                    <td className="px-4 py-4 capitalize text-gray-700">
                      {staffMember.sex}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {staffMember.phone_number}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {staffMember.email}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {staffMember.position}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/staff/edit/${staffMember.id}`)
                          }
                          className="
                            flex items-center gap-1.5
                            rounded-lg
                            bg-blue-500
                            px-3.5 py-2
                            text-sm font-medium text-white
                            transition cursor-pointer
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
                          onClick={() => handleOpenDeleteModal(staffMember)}
                          className="
                            flex items-center gap-1.5
                            rounded-lg
                            bg-red-500
                            px-3.5 py-2
                            text-sm font-medium text-white
                            transition cursor-pointer
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
                  <td colSpan={8} className="py-10 text-center text-gray-500">
                    No staff found
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
              rounded-lg
              px-4 py-2
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
              rounded-lg
              px-4 py-2
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
        handleChange={handleChangeStaff}
        handleSubmit={handleSubmitStaff}
        title="Add New Staff"
        loading={saveLoading}
        onClose={handleCloseAddModal}
      />

      <StaffModalConfirmation
        openModal={openModalDelete}
        setOpenModal={setOpenModalDelete}
        title="Delete Staff?"
        description={
          selectedStaff
            ? `Are you sure you want to delete "${selectedStaff.first_name} ${selectedStaff.last_name}"? This action cannot be undone.`
            : "Are you sure you want to delete this staff?"
        }
        handleSubmit={handleDeleteStaff}
        loading={deleteLoading}
        onClose={handleCloseDeleteModal}
      />
    </>
  );
}
