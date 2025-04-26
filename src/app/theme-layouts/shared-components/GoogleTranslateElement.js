/* eslint-disable consistent-return */
import { memo, useEffect, useRef } from 'react';

// Global variable to track if script is loaded
let googleTranslateScriptLoaded = false;

function GoogleTranslateElement() {
  const translatorInitialized = useRef(false);
  
  useEffect(() => {
    // Only initialize once
    if (translatorInitialized.current) {
      return;
    }
    
    const initGoogleTranslate = () => {
      if (window.google && window.google.translate) {
        try {
          // Clear previous instance if exists
          const existingElement = document.querySelector('.goog-te-combo');
          if (existingElement) {
            return; // Already initialized
          }
          
          // eslint-disable-next-line no-new
          new window.google.translate.TranslateElement(
            {
              autoDisplay: false,
              pageLanguage: 'en',
            },
            'google_translate_element'
          );
          
          // Mark as initialized
          translatorInitialized.current = true;
        } catch (error) {
          console.error('Error initializing Google Translate:', error);
        }
      } else {
        console.error('Google Translate library not loaded yet.');
      }
    };

    if (!window.googleTranslateElementInit && !googleTranslateScriptLoaded) {
      window.googleTranslateElementInit = initGoogleTranslate;
      googleTranslateScriptLoaded = true;
      
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => {
        console.error('Failed to load Google Translate script.');
        googleTranslateScriptLoaded = false;
        delete window.googleTranslateElementInit;
      };
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      // If already loaded, initialize directly
      initGoogleTranslate();
    }
    
    // No cleanup needed as we want to keep the script loaded
    return () => {
      // We intentionally don't clean up the script or init function here
      // to maintain single load behavior
    };
  }, []); // Empty dependency array ensures this only runs once

  return (
    <div
      id="google_translate_element"
      style={{
        borderBottom: '1px solid lightgray',
        padding: 0,
        fontSize: '14px',
        width: '100px',
        position: 'relative',
        zIndex: 999,
      }}
    />
  );
}

export default memo(GoogleTranslateElement);
