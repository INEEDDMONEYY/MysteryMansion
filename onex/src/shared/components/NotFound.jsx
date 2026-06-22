/**
 * NotFound
 * Shared 404 component — displayed when a route doesn't match.
 * Style during UI redesign.
 *
 * Props:
 *   message — optional override text (default: "Page not found")
 */
import { Link } from 'react-router-dom';

export default function NotFound({ message = "Page not found" }) {
  return (
    <div className="not-found">
      <div className="not-found__content">
        <h1 className="not-found__code">404</h1>
        <p className="not-found__message">{message}</p>
        <p className="not-found__sub">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="not-found__link">
          Return Home
        </Link>
      </div>
    </div>
  );
}
