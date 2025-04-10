import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* __name polyfill injected before anything else */}
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            if (typeof window !== 'undefined' && typeof window.__name === 'undefined') {
              window.__name = function(target, value) {
                if (typeof Object.defineProperty === 'function') {
                  Object.defineProperty(target, 'name', { 
                    value: value, 
                    configurable: true 
                  });
                }
                return target;
              };
            }
          })();
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 