/**
 * MessagesPage
 * Route: (standalone route if needed - currently messaging lives inside UserLayout/UserMessages)
 * This page provides a full-screen messaging view outside of the dashboard.
 * Placeholder — implement UI during redesign.
 */
import { Outlet } from 'react-router-dom';
import ConversationList from '../components/ConversationList';

export default function MessagesPage() {
  return (
    <div className="messages-page">
      <ConversationList />
      <main className="messages-page__content">
        {/* Renders nested message thread routes if any, or a placeholder */}
        <Outlet />
      </main>
    </div>
  );
}
