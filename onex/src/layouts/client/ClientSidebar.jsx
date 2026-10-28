import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Heart, MessageSquareText, User,
  LogOut, Search, Bell, Coins, Trophy, Flag, Waypoints, Rocket,
  Cog,
} from 'lucide-react';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import DashboardSidebar from '@/layouts/shared/DashboardSidebar';
import useMembership from '@/features/membership/hooks/useMembership';

export default function ClientSidebar({ isOpen, onClose, unreadMessages = 0 }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
  const { membership } = useMembership();

  const avatarSrc = user?.profilePic || '';

  const navItems = [
    { to: '/client/dashboard',       label: 'Dashboard',     icon: LayoutDashboard, end: true },
    { to: '/client/liked-posts',     label: 'Liked Posts',   icon: Heart },
    { to: '/client/messages',        label: 'Messages',      icon: MessageSquareText, badge: unreadMessages },
    // Active members land on their own membership page; everyone else sees the plans.
    { to: membership.active ? '/client/membership' : '/membership', label: 'Membership', icon: Rocket },
    { to: '/client/notifications',   label: 'Notifications', icon: Bell },
    { to: '/client/credits',         label: 'Credits',       icon: Coins },
    { to: '/client/milestones',      label: 'Milestones',    icon: Trophy },
    { to: '/client/reports',         label: 'My Reports',    icon: Flag },
    //{ to: '/referrals',              label: 'Referrals', icon: Waypoints },
    { to: '/client/profile',         label: 'Edit Profile',  icon: User },
    { to: '/',                       label: 'Browse Listings', icon: Search },
    //{ to: '*',                       label: 'Settings', icon: Cog },
  ].sort((a, b) => a.label.localeCompare(b.label));

  const footerActions = [
    {
      label: 'Sign Out',
      icon: LogOut,
      danger: true,
      onClick: async () => {
        navigate('/signout');
        await logout?.();
      },
    },
  ];

  return (
    <DashboardSidebar
      variant="client"
      isOpen={isOpen}
      onClose={onClose}
      brand={{
        label: user?.username ?? 'My Account',
        avatarSrc,
        avatarAlt: 'Your avatar',
      }}
      navItems={navItems}
      footerActions={footerActions}
    />
  );
}
