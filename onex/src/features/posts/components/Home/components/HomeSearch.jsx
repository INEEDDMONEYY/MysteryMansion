import UserSearch from "@/features/users/components/UserSearch";

export default function HomeSearch({
  users = [],
  posts = [],
  query = "",
  onQueryChange,
  onResults,
  onSelectUser,
}) {
  return (
    <section className="w-full bg-white">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-10">
        <UserSearch
          users={users}
          posts={posts}
          query={query}
          onQueryChange={onQueryChange}
          onResults={onResults}
          onSelectUser={onSelectUser}
          placeholder="Search providers, posts, or keywords..."
        />
      </div>
    </section>
  );
}