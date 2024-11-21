import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export default function Logout() {
  const { setIsLoggedIn, setLogInUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    let isMounted = true;

    const logout = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BASE_URL}/users/logout`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (response.status === 200 && isMounted) {
          localStorage.removeItem("token");
          localStorage.removeItem("id");

          cookies.remove("token", { path: "/", sameSite: "None", secure: true });
          cookies.remove("token");

          setIsLoggedIn(false);
          setLogInUser({});
          toast.success(response.data.message);
          navigate("/signin");
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Logout failed. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    logout();

    return () => {
      isMounted = false;
    };
  }, [navigate, setIsLoggedIn, setLogInUser]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-indigo-800">Logging Out...</h2>
        <p className="text-gray-600 mt-2">Please wait while we securely log you out.</p>
      </div>
    </div>
  );
}
