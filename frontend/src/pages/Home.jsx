import { useContext, useEffect, useState } from "react";
import { subscribeToTaskUpdates } from "../js/socket.js";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import TaskCard from "../components/TaskCard";
import { AuthContext } from "../context/AuthProvider";
import Cookies from "universal-cookie";
import { messaging, requestPermission, onMessageListener } from "../firebase";
import { onMessage } from "firebase/messaging";

const cookies = new Cookies();

export default function Home() {
  const [user, setUser] = useState({});
  const [tasks, setTasks] = useState([]);

  const { isRefresh } = useContext(AuthContext);
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token") || cookies.get("token");

    if (!token) {
      navigate("/signin");
      return;
    }

    const setupNotifications = async () => {
      const fcmToken = await requestPermission();
      if (fcmToken) {
        try {
          await axios.patch(
            `${BASE_URL}/users/updateFcmToken`,
            { fcmToken },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("FCM token updated successfully");
        } catch (error) {
          console.error("Error updating FCM token:", error);
        }
      }
    };

    setupNotifications();

    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/tasks/getTasks`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        const tasks = response.data.data;

        const categoryOrder = { high: 1, medium: 2, low: 3 };

        const sortedTasks = tasks.sort((a, b) => {
          if (a.isCompleted !== b.isCompleted) {
            return a.isCompleted - b.isCompleted;
          }
          return categoryOrder[a.category] - categoryOrder[b.category];
        });

        setTasks(sortedTasks);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    };

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/users/getUser`, {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        setUser(response.data.data);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.message);
        }
      }
    };

    fetchUser();
    fetchTasks();

    subscribeToTaskUpdates((updatedTask) => {
      setTasks((prevTasks) => prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
      toast.info("Task updated in real-time!");
    });

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Received foreground message:", payload);
      toast.info(payload.notification.title, {
        body: payload.notification.body,
      });
      fetchTasks();
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [BASE_URL, navigate, isRefresh]);

  const sendTestNotification = async () => {
    const token = localStorage.getItem("token") || cookies.get("token");
    try {
      const response = await axios.post(
        `${BASE_URL}/users/sendTestNotification`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Test notification sent", response.data);
    } catch (error) {
      console.error("Error sending test notification:", error.response?.data || error.message);
      if (error.response?.data?.details) {
        console.error("Detailed error:", error.response.data.details);
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="pt-28 flex flex-col items-center">
          <div className="w-full max-w-3xl rounded-xl bg-white/80 backdrop-blur-sm shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-indigo-800 text-3xl font-bold text-center">Welcome {user?.name}</h1>
            </div>
            <div className="mb-6">
              <h1 className="text-indigo-600 text-2xl font-semibold">Your Tasks</h1>
            </div>
            <div className="space-y-4">
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300">
                    <TaskCard task={task} user={user} />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-6 bg-white/50 rounded-lg">No tasks available</p>
              )}
            </div>
            <button
              onClick={sendTestNotification}
              className="mt-8 px-6 py-3 bg-indigo-100 text-indigo-600 rounded-full 
                         hover:bg-indigo-200 transition-all duration-300 font-medium"
            >
              Send Test Notification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
