'use client';

import { useEffect } from 'react';

export function BootstrapClient() {
  useEffect(() => {
    // Import Bootstrap JS only on client side
    // @ts-expect-error - Bootstrap bundle doesn't have types
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return null;
}
