import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/shared/utils/api';
import UserProfileView from './UserProfileViewPage';
import { setSEO } from '@/shared/utils/seo';

export default function ProfilePage({ userId = null, disableActionButtons = false }) {
  const { username } = useParams();

  useEffect(() => {
    if (username) {
      setSEO(
        `${username}'s Escort Profile | Mystery Mansion`,
        `View ${username}'s escort profile on Mystery Mansion. Browse listings, read client reviews, and get contact details for ${username}.`
      );
    }
  }, [username]);
  const [resolvedUserId, setResolvedUserId] = useState('');
  const [loading, setLoading] = useState(Boolean(!userId && username));
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
  }, [userId, username]);

  const effectiveUserId = useMemo(
    () => String(userId || resolvedUserId || ''),
    [userId, resolvedUserId]
  );

  if (loading) {
    return (
      <section className="w-full min-h-screen px-4 sm:px-6 lg:px-12 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-gray-500">Loading profile...</div>
        </div>
      </section>
    );
  }

  if (!effectiveUserId) {
    return (
      <section className="w-full min-h-screen px-4 sm:px-6 lg:px-12 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-red-600">
            {error || 'Profile unavailable.'}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full min-h-screen px-4 sm:px-6 lg:px-12 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <UserProfileView userId={effectiveUserId} disableActionButtons={disableActionButtons} />
        </div>
      </div>
    </section>
  );
}
