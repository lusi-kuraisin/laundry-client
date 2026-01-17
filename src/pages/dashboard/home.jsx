import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Progress,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { ClockIcon, TagIcon } from "@heroicons/react/24/solid";

import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";

import {
  getChartsDataStructure,
  getChartConfig,
} from "@/data/statistic-charts-config";

const API_BASE_URL = "https://laundromat-server.vercel.app/api/v1";

const initialDashboardData = {
  stats: [
    {
      color: "green",
      icon: CurrencyDollarIcon,
      title: "Pendapatan Hari Ini",
      value: "Rp 0",
      footer: { color: "text-blue-gray-600", value: "0%", label: "vs kemarin" },
    },
    {
      color: "pink",
      icon: ShoppingBagIcon,
      title: "Order Baru Hari Ini",
      value: "0",
      footer: {
        color: "text-blue-gray-600",
        value: "0",
        label: "total order hari ini",
      },
    },
    {
      color: "blue",
      icon: UsersIcon,
      title: "Total Pelanggan",
      value: "0",
      footer: {
        color: "text-blue-gray-600",
        value: "0",
        label: "pelanggan terdaftar",
      },
    },
    {
      color: "orange",
      icon: CheckBadgeIcon,
      title: "Order Aktif Diproses",
      value: "0",
      footer: {
        color: "text-blue-gray-600",
        value: "0%",
        label: "dari total order",
      },
    },
  ],
  ordersInProcess: [],
  recentActivities: [],
  charts: getChartsDataStructure(),
};

const formatRupiah = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);

const getProgressAndColor = (status) => {
  switch (status) {
    case "new":
      return { progress: 25, statusText: "Order Baru", statusColor: "blue" };
    case "processing":
      return { progress: 60, statusText: "Sedang Cuci", statusColor: "orange" };
    case "done":
      return { progress: 95, statusText: "Siap Ambil", statusColor: "green" };
    case "taken":
      return {
        progress: 100,
        statusText: "Sudah Diambil",
        statusColor: "gray",
      };
    default:
      return { progress: 0, statusText: "Unknown", statusColor: "gray" };
  }
};

