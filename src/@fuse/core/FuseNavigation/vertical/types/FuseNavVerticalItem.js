import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { alpha, styled } from '@mui/material/styles';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useMemo } from 'react';
import FuseNavBadge from '../../FuseNavBadge';
import FuseSvgIcon from '../../../FuseSvgIcon';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { slice } from 'app/store/reloadData';
import { selectUser } from 'app/store/userSlice';

const Root = styled(ListItem)(({ theme, ...props }) => ({
  minHeight: 44,
  width: '100%',
  borderRadius: '6px',
  margin: '0 0 4px 0',
  paddingRight: 16,
  paddingLeft: props.itempadding > 80 ? 80 : props.itempadding,
  paddingTop: 10,
  paddingBottom: 10,
  color: "#5B718F",
  cursor: 'pointer',
  textDecoration: 'none!important',
  '&:hover': {
    color: "#FFFFFF",
    backgroundColor: "#5B718F !important"
  },
  '&.active': {
    color: "#FFFFFF",
    backgroundColor: "#5B718F",
    pointerEvents: 'none',
    transition: 'border-radius .15s cubic-bezier(0.4,0.0,0.2,1)',
    '& > .fuse-list-item-text-primary': {
      color: 'inherit',
    },
    '& > .fuse-list-item-icon': {
      color: 'inherit',
    },
  },
  '& >.fuse-list-item-icon': {
    marginRight: 16,
    color: 'inherit',
  },
  '& > .fuse-list-item-text': {},
}));

function FuseNavVerticalItem(props) {
  const { item, nestedLevel, onItemClick } = props;
  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

  const dispach = useDispatch();

  const itempadding = nestedLevel > 0 ? 38 + nestedLevel * 16 : 16;

  return useMemo(
    () => (
      item?.visible.includes(user?.role) &&
      <Root
        button
        component={NavLinkAdapter}
        to={item.url || ''}
        activeClassName={item.url ? 'active' : ''}
        className={clsx('fuse-list-item', item.active && 'active')}
        onClick={() => {
          dispach(slice.setLeanerId({ id: null, user_id: null }))
        }}
        end={item.end}
        itempadding={itempadding}
        role="button"
        sx={item.sx}
        disabled={item.disabled}
      >
        {item.icon && (
          <FuseSvgIcon
            className={clsx('fuse-list-item-icon shrink-0', item.iconClass)}
            color="action"
          >
            {item.icon}
          </FuseSvgIcon>
        )}

        <ListItemText
          className="fuse-list-item-text"
          primary={item.title}
          secondary={item.subtitle}
          classes={{
            primary: 'text-13 font-medium fuse-list-item-text-primary truncate',
            secondary: 'text-11 font-medium fuse-list-item-text-secondary leading-normal truncate',
          }}
        />
        {item.badge && <FuseNavBadge badge={item.badge} />}
      </Root>
    ),
    [item, itempadding, onItemClick]
  );
}

FuseNavVerticalItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    icon: PropTypes.string,
    url: PropTypes.string,
  }),
};

FuseNavVerticalItem.defaultProps = {};

const NavVerticalItem = FuseNavVerticalItem;

export default NavVerticalItem;
