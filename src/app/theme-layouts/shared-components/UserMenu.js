import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from 'src/app/auth/AuthContext'
import jwtService from 'src/app/auth/services/jwtService';
import { changeUserRoleHandler, selectAdminUserManagement } from 'app/store/adminUserManagement';
import { style } from './Style';
import { getRandomColor } from 'src/utils/randomColor';
import { useCurrentUser } from 'src/app/utils/userHelpers';

function UserMenu(props) {
  const user = useCurrentUser();
  const userAvarat = useSelector(selectAdminUserManagement)
  const { isAuthenticated } = useAuth();
  const { logout } = jwtService;
  const [userMenu, setUserMenu] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userMenuClick = (event) => {
    setUserMenu(event.currentTarget);
  };

  const userMenuClose = () => {
    setUserMenu(null);
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    userMenuClose();
    setAnchorEl(null);
  };


  const changeRole = (role) => {
    dispatch(changeUserRoleHandler(role))
    navigate('/Home')
    handleClose()
  }

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Button
        className="min-h-40 min-w-40 px-0 md:px-16 py-0 md:py-6"
        onClick={userMenuClick}
        color="inherit"
        sx={style}
      >
        <div className="flex-col mx-4 items-end sm:!flex" style={{ display: "none" }}>
          <Typography component="span" className="font-semibold flex">
            {user?.first_name + ' ' + user?.last_name}
          </Typography>
          <Typography className="text-11 font-medium capitalize" color="text.white">
            {user?.role?.toString()}
            {(!user?.role || (Array.isArray(user?.role) && user?.role?.length === 0)) && 'Guest'}
          </Typography>
        </div>

        {(user?.avatar?.url || userAvarat?.avatar) ? (
          <Avatar className="md:mx-4" alt="user photo" src={userAvarat?.avatar || user?.avatar?.url} />
        ) : (
          <Avatar className="md:mx-4" sx={{ backgroundColor: getRandomColor(user?.first_name?.toLowerCase().charAt(0)) }}>{user?.first_name?.toUpperCase().charAt(0)}</Avatar>
        )}
      </Button>

      <Popover
        open={Boolean(userMenu)}
        anchorEl={userMenu}
        onClose={userMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        classes={{
          paper: 'py-8',
        }}
      >
        {isAuthenticated ? (
          <>
            {/* <MenuItem onClick={() => navigate('/profile')} >
              <ListItemText primary="My Profile" />
            </MenuItem> */}
            {user?.role !== 'Learner' && (
              <MenuItem onClick={handleClick}>
                <ListItemText primary="Change Role" />
              </MenuItem>
            )}

            <MenuItem MenuItem onClick={() => logout()} >
              <ListItemText primary="Sign Out" />
            </MenuItem>

            <Popover
              id={id}
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              classes={{
                paper: 'py-8',
              }}
            >
              {[...user?.roles]?.reverse()?.map(value => {
                return (
                  <MenuItem key={value} onClick={() => changeRole(value)}>
                    <ListItemText primary={value} />
                  </MenuItem>
                );
              })}
            </Popover>
          </>
        ) : (
          <Link to="/sign-in">
            <MenuItem>
              {/* <ListItemIcon className="min-w-40">
                <FuseSvgIcon>heroicons-outline:lock-closed</FuseSvgIcon>
              </ListItemIcon> */}
              <ListItemText primary="Sign In" />
            </MenuItem>
          </Link>
        )}
      </Popover >
    </>
  );
}

export default UserMenu;
