import { createContext, useContext, useEffect, useState } from "react";
import api from '@/shared/utils/api';

// 1️⃣ Create Context
const DevMessageContext = createContext();

// 2️⃣ Context Provider
export const DevMessageProvider = ({ children }) => {
  const [devMessage, setDevMessage] = useState(
    "Welcome to Mystery Mansion where all your naughty fantasies can be explored 🌟"
  );
  const [loading, setLoading] = useState(true);

  // Fetch dev message from backend on mount
  useEffect(() => {
    const fetchDevMessage = async () => {
      try {
        const { data } = await api.get("/public/settings/dev-message");
        const payload = data?.data || data;
        const message = payload?.devMessage;
        if (message) setDevMessage(message);
      } catch (err) {
        console.error("Error fetching dev message:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDevMessage();
  }, []);

  // Function to update message
  const updateDevMessage = async (newMessage) => {
    try {
      await api.put("/admin/settings", { field: "devMessage", value: newMessage });
      setDevMessage(newMessage); // Update context state
      return true;
    } catch (err) {
      console.error("Error updating dev message:", err);
      return false;
    }
  };

  return (
    <DevMessageContext.Provider
      value={{ devMessage, updateDevMessage, loading }}
    >
      {children}
    </DevMessageContext.Provider>
  );
};

// 3️⃣ Custom hook for convenience
export const useDevMessage = () => {
  const context = useContext(DevMessageContext);
  if (!context) {
    console.warn("useDevMessage must be used within a DevMessageProvider");
    return {
      devMessage: "Welcome to Mystery Mansion where all your naughty fantasies can be explored 🌟",
      updateDevMessage: async () => false,
      loading: true,
    };
  }
  return context;
};