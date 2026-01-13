import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Select,
  Option,
  Input,
  Button,
  IconButton,
  Alert,
} from "@material-tailwind/react";
import {
  PlusIcon,
  TrashIcon,
  CalculatorIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon,
  ShoppingBagIcon,
  TagIcon,
} from "@heroicons/react/24/solid";

const API_BASE_URL = "http://localhost:4000/api/v1/transaction";

const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const initialItem = {
  package_id: "",
  qty_weight: 0,
  price_per_unit: 0,
  subtotal: 0,
  unit: "",
};

const initialFormState = {
  customer_id: "",
  drop_off_date: new Date().toISOString().slice(0, 10),
  discount_amount: 0,
  items: [{ ...initialItem }],
  payment_status: "pending",
};

export function Transactions() {
  const [dataMaster, setDataMaster] = useState({
    customers: [],
    packages: [],
    currentUserId: null,
  });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialFormState);
  const [totals, setTotals] = useState({ subtotal: 0, final_total: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setAlert(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/create-data`, {
        withCredentials: true,
      });

      const { customers, packages, currentUserId } = response.data.data;

      setDataMaster({ customers, packages, currentUserId });

      if (customers.length > 0) {
        setForm((prev) => ({
          ...prev,
          customer_id: customers[0].id.toString(),
        }));
      }
    } catch (error) {
      console.error("❌ Gagal memuat data master:", error.response || error);
      setAlert({
        type: "error",
        message:
          "Gagal memuat data pelanggan dan layanan. Pastikan BE berjalan!",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const newSubtotal = form.items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    const discount = Math.min(form.discount_amount, newSubtotal);
    const final_total_price = newSubtotal - discount;

    setTotals({
      subtotal: newSubtotal,
      final_total: Math.max(0, final_total_price),
    });

    if (discount !== form.discount_amount) {
      setForm((prev) => ({ ...prev, discount_amount: discount }));
    }
  }, [form.items, form.discount_amount]);

  const handleItemChange = (index, name, value) => {
    const updatedItems = form.items.map((item, i) => {
      if (i === index) {
        let newItem = { ...item, [name]: value };

        const selectedPackage = dataMaster.packages.find(
          (p) => p.id === parseInt(newItem.package_id)
        );

        if (name === "package_id" && selectedPackage) {
          newItem.price_per_unit = selectedPackage.price;
          newItem.unit = selectedPackage.unit;
        }

        const price = newItem.price_per_unit || 0;
        let qty = parseFloat(newItem.qty_weight) || 0;

        if (name === "qty_weight" && qty < 0.01) {
          qty = 0;
        }

        newItem.qty_weight = qty;
        newItem.subtotal = price * qty;

        return newItem;
      }
      return item;
    });

    setForm({ ...form, items: updatedItems });
  };

  const handleAddItem = () => {
    setForm({ ...form, items: [...form.items, { ...initialItem }] });
  };

  const handleRemoveItem = (index) => {
    if (form.items.length > 1) {
      setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
    }
  };

  const handleFormChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getMaxDuration = () => {
    return form.items.reduce((maxDuration, item) => {
      const selectedPackage = dataMaster.packages.find(
        (p) => p.id === parseInt(item.package_id)
      );
      const duration = selectedPackage ? selectedPackage.estimated_duration : 0;
      return Math.max(maxDuration, duration);
    }, 1);
  };

  const handleSubmit = async () => {
    if (
      !form.customer_id ||
      form.items.length === 0 ||
      form.items.some((item) => !item.package_id || item.qty_weight < 0.01)
    ) {
      setAlert({
        type: "error",
        message:
          "Mohon lengkapi Pelanggan dan minimal satu item layanan (Qty > 0.01).",
      });
      return;
    }

    if (form.discount_amount > totals.subtotal) {
      setAlert({
        type: "error",
        message: "Diskon tidak boleh melebihi Subtotal! 💰",
      });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    const payload = {
      customer_id: parseInt(form.customer_id),
      drop_off_date: form.drop_off_date,
      subtotal_before_discount: totals.subtotal,
      discount_amount: form.discount_amount,
      final_total_price: totals.final_total,
      max_duration: getMaxDuration(),
      payment_status: form.payment_status,
      user_id: 7,
      items: form.items
        .filter((item) => item.package_id && item.qty_weight > 0)
        .map((item) => ({
          package_id: parseInt(item.package_id),
          qty_weight: parseFloat(item.qty_weight),
          price_per_unit: item.price_per_unit,
          subtotal: item.subtotal,
        })),
    };

    try {
      const response = await axios.post(API_BASE_URL, payload, {
        withCredentials: true,
      });

      const invoiceCode = response.data.invoiceCode;

      setAlert({
        type: "success",
        message: `Transaksi Baru ${invoiceCode} berhasil dibuat! 🎉 Faktur siap dicetak.`,
      });

      setForm(initialFormState);
    } catch (error) {
      console.error("❌ Transaction Store Error:", error.response || error);

      let errorMsg = "Gagal menyimpan transaksi. Cek data dan koneksi API.";
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMsg = error.response.data.errors.map((err) => err.msg).join("; ");
      }

      setAlert({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Typography variant="h5" color="blue-gray">
          Memuat Data Master... 🚀
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card className="shadow-lg">
        <CardHeader
          variant="gradient"
          color="blue"
          className="mb-4 p-6 flex justify-between items-center"
        >
          <Typography
            variant="h5"
            color="white"
            className="flex items-center gap-2"
          >
            <ShoppingBagIcon className="w-6 h-6" /> Buat Transaksi Baru (POS)
          </Typography>
        </CardHeader>
        <CardBody>
          {alert && (
            <Alert
              color={alert.type === "success" ? "green" : "red"}
              className="mb-4"
            >
              {alert.message}
            </Alert>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="xl:col-span-1 border border-blue-gray-100 shadow-xl shadow-slate-400 p-4 h-fit">
              <Typography
                variant="h6"
                color="blue-gray"
                className="mb-4 flex items-center gap-2"
              >
                <UserGroupIcon className="w-5 h-5" /> Info Dasar
              </Typography>
              <div className="space-y-4">
                <Select
                  label="Pilih Pelanggan"
                  value={form.customer_id}
                  onChange={(val) => handleFormChange("customer_id", val)}
                  required
                >
                  {dataMaster.customers.map((c) => (
                    <Option key={c.id} value={c.id.toString()}>
                      {c.name} ({c.phone})
                    </Option>
                  ))}
                </Select>
                <Input
                  type="date"
                  label="Tanggal Drop Off"
                  value={form.drop_off_date}
                  onChange={(e) =>
                    handleFormChange("drop_off_date", e.target.value)
                  }
                  icon={<CalendarIcon className="w-5 h-5" />}
                  required
                />
              </div>
            </Card>

            <Card className="lg:col-span-2 border border-blue-gray-100 shadow-xl shadow-slate-400 p-4">
              <Typography
                variant="h6"
                color="blue-gray"
                className="mb-4 flex items-center gap-2"
              >
                <TagIcon className="w-5 h-5" /> Daftar Layanan
              </Typography>

              {form.items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col md:flex-row gap-3 mb-4 items-start pt-2 border-b border-blue-gray-50 last:border-b-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                    <div className="md:col-span-1">
                      <Select
                        label={`Layanan ${index + 1}`}
                        value={item.package_id}
                        onChange={(val) =>
                          handleItemChange(index, "package_id", val)
                        }
                        required
                      >
                        {dataMaster.packages.map((p) => (
                          <Option key={p.id} value={p.id.toString()}>
                            {p.name} ({formatRupiah(p.price)}/{p.unit})
                          </Option>
                        ))}
                      </Select>
                    </div>

                    <div className="md:col-span-1">
                      <Input
                        type="number"
                        label={`Qty (${item.unit || "Unit"})`}
                        value={item.qty_weight <= 0 ? "" : item.qty_weight}
                        onChange={(e) =>
                          handleItemChange(index, "qty_weight", e.target.value)
                        }
                        min="0.1"
                        step={item.unit === "KG" ? "0.1" : "1"}
                        required
                      />
                    </div>

                    <div className="md:col-span-1">
                      <Input
                        type="text"
                        label="Harga Unit"
                        value={formatRupiah(item.price_per_unit)}
                        readOnly
                        className="bg-blue-gray-50/50"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <Input
                        type="text"
                        label="Subtotal"
                        value={formatRupiah(item.subtotal)}
                        readOnly
                        className="bg-blue-gray-50/50"
                      />
                    </div>
                  </div>

                  <div className="flex-shrink-0 self-start md:mt-0">
                    <IconButton
                      variant="text"
                      color="red"
                      onClick={() => handleRemoveItem(index)}
                      disabled={form.items.length === 1}
                      className="w-full md:w-fit mt-0"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </div>
              ))}

              <Button
                variant="outlined"
                color="blue"
                size="sm"
                onClick={handleAddItem}
                className="mt-4 flex items-center gap-1 w-fit"
              >
                <PlusIcon className="h-4 w-4" /> Tambah Layanan
              </Button>
            </Card>

            <Card className="xl:col-span-3 border border-blue-gray-100 shadow-xl shadow-slate-400 p-4 mt-6">
              <Typography
                variant="h6"
                color="blue-gray"
                className="mb-4 flex items-center gap-2"
              >
                <CalculatorIcon className="w-5 h-5" /> Rincian Pembayaran
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                  <Input
                    type="number"
                    label="Diskon (Rp)"
                    value={form.discount_amount}
                    onChange={(e) =>
                      handleFormChange(
                        "discount_amount",
                        Math.max(0, parseFloat(e.target.value) || 0)
                      )
                    }
                    min="0"
                  />
                  <Select
                    label="Status Pembayaran"
                    value={form.payment_status}
                    onChange={(val) => handleFormChange("payment_status", val)}
                  >
                    <Option value="pending">Pending (Belum Bayar)</Option>
                    <Option value="paid">Paid (Sudah Bayar)</Option>
                  </Select>
                </div>

                <div className="md:col-span-1 bg-blue-gray-50 p-4 rounded-lg space-y-2 order-first md:order-none">
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Ringkasan Biaya
                  </Typography>
                  <div className="flex justify-between">
                    <Typography variant="small" color="blue-gray">
                      Subtotal
                    </Typography>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold"
                    >
                      {formatRupiah(totals.subtotal)}
                    </Typography>
                  </div>
                  <div className="flex justify-between">
                    <Typography variant="small" color="red">
                      Diskon
                    </Typography>
                    <Typography
                      variant="small"
                      color="red"
                      className="font-semibold"
                    >
                      -{formatRupiah(form.discount_amount)}
                    </Typography>
                  </div>
                  <div className="flex justify-between border-t border-blue-gray-200 pt-2">
                    <Typography variant="h5" color="black">
                      TOTAL AKHIR
                    </Typography>
                    <Typography variant="h5" color="black">
                      {formatRupiah(totals.final_total)}
                    </Typography>
                  </div>
                </div>

                <div className="md:col-span-1 flex items-end">
                  <Button
                    color="green"
                    className="w-full flex items-center justify-center gap-2 h-12"
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      totals.final_total <= 0 ||
                      !form.customer_id ||
                      form.items.some(
                        (item) => !item.package_id || item.qty_weight < 0.01
                      )
                    }
                  >
                    <CurrencyDollarIcon className="h-5 w-5" />
                    {isSubmitting
                      ? "Memproses Transaksi..."
                      : `Simpan & Cetak Faktur (${formatRupiah(
                          totals.final_total
                        )})`}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default Transactions;
