/**
 * UserSidebar
 * Thin config wrapper around DashboardSidebar.
 * Supplies user-specific nav items, feature-flag gates, and footer actions.
 * Style DashboardSidebar during UI redesign — do not add layout logic here.
 *
 * Props:
 *   isOpen         — bool
 *   onClose        — fn()
 *   unreadMessages — number  badge count on Messages link
 */
import { NavLink, useNavigate } from 'react-router-dom';
import {
  User, MessageSquareText, BarChart3, LogOut, Home,
  Sparkles, LayoutDashboard, BookMarked, Heart,
} from 'lucide-react';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';
import DashboardSidebar from '@/layouts/shared/DashboardSidebar';

export default function UserSidebar({ isOpen, onClose, unreadMessages = 0 }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const avatarSrc = user?.profilePic || '';

  // ── Base nav items — always visible ──────────────────────────────────────
  const navItems = [
    { to: '/user/dashboard',   label: 'Dashboard',    icon: LayoutDashboard, end: true },
    { to: '/user/saved-posts',  label: 'Posts',         icon: BookMarked },
    { to: '/user/liked-posts',   label: 'Liked',          icon: Heart },
    { to: '/user/activity',      label: 'Activity',       icon: BarChart3 },
    { to: '/user/profile',     label: 'Edit Profile',  icon: User },
    { to: '/user/messages',    label: 'Messages',      icon: MessageSquareText, badge: unreadMessages },
    { to: '/promote',          label: 'Promote',        icon: Sparkles },
  ];

  // ── Feature-flagged extra nav items ───────────────────────────────────────
  // Rendered via the extraNav slot so flags are evaluated at runtime
  const extraNav = null;

  // ── Footer actions ────────────────────────────────────────────────────────
  const footerActions = [
    {
      label: 'Home',
      icon: Home,
      onClick: () => { navigate('/'); onClose?.(); },
    },
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
      variant="user"
      isOpen={isOpen}
      onClose={onClose}
      brand={{
        label: user?.username ?? 'My Dashboard',
        avatarSrc,
        avatarAlt: 'Your avatar',
      }}
      navItems={navItems}
      extraNav={extraNav}
      footerActions={footerActions}
    />
  );
}

