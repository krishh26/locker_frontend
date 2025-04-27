const GOOGLE_TRANSLATE_CONFIG = {
  pageLanguage: 'en',
  includedLanguages: 'af,sq,am,ar,hy,az,eu,be,bn,bs,bg,ca,ceb,zh-CN,zh-TW,co,hr,cs,da,nl,en,eo,et,fi,fr,fy,gl,ka,de,el,gu,ht,ha,haw,he,hi,hmn,hu,is,ig,id,ga,it,ja,jv,kn,kk,km,ko,ku,ky,lo,la,lv,lt,lb,mk,mg,ms,ml,mt,mi,mr,mn,my,ne,no,ny,ps,fa,pl,pt,pa,ro,ru,sm,gd,sr,st,sn,sd,si,sk,sl,so,es,su,sw,sv,tl,tg,ta,te,th,tr,uk,ur,uz,vi,cy,xh,yi,yo,zu', // Include all languages
  autoDisplay: true
};
let isScriptLoaded = false;
let isInitialized = false;
let selectedLanguage = null;
let translateElementContainer = null;
function initGoogleTranslate() {
  if (!document.getElementById('google_translate_element')) {
    translateElementContainer = document.createElement('div');
    translateElementContainer.id = 'google_translate_element';
    translateElementContainer.style.position = 'fixed';
    translateElementContainer.style.bottom = '20px';
    translateElementContainer.style.right = '20px';
    translateElementContainer.style.zIndex = '9999';
    translateElementContainer.style.backgroundColor = 'white';
    translateElementContainer.style.padding = '10px';
    translateElementContainer.style.borderRadius = '8px';
    translateElementContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    translateElementContainer.style.minWidth = '200px';
    document.body.appendChild(translateElementContainer);
  } else {
    translateElementContainer = document.getElementById('google_translate_element');
    translateElementContainer.style.position = 'fixed';
    translateElementContainer.style.bottom = '20px';
    translateElementContainer.style.right = '20px';
    translateElementContainer.style.zIndex = '9999';
    translateElementContainer.style.backgroundColor = 'white';
    translateElementContainer.style.padding = '10px';
    translateElementContainer.style.borderRadius = '8px';
    translateElementContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    translateElementContainer.style.minWidth = '200px';
  }

  if (!isScriptLoaded) {
    loadGoogleTranslateScript();
  } else if (window.google && window.google.translate) {
    if (!isInitialized) {
      createTranslateElement();
    }
  }
}

function loadGoogleTranslateScript() {
  const existingScript = document.querySelector('script[src*="translate.google.com/translate_a/element.js"]');
  if (existingScript) {
    console.log('Google Translate script already exists, not loading again');
    isScriptLoaded = true;
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  script.async = true;
  script.defer = true;
  script.id = 'google-translate-script'; // Add ID for easier removal

  window.googleTranslateElementInit = function() {
    createTranslateElement();
  };

  document.body.appendChild(script);
  isScriptLoaded = true;
}

function createTranslateElement() {

  if (window.google && window.google.translate && window.google.translate.TranslateElement) {
    try {
      if (translateElementContainer) {
        translateElementContainer.innerHTML = '';
      }

      window.googleTranslateInstance = new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'af,sq,am,ar,hy,az,eu,be,bn,bs,bg,ca,ceb,zh-CN,zh-TW,co,hr,cs,da,nl,en,eo,et,fi,fr,fy,gl,ka,de,el,gu,ht,ha,haw,he,hi,hmn,hu,is,ig,id,ga,it,ja,jv,kn,kk,km,ko,ku,ky,lo,la,lv,lt,lb,mk,mg,ms,ml,mt,mi,mr,mn,my,ne,no,ny,ps,fa,pl,pt,pa,ro,ru,sm,gd,sr,st,sn,sd,si,sk,sl,so,es,su,sw,sv,tl,tg,ta,te,th,tr,uk,ur,uz,vi,cy,xh,yi,yo,zu',
        autoDisplay: true,
        layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL
      }, 'google_translate_element');

      isInitialized = true;

      observeTranslateElement();

      setTimeout(restoreLanguage, 1000);

      addGoogleTranslateStyles();

      setTimeout(() => {
        const comboBox = document.querySelector('.goog-te-combo');
        if (comboBox) {
          comboBox.style.display = 'block';
          comboBox.style.visibility = 'visible';
          comboBox.style.opacity = '1';
          comboBox.style.width = '100%';
          comboBox.style.height = '45px';
          comboBox.style.padding = '10px 14px';
          comboBox.style.border = '2px solid #4285f4';
          comboBox.style.borderRadius = '8px';
          comboBox.style.fontSize = '14px';
          comboBox.style.fontWeight = '500';
          comboBox.style.backgroundColor = '#fff';
          comboBox.style.color = '#333';
          comboBox.style.cursor = 'pointer';
          comboBox.style.boxShadow = '0 2px 8px rgba(66, 133, 244, 0.15)';
          comboBox.style.transition = 'all 0.3s ease';
          comboBox.style.letterSpacing = '0.3px';

          try {
            comboBox.focus();
            const event = new MouseEvent('mousedown', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            comboBox.dispatchEvent(event);
          } catch (e) {
          }
        }
      }, 500);


    } catch (error) {

      setTimeout(createTranslateElement, 1000);
    }
  } else {

    setTimeout(createTranslateElement, 1000);
  }
}

