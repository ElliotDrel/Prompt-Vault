import type { MouseEvent } from 'react';

type LinkNavigationOptions = {
  href: string;
  onNavigate: () => void;
};

export const handleLinkClick = (
  event: MouseEvent<HTMLAnchorElement>,
  { href, onNavigate }: LinkNavigationOptions
) => {
  event.preventDefault();

  if (event.metaKey || event.ctrlKey) {
    event.stopPropagation();
    window.open(href, '_blank', 'noopener,noreferrer');
    return;
  }

  onNavigate();
};

export const handleLinkMouseDown = (
  event: MouseEvent<HTMLAnchorElement>,
  href: string
) => {
  if (event.button !== 1) {
    return;
  }

  if (event.metaKey || event.ctrlKey) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  window.open(href, '_blank', 'noopener,noreferrer');
};
