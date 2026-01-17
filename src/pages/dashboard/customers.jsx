import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  IconButton,
  Tooltip,
  Input,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Alert,
} from "@material-tailwind/react";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/solid";
import { CustomerFormModal } from "@/widgets/modals/customer-form-modal";

const API_BASE_URL = "https://laundromat-server.vercel.app/api/v1/customer";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export function Customers() {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [alert, setAlert] = useState(null);
  const [page, setPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const loadCustomers = useCallback(
    async (currentPage = page, search = searchQuery) => {
      setLoading(true);
      setAlert(null);
      try {
        const response = await axios.get(API_BASE_URL, {
          params: {
            search: search,
            page: currentPage,
            limit: 15,
          },
          withCredentials: true,
        });

        setCustomers(response.data.data);
        setMeta(response.data.meta);
      } catch (error) {
        console.error(
          "❌ Gagal memuat daftar pelanggan:",
          error.response || error
        );
        setAlert({
          type: "error",
          message:
            "Gagal memuat daftar pelanggan. Pastikan server BE berjalan!",
        });
      } finally {
        setLoading(false);
      }
    },
    [page, searchQuery]
  );

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearch = () => {
    setPage(1);
    loadCustomers(1, searchQuery);
  };

  const handleChangePage = (newPage) => {
    if (newPage >= 1 && newPage <= meta.last_page) {
      setPage(newPage);
      loadCustomers(newPage, searchQuery);
    }
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (customer) => {
    setEditingCustomer(customer);
    setOpenModal(true);
  };

  const handleCloseModal = (isSuccess = false, message = "") => {
    setOpenModal(false);
    setEditingCustomer(null);

    if (isSuccess) {
      setAlert({ type: "success", message });
      loadCustomers(page, searchQuery);
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus pelanggan ${name}?`)) return;

    setAlert(null);
    try {
      await axios.delete(`${API_BASE_URL}/${id}`, { withCredentials: true });
      handleCloseModal(true, `Pelanggan ${name} berhasil dihapus! 👍`);
    } catch (error) {
      console.error("❌ Gagal menghapus pelanggan:", error.response || error);
      const errorMessage =
        error.response?.data?.message || `Gagal menghapus pelanggan ${name}.`;
      setAlert({ type: "error", message: errorMessage });
    }
  };

  const tableHeaders = [
    "Pelanggan",
    "Telepon",
    "Alamat",
    "Terdaftar Sejak",
    "Aksi",
  ];

  if (loading) {
    return (
      <div className="mt-12 text-center p-8">
        <Typography variant="h5" color="blue-gray">
          Memuat Data Pelanggan... 👤
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-8 p-6 flex flex-col md:flex-row justify-between items-center"
        >
          <Typography
            variant="h6"
            color="white"
            className="flex items-center gap-2 mb-4 md:mb-0"
          >
            <UserCircleIcon className="w-6 h-6" /> Daftar Pelanggan (
            {meta.total || customers.length})
          </Typography>
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex w-full max-w-[20rem]">
              <Input
                type="text"
                label="Cari Nama/Telepon..."
                color="white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-20"
                containerProps={{
                  className: "min-w-0",
                }}
              />
              <Button
                size="sm"
                color="white"
                onClick={handleSearch}
                className="!absolute right-1 top-1 rounded"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
              </Button>
            </div>

            <Button
              color="green"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon className="h-5 w-5" /> Tambah Baru
            </Button>
          </div>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {alert && (
            <Alert
              color={alert.type === "success" ? "green" : "red"}
              className="mb-4 mx-4"
            >
              {alert.message}
            </Alert>
          )}
          <table className="w-full min-w-[700px] table-auto">
            <thead>
              <tr>
                {tableHeaders.map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <Typography variant="paragraph" color="blue-gray">
                      Tidak ada data pelanggan yang ditemukan. 🧐
                    </Typography>
                  </td>
                </tr>
              ) : (
                customers.map(
                  ({ id, name, phone, address, createdAt }, key) => {
                    const className = `py-3 px-5 ${
                      key === customers.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={id}>
                        <td className={className}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            {name}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {phone}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Tooltip content={address} placement="top-start">
                            <Typography className="text-xs font-normal text-blue-gray-500 max-w-[200px] truncate">
                              {address}
                            </Typography>
                          </Tooltip>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            {formatDate(createdAt)}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Menu placement="left-start">
                            <MenuHandler>
                              <IconButton
                                size="sm"
                                variant="text"
                                color="blue-gray"
                              >
                                <EllipsisVerticalIcon className="h-5 w-5" />
                              </IconButton>
                            </MenuHandler>
                            <MenuList>
                              <MenuItem
                                onClick={() =>
                                  handleOpenEdit({ id, name, phone, address })
                                }
                              >
                                <PencilSquareIcon className="h-4 w-4 mr-2 inline-block" />{" "}
                                Edit
                              </MenuItem>
                              <MenuItem
                                onClick={() => handleDeleteCustomer(id, name)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <TrashIcon className="h-4 w-4 mr-2 inline-block" />{" "}
                                Hapus
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
          {meta.total > 0 && (
            <div className="flex justify-between items-center px-5 py-3 border-t border-blue-gray-50">
              <Typography variant="small" color="blue-gray">
                Menampilkan {meta.from} - {meta.to} dari {meta.total} data
              </Typography>
              <div className="flex gap-2">
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => handleChangePage(page - 1)}
                  disabled={page === 1 || loading}
                >
                  Sebelumnya
                </Button>
                <Button variant="gradient" size="sm" disabled={loading}>
                  {page}
                </Button>
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => handleChangePage(page + 1)}
                  disabled={page === meta.last_page || loading}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <CustomerFormModal
        open={openModal}
        handleClose={handleCloseModal}
        customerData={editingCustomer}
      />
    </div>
  );
}

export default Customers;
