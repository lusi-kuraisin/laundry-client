import { useLocation, Link } from "react-router-dom";
import { Navbar, Typography, Breadcrumbs } from "@material-tailwind/react";

export function DashboardNavbar() {
  const { pathname } = useLocation();
  const path = pathname.slice(1);

  return (
    <Navbar
      color="white"
      className="sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
      fullWidth
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Breadcrumbs className={`bg-transparent p-0 transition-all mt-1`}>
            <Link to="/">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                Dashboard
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              {path}
            </Typography>
          </Breadcrumbs>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
