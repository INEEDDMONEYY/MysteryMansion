// SignoutFlow.jsx
import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext"; // ✅ import your context
import SignoutLoader from "@/shared/components/Loaders/SignoutLoader";

export default function SignoutFlow() {
  const navigate = useNavigate();
  const { logout } = useContext(UserContext); // ✅ use your existing logout logic

  useEffect(() => {
    const performSignout = async () => {
      try {
        await logout();   // ✅ same as UserDashboard
        navigate("/");    // redirect home
      } catch (error) {
        console.error("Signout failed:", error);
      }
    };

    performSignout();
  }, []);

  return <SignoutLoader />;
}
