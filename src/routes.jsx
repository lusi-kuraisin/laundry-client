import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";

import { Histories, Home, Packages } from "@/pages/dashboard";
import { Transactions } from "./pages/dashboard/transactions";
import { Customers } from "./pages/dashboard/customers";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    title: "Operasional Harian",
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Dashboard",
        path: "/",
        element: <Home />,
      },
      {
        icon: <ShoppingBagIcon {...icon} />,
        name: "Transaksi Baru (POS)",
        path: "/transactions",
        element: <Transactions />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Riwayat Transaksi",
        path: "/histories",
        element: <Histories />,
      },
    ],
  },

  {
    title: "Data Master",
    layout: "dashboard",
    pages: [
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Data Pelanggan",
        path: "/customers",
        element: <Customers />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Layanan & Harga",
        path: "/packages",
        element: <Packages />,
      },
    ],
  },
];

export default routes;
