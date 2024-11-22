import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { notifyTaskUpdate } from "../js/socket.js";

export default function AddTask() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("medium");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const sendData = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${BASE_URL}/tasks/register`,
        {
          title,
          description,
          category,
          assignTo: selectedUserId,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      notifyTaskUpdate(response.data.message);
      toast.success(response.data.message);
      navigate("/");
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
      navigate("/addTask");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

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

        setUser(response.data.data);
        setSelectedUserId(response.data.data._id);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    };

    const selectUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/users/getAllUsers`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        // console.log(response);

        setUsers(response.data.data);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    };

    fetchUser();
    selectUser();
  }, [BASE_URL, navigate]);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 min-h-screen">
      <div className="container mx-auto">
        <div className="flex justify-center items-center min-h-screen py-20">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-sm w-full max-w-2xl">
            <h2 className="mb-6 text-2xl font-bold text-indigo-800 text-center">Add Your Task</h2>
            <form className="flex flex-col gap-4" onSubmit={sendData}>
              <div className="space-y-4">
                <input
                  className="w-full px-4 py-3 rounded-lg border border-indigo-100 
                           focus:outline-none focus:border-indigo-300 focus:ring-2 
                           focus:ring-indigo-100 transition-all duration-300"
                  type="text"
                  placeholder="Task Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  name="title"
                />

                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-indigo-100 
                           focus:outline-none focus:border-indigo-300 focus:ring-2 
                           focus:ring-indigo-100 transition-all duration-300 resize-none"
                  rows={5}
                  placeholder="Task Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  name="description"
                />

                <select
                  className="w-full px-4 py-3 rounded-lg border border-indigo-100 
                           focus:outline-none focus:border-indigo-300 focus:ring-2 
                           focus:ring-indigo-100 transition-all duration-300
                           bg-white text-gray-700"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="high" className="text-rose-600">
                    High Priority
                  </option>
                  <option value="medium" className="text-amber-600">
                    Medium Priority
                  </option>
                  <option value="low" className="text-emerald-600">
                    Low Priority
                  </option>
                </select>

                {user.role === "admin" && (
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-indigo-100 
                             focus:outline-none focus:border-indigo-300 focus:ring-2 
                             focus:ring-indigo-100 transition-all duration-300
                             bg-white text-gray-700"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="" disabled>
                      Select Team Member
                    </option>
                    {users?.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold
                         hover:bg-indigo-700 transform hover:-translate-y-0.5 
                         transition-all duration-300 shadow-sm hover:shadow-md"
                type="submit"
              >
                Add Task
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
