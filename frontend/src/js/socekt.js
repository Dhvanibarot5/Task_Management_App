import { io } from "socket.io-client";

const socket = io("http://localhost:8001");

export const subscribeToTaskUpdates = (callback) => {
  socket.on("taskUpdated", (data) => {
    console.log("taskUpdated", data);
    callback(data);
  });
};

export const notifyTaskUpdate = (task) => {
  socket.emit("taskUpdated", task);
};
