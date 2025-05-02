import { memo, useEffect, useRef } from "react";

function GoogleTranslateElement() {
  const translatorRef = useRef(null);

  useEffect(() => {
    // Position the Google Translate element next to the font size resizer
    const positionTranslateElement = () => {
      const googleTranslateElement = document.getElementById('google_translate_element');
      const toolbarContainer = document.getElementById('toolbar-container');

      if (googleTranslateElement && toolbarContainer && translatorRef.current) {
        // Get the position of the reference element in the toolbar
        const rect = translatorRef.current.getBoundingClientRect();

        // Make the Google Translate element visible
        googleTranslateElement.style.display = 'block';
        googleTranslateElement.style.position = 'absolute';
        googleTranslateElement.style.top = `${rect.top}px`;
        googleTranslateElement.style.left = `${rect.left}px`;
        googleTranslateElement.style.height = `${rect.height}px`;
        googleTranslateElement.style.zIndex = '1000';
        googleTranslateElement.style.minWidth = '200px';
      }
    };

    // Initialize Google Translate
    if (typeof window.googleTranslateInit === "function") {
      window.googleTranslateInit();
      setTimeout(positionTranslateElement, 500);
    } else {
      const checkInterval = setInterval(() => {
        if (typeof window.googleTranslateInit === "function") {
          window.googleTranslateInit();
          clearInterval(checkInterval);
          setTimeout(positionTranslateElement, 500);
        }
      }, 500);

      setTimeout(() => clearInterval(checkInterval), 10000);
    }

    // Reposition on window resize
    window.addEventListener('resize', positionTranslateElement);

    // Reposition periodically to handle any layout changes
    const positionInterval = setInterval(positionTranslateElement, 2000);

    return () => {
      window.removeEventListener('resize', positionTranslateElement);
      clearInterval(positionInterval);
    };
  }, []);

  // Return a reference div that will be used for positioning
  return <div ref={translatorRef} className="google-translate-placeholder mr-8" style={{ width: '200px', height: '40px' }} />;
}

export default memo(GoogleTranslateElement);
