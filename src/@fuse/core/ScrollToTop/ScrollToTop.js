import { useEffect } from 'react';
import history from '@history';

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * when the route changes. This component should be placed inside the Router
 * but outside of any route-specific components.
 */
function ScrollToTop() {
  useEffect(() => {
    // Listen to history changes and scroll to top
    const unlisten = history.listen((location, action) => {
      // Debug log to verify it's working
      console.log('Route changed, scrolling to top:', location.pathname);
      
      // Using requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        // Try multiple selectors to find the scrollable container
        const selectors = [
          '#fuse-main .overflow-y-auto',
          '#fuse-main > div:last-child',
          '.FusePageSimple-content',
          '.FusePageCarded-contentWrapper',
          'main .overflow-y-auto',
          'main > div:last-child'
        ];
        
        let scrolled = false;
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element && element.scrollHeight > element.clientHeight) {
            element.scrollTo({
              top: 0,
              left: 0,
              behavior: 'auto'
            });
            scrolled = true;
            console.log('Scrolled container:', selector);
            break;
          }
        }
        
        // Also scroll the window as fallback
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });
        
        if (!scrolled) {
          console.log('No scrollable container found, used window scroll');
        }
      });
    });

    // Cleanup listener on unmount
    return unlisten;
  }, []);

  return null;
}

export default ScrollToTop;