function observeTranslateElement() {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length > 0) {
        const select = document.querySelector('.goog-te-combo');
        if (select && !select.dataset.monitored) {
          select.addEventListener('change', function() {
            selectedLanguage = select.value;
            localStorage.setItem('googleTranslateLanguage', selectedLanguage);
          });

          select.dataset.monitored = 'true';

          observer.disconnect();
        }
      }
    });
  });

  if (translateElementContainer) {
    observer.observe(translateElementContainer, {
      childList: true,
      subtree: true
    });
  }
}

function restoreLanguage() {
  const savedLanguage = selectedLanguage ||
                        localStorage.getItem('googleTranslateLanguage') ||
                        sessionStorage.getItem('googleTranslateLanguage');

  if (savedLanguage) {
    selectedLanguage = savedLanguage;

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = savedLanguage;

      const event = new Event('change', { bubbles: true });
      select.dispatchEvent(event);

      setTimeout(() => {
        if (select && select.value === savedLanguage) {
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 500);
    } else {
      setTimeout(restoreLanguage, 1000);
    }
  }
}

function addGoogleTranslateStyles() {
  if (document.querySelector('style[id="google-translate-styles"]')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'google-translate-styles';
  style.textContent = `
    /* Hide Google Translate attribution */
    .goog-logo-link, .goog-te-gadget span:not(.goog-te-combo), .goog-te-banner-frame, .skiptranslate {
      display: none !important;
    }

    /* Fix body position */
    body {
      top: 0 !important;
    }

    /* Style the dropdown - enhanced attractive design */
    .goog-te-combo {
      padding: 10px 14px !important;
      border-radius: 8px !important;
      border: 2px solid #4285f4 !important;
      background-color: #ffffff !important;
      color: #333 !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      width: 100% !important;
      max-width: 100% !important;
      height: 45px !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      box-shadow: 0 2px 8px rgba(66, 133, 244, 0.15) !important;
      transition: all 0.3s ease !important;
      cursor: pointer !important;
      outline: none !important;
      appearance: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234285f4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 12px center !important;
      background-size: 18px !important;
      padding-right: 40px !important;
      letter-spacing: 0.3px !important;
    }

    .goog-te-combo:hover {
      border-color: #1a73e8 !important;
      box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2) !important;
      transform: translateY(-1px) !important;
    }

    .goog-te-combo:focus {
      border-color: #1a73e8 !important;
      box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.25) !important;
      outline: none !important;
    }

    /* Container styling - enhanced */
    #google_translate_element {
      background-color: white !important;
      padding: 15px !important;
      border-radius: 12px !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      border: 1px solid rgba(66, 133, 244, 0.1) !important;
      transition: all 0.3s ease !important;
    }

    /* Make sure the gadget is visible and styled */
    .goog-te-gadget {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }

    /* Fix for dropdown options - enhanced */
    .goog-te-menu-value, .goog-te-menu, .goog-te-menu2 {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      border-radius: 8px !important;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15) !important;
      border: none !important;
      overflow: hidden !important;
    }

    /* Style the dropdown menu */
    .goog-te-menu2 {
      background-color: white !important;
      padding: 8px 0 !important;
    }

    .goog-te-menu2-item {
      padding: 8px 16px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      color: #333 !important;
    }

    .goog-te-menu2-item:hover {
      background-color: #f0f7ff !important;
      color: #1a73e8 !important;
    }

    .goog-te-menu2-item div {
      color: inherit !important;
    }
  `;
  document.head.appendChild(style);
}

function cleanupGoogleTranslate() {
  const select = document.querySelector('.goog-te-combo');
  if (select && select.value) {
    localStorage.setItem('googleTranslateLanguage', select.value);
  }

  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  const hostname = window.location.hostname;
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname}`;

  if (hostname.includes('.')) {
    const domain = hostname.substring(hostname.indexOf('.'));
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
  }

  isInitialized = false;
  isScriptLoaded = false;

  if (translateElementContainer) {
    translateElementContainer.remove();
    translateElementContainer = null;
  }

  document.body.classList.remove('translated-ltr', 'translated-rtl');
  document.body.style.top = '';

  const iframes = document.querySelectorAll('iframe[src*="translate.google"]');
  iframes.forEach(iframe => iframe.remove());

  const scripts = document.querySelectorAll('script[src*="translate.google"]');
  scripts.forEach(script => script.remove());
  const styles = document.getElementById('google-translate-styles');
  if (styles) {
    styles.remove();
  }
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initGoogleTranslate, 1000);
  setTimeout(initGoogleTranslate, 3000);
  setTimeout(initGoogleTranslate, 5000);
});


window.addEventListener('load', function() {
  setTimeout(initGoogleTranslate, 1000);
});


window.googleTranslateInit = initGoogleTranslate;
window.googleTranslateCleanup = cleanupGoogleTranslate;
