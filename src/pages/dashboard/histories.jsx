import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  IconButton,
  Button,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  CurrencyDollarIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { TransactionDetailModal } from "@/widgets/modals/transaction-detail-modal";

const API_BASE_URL = "https://laundromat-server.vercel.app/api/v1/transaction";

const getStatusChipProps = (status) => {
  switch (status) {
    case "new":
      return { color: "blue", label: "Baru Masuk" };
    case "processing":
      return { color: "orange", label: "Diproses" };
    case "done":
      return { color: "green", label: "Selesai Cuci" };
    case "taken":
      return { color: "red", label: "Sudah Diambil" };
    case "pending":
      return { color: "red", label: "Belum Bayar" };
    case "paid":
      return { color: "green", label: "Lunas" };
    default:
      return { color: "gray", label: status };
  }
};

const fetchTransactions = async (params = {}) => {
  try {
    const response = await axios.get(API_BASE_URL, {
      params,
      withCredentials: true,
      headers: {

    "x-client-type": "web",

  },
    });

    return response.data;
  } catch (error) {
    console.error("Gagal memuat transaksi:", error);
    throw new Error("Gagal mengambil data riwayat.");
  }
};

const fetchTransactionDetail = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`, {
      withCredentials: true,
      headers: {

    "x-client-type": "web",

  },
    });
    return response.data.data;
  } catch (error) {
    console.error(`Gagal memuat detail transaksi ID ${id}:`, error);
    throw new Error("Gagal mengambil detail transaksi.");
  }
};

const updateTransactionStatusAPI = async (id, type, value) => {
  let url = `${API_BASE_URL}/status/${id}`;
  let payload = { status: value };

  if (type === "payment") {
    url = `${API_BASE_URL}/payment/${id}`;
    payload = { payment_status: value };
  }

  try {
    const response = await axios.put(url, payload, { withCredentials: true, headers: {

    "x-client-type": "web",

  }, });
    return response.data.data;
  } catch (error) {
    console.error(
      `Gagal mengupdate status ${type}:`,
      error.response?.data || error
    );
    throw new Error(`Gagal mengupdate status ${type}.`);
  }
};

export function Histories() {
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchTransactions({
        page: currentPage,
        limit: 15,
      });

      setTransactions(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChangePage = (newPage) => {
    if (newPage >= 1 && newPage <= meta.last_page) {
      setCurrentPage(newPage);
    }
  };

  const handleUpdateStatus = async (id, type, newStatus) => {
    setLoading(true);
    try {
      await updateTransactionStatusAPI(id, type, newStatus);

      setTransactions((prevTransactions) =>
        prevTransactions.map((tx) =>
          tx.id === id
            ? {
                ...tx,
                [type === "laundry" ? "laundry_status" : "payment_status"]:
                  newStatus,
              }
            : tx
        )
      );

      console.log(`Status berhasil diubah menjadi ${newStatus}! 🎉`);
    } catch (error) {
      console.error(`Gagal mengubah status ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (id) => {
    setLoading(true);

    try {
      const detail = await fetchTransactionDetail(id);

      setSelectedTransaction(detail);
      setOpenDetail(true);
    } catch (error) {
      console.error("Gagal membuka detail modal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
    setSelectedTransaction(null);
  };

  if (loading) {
    return (
      <div className="mt-12 text-center p-8">
        <Typography variant="h5" color="blue-gray">
          Memuat Riwayat Transaksi... 🧺 Tunggu sebentar ya, Sayang!
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-6">
          <Typography
            variant="h6"
            color="white"
            className="flex items-center gap-2"
          >
            <TagIcon className="w-5 h-5" /> Riwayat Transaksi ({meta.total || 0}{" "}
            Total)
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[1000px] table-auto">
            <thead>
              <tr>
                {[
                  "Invoice & Pelanggan",
                  "Kasir & Tanggal",
                  "Status Cucian",
                  "Status Bayar",
                  "Total Bayar",
                  "Aksi",
                ].map((el) => (
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
              {transactions.length > 0 ? (
                transactions.map(
                  (
                    {
                      id,
                      invoice_code,
                      customer,
                      cashier,
                      total_price,
                      drop_off_date,
                      estimated_pickup_date,
                      laundry_status,
                      payment_status,
                    },
                    key
                  ) => {
                    const className = `py-3 px-5 ${
                      key === transactions.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    const statusCucian = getStatusChipProps(laundry_status);
                    const statusBayar = getStatusChipProps(payment_status);

                    return (
                      <tr key={id}>
                        <td className={className}>
                          <div className="flex flex-col">
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {invoice_code}
                            </Typography>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {customer.name} ({customer.phone})
                            </Typography>
                          </div>
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {cashier.name}
                          </Typography>
                          <Typography className="text-xs font-normal text-blue-gray-500">
                            Masuk: {drop_off_date} | Estimasi Ambil:{" "}
                            {estimated_pickup_date}
                          </Typography>
                        </td>

                        <td className={className}>
                          <Chip
                            variant="gradient"
                            color={statusCucian.color}
                            value={statusCucian.label}
                            className="py-0.5 px-2 text-[11px] font-medium w-fit"
                            icon={
                              laundry_status === "taken" ? (
                                <CheckCircleIcon className="h-4 w-4" />
                              ) : (
                                <ClockIcon className="h-4 w-4" />
                              )
                            }
                          />
                        </td>

                        <td className={className}>
                          <Chip
                            variant="gradient"
                            color={statusBayar.color}
                            value={statusBayar.label}
                            className="py-0.5 px-2 text-[11px] font-medium w-fit"
                            icon={<CurrencyDollarIcon className="h-4 w-4" />}
                          />
                        </td>

                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            Rp{" "}
                            {new Intl.NumberFormat("id-ID").format(total_price)}
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
                            <MenuList className="z-50">
                              <MenuItem onClick={() => handleOpenDetail(id)}>
                                Detail Transaksi
                              </MenuItem>

                              <Typography
                                variant="small"
                                className="p-2 font-bold text-blue-gray-700 mt-2"
                              >
                                Ubah Status Cucian
                              </Typography>
                              {["new", "processing", "done", "taken"].map(
                                (status) => (
                                  <MenuItem
                                    key={`laundry-${status}`}
                                    disabled={
                                      laundry_status === status || loading
                                    }
                                    onClick={() =>
                                      handleUpdateStatus(id, "laundry", status)
                                    }
                                    className={
                                      laundry_status === status
                                        ? "bg-gray-100 italic"
                                        : ""
                                    }
                                  >
                                    {getStatusChipProps(status).label}
                                  </MenuItem>
                                )
                              )}

                              <Typography
                                variant="small"
                                className="p-2 font-bold text-blue-gray-700 mt-2"
                              >
                                Ubah Status Bayar
                              </Typography>
                              {["pending", "paid"].map((status) => (
                                <MenuItem
                                  key={`payment-${status}`}
                                  disabled={
                                    payment_status === status || loading
                                  }
                                  onClick={() =>
                                    handleUpdateStatus(id, "payment", status)
                                  }
                                  className={
                                    payment_status === status
                                      ? "bg-gray-100 italic"
                                      : ""
                                  }
                                >
                                  {getStatusChipProps(status).label}
                                </MenuItem>
                              ))}
                            </MenuList>
                          </Menu>
                          <Button
                            variant="text"
                            size="sm"
                            className="ml-2 text-xs"
                            onClick={() => handleOpenDetail(id)}
                            disabled={loading}
                          >
                            Detail
                          </Button>
                        </td>
                      </tr>
                    );
                  }
                )
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    <Typography className="font-normal text-blue-gray-500">
                      Ups! Belum ada riwayat transaksi yang ditemukan. 😔
                    </Typography>
                  </td>
                </tr>
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
                  onClick={() => handleChangePage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Sebelumnya
                </Button>
                <Button variant="gradient" size="sm" disabled={loading}>
                  {currentPage}
                </Button>
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => handleChangePage(currentPage + 1)}
                  disabled={currentPage === meta.last_page || loading}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {selectedTransaction && (
        <TransactionDetailModal
          open={openDetail}
          handleOpen={handleCloseDetail}
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
}
