
import '@mock-api';
import BrowserRouter from '@fuse/core/BrowserRouter';
import FuseLayout from '@fuse/core/FuseLayout';
import FuseTheme from '@fuse/core/FuseTheme';
import { SnackbarProvider } from 'notistack';
import { useDispatch, useSelector } from 'react-redux';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { selectCurrentLanguageDirection } from 'app/store/i18nSlice';
import { selectUser } from 'app/store/userSlice';
import themeLayouts from 'app/theme-layouts/themeLayouts';
import { changeFuseTheme, selectMainTheme } from 'app/store/fuse/settingsSlice';
import themesConfig from 'app/configs/themesConfig';
import FuseAuthorization from '@fuse/core/FuseAuthorization';
import settingsConfig from 'app/configs/settingsConfig';
import withAppProviders from './withAppProviders';
import { AuthProvider } from './auth/AuthContext';
import { useEffect } from 'react';
import { disconnectFromSocket } from 'src/utils/socket';


const emotionCacheOptions = {
  rtl: {
    key: 'muirtl',
    stylisPlugins: [rtlPlugin],
    insertionPoint: document.getElementById('emotion-insertion-point'),
  },
  ltr: {
    key: 'muiltr',
    stylisPlugins: [],
    insertionPoint: document.getElementById('emotion-insertion-point'),
  },
};

function App() {
  const langDirection = useSelector(selectCurrentLanguageDirection);
  const mainTheme = useSelector(selectMainTheme);
  const dispatch = useDispatch();
  let user = useSelector(selectUser)?.data;

  // Load saved theme from localStorage
  useEffect(() => {
    try {
      const savedThemeData = localStorage.getItem('selectedTheme');
      if (savedThemeData) {
        const { themeName } = JSON.parse(savedThemeData);
        if (themeName && themesConfig[themeName]) {
          // Create a new function instance for the saved theme
          const changeTheme = changeFuseTheme(themesConfig[themeName]);
          changeTheme(dispatch, () => ({ fuse: { settings: { current: { theme: { main: null } } } } }));
        }
      }
    } catch (e) {
      console.error('Failed to load saved theme:', e);
    }
  }, [dispatch]);

  useEffect(() => {
    return () => {
      disconnectFromSocket()
    }
  }, [])

  return (
    <CacheProvider value={createCache(emotionCacheOptions[langDirection])}>
      <FuseTheme theme={mainTheme} direction={langDirection}>
        <AuthProvider>
          <BrowserRouter>
            <FuseAuthorization
              userRole={user?.role}
              loginRedirectUrl={settingsConfig.loginRedirectUrl}
            >
              <SnackbarProvider
                maxSnack={5}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                classes={{
                  containerRoot: 'bottom-0 right-0 mb-52 md:mb-68 mr-8 lg:mr-80 z-99',
                }}
              >
                <FuseLayout layouts={themeLayouts} />
              </SnackbarProvider>
            </FuseAuthorization>
          </BrowserRouter>
        </AuthProvider>
      </FuseTheme>
    </CacheProvider>
  );
}

export default withAppProviders(App)();