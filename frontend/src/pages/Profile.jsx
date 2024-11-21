import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";

const cookies = new Cookies();

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [id, setId] = useState("");
  const [file, setFile] = useState(null);

  const { setIsLoggedIn, setLogInUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token") || cookies.get("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`${BASE_URL}/users/getUser`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        setName(response.data.data.name);
        setEmail(response.data.data.email);
        setId(response.data.data._id);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    };

    fetchUser();
  }, []);

  const sendData = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Missing access token. User needs to be authenticated.");
        return;
      }

      let user = !password.trim() === "" ? { name, email, password } : { name, email };

      const response = await axios.patch(`${BASE_URL}/users/update/${id}`, user, {
        withCredentials: true,
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      toast.success(response.data.message);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  const deleteUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Missing access token. User needs to be authenticated.");
        return;
      }

      const response = await axios.delete(`${BASE_URL}/users/delete/${id}`, {
        withCredentials: true,
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("id");

      cookies.remove("token", { path: "/", sameSite: "None", secure: true });
      cookies.remove("token");

      setIsLoggedIn(false);
      setLogInUser({});
      toast.success(response.data.message);
      navigate("/signin");
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  // Handle file selection for import
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Import function
  const handleImport = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Missing access token. User needs to be authenticated.");
      return;
    }

    if (!file) {
      toast.error("Please select a file to import");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${BASE_URL}/tasks/import`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error importing tasks");
    }
  };

  // Export function
  const handleExport = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Missing access token. User needs to be authenticated.");
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/tasks/export`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "tasks.csv");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error exporting tasks");
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 min-h-screen flex items-center justify-center py-12">
      <div className="bg-white/90 backdrop-blur-sm shadow-sm rounded-xl p-8 w-full max-w-md mx-4">
        <h2 className="mb-8 text-2xl font-bold text-teal-800 text-center">Profile Settings</h2>

        <form className="space-y-4" onSubmit={sendData}>
          <input
            className="w-full px-4 py-3 border border-teal-100 rounded-lg 
                     focus:outline-none focus:border-teal-300 focus:ring-2 
                     focus:ring-teal-100 transition-all duration-300"
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full px-4 py-3 border border-teal-100 rounded-lg 
                     focus:outline-none focus:border-teal-300 focus:ring-2 
                     focus:ring-teal-100 transition-all duration-300"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full px-4 py-3 border border-teal-100 rounded-lg 
                     focus:outline-none focus:border-teal-300 focus:ring-2 
                     focus:ring-teal-100 transition-all duration-300"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold
                     hover:bg-teal-700 transform hover:-translate-y-0.5 
                     transition-all duration-300 shadow-sm hover:shadow-md"
            type="submit"
          >
            Save Changes
          </button>
        </form>

        <div className="mt-6">
          <button
            className="w-full bg-rose-100 text-rose-600 py-3 rounded-lg font-semibold
                     hover:bg-rose-200 transition-all duration-300"
            onClick={deleteUser}
          >
            Delete User
          </button>
        </div>

        {/* Import & Export Section */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-teal-800 mb-4">Import & Export Tasks</h3>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600
                     file:mr-4 file:py-2 file:px-4 file:rounded-full
                     file:border-0 file:text-sm file:font-semibold
                     file:bg-teal-50 file:text-teal-700
                     hover:file:bg-teal-100 transition-colors
                     cursor-pointer"
          />

          <button
            onClick={handleImport}
            className="w-full bg-emerald-100 text-emerald-600 py-3 rounded-lg font-semibold
                     hover:bg-emerald-200 transition-all duration-300"
          >
            Import Tasks
          </button>

          <button
            onClick={handleExport}
            className="w-full bg-cyan-100 text-cyan-600 py-3 rounded-lg font-semibold
                     hover:bg-cyan-200 transition-all duration-300"
          >
            Export Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
