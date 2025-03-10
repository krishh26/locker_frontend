import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import * as React from 'react';
import {
  Button,
  Grid,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useDispatch, useSelector } from 'react-redux';
import { deleteNotifications, fetchNotifications, readNotifications, selectnotificationSlice } from 'app/store/notification';


function Notification(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const [dot, setDot] = React.useState(false);

  const { notification } = useSelector(selectnotificationSlice);

  const dispatch = useDispatch()

  React.useEffect(() => {
    dispatch(fetchNotifications())
  }, []);

  React.useEffect(() => {
    setNotifications(notification);
  }, [notification])

  React.useEffect(() => {
    setDot(notification.filter(n =>!n.read).length > 0);
  }, [notifications])

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRead = async (id) => {
    await dispatch(readNotifications(id))
    setNotifications(notifications.map(notification =>
      notification.notification_id
        === id ? { ...notification, read: true } : notification
    ));
  };

  const handleReadAll = async () => {
    await dispatch(readNotifications())
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  const handleRemove = async (id) => {
    await dispatch(deleteNotifications(id))
    setNotifications(notifications.filter(notification => notification.notification_id
      !== id));
  };

  const handleRemoveAll = async () => {
    await dispatch(deleteNotifications())
    setNotifications([]);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;


  return (
    <div>
      <Button aria-describedby={id} className='min-w-0 ' onClick={handleClick}>
        <div className='relative'>
          {dot && <div className='w-10 h-10 bg-red rounded-full absolute right-0'></div>}
          <NotificationsNoneIcon />
        </div>
      </Button>
      <Popover
        className='top-24 '
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Grid className='flex flex-col items-center h-360 w-320 '>
          {notifications.length === 0 ? (
            <>
              <div className='flex flex-col items-center justify-center pt-44'>
                <div>
                  <img
                    className='pt-52 '
                    src="assets/images/svgImage/notification.svg"
                    alt="notification"
                  />
                </div>
                <div className="flex items-center justify-center p-16">
                  <Typography className="text-16 text-center" color="text.secondary">
                    You have no new notification now.
                  </Typography>
                </div>
              </div>
            </>
          ) : (
            <>
              <List className='px-10 pt-3 pb-0 w-320'>
                {notifications?.slice(0, 5)?.map((notification) => (
                  <ListItem key={notification.notification_id
                  } className='flex px-0 py-2 gap-7' divider>
                    <Grid className='px-5 '>
                      {notification.type === 'notification' && <NotificationsActiveIcon />}
                      {notification.type === 'news' && < NewspaperIcon />}
                      {notification.type === 'allocation' && < AssignmentIcon />}
                    </Grid>

                    <ListItemText>
                      <Typography style={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                        {notification.title.slice(0, 20) + (notification.title.length > 20 ? '...' : '')}
                      </Typography>
                      <Tooltip title={notification.message}>
                        <Typography style={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                          {notification.message.slice(0, 25) + (notification.message.length > 25 ? '...' : '')}
                        </Typography>
                      </Tooltip>
                    </ListItemText>

                    <Grid className='flex content-center '>
                      <Button className='p-0 min-w-36' onClick={() => handleRead(notification.notification_id
                      )}>
                        <img
                          src="assets/images/svgImage/read.svg"
                          alt="read"
                        />
                      </Button>
                      <Button className='p-0 min-w-36' onClick={() => handleRemove(notification.notification_id
                      )}>
                        <img
                          src="assets/images/svgImage/remove.svg"
                          alt="remove"
                        />
                      </Button>
                    </Grid>

                  </ListItem>
                ))}
              </List>
              <Grid className='flex flex-col w-full text-center mt-auto'>
                <Grid className='w-full '>
                  <Link to="/notification">
                    <Button variant="text" className='text-[#5B718F] font-600 ' onClick={handleClose} >
                      View All
                    </Button>
                  </Link>
                </Grid>
                <Grid className='flex w-full '>
                  <Grid className='w-1/2 bg-[#5B718F33]'>
                    <Button variant="text" className='text-[#5B718F] font-600' onClick={handleReadAll}>
                      Mark as read all
                    </Button>
                  </Grid>
                  <Grid className='w-1/2 bg-[#5B718F]'>
                    <Button variant="text" className='text-[#ffffff] font-600' onClick={handleRemoveAll}>
                      Delete all
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      </Popover>
    </div >
  );
}

export default Notification;
