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
  Select,
  Option,
  Switch,
  IconButton,
} from "@material-tailwind/react";
import {
  UserPlusIcon,
  XMarkIcon,
  PencilSquareIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";

const API_BASE_URL = "http://localhost:4000/api/v1/package";
const initialFormState = {
  name: "",
  description: "",
  unit: "kg",
  price: 0,
  estimated_duration: 1,
  is_active: true,
};

export function PackageFormModal({ open, handleClose, packageData }) {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!packageData;
  const title = isEditing ? "Edit Paket Layanan" : "Buat Paket Layanan Baru";
  const icon = isEditing ? (
    <PencilSquareIcon className="h-6 w-6" />
  ) : (
    <TruckIcon className="h-6 w-6" />
  );
  const submitText = isEditing ? "Simpan Perubahan" : "Daftar Paket";

  useEffect(() => {
    if (packageData) {
      setFormData({
        name: packageData.name || "",
        description: packageData.description || "",
        unit: packageData.unit || "kg",

        price: packageData.price ? parseFloat(packageData.price).toFixed(2) : 0,
        estimated_duration: packageData.estimated_duration || 1,
        is_active:
          packageData.is_active !== undefined ? packageData.is_active : true,
      });
    } else {
      setFormData(initialFormState);
    }
    setError(null);
  }, [packageData, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({ ...prev, unit: value }));
  };

  const handleSwitchChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      is_active: e.target.checked,
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (
      !formData.name ||
      !formData.unit ||
      parseFloat(formData.price) <= 0 ||
      parseInt(formData.estimated_duration) <= 0
    ) {
      setError(
        "Nama, Satuan, Harga, dan Durasi wajib diisi dengan nilai yang valid! 🤯"
      );
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      estimated_duration: parseInt(formData.estimated_duration),
    };

    try {
      let response;
      let message;

      if (isEditing) {
        response = await axios.put(
          `${API_BASE_URL}/${packageData.id}`,
          payload,
          { withCredentials: true }
        );
        message =
          response.data.message ||
          `Paket ${formData.name} berhasil diupdate! 🔄`;
      } else {
        response = await axios.post(API_BASE_URL, payload, {
          withCredentials: true,
        });
        message =
          response.data.message ||
          `Paket ${formData.name} berhasil ditambahkan! ✨`;
      }

      handleClose(true, message);
    } catch (err) {
      console.error("❌ Error saat Submit Data Paket:", err.response || err);

      let errorMsg = `Gagal ${isEditing ? "mengupdate" : "menyimpan"} data.`;
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = err.response.data.message;
      } else if (err.response && err.response.status === 400) {
        errorMsg =
          "Data yang Anda masukkan tidak valid. Periksa kembali input Anda.";
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
            label="Nama Paket (cth: Cuci Kering Ekspres)"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
          <Textarea
            label="Deskripsi (cth: Selesai dalam 1 hari, gratis pewangi premium)"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Harga Jual (Rp)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="1000"
              required
              disabled={isSubmitting}
            />

            <Select
              label="Satuan (Unit BE)"
              value={formData.unit}
              onChange={handleSelectChange}
              required
              disabled={isSubmitting}
            >
              <Option value="kg">KG (Kilogram)</Option>
              <Option value="pcs">PCS (Potong)</Option>
              <Option value="item">ITEM (Unit/Bed Cover, dll)</Option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Estimasi Durasi (Hari)"
              name="estimated_duration"
              type="number"
              value={formData.estimated_duration}
              onChange={handleChange}
              min="1"
              required
              disabled={isSubmitting}
            />

            <div className="flex items-center justify-end h-full">
              <Switch
                id="is_active"
                name="is_active"
                label={
                  <Typography color="blue-gray" className="font-medium">
                    Status: {formData.is_active ? "Aktif" : "Nonaktif"}
                  </Typography>
                }
                checked={formData.is_active}
                onChange={handleSwitchChange}
                ripple={true}
                disabled={isSubmitting}
              />
            </div>
          </div>
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
