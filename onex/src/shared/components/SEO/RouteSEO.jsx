import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyRouteSEO } from "@/shared/utils/seo";

// Layout effects run before the page's own effects, so page-level SEO calls
// override this baseline.
export default function RouteSEO() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    applyRouteSEO(pathname);
  }, [pathname]);

  return null;
}
