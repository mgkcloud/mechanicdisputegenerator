// This is a polyfill for the __name function used in Next.js with Cloudflare Workers
// ReferenceError: Can't find variable: __name
if (typeof window !== 'undefined' && typeof window.__name === 'undefined') {
  window.__name = (target, value) => {
    if (typeof Object.defineProperty === 'function') {
      Object.defineProperty(target, 'name', { 
        value, 
        configurable: true 
      });
    }
    return target;
  };
}

export {}; 