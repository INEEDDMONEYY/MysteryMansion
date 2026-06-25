import { useState, useEffect } from "react";
import api from "@/shared/utils/api";
import RestrictUserSetting from "@/shared/components/admin/settings/RestrictUserSettings.jsx";
import UnrestrictUserSetting from "@/shared/components/admin/settings/UnrestrictUserSettings.jsx";
import SuspendUserSetting from "@/shared/components/admin/settings/SuspendUserSettings.jsx";
import DeveloperMessageSetting from "@/shared/components/admin/settings/DeveloperMessageSettings.jsx";
import AdminCredentialsSetting from "@/shared/components/admin/settings/AdminCredentialsSettings.jsx";
import ProfilePictureSetting from "@/shared/components/admin/settings/ProfilePictureSettings.jsx";
import DeleteUserSetting from "@/shared/components/admin/settings/DeleteUserSettings.jsx";
import VisitorCountSetting from "@/shared/components/admin/settings/VisitorCountSetting.jsx";
import PlatformUpdatesForm from "@/features/updates/components/PlatformUpdatesForm";
import NewFeatureUpdatesForm from "@/features/updates/components/NewFeatureUpdatesForm";


export default function AdminSettings({ onProfileUpdate, settingsData }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/admin/users");
        setUsers(data?.data || data?.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-5 pb-8 max-w-4xl">
      <RestrictUserSetting users={users} />
      <UnrestrictUserSetting users={users} />
      <SuspendUserSetting users={users} />
      <DeveloperMessageSetting />
      <VisitorCountSetting />
      <AdminCredentialsSetting />
      <ProfilePictureSetting
        currentProfile={settingsData?.profilePicture}
        onProfileUpdate={onProfileUpdate}
      />
      <DeleteUserSetting users={users} />

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Platform Updates</h2>
        <PlatformUpdatesForm />
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">New Feature Updates</h2>
        <NewFeatureUpdatesForm />
      </div>
    </div>
  );
}
