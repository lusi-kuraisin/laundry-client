// ./TransactionDetailModal.jsx

import React from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Button,
  Chip,
  Card,
  CardBody,
  IconButton,
} from "@material-tailwind/react";
import {
  XMarkIcon,
  TruckIcon,
  UserIcon,
  TagIcon,
  ScaleIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

// Helper untuk format Rupiah
const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper untuk status chip
const getStatusChipProps = (status) => {
  switch (status) {
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
      return { color: "blue", label: status };
  }
};

export function TransactionDetailModal({ open, handleOpen, transaction }) {
  if (!transaction) return null;

  return (
    <Dialog open={open} handler={handleOpen} size="lg" className="p-4">
      <DialogHeader className="flex justify-between border-b border-blue-gray-100 pb-3">
        <Typography variant="h5" color="blue-gray">
          Detail Transaksi: {transaction.invoice_code}
        </Typography>
        <IconButton variant="text" color="blue-gray" onClick={handleOpen}>
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </DialogHeader>

      <DialogBody divider className="max-h-[70vh] overflow-y-auto">
        {/* Status Section */}
        <div className="flex justify-between items-center mb-6 p-3 bg-blue-gray-50 rounded-lg">
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold uppercase mb-1 flex items-center gap-1"
            >
              <TruckIcon className="h-4 w-4" /> Status Cucian
            </Typography>
            <Chip
              variant="gradient"
              color={getStatusChipProps(transaction.laundry_status).color}
              value={getStatusChipProps(transaction.laundry_status).label}
              className="py-0.5 px-2 text-sm font-medium w-fit"
            />
          </div>
          <div>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-semibold uppercase mb-1 flex items-center gap-1"
            >
              <CreditCardIcon className="h-4 w-4" /> Status Pembayaran
            </Typography>
            <Chip
              variant="gradient"
              color={getStatusChipProps(transaction.payment_status).color}
              value={getStatusChipProps(transaction.payment_status).label}
              className="py-0.5 px-2 text-sm font-medium w-fit"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informasi Pelanggan & Waktu */}
          <div>
            <Typography
              variant="h6"
              color="blue-gray"
              className="mb-3 flex items-center gap-1"
            >
              <UserIcon className="h-5 w-5" /> Info Pelanggan & Waktu
            </Typography>
            <ul className="list-disc ml-5 text-sm space-y-2">
              <li>
                <b>Nama:</b> {transaction.customer.name}
              </li>
              <li>
                <b>Telepon:</b> {transaction.customer.phone}
              </li>
              <li>
                <b>Alamat:</b> {transaction.customer.address}
              </li>
              <li>
                <b>Masuk:</b> {transaction.drop_off_date}
              </li>
              <li>
                <b>Estimasi Selesai:</b> {transaction.estimated_pickup_date}
              </li>
              {transaction.actual_pickup_date && (
                <li>
                  <b>Diambil:</b> {transaction.actual_pickup_date}
                </li>
              )}
            </ul>
          </div>

          {/* Detail Item Layanan */}
          <div>
            <Typography
              variant="h6"
              color="blue-gray"
              className="mb-3 flex items-center gap-1"
            >
              <TagIcon className="h-5 w-5" /> Item Layanan
            </Typography>
            <Card className="shadow-none border border-blue-gray-100">
              <CardBody className="p-4">
                {transaction.details.map((detail, index) => (
                  <div
                    key={index}
                    className="mb-2 pb-2 border-b border-blue-gray-50 last:border-b-0"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-bold"
                    >
                      {detail.package.name}
                    </Typography>
                    <div className="flex justify-between text-xs text-blue-gray-600">
                      <span>
                        {detail.qty_weight} Kg @{" "}
                        {formatRupiah(detail.package.price)}
                      </span>
                      <span className="font-semibold">
                        {formatRupiah(detail.subtotal)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Rincian Pembayaran */}
        <Card className="mt-6 border-2 border-blue-500/50 shadow-md">
          <CardBody className="p-4">
            <Typography
              variant="h6"
              color="blue"
              className="mb-3 flex items-center gap-1"
            >
              <ScaleIcon className="h-5 w-5" /> Rincian Pembayaran
            </Typography>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <Typography variant="small" color="blue-gray">
                  Subtotal
                </Typography>
                <Typography variant="small" color="blue-gray">
                  {formatRupiah(transaction.subtotal)}
                </Typography>
              </div>
              <div className="flex justify-between">
                <Typography variant="small" color="red">
                  Diskon
                </Typography>
                <Typography variant="small" color="red">
                  -{formatRupiah(transaction.discount_amount)}
                </Typography>
              </div>
              <div className="flex justify-between border-t pt-2 border-blue-gray-200">
                <Typography variant="h5" color="black">
                  TOTAL AKHIR
                </Typography>
                <Typography variant="h5" color="black">
                  {formatRupiah(transaction.total_price)}
                </Typography>
              </div>
            </div>
          </CardBody>
        </Card>
      </DialogBody>

      <DialogFooter>
        <Button variant="gradient" color="blue" onClick={handleOpen}>
          <span>Tutup Detail</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
