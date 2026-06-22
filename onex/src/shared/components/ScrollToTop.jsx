import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // In dashboard layouts the scroll container is a div, not window
    const adminScroll = document.getElementById('admin-scroll');
    const userScroll  = document.getElementById('user-scroll');
    if (adminScroll) {
      adminScroll.scrollTop = 0;
    } else if (userScroll) {
      userScroll.scrollTop = 0;
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
