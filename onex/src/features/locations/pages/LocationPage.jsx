import BrandLoader from "@/shared/components/Loaders/BrandLoader";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star, Users, FileText, MessageSquare } from "lucide-react";

import api from "@/shared/utils/api";
import { useServerReady } from "@/context/ServerReadyContext";
import PostCard from "@/features/posts/components/PostCard";
import LocationLinkPill from "../components/LocationLinkPill";
import { buildProviderProfilePath, setLocationSEO, setSEO } from "@/shared/utils/seo";

const HERO_IMAGE = "/mm-hero.png";

const placeName = (location) =>
  location
    ? [location.city, location.state].filter(Boolean).join(", ")
    : "";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/60">
        <Icon size={14} className="text-pink-400" />
        {label}
      </div>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <section className="w-full bg-white">
      <BrandLoader size="lg" className="min-h-[60vh]" />
    </section>
  );
}

export default function LocationPage() {
  const { locationSlug = "" } = useParams();
  const serverReady = useServerReady();
  const slug = locationSlug.toLowerCase();

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");

    api
      .get(`/posts/locations/${encodeURIComponent(slug)}`)
      .then(({ data: body }) => {
        if (!active) return;
        setData(body);
        setStatus("ready");
      })
      .catch((err) => {
        if (!active) return;
        setData(null);
        setStatus(err?.response?.status === 404 ? "notfound" : "error");
      });

    return () => {
      active = false;
    };
  }, [slug, serverReady]);

  useEffect(() => {
    if (status === "ready" && data?.location) {
      const { location, parentState, stats, providers, indexable } = data;
      setLocationSEO(location.type === "state" ? { state: location.state } : location, {
        canonicalPath: `/locations/${location.slug}`,
        indexable,
        providerCount: stats.providerCount,
        reviewCount: stats.reviewCount,
        providers,
        parentState: parentState
          ? { name: parentState.state, path: `/locations/${parentState.slug}` }
          : undefined,
      });
    } else if (status === "notfound" || status === "error") {
      setSEO("Location Not Found | Mystery Mansion", "This location page is not available.", {
        robots: "noindex, follow",
        canonicalPath: "/locations",
      });
    }
  }, [status, data]);

  if (status === "loading") return <LoadingState />;

  if (status !== "ready") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-neutral-950 px-4 text-center text-white">
        <MapPin size={40} className="mb-4 text-pink-500" />
        <h1 className="text-2xl font-bold sm:text-3xl">
          {status === "notfound" ? "No listings in this location yet" : "Something went wrong"}
        </h1>
        <p className="mt-3 max-w-md text-white/70">
          {status === "notfound"
            ? "We couldn't find any listings for this city or state. Browse other locations instead."
            : "We couldn't load this location right now. Please try again shortly."}
        </p>
        <Link
          to="/locations"
          className="mt-6 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-500"
        >
          Browse all locations
        </Link>
      </div>
    );
  }

  const { location, parentState, posts, providers, nearby, stats } = data;
  const isState = location.type === "state";
  const place = isState ? location.state : placeName(location);

  return (
    <div className="w-full">
      <section className="relative w-full overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />

        <div className="relative mx-auto flex min-h-[420px] w-full max-w-screen-2xl items-end px-4 py-14 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
          <div className="w-full max-w-4xl text-white">
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/70">
              <Link to="/locations" className="inline-flex items-center gap-2 transition hover:text-white">
                <ArrowLeft size={17} />
                All Locations
              </Link>
              {parentState && (
                <>
                  <span aria-hidden="true">/</span>
                  <Link to={`/locations/${parentState.slug}`} className="transition hover:text-white">
                    {parentState.state}
                  </Link>
                </>
              )}
            </nav>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-pink-400">
              {isState ? "Explore State" : "Explore City"}
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Providers in {place}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Browse local provider profiles and listings in {place}, and read member reviews
              to learn more about providers in the area.
            </p>

            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard icon={FileText} label="Listings" value={stats.postCount} />
              <StatCard icon={Users} label="Providers" value={stats.providerCount} />
              <StatCard icon={MessageSquare} label="Reviews" value={stats.reviewCount} />
              <StatCard
                icon={Star}
                label="Avg Rating"
                value={stats.averageRating ? stats.averageRating.toFixed(1) : "—"}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="mx-auto max-w-screen-2xl space-y-10 px-4 py-10 sm:px-6 lg:px-10">
          {providers.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Providers in {place}</h2>
              <ul className="flex gap-4 overflow-x-auto pb-2">
                {providers.map((provider) => (
                  <li key={provider._id} className="shrink-0">
                    <Link
                      to={buildProviderProfilePath(provider)}
                      className="flex w-28 flex-col items-center gap-2 rounded-xl p-2 text-center transition hover:bg-gray-50"
                    >
                      {provider.profilePic ? (
                        <img
                          src={provider.profilePic}
                          alt={provider.username}
                          loading="lazy"
                          className="h-16 w-16 rounded-full border-2 border-pink-500 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-pink-500 bg-gray-100 text-lg font-bold text-gray-500">
                          {provider.username?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <span className="w-full truncate text-sm font-semibold text-gray-900">
                        {provider.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {provider.reviewCount > 0
                          ? `★ ${provider.averageRating.toFixed(1)} · ${provider.reviewCount} review${provider.reviewCount === 1 ? "" : "s"}`
                          : `${provider.postCount} listing${provider.postCount === 1 ? "" : "s"}`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-900">Latest listings in {place}</h2>
            {posts.length ? (
              <div className="grid grid-cols-1 gap-5 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                No active listings here right now.
              </p>
            )}
          </div>

          {nearby.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                {isState ? `Cities in ${location.state}` : `More cities in ${location.state}`}
              </h2>
              <div className="flex flex-wrap gap-2">
                {nearby.map((city) => (
                  <LocationLinkPill key={city.slug} location={city} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
