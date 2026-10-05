import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

interface formLogin {
  email: string;
  password: string;
}

export default function App() {
  const navigate = useNavigate();
  const [form, setForm] = useState<formLogin>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (event: any) => {
    //event - adalah event listener
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios({
        method: "POST",
        url: "http://192.168.101.4:8000/api/auth/login",
        data: form,
      });
      const { token, user } = response.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));

      toast.success("Login success");

      const role = user.role?.name?.toLowerCase()?.trim();
      switch (role) {
        case "admin":
          navigate("/admin/dashboard");
          break;

        case "kasir":
          navigate("/cashier/payment-verification");
          break;

        case "dapur":
          navigate("/kitchen/live-order");
          break;

        default:
          navigate("/");
          break;
      }
    } catch (error: any) {
      console.log(error, "error");
      toast.error(error?.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };
  console.log(form, "form");

  return (
    <>
      <div className="flex h-screen justify-center">
        {/* left */}
        <div className="">
          <div className=" lg:mx-32 mx-4 p-8 rounded-xl">
            <h1 className="flex text-4xl text-left mb-4 text-blue-900 font-bold">
              Log in
            </h1>
            <p className="text-gray-400">
              Please enter your email and password
            </p>

            <div className="text-black flex flex-col gap-4">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className="border border-gray-400 p-2 w-full rounded-xl"
              />
            </div>

            <div className="text-black flex flex-col gap-4 mt-2">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                className="border border-gray-400 p-2 w-full rounded-xl"
              />
            </div>

            {/* <p className='text-gray-500 text-xs mt-4'>Don't have an account?</p>
            <span className="text-blue-800 cursor-pointer" onClick={() => navigate("/register")}>Register</span> */}

            <button
              className="bg-blue-900 text-white p-2 w-full rounded-xl mt-4 cursor-pointer"
              onClick={handleSubmit}
              disabled={loading}
            >
              Log in
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
