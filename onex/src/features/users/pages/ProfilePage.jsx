import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/shared/utils/api';
import UserProfileView from './UserProfileViewPage';
import { setSEO } from '@/shared/utils/seo';
import { useUser } from '@/context/useUser';

export default function ProfilePage({ userId = null, disableActionButtons = false }) {
  const { username } = useParams();
  const { user: loggedInUser } = useUser();
  const ownUserId = loggedInUser?._id || loggedInUser?.id || null;

  useEffect(() => {
    if (username) {
      setSEO(
        `${username}'s Escort Profile | Mystery Mansion`,
        `View ${username}'s escort profile on Mystery Mansion. Browse listings, read client reviews, and get contact details for ${username}.`
      );
    }
  }, [username]);
  const [resolvedUserId, setResolvedUserId] = useState('');
  const [loading, setLoading] = useState(Boolean(!userId && (username || ownUserId)));
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const resolveUserByUsername = async () => {
      if (userId) {
        setResolvedUserId(String(userId));
        setLoading(false);
        setError('');
        return;
      }

      if (!username) {
        if (ownUserId) {
          setResolvedUserId(String(ownUserId));
          setLoading(false);
          setError('');
          return;
        }

        setResolvedUserId('');
        setLoading(false);
        setError('No profile username provided.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const { data } = await api.get(`/public/users/${encodeURIComponent(username)}`);
        const id = data?._id || data?.id || '';

        if (!id) {
          throw new Error('Profile id missing in response');
        }

        if (!ignore) {
          setResolvedUserId(String(id));
          setError('');
        }
      } catch (err) {
        if (!ignore) {
          setResolvedUserId('');
          setError(err?.response?.data?.error || 'Profile could not be found.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    resolveUserByUsername();

    return () => {
      ignore = true;
    };
  }, [userId, username, ownUserId]);

  const effectiveUserId = useMemo(
    () => String(userId || resolvedUserId || ''),
    [userId, resolvedUserId]
  );

  if (loading) {
    return (
      <section className="flex min-h-screen w-full items-center justify-center bg-gray-100 px-4">
        <div className="rounded-lg bg-white p-6 text-gray-500 shadow-md">Loading profile...</div>
      </section>
    );
  }

  if (!effectiveUserId) {
    return (
      <section className="flex min-h-screen w-full items-center justify-center bg-gray-100 px-4">
        <div className="rounded-lg bg-white p-6 text-red-600 shadow-md">
          {error || 'Profile unavailable.'}
        </div>
      </section>
    );
  }

  // No extra width wrapper here — matches the direct /user/:userId route's full-width styling.
  return <UserProfileView userId={effectiveUserId} disableActionButtons={disableActionButtons} />;
}
