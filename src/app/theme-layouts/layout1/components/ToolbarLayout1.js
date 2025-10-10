import { Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Hidden from '@mui/material/Hidden';
import { ThemeProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import { selectFuseNavbar } from 'app/store/fuse/navbarSlice';
import { selectFuseCurrentLayoutConfig, selectToolbarTheme } from 'app/store/fuse/settingsSlice';
import clsx from 'clsx';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { useCurrentUser } from 'src/app/utils/userHelpers';
import { RoleShortForm } from 'src/utils/randomColor';
import AdjustFontSize from '../../shared-components/AdjustFontSize';
import GoogleTranslateElement from '../../shared-components/GoogleTranslateElement';
import NavbarToggleButton from '../../shared-components/NavbarToggleButton';
import UserMenu from '../../shared-components/UserMenu';
import Notification from './notification';

function ToolbarLayout1(props) {
  const config = useSelector(selectFuseCurrentLayoutConfig);
  const navbar = useSelector(selectFuseNavbar);
  const toolbarTheme = useSelector(selectToolbarTheme);
  const currentUser  = useCurrentUser();

  return (
    <ThemeProvider theme={toolbarTheme}>
      <AppBar
        id="fuse-toolbar"
        className={clsx('flex relative z-20 shadow-md', props.className)}
        color="default"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? '#5B718F'
              : toolbarTheme.palette.background.default,
        }}
        position="static"
      >
        <Toolbar className="p-0 min-h-64 md:min-h-64">
          <Typography className="ml-12 text-white" variant="h6">
            Welcome
            {`, ${currentUser?.first_name} ${currentUser?.last_name} ` +
              `(${RoleShortForm[currentUser?.role]})`}
          </Typography>

          <div className="flex flex-1 px-16">
            {config.navbar.display && config.navbar.position === 'left' && (
              <>
                <Hidden lgDown>
                  {(config.navbar.style === 'style-3' ||
                    config.navbar.style === 'style-3-dense') && (
                    <NavbarToggleButton className="w-40 h-40 p-0 mx-0" />
                  )}

                  {config.navbar.style === 'style-1' && !navbar.open && (
                    <NavbarToggleButton className="w-40 h-40 p-0 mx-0" />
                  )}
                </Hidden>

                <Hidden lgUp>
                  <NavbarToggleButton className="w-40 h-40 p-0 mx-0 sm:mx-8" />
                </Hidden>
              </>
            )}
          </div>

          <div className="flex items-center px-8 h-full overflow-x-auto" id="toolbar-container">
            {/* Google Translate Element - positioned to the left of font size resizer */}
            <GoogleTranslateElement />

            <AdjustFontSize />
            <Notification />
            <UserMenu />
          </div>

          {config.navbar.display && config.navbar.position === 'right' && (
            <>
              <Hidden lgDown>
                {!navbar.open && <NavbarToggleButton className="w-40 h-40 p-0 mx-0" />}
              </Hidden>

              <Hidden lgUp>
                <NavbarToggleButton className="w-40 h-40 p-0 mx-0 sm:mx-8" />
              </Hidden>
            </>
          )}
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default memo(ToolbarLayout1);
