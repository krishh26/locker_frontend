import { memo, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';

window.googleTranslateElementInit = () => {};

const getCurrentLanguage = () => {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith('googtrans='))
      ?.split('/')[2] || ''
  );
};

const saveLanguageToLocalStorage = (lang) => {
  if (lang && lang !== 'en') {
    localStorage.setItem('googtrans_lang', lang);
  } else if (lang === 'en') {
    localStorage.removeItem('googtrans_lang');
  }
};

export const cleanupGoogleTranslate = (preserveLanguage = true) => {
  try {
    let currentLang = '';
    if (preserveLanguage) {
      currentLang = getCurrentLanguage();
      if (currentLang) {
        saveLanguageToLocalStorage(currentLang);
      }
    }

    const scriptTags = document.querySelectorAll(
      'script[src*="translate.google.com/translate_a/element.js"]'
    );
    scriptTags.forEach((script) => script.remove());

    const container = document.getElementById('google_translate_element');
    if (container) container.innerHTML = '';

    const iframes = document.querySelectorAll('iframe.goog-te-menu-frame');
    iframes.forEach((iframe) => iframe.remove());

    const googleElements = document.querySelectorAll(
      '.goog-te-gadget, .goog-te-banner-frame, .goog-te-menu-frame, .VIpgJd-ZVi9od-l4eHX-hSRGPd'
    );
    googleElements.forEach((element) => element.remove());

    document.body.classList.remove('translated-ltr', 'translated-rtl');
    if (!preserveLanguage) {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    }

    if (window.google && window.google.translate) {
      delete window.google.translate;
    }
  } catch (error) {
    // Error handling
  }
};

function GoogleTranslateElement() {
  const translatorInitialized = useRef(false);
  const isFirstMount = useRef(true);
  const initTimeoutRef = useRef(null);

  const currentTheme = useSelector((state) => state.fuse?.settings?.current?.theme?.main);

  const restoreSavedLanguage = useCallback(() => {
    const savedLang = localStorage.getItem('googtrans_lang');

    if (savedLang && savedLang !== 'en') {
      setTimeout(() => {
        try {
          const selectElement = document.querySelector('.goog-te-combo');
          if (selectElement) {
            selectElement.value = savedLang;
            selectElement.dispatchEvent(new Event('change'));
          }
        } catch (error) {
          // Error handling
        }
      }, 1000);
    }
  }, []);

  const initializeGoogleTranslate = useCallback(() => {
    try {
      const existingScripts = document.querySelectorAll(
        'script[src*="translate.google.com/translate_a/element.js"]'
      );
      existingScripts.forEach((script) => script.remove());

      const container = document.getElementById('google_translate_element');
      if (container) container.innerHTML = '';

      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.defer = true;

      window.googleTranslateElementInit = () => {
        if (window.google?.translate) {
          // eslint-disable-next-line no-new
          new window.google.translate.TranslateElement(
            {
              autoDisplay: false,
              pageLanguage: 'en',
              gaTrack: false,
            },
            'google_translate_element'
          );
          translatorInitialized.current = true;

          restoreSavedLanguage();

          setTimeout(() => {
            const translateElement = document.getElementById('google_translate_element');
            if (translateElement) {
              const dropdown = translateElement.querySelector('.goog-te-combo');
              if (dropdown) {
                dropdown.addEventListener('change', () => {
                  setTimeout(() => {
                    const currentLang = getCurrentLanguage();
                    saveLanguageToLocalStorage(currentLang);
                  }, 500);
                });
              }

              const observer = new MutationObserver(() => {
                const currentLang = getCurrentLanguage();
                saveLanguageToLocalStorage(currentLang);

                if (currentLang) {
                  if (currentLang !== 'en') {
                    localStorage.setItem('googtrans_lang', currentLang);
                  } else {
                    localStorage.removeItem('googtrans_lang');
                  }
                }
              });

              observer.observe(translateElement, {
                childList: true,
                subtree: true,
                attributes: true,
              });
            }
          }, 1000);
        }
      };

      document.body.appendChild(script);
    } catch (error) {
      // Error handling
    }
  }, [restoreSavedLanguage]);

  useEffect(() => {
    if (!isFirstMount.current) {
      const currentLang = getCurrentLanguage();
      if (currentLang && currentLang !== 'en') {
        saveLanguageToLocalStorage(currentLang);
      }

      cleanupGoogleTranslate();

      setTimeout(() => {
        initializeGoogleTranslate();
      }, 2000);
    }
  }, [currentTheme, initializeGoogleTranslate]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      cleanupGoogleTranslate();

      initTimeoutRef.current = setTimeout(() => {
        initializeGoogleTranslate();
      }, 1500);
    }

    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (
        (source && source.includes('translate.google.com')) ||
        message.includes('google') ||
        message.includes('translate')
      ) {
        return true;
      }

      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }

      window.onerror = originalOnError;
      translatorInitialized.current = false;
    };
  }, [initializeGoogleTranslate]);

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
