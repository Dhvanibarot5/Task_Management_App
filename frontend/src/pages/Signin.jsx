import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
// import Cookies from "universal-cookie";
import { AuthContext } from "../context/AuthProvider";

// const cookies = new Cookies();

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const notify1 = (msg) => toast.error(msg);
  const notify2 = (msg) => toast.success(msg);

  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;

  const loginData = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      notify1("Invalid email format");
      return;
    }
    if (!passwordRegex.test(password)) {
      notify1(
        "Invalid password format,  must contain a number, must contain one lowercase, must contain one uppercase, must contain one special character, password must be 8-16 characters long"
      );
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/users/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const token = response.data.data.token;

        localStorage.setItem("token", token);
        localStorage.setItem("id", response.data.data.user._id);
        setIsLoggedIn(true);

        notify2(response.data.message);
        navigate("/");
      } else {
        notify1(response.data.message);
        navigate("/signin");
      }
    } catch (error) {
      if (error.response) {
        notify1(error.response.data.message);
      } else {
        notify1(error.message);
      }
      navigate("/signin");
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center min-h-screen py-12">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-md w-full max-w-md">
            <h1
              className="mb-8 text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 
                          text-transparent bg-clip-text"
            >
              Sundowners Enterprise
            </h1>

            <form className="space-y-4" onSubmit={loginData}>
              <input
                className="w-full px-4 py-3 rounded-lg border border-blue-100 
                         focus:outline-none focus:border-blue-300 focus:ring-2 
                         focus:ring-blue-100 transition-all duration-300"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                name="email"
              />

              <input
                className="w-full px-4 py-3 rounded-lg border border-blue-100 
                         focus:outline-none focus:border-blue-300 focus:ring-2 
                         focus:ring-blue-100 transition-all duration-300"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
              />

              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold
                         hover:bg-blue-700 transform hover:-translate-y-0.5 
                         transition-all duration-300 shadow-sm hover:shadow-md"
                type="submit"
              >
                Sign In
              </button>

              <p className="text-center text-gray-600">
                Don't have an account?{" "}
                <Link
                  className="text-blue-600 hover:text-blue-700 font-semibold 
                           transition-colors duration-300"
                  to="/signup"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
