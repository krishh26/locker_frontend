import { memo, useEffect, useRef } from 'react';

// Global variable to track if the script is loaded
let googleTranslateScriptLoaded = false;
let googleTranslateScriptPromise = null;

function GoogleTranslateElement() {
  const translatorInitialized = useRef(false);

  useEffect(() => {
    const initGoogleTranslate = () => {
      if (window.google?.translate) {
        const existingElement = document.querySelector('.goog-te-combo');
        if (!existingElement) {
          // eslint-disable-next-line no-new
          new window.google.translate.TranslateElement(
            {
              autoDisplay: false,
              pageLanguage: 'en',
            },
            'google_translate_element'
          );
        }
        translatorInitialized.current = true;
      }
    };

    const loadScript = () => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (error) => reject(error);
        document.body.appendChild(script);
      });
    };

    // Clear previous translate element container content
    const container = document.getElementById('google_translate_element');
    if (container) container.innerHTML = '';

    const loadTranslateElement = async () => {
      try {
        // If the script is not loaded, load it
        if (!googleTranslateScriptLoaded) {
          if (!googleTranslateScriptPromise) {
            googleTranslateScriptPromise = loadScript().then(() => {
              googleTranslateScriptLoaded = true;
            });
          }
          await googleTranslateScriptPromise;
        }

        // Wait for Google Translate to be available
        const checkTranslateLoaded = () => {
          return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
              if (window.google?.translate) {
                clearInterval(interval);
                resolve();
              }
            }, 100);
            setTimeout(() => {
              clearInterval(interval);
              reject(new Error('Google Translate failed to load in time'));
            }, 5000); // Timeout after 5 seconds
          });
        };

        await checkTranslateLoaded();
        initGoogleTranslate();
      } catch (error) {
        console.error(error);
        // Reset the promise to allow retry on next mount
        googleTranslateScriptPromise = null;
        googleTranslateScriptLoaded = false;
      }
    };

    loadTranslateElement();

    return () => {
      const scriptTags = document.querySelectorAll(
        'script[src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"]'
      );
      scriptTags.forEach((script) => script.remove());
      // Reset the initialized state
      translatorInitialized.current = false;
    };
  }, []);

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
