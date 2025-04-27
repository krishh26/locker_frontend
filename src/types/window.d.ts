interface Window {
  googleTranslateConfig?: {
    initialized: boolean;
    selectedLanguage: string | null;
    scriptLoaded: boolean;
  };
  googleTranslateElementInit?: () => void;
  googleTranslateInstance?: any;
  restoreGoogleTranslateLanguage?: () => void;
  saveGoogleTranslateLanguage?: () => void;
  initializeGoogleTranslate?: () => void;
  ensureGoogleTranslateLoaded?: () => void;

  googleTranslateInit?: () => void;
  googleTranslateCleanup?: () => void;

  google?: {
    translate?: {
      TranslateElement: any;
    };
  };
}
