import { useDispatch, useSelector } from 'react-redux';
import FuseShortcuts from '@fuse/core/FuseShortcuts';
import { selectFlatNavigation } from 'app/store/fuse/navigationSlice';

function NavigationShortcuts(props) {
  const { variant, className } = props;
  const navigation = useSelector(selectFlatNavigation);

  function handleShortcutsChange(newShortcuts) {
  }

  return (
    <FuseShortcuts
      className={className}
      variant={variant}
      navigation={navigation}
      // shortcuts={shortcuts}
      onChange={handleShortcutsChange}
    />
  );
}

export default NavigationShortcuts;
