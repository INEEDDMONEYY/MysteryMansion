import BrandLoader from "@/shared/components/Loaders/BrandLoader";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search } from "lucide-react";

import api from "@/shared/utils/api";
import { useServerReady } from "@/context/ServerReadyContext";
import LocationLinkPill from "../components/LocationLinkPill";
import { setPublicPageSEO } from "@/shared/utils/seo";

const HERO_IMAGE = "/mm-hero.png";

export default function LocationsIndexPage() {
  const serverReady = useServerReady();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setPublicPageSEO("/locations");
  }, []);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    api
      .get("/posts/locations")
      .then(({ data: body }) => {
        if (!active) return;
        setData(body);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [serverReady]);

  const term = filter.trim().toLowerCase();

  const states = useMemo(() => {
    const list = data?.states || [];
    if (!term) return list;
    return list
      .map((state) => {
        if (state.state.toLowerCase().includes(term)) return state;
        const cities = state.cities.filter((city) => city.city.toLowerCase().includes(term));
        return cities.length ? { ...state, cities } : null;
      })
      .filter(Boolean);
  }, [data, term]);

  const unassigned = useMemo(
    () =>
      (data?.unassignedCities || []).filter(
        (city) => !term || city.city.toLowerCase().includes(term)
      ),
    [data, term]
  );

  return (
    <div className="w-full">
      <section className="relative w-full overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />

        <div className="relative mx-auto flex min-h-[380px] w-full max-w-screen-2xl items-end px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
          <div className="w-full max-w-4xl text-white">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-pink-400">
              Browse by Location
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find Providers Near You
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Explore provider profiles and listings by city and state.
              {data?.totals
                ? ` ${data.totals.cities} cities across ${data.totals.states} states.`
                : ""}
            </p>

            {data?.popular?.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {data.popular.map((city) => (
                  <LocationLinkPill key={city.slug} location={city} showState tone="dark" />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="w-full bg-white">
        <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10">
          <div className="relative mb-8 max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by city or state"
              aria-label="Filter locations"
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          {status === "loading" && (
            <BrandLoader size="sm" />
          )}

          {status === "error" && (
            <p className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
              We couldn't load locations right now. Please try again shortly.
            </p>
          )}

          {status === "ready" && !states.length && !unassigned.length && (
            <p className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
              {term ? "No locations match your search." : "No locations with listings yet."}
            </p>
          )}

          {status === "ready" && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {states.map((state) => (
                <div key={state.slug} className="rounded-xl border border-gray-200 p-5">
                  <Link
                    to={`/locations/${state.slug}`}
                    className="group mb-3 flex items-center justify-between gap-2"
                  >
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 group-hover:text-pink-600">
                      <MapPin size={18} className="text-pink-500" />
                      {state.state}
                    </h2>
                    <span className="text-xs text-gray-500">
                      {state.postCount} listing{state.postCount === 1 ? "" : "s"}
                    </span>
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    {state.cities.map((city) => (
                      <LocationLinkPill key={city.slug} location={city} />
                    ))}
                  </div>
                </div>
              ))}

              {unassigned.length > 0 && (
                <div className="rounded-xl border border-gray-200 p-5">
                  <h2 className="mb-3 text-lg font-bold text-gray-900">Other cities</h2>
                  <div className="flex flex-wrap gap-2">
                    {unassigned.map((city) => (
                      <LocationLinkPill key={city.slug} location={city} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