export function Home() {
  const [data, setData] = useState(initialDashboardData);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
        withCredentials: true,
        headers: {
          "X-Client-Type": "web",
        },
      });
      const recentOrdersResponse = await axios.get(
        `${API_BASE_URL}/transaction`,
        {
          params: {
            limit: 5,
            status_in: ["new", "processing"],
          },
          withCredentials: true,
          headers: {
            "X-Client-Type": "web",
          },
        }
      );
      const recentActivityResponse = await axios.get(
        `${API_BASE_URL}/transaction`,
        {
          params: { limit: 4 },
          withCredentials: true,
          headers: {
            "X-Client-Type": "web",
          },
        }
      );

      const backendStats = statsResponse.data.data;

      const mappedStats = [
        {
          color: "green",
          icon: CurrencyDollarIcon,
          title: "Pendapatan Hari Ini",
          value: formatRupiah(backendStats.totalRevenueToday || 0),
          footer: {
            color:
              backendStats.revenueChangePercent > 0
                ? "text-green-500"
                : "text-red-500",
            value: `${backendStats.revenueChangePercent >= 0 ? "+" : ""}${
              backendStats.revenueChangePercent || 0
            }%`,
            label: "vs kemarin",
          },
        },
        {
          color: "pink",
          icon: ShoppingBagIcon,
          title: "Order Baru Hari Ini",
          value: `${backendStats.newOrdersToday || 0}`,
          footer: {
            color: "text-blue-gray-600",
            value: `${backendStats.newOrdersToday || 0}`,
            label: "total order hari ini",
          },
        },
        {
          color: "blue",
          icon: UsersIcon,
          title: "Total Pelanggan",
          value: `${backendStats.totalCustomers || 0}`,
          footer: {
            color: "text-blue-gray-600",
            value: `${backendStats.totalCustomers || 0}`,
            label: "pelanggan terdaftar",
          },
        },
        {
          color: "orange",
          icon: CheckBadgeIcon,
          title: "Order Aktif Diproses",
          value: `${backendStats.totalProcessingOrders || 0}`,
          footer: {
            color: "text-blue-gray-600",
            value: `${(backendStats.processingPercentage || 0).toFixed(0)}%`,
            label: "dari total order",
          },
        },
      ];

      const mappedOrdersInProcess = recentOrdersResponse.data.data.map((tx) => {
        const progressData = getProgressAndColor(tx.laundry_status);

        const serviceName =
          tx.details && tx.details.length > 0
            ? tx.details[0].package.name
            : "N/A";
        const weight =
          tx.details && tx.details.length > 0 ? tx.details[0].qty_weight : 0;

        return {
          id: tx.invoice_code,
          customer: tx.customer.name,
          service: serviceName,
          weight: `${weight} Kg`,
          progress: progressData.progress,
          statusColor: progressData.statusColor,
        };
      });

      const mappedActivities = recentActivityResponse.data.data.map((tx) => ({
        color:
          tx.laundry_status === "taken" ? "text-green-500" : "text-blue-500",
        icon: tx.laundry_status === "taken" ? CheckBadgeIcon : ShoppingBagIcon,
        title: `Order #${tx.invoice_code}`,
        status: getProgressAndColor(tx.laundry_status).statusText,
        time: new Date(tx.createdAt).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setData((prev) => ({
        ...prev,
        stats: mappedStats,
        ordersInProcess: mappedOrdersInProcess,
        recentActivities: mappedActivities,
      }));
    } catch (error) {
      console.error(
        "❌ Gagal memuat data statistik dashboard:",
        error.response || error
      );
    }
  };

  const fetchDashboardCharts = async () => {
    try {
      const chartsResponse = await axios.get(
        `${API_BASE_URL}/dashboard/charts`,
        {
          withCredentials: true,
          headers: {
            "X-Client-Type": "web",
          },
        }
      );
      const backendCharts = chartsResponse.data.data;

      const mappedCharts = getChartsDataStructure(
        getChartConfig(
          "bar",
          backendCharts.weeklyOrders.data,
          backendCharts.weeklyOrders.categories,
          "Orders"
        ),

        getChartConfig(
          "line",
          backendCharts.monthlyRevenue.data,
          backendCharts.monthlyRevenue.categories,
          "Revenue"
        ),

        getChartConfig(
          "line",
          backendCharts.monthlyWeight.data,
          backendCharts.monthlyWeight.categories,
          "Weight (Kg)"
        )
      );

      setData((prev) => ({
        ...prev,
        charts: mappedCharts,
      }));
    } catch (error) {
      console.error("❌ Gagal memuat data charts:", error.response || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchDashboardCharts();
  }, []);

  if (loading) {
    return (
      <div className="mt-12 text-center p-8">
        <Typography variant="h5" color="blue-gray">
          Memuat Dashboard Data... 💡 Tunggu sebentar ya!
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>

      <hr className="my-8 border-blue-gray-50" />

      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {data.charts.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon
                  strokeWidth={2}
                  className="h-4 w-4 text-blue-gray-400"
                />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>

      <hr className="my-8 border-blue-gray-50" />

      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-xl shadow-slate-400">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Order Sedang Diproses ({data.ordersInProcess.length})
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <TagIcon
                  strokeWidth={3}
                  className="h-4 w-4 text-blue-gray-200"
                />
                Daftar cucian aktif di tahapan 'Baru' atau 'Diproses'.
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Lihat Semua Order</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Order ID", "Pelanggan", "Layanan", "Status Proses"].map(
                    (el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-6 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-medium uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {data.ordersInProcess.length > 0 ? (
                  data.ordersInProcess.map(
                    (
                      { id, customer, service, progress, statusColor, weight },
                      key
                    ) => {
                      const className = `py-3 px-5 ${
                        key === data.ordersInProcess.length - 1
                          ? ""
                          : "border-b border-blue-gray-50"
                      }`;

                      return (
                        <tr key={id}>
                          <td className={className}>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {id}
                            </Typography>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-400"
                            >
                              {weight}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {customer}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {service}
                            </Typography>
                          </td>
                          <td className={className}>
                            <div className="w-10/12">
                              <Typography
                                variant="small"
                                className="mb-1 block text-xs font-medium text-blue-gray-600"
                              >
                                {progress >= 90
                                  ? "Siap Ambil"
                                  : `${progress}% Selesai`}
                              </Typography>
                              <Progress
                                value={progress}
                                variant="gradient"
                                color={statusColor}
                                className="h-1"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center">
                      <Typography className="font-normal text-blue-gray-500">
                        Tidak ada order aktif yang sedang diproses. Santai! 😌
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-xl shadow-slate-400">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Aktivitas Transaksi Terakhir
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              <ArrowTrendingUpIcon
                strokeWidth={3}
                className="h-3.5 w-3.5 text-green-500"
              />
              Peningkatan order **24%** dibanding bulan lalu 📈
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {data.recentActivities.length > 0 ? (
              data.recentActivities.map(
                ({ icon, color, title, status, time }, key) => (
                  <div
                    key={title + key}
                    className="flex items-start gap-4 py-3"
                  >
                    <div
                      className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                        key === data.recentActivities.length - 1
                          ? "after:h-0"
                          : "after:h-4/6"
                      }`}
                    >
                      {React.createElement(icon, {
                        className: `!w-5 !h-5 ${color}`,
                      })}
                    </div>
                    <div>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="block font-medium"
                      >
                        {title}
                      </Typography>
                      <Typography
                        as="span"
                        variant="small"
                        className="text-xs font-medium text-blue-gray-500"
                      >
                        {status} • {time}
                      </Typography>
                    </div>
                  </div>
                )
              )
            ) : (
              <Typography className="font-normal text-blue-gray-500 py-4">
                Belum ada aktivitas transaksi baru. 💤
              </Typography>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
