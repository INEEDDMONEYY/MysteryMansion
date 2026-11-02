import BrandLoader from "@/shared/components/Loaders/BrandLoader";
import { useEffect, useMemo, useState } from "react";
import { Ban, CircleUser, Search, ShieldCheck, X } from "lucide-react";
import api from "@/shared/utils/api";
import { useUser } from "@/context/useUser";
import PromocodeSettings from "@/shared/components/admin/settings/PromocodeSettings";

const PAGE_SIZE = 25;
// Activity is recorded server-side at most every 2 minutes, so 10 minutes
// comfortably covers someone who is still using the site.
const ONLINE_WINDOW_MS = 10 * 60 * 1000;
const REFRESH_INTERVAL_MS = 60 * 1000;
const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;

const ROLE_STYLES = {
  admin: { label: "Admin", className: "border-amber-500/30 bg-amber-500/15 text-amber-300" },
  provider: { label: "Provider", className: "border-pink-500/30 bg-pink-500/15 text-pink-300" },
  client: { label: "Client", className: "border-purple-500/30 bg-purple-500/15 text-purple-300" },
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "provider", label: "Providers" },
  { value: "client", label: "Clients" },
  { value: "admin", label: "Admins" },
  { value: "disabled", label: "Disabled" },
];

const SORTS = [
  { value: "lastActive", label: "Last active" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Username A–Z" },
];

const roleKeyFor = (account) =>
  account?.role === "admin" ? "admin" : account?.accountType === "client" ? "client" : "provider";

const toDate = (raw) => {
  const date = raw ? new Date(raw) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

// Most recent server-recorded session activity (request or sign-in).
const lastActiveDateFor = (account) => {
  const active = toDate(account?.lastActiveAt);
  const login = toDate(account?.lastLogin);
  if (!active) return login;
  if (!login) return active;
  return active > login ? active : login;
};

const isSignedOut = (account) => {
  const logout = toDate(account?.lastLogoutAt);
  const active = lastActiveDateFor(account);
  return Boolean(logout && (!active || logout >= active));
};

const formatRelative = (date) => {
  if (!date) return "Never";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

function LastActiveIndicator({ account }) {
  const date = lastActiveDateFor(account);
  const age = date ? Date.now() - date.getTime() : Infinity;
  const signedOut = isSignedOut(account);
  const tone =
    age <= ONLINE_WINDOW_MS && !signedOut
      ? { dot: "bg-emerald-400", ring: "ring-emerald-400/30", text: "text-emerald-300", label: "Online" }
      : age <= RECENT_WINDOW_MS
        ? { dot: "bg-amber-400", ring: "ring-amber-400/20", text: "text-amber-200", label: formatRelative(date) }
        : { dot: "bg-neutral-500", ring: "ring-neutral-500/20", text: "text-neutral-400", label: formatRelative(date) };

  return (
    <span
      className="inline-flex min-w-[6.5rem] items-center gap-2 text-xs"
      title={
        date
          ? `Last active ${date.toLocaleString()}${signedOut ? " · signed out" : ""}`
          : "No activity recorded"
      }
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${tone.dot} ${tone.ring}`} aria-hidden="true" />
      <span className={tone.text}>{tone.label}</span>
    </span>
  );
}

function RoleBadge({ account }) {
  const role = ROLE_STYLES[roleKeyFor(account)];
  return (
    <span className={`inline-flex min-w-[4.75rem] justify-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${role.className}`}>
      {role.label}
    </span>
  );
}

function DisableAccountButton({ account, isSelf, onRequest }) {
  const isDisabled = account?.status === "suspended";
  const isAdminAccount = account?.role === "admin";
  const locked = isSelf || isAdminAccount;

  return (
    <button
      type="button"
      onClick={() => onRequest(account)}
      disabled={locked}
      title={locked ? (isSelf ? "You can't disable your own account" : "Admin accounts can't be disabled here") : undefined}
      className={`inline-flex min-w-[7.5rem] items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        isDisabled
          ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
          : "border-red-500/40 text-red-300 hover:bg-red-500/10"
      }`}
    >
      {isDisabled ? <ShieldCheck size={14} /> : <Ban size={14} />}
      {isDisabled ? "Enable Account" : "Disable Account"}
    </button>
  );
}

function ConfirmDisableModal({ account, onCancel, onConfirm }) {
  useEffect(() => {
    if (!account) return undefined;
    const onKey = (event) => event.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [account, onCancel]);

  if (!account) return null;
  const isDisabled = account.status === "suspended";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disable-account-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900 p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 id="disable-account-title" className="text-base font-semibold text-white">
            {isDisabled ? "Enable" : "Disable"} @{account.username || "account"}?
          </h3>
          <button type="button" onClick={onCancel} aria-label="Close" className="text-neutral-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <p className="mt-2 text-sm text-neutral-400">
          {isDisabled
            ? "This account will be able to sign in and use the platform again."
            : "This account will be blocked from signing in and its listings will be hidden until it is enabled again."}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(account)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              isDisabled ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"
            }`}
          >
            {isDisabled ? "Enable Account" : "Disable Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUserManagement() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("lastActive");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [pendingAccount, setPendingAccount] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    // Background refreshes keep Last Active current without flashing the loader.
    const fetchUsers = async ({ background = false } = {}) => {
      if (!background) setUsersLoading(true);
      try {
        const { data } = await api.get("/admin/users");
        if (!active) return;
        setUsers(
          Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.users) ? data.users : [],
        );
        setUsersError("");
      } catch (err) {
        if (!active || background) return;
        console.error("Failed to fetch users:", err);
        setUsers([]);
        setUsersError(err?.response?.data?.error || "Failed to fetch users. Make sure you are an admin.");
      } finally {
        if (active && !background) setUsersLoading(false);
      }
    };
    fetchUsers();
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") fetchUsers({ background: true });
    }, REFRESH_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, sort, query]);

  const counts = useMemo(() => {
    const result = { all: users.length, provider: 0, client: 0, admin: 0, disabled: 0 };
    for (const account of users) {
      result[roleKeyFor(account)] += 1;
      if (account.status === "suspended") result.disabled += 1;
    }
    return result;
  }, [users]);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = users.filter((account) => {
      if (filter === "disabled" ? account.status !== "suspended" : filter !== "all" && roleKeyFor(account) !== filter) {
        return false;
      }
      if (!needle) return true;
      return [account.username, account.email, account.city, account.state]
        .some((value) => String(value || "").toLowerCase().includes(needle));
    });

    return list.sort((a, b) => {
      if (sort === "name") return String(a.username || "").localeCompare(String(b.username || ""));
      if (sort === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return (lastActiveDateFor(b)?.getTime() || 0) - (lastActiveDateFor(a)?.getTime() || 0);
    });
  }, [users, filter, sort, query]);

  // TODO: connect to the disable/enable account endpoint once it exists.
  const handleConfirmDisable = (account) => {
    setPendingAccount(null);
    setNotice(
      `${account.status === "suspended" ? "Enabling" : "Disabling"} accounts isn't connected yet — no changes were made to @${account.username || "this account"}.`,
    );
  };

  const currentUserId = String(currentUser?._id || currentUser?.id || "");
  const visibleUsers = filteredUsers.slice(0, visibleCount);

  return (
    <div className="space-y-6 pb-8">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">All Accounts</h2>
            <p className="mt-0.5 text-xs text-neutral-400">
              Every provider, client and admin account on the platform.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <span className="sr-only">Search accounts</span>
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search username, email, city"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 focus:border-pink-500 focus:outline-none sm:w-64"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-neutral-400">
              Sort
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
              >
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter accounts">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                filter === value
                  ? "border-neutral-100 bg-neutral-100 text-neutral-900"
                  : "border-neutral-700 bg-transparent text-neutral-400 hover:border-neutral-500"
              }`}
            >
              {label} ({counts[value]})
            </button>
          ))}
        </div>

        {notice && (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200" role="status">
            {notice}
          </p>
        )}
        {usersError && <p className="mt-4 text-sm text-red-400">{usersError}</p>}

        <div className="mt-4">
          {usersLoading ? (
            <BrandLoader size="sm" tone="dark" label="Loading accounts..." />
          ) : filteredUsers.length === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-500">No accounts match these filters.</p>
          ) : (
            <>
              <div className="hidden grid-cols-[minmax(0,1fr)_6.5rem_4.75rem_7.5rem] gap-4 border-b border-neutral-800 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 md:grid">
                <span>Account</span>
                <span>Last Active</span>
                <span className="text-center">Role</span>
                <span className="text-center">Status</span>
              </div>

              <ul className="divide-y divide-neutral-800">
                {visibleUsers.map((account) => {
                  const isDisabled = account.status === "suspended";
                  const location = [account.city, account.state].filter(Boolean).join(", ");
                  return (
                    <li
                      key={account._id}
                      className={`grid gap-3 px-3 py-3 md:grid-cols-[minmax(0,1fr)_6.5rem_4.75rem_7.5rem] md:items-center md:gap-4 ${
                        isDisabled ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {account.profilePic ? (
                          <img
                            src={account.profilePic}
                            alt=""
                            loading="lazy"
                            className="h-10 w-10 shrink-0 rounded-full border border-neutral-700 object-cover"
                          />
                        ) : (
                          <CircleUser size={40} strokeWidth={1.25} className="shrink-0 text-neutral-600" />
                        )}
                        <div className="min-w-0">
                          <p className="flex items-center gap-2 truncate text-sm font-semibold text-white">
                            @{account.username || "unknown"}
                            {isDisabled && (
                              <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-red-300">Disabled</span>
                            )}
                          </p>
                          <p className="truncate text-xs text-neutral-400">{account.email || "No email"}</p>
                          <p className="truncate text-[11px] text-neutral-500">
                            {location ? `${location} · ` : ""}Joined{" "}
                            {account.createdAt
                              ? new Date(account.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pl-[3.25rem] md:contents md:pl-0">
                        <LastActiveIndicator account={account} />
                        <span className="md:flex md:justify-center"><RoleBadge account={account} /></span>
                        <span className="md:flex md:justify-center">
                          <DisableAccountButton
                            account={account}
                            isSelf={String(account._id) === currentUserId}
                            onRequest={setPendingAccount}
                          />
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex flex-col items-center gap-2 text-xs text-neutral-500">
                <span>Showing {visibleUsers.length} of {filteredUsers.length} accounts</span>
                {visibleUsers.length < filteredUsers.length && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-800"
                  >
                    Show more
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <div className="space-y-5">
        <PromocodeSettings />
      </div>

      <ConfirmDisableModal
        account={pendingAccount}
        onCancel={() => setPendingAccount(null)}
        onConfirm={handleConfirmDisable}
      />
    </div>
  );
}
