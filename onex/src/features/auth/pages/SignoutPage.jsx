// SignoutPage.jsx
import { useEffect } from "react";
import SignoutFlow from "../components/SignoutFlow";
import { setSEO } from "@/shared/utils/seo";

export default function Signout() {
  useEffect(() => {
    setSEO('Sign Out | Mystery Mansion', '', { robots: 'noindex, nofollow' });
  }, []);

  return <SignoutFlow />;
}
