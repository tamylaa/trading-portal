import React, { useEffect, useRef } from 'react';

/**
 * ContentManagerWidget - React wrapper for <tamyla-content-manager>
 * Ensures consistent usage, theme, and prop passing across the app.
 *
 * Props:
 *   apiBase: string (API endpoint base URL)
 *   authToken: string (JWT or session token)
 *   maxFileSize: number (bytes)
 *   currentUser: object (optional, for audit/logging)
 *   style, className: for layout
 *   ...rest: passed as attributes
 */
const ContentManagerWidget = ({
  apiBase = 'https://content.tamyla.com',
  authToken = '',
  maxFileSize = 25 * 1024 * 1024,
  currentUser = null,
  style = {},
  className = '',
  ...rest
}) => {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.apiBase = apiBase;
      ref.current.authToken = authToken;
      ref.current.maxFileSize = maxFileSize;
      if (currentUser) ref.current.currentUser = currentUser;
    }
  }, [apiBase, authToken, maxFileSize, currentUser]);

  // Optionally, listen for upload events
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleUpload = (e) => {
      if (rest.onContentUploaded) rest.onContentUploaded(e.detail);
    };
    el.addEventListener('content-uploaded', handleUpload);
    return () => el.removeEventListener('content-uploaded', handleUpload);
  }, [rest.onContentUploaded]);

  return (
    <tamyla-content-manager
      ref={ref}
      style={style}
      class={className}
      {...rest}
    />
  );
};

export default ContentManagerWidget;