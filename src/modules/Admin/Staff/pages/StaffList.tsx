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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Staff List</h1>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-medium text-white transition cursor-pointer hover:bg-orange-600"
          >
            Add New Staff
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-md">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">First Name</th>
                <th className="px-4 py-3">Last Name</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Phone Number</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Action</th>
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
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500">
                    No staff found.
                  </td>
                </tr>
              ) : (
                staff.map((staffMember, index) => (
                  <tr key={staffMember.id} className="border-b">
                    <td className="px-4 py-3 text-gray-600">
                      {(currentPage - 1) * 10 + index + 1}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-800">
                      {staffMember.first_name}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {staffMember.last_name}
                    </td>

                    <td className="px-4 py-3 capitalize text-gray-600">
                      {staffMember.sex}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {staffMember.phone_number}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {staffMember.email}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {staffMember.position}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/staff/edit/${staffMember.id}`)
                          }
                          className="rounded-lg p-2 text-blue-500 transition cursor-pointer hover:bg-blue-50"
                        >
                          <AiFillEdit size={20} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(staffMember)}
                          className="rounded-lg p-2 text-red-500 transition cursor-pointer hover:bg-red-50"
                        >
                          <AiFillDelete size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>

          <span className="px-3 text-sm text-gray-600">
            Page {currentPage} of {lastPage}
          </span>

          <button
            type="button"
            disabled={currentPage === lastPage}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
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
