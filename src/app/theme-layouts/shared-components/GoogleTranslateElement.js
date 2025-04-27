import { memo, useEffect } from "react";

function GoogleTranslateElement() {
  useEffect(() => {
    if (typeof window.googleTranslateInit === "function") {
      window.googleTranslateInit();
    } else {
      const checkInterval = setInterval(() => {
        if (typeof window.googleTranslateInit === "function") {
          window.googleTranslateInit();
          clearInterval(checkInterval);
        }
      }, 500);

      setTimeout(() => clearInterval(checkInterval), 10000);
    }

    return () => {};
  }, []);

  return null;
}

export default memo(GoogleTranslateElement);
