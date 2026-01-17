import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Alert, Button, Typography } from "@material-tailwind/react";
import { Card, CardBody, Input, Checkbox } from "@material-tailwind/react";
import {
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/context";

const BASE_API_URL = "https://laundromat-server.vercel.app/api/v1";

const CustomPasswordInput = ({ value, onChange, name }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        name={name}
        label="Password"
        size="lg"
        className="pr-10"
        color="blue"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
      >
        {showPassword ? (
          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
        ) : (
          <EyeIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>
    </div>
  );
};

function AuthFormContent({ redirectTo }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const auth = useAuth();

  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    if (alert) setAlert(null);

    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert(null);

    try {
      const response = await axios.post(
        `${BASE_API_URL}/auth/login`,
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true, headers: {

    "x-client-type": "web",

  }, }
      );

      const user = response.data.user;

      auth.login(user);

      setAlert({
        type: "success",
        message: `Welcome back, ${user.name || formData.email}! Redirecting...`,
      });

      setTimeout(() => {
        navigate(redirectTo || "/", { replace: true });
      }, 500);
    } catch (error) {
      console.error("Login Failed:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Login gagal. Periksa email dan password kamu.";

      setAlert({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {alert && (
        <Alert
          color={alert.type === "success" ? "green" : "red"}
          className="mb-4"
        >
          <Typography className="font-medium">{alert.message}</Typography>
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <Input
            type="email"
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            required
            size="lg"
            color="blue"
          />
        </div>

        <div className="relative">
          <CustomPasswordInput
            value={formData.password}
            onChange={handleChange}
            name="password"
            required
          />

          <Link
            to="/forgot-password"
            className="text-end text-xs font-medium text-blue-600 hover:text-blue-800 block mt-2"
          >
            Forgot?
          </Link>
        </div>

        <div className="flex items-center pt-2">
          <Checkbox id="remember-me" label="Remember me" color="blue" />
        </div>

        <Button
          type="submit"
          className="w-full rounded-lg py-2 shadow-md flex items-center justify-center gap-2 bg-gradient-to-tr from-blue-600 via-blue-500 to-blue-400"
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          )}
          SIGN IN
        </Button>
      </form>
    </>
  );
}

export function SignIn() {
  return (
    <>
      <div className="relative flex min-h-screen flex-col bg-gray-100 font-sans">
        <div
          className="mx-5 mt-5 h-[30vh] overflow-hidden rounded-2xl bg-cover bg-center md:h-[40vh]"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("/img/laundry.jpg")`,
          }}
        >
          <header className="relative z-10 p-6 text-2xl font-bold text-white">
            Rama Laundromat
          </header>
        </div>

        <div className="relative z-20 mt-[-100px] flex justify-center px-4 md:mt-[-120px]">
          <Card className="w-full max-w-sm rounded-xl p-0 shadow-2xl md:max-w-md">
            <div className="relative mx-5 -mt-16 flex justify-center rounded-xl p-5 text-center text-white shadow-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-blue-400">
              <img src="/img/logo.png" alt="" className="w-24" />
            </div>

            <CardBody className="space-y-6 pt-10">
              <AuthFormContent />

              <p className="mt-4 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="#"
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  Sign up
                </Link>
              </p>
            </CardBody>
          </Card>
        </div>

        <footer className="mt-auto py-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()}, made with 💖 by Lusi for a better
          web.
        </footer>
      </div>
    </>
  );
}
