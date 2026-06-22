import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserProfileHeader from "@/features/users/components/UserProfileHeader";
import PostList from "@/features/posts/components/PostList";
import UserAvailabilityDisplay from "@/features/users/components/UserAvailabilityDisplay";
import UserMeetupDisplay from "@/features/users/components/UserMeetupDisplay";
import ReviewButton from "@/shared/components/Buttons/reviewButtons/ReviewButton";
import ReferencesLinks from "@/shared/components/References/ReferencesLinks.jsx";
import CompletedDates from "@/shared/components/References/CompletedDates.jsx";
import api from "@/shared/utils/api.js";


export default function UserProfileViewPage({ userId: propUserId = null, disableActionButtons = false }) {
  const navigate = useNavigate();
  const params = useParams();

  const handleReturnToPost = () => {
    navigate("/home");
  };

  const userId = useMemo(() => {
    const routeUserId = params?.userId || params?.id || null;
    if (propUserId) return propUserId;
    return routeUserId || null;
  }, [propUserId, params]);

  const [availability, setAvailability] = useState({ status: "" });
  const [prices, setPrices] = useState({});

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    api.get(`/public/users/id/${userId}`)
      .then((res) => {
        if (cancelled) return;
        const u = res?.data || {};
        const rawAvail = u.availability;
        const status =
          typeof rawAvail === "string"
            ? rawAvail
            : rawAvail?.status ?? "";
        setAvailability({ status });
        setPrices({
          incall: u.incallPrice != null ? String(u.incallPrice) : "",
          outcall: u.outcallPrice != null ? String(u.outcallPrice) : "",
          overnights: u.overnightPrice != null ? String(u.overnightPrice) : "",
          flyOut: u.flyOutPrice != null ? String(u.flyOutPrice) : "",
        });
      })
      .catch(() => {
        if (!cancelled) {
          setAvailability({ status: "" });
          setPrices({});
        }
      });

    return () => { cancelled = true; };
  }, [userId]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-36 sm:pb-10">
        {/* User Info */}
        <section>
          <UserProfileHeader userId={userId} />
        </section>

        <section>
          <ReferencesLinks userId={userId} />
        </section>

        <section>
          <CompletedDates userId={userId} />
        </section>

        {/* Availability */}
        {availability.status && (
          <section>
            <UserAvailabilityDisplay availability={availability} />
          </section>
        )}

        {/* Meetup Prices */}
        {Object.values(prices).some((v) => v !== "" && Number(v) > 0) && (
          <section>
            <UserMeetupDisplay prices={prices} />
          </section>
        )}

        {/* User's Posts */}
        <section>
          <PostList authorId={userId} />
        </section>
      </div>

      {!disableActionButtons && (
        <div className="fixed bottom-4 left-4 right-4 z-40 flex flex-col items-stretch gap-2 pb-[max(0px,env(safe-area-inset-bottom))] sm:bottom-6 sm:left-auto sm:right-6 sm:items-end sm:pb-0">
          <ReviewButton
            onClick={() => {
              if (!userId) return;
              navigate(`/reviews/${userId}`);
            }}
            disabled={!userId}
          />

          <button
            onClick={handleReturnToPost}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-white font-semibold transition-colors bg-gray-800 hover:bg-gray-900"
          >
            Return to post
          </button>
        </div>
      )}
    </>
  );
}
