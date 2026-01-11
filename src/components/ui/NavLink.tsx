import { forwardRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface NavLinkProps extends Omit<LinkProps, 'to'> {
  /** The destination URL */
  to: string;
  /**
   * Optional custom click handler. When provided, this is called for regular clicks
   * instead of default navigation. Useful for intercepting navigation (e.g., unsaved changes).
   * Middle-click and Ctrl/Cmd+click always use native browser behavior (open in new tab).
   */
  onNavigate?: () => void;
}

/**
 * A navigation link component that provides native browser behavior for middle-click
 * and Ctrl/Cmd+click (opens in background tab), while supporting custom click handlers
 * for regular clicks.
 *
 * Uses react-router-dom's Link under the hood, which renders as an <a> element.
 * This gives us proper browser-native behavior without needing window.open().
 *
 * @example
 * // Basic usage - regular Link behavior
 * <NavLink to="/dashboard">Go to Dashboard</NavLink>
 *
 * @example
 * // With custom click handler (e.g., check for unsaved changes)
 * <NavLink to="/dashboard" onNavigate={handleBack}>
 *   Back to Dashboard
 * </NavLink>
 *
 * @example
 * // With Button styling using asChild
 * <Button variant="ghost" asChild>
 *   <NavLink to="/dashboard">
 *     <ArrowLeft className="h-4 w-4 mr-2" />
 *     Back to Dashboard
 *   </NavLink>
 * </Button>
 */
export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, onNavigate, onClick, children, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Call original onClick if provided
      onClick?.(event);

      // If already prevented, don't do anything
      if (event.defaultPrevented) {
        return;
      }

      // Let browser handle Ctrl/Cmd+click natively (opens new tab)
      if (event.metaKey || event.ctrlKey) {
        return;
      }

      // For regular clicks with a custom handler, prevent default and call it
      if (onNavigate) {
        event.preventDefault();
        onNavigate();
      }
      // Otherwise, let Link handle regular navigation normally
    };

    return (
      <Link ref={ref} to={to} onClick={handleClick} {...props}>
        {children}
      </Link>
    );
  }
);

NavLink.displayName = 'NavLink';
