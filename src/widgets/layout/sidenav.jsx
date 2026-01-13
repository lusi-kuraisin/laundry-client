import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import {
  PowerIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "@/context";

export function Sidenav({ brandImg, brandName, routes }) {
  const navigate = useNavigate();
  const auth = useAuth();

  const [openDialog, setOpenDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    handleCloseDialog();

    await auth.logout();

    setIsLoggingOut(false);

    navigate("/auth/sign-in", { replace: true });
  };

  return (
    <aside
      className={`fixed inset-0 z-50 h-screen w-72 transition-transform duration-300 xl:translate-x-0 bg-[#1e293b]`}
    >
      <div className={`relative`}>
        <Link to="/" className="py-6 px-8 text-center flex items-center gap-5">
          <img src={brandImg} className="w-10" />
          <Typography variant="h6" color="white">
            {brandName}
          </Typography>
        </Link>
      </div>
      <div className="m-4">
        {routes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  className="font-black uppercase opacity-75 text-slate-100"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.map(({ icon, name, path }) => (
              <li key={name}>
                <NavLink to={`${path}`}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={isActive ? "blue" : "blue-gray"}
                      className={`flex items-center gap-4 px-4 capitalize text-slate-500 hover:text-slate-200 ${
                        isActive ? "text-slate-200" : ""
                      }`}
                      fullWidth
                    >
                      {icon}
                      <Typography
                        color="inherit"
                        className="font-medium capitalize"
                      >
                        {name}
                      </Typography>
                    </Button>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        ))}

        <ul className="mb-4 flex flex-col gap-1">
          <li className="mx-3.5 mt-4 mb-2">
            <Typography
              variant="small"
              className="font-black uppercase opacity-75 text-slate-100"
            >
              Sistem
            </Typography>
          </li>
          <li>
            <Button
              onClick={handleOpenDialog}
              variant="text"
              color="blue-gray"
              className="flex items-center gap-4 px-4 capitalize text-slate-500 hover:text-slate-200"
              fullWidth
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <PowerIcon className="w-5 h-5 text-inherit" />
              )}
              <Typography color="inherit" className="font-medium capitalize">
                {isLoggingOut ? "Processing..." : "Logout"}
              </Typography>
            </Button>
          </li>
        </ul>
      </div>

      <Dialog open={openDialog} handler={handleCloseDialog} size="xs">
        <DialogHeader className="flex items-center gap-2 text-red-600">
          <ExclamationTriangleIcon className="w-6 h-6" />
          Konfirmasi Logout
        </DialogHeader>
        <DialogBody divider>
          <Typography className="font-normal text-gray-700">
            Yakin ingin keluar dari akun ini? Kamu akan diarahkan kembali ke
            halaman login.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="blue-gray"
            onClick={handleCloseDialog}
            className="mr-1"
          >
            <span>Batal</span>
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={confirmLogout}
            disabled={isLoggingOut}
          >
            <span>{isLoggingOut ? "Keluar..." : "Ya, Logout"}</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "Material Tailwind React",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
