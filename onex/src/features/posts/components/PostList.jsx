import { useState, useEffect } from 'react';
import api from '@/shared/utils/api';
import PostCard from './PostCard';

const dedupePostsById = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const id = item?._id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

export default function PostList({ authorId = "" }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [authorUsername, setAuthorUsername] = useState("");

  useEffect(() => {
    if (!authorId) {
      setPosts([]);
      setLoading(false);
      setErrorMessage("No profile selected.");
      setAuthorUsername("");
      return;
    }

    const fetchAllPosts = async () => {
      try {
        const { data } = await api.get('/posts', {
          params: { userId: authorId },
        });

        const normalizedPosts = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.posts)
              ? data.posts
              : null;

        if (!normalizedPosts) {
          setErrorMessage("Unexpected response format from server.");
          setPosts([]);
          setAuthorUsername("");
        } else {
          const uniquePosts = dedupePostsById(normalizedPosts);

          if (uniquePosts.length === 0) {
            setErrorMessage("No posts found.");
            setPosts([]);

            // Still resolve profile name for heading when there are no posts.
            try {
              const { data: userData } = await api.get(`/public/users/id/${authorId}`);
              const fetchedUsername = userData?.username || "";
              setAuthorUsername(fetchedUsername);
            } catch {
              setAuthorUsername("");
            }
          } else {
            setPosts(uniquePosts);
            setErrorMessage(null);

            const firstPostUsername = uniquePosts?.[0]?.userId?.username || "";
            if (firstPostUsername) {
              setAuthorUsername(firstPostUsername);
            } else {
              try {
                const { data: userData } = await api.get(`/public/users/id/${authorId}`);
                const fetchedUsername = userData?.username || "";
                setAuthorUsername(fetchedUsername);
              } catch {
                setAuthorUsername("");
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setErrorMessage(
          err?.response?.data?.error ||
            "Error fetching posts. Please try again later."
        );
        setPosts([]);

        try {
          const { data: userData } = await api.get(`/public/users/id/${authorId}`);
          const fetchedUsername = userData?.username || "";
          setAuthorUsername(fetchedUsername);
        } catch {
          setAuthorUsername("");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, [authorId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-gray-500 text-lg">
        Loading posts...
      </div>
    );
  }

  return (
    <section className="px-4 sm:px-6 lg:px-12 py-10">
      <h2 className="text-lg sm:text-2xl font-bold text-pink-700 mb-6 text-center sm:text-left">
        {authorUsername ? `${authorUsername}'s Posts` : "Account Holder Posts"}
      </h2>

      {errorMessage && (
        <div className="text-red-500 text-center mb-6">{errorMessage}</div>
      )}

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={(id) => {
                setPosts((prev) => prev.filter((p) => p._id !== id));
              }}
            />
          ))
        ) : (
          !errorMessage && (
            <p className="text-gray-500 text-center col-span-full">
              No posts found.
            </p>
          )
        )}
      </div>
    </section>
  );
}
