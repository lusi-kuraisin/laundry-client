import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Button,
  Input,
  Textarea,
  Alert,
  IconButton,
} from "@material-tailwind/react";
import {
  UserPlusIcon,
  XMarkIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";

const API_BASE_URL = "https://laundromat-server.vercel.app/api/v1/customer";

const initialFormState = { name: "", phone: "", address: "" };

export function CustomerFormModal({ open, handleClose, customerData }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!customerData;
  const title = isEditing ? "Edit Data Pelanggan" : "Daftarkan Pelanggan Baru";
  const icon = isEditing ? (
    <PencilSquareIcon className="h-6 w-6" />
  ) : (
    <UserPlusIcon className="h-6 w-6" />
  );
  const submitText = isEditing ? "Simpan Perubahan" : "Daftar Sekarang";

  useEffect(() => {
    if (customerData) {
      setFormData({
        name: customerData.name || "",
        phone: customerData.phone || "",
        address: customerData.address || "",
      });
    } else {
      setFormData(initialFormState);
    }
    setError(null);
  }, [customerData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!formData.name || !formData.phone) {
      setError("Nama dan Nomor Telepon wajib diisi, Sayang!");
      return;
    }

    setIsSubmitting(true);

    try {
      let response;
      let message;

      if (isEditing) {
        response = await axios.put(
          `${API_BASE_URL}/${customerData.id}`,
          formData,
          { withCredentials: true, headers: {

    "x-client-type": "web",

  }, }
        );
        message =
          response.data.message ||
          `Pelanggan ${formData.name} berhasil diupdate! ✨`;
      } else {
        response = await axios.post(API_BASE_URL, formData, {
          withCredentials: true,
          headers: {

    "x-client-type": "web",

  },
        });
        message =
          response.data.message ||
          `Pelanggan ${formData.name} berhasil ditambahkan! 💖`;
      }

      handleClose(true, message);
    } catch (err) {
      console.error(
        "❌ Error saat Submit Data Pelanggan:",
        err.response || err
      );

      let errorMsg = `Gagal ${isEditing ? "mengupdate" : "menyimpan"} data.`;
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      } else if (err.response && err.response.status === 400) {
        errorMsg = "Data yang Anda masukkan tidak valid atau ada yang kurang.";
      }

      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} handler={() => handleClose()} size="sm">
      <DialogHeader className="flex justify-between border-b border-blue-gray-100 pb-3">
        <Typography
          variant="h5"
          color="blue-gray"
          className="flex items-center gap-2"
        >
          {icon} {title}
        </Typography>
        <IconButton
          variant="text"
          color="blue-gray"
          onClick={() => handleClose()}
        >
          <XMarkIcon className="h-6 w-6" />
        </IconButton>
      </DialogHeader>

      <DialogBody divider>
        {error && (
          <Alert color="red" className="mb-4">
            {error}
          </Alert>
        )}
        <div className="space-y-4">
          <Input
            label="Nama Lengkap"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <Input
            label="Nomor Telepon"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <Textarea
            label="Alamat Lengkap"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
      </DialogBody>

      <DialogFooter>
        <Button
          variant="text"
          color="red"
          onClick={() => handleClose()}
          className="mr-1"
          disabled={isSubmitting}
        >
          <span>Batal</span>
        </Button>
        <Button
          variant="gradient"
          color="green"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Loading..." : submitText}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
