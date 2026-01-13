import { chartsConfig } from "@/configs";

export const getChartConfig = (type, seriesData, categoriesData, name) => {
  const options = {
    ...chartsConfig,
    xaxis: {
      ...chartsConfig.xaxis,
      categories: categoriesData,
    },

    colors: type === "bar" ? "#388e3c" : "#0288d1",
    plotOptions:
      type === "bar"
        ? {
            bar: {
              columnWidth: "16%",
              borderRadius: 5,
            },
          }
        : {},
    stroke:
      type === "line"
        ? {
            lineCap: "round",
          }
        : {},
    markers:
      type === "line"
        ? {
            size: 5,
          }
        : {},
  };

  return {
    type: type,
    height: 220,
    series: [
      {
        name: name,
        data: seriesData,
      },
    ],
    options: options,
  };
};

export const getChartsDataStructure = (
  weeklyOrdersChart = getChartConfig(
    "bar",
    [0, 0, 0, 0, 0, 0, 0],
    ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    "Orders"
  ),
  monthlyRevenueChart = getChartConfig(
    "line",
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ],
    "Revenue"
  ),
  monthlyWeightChart = getChartConfig(
    "line",
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ],
    "Weight (Kg)"
  )
) => [
  {
    color: "white",
    title: "Volume Order Mingguan",
    description: "Perbandingan jumlah order (masuk) harian.",
    footer: "diperbarui setiap hari",
    chart: weeklyOrdersChart,
  },
  {
    color: "white",
    title: "Tren Pendapatan Bulanan",
    description: "Perkembangan pendapatan lunas 12 bulan terakhir.",
    footer: "diperbarui setiap bulan",
    chart: monthlyRevenueChart,
  },
  {
    color: "white",
    title: "Volume Berat (Kg) Bulanan",
    description: "Total berat cucian yang diproses 12 bulan terakhir.",
    footer: "diperbarui setiap bulan",
    chart: monthlyWeightChart,
  },
];
