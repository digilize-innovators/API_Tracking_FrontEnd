import React from 'react';
import PropTypes from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import VerticalLayout from 'src/@core/layouts/VerticalLayout';
import VerticalNavItems from 'src/navigation/vertical';
import VerticalAppBarContent from './components/vertical/AppBarContent';
import { useSettings } from 'src/@core/hooks/useSettings';

// Context definition (if needed elsewhere in the app)
// export const LoaderContext = createContext({
//   isLoading: false,
//   setIsLoading: () => null,
// });

// export const LoaderProvider = ({ children }) => {
//   const [isLoading, setIsLoading] = useState(false);
//   const contextValue = useMemo(() => ({ isLoading, setIsLoading }), [isLoading, setIsLoading]);

//   return (
//     <LoaderContext.Provider value={contextValue}>
//       {children}
//     </LoaderContext.Provider>
//   );
// };

// LoaderProvider.propTypes = {
//   children: PropTypes.any,
// };

// Separated AppBarContent component
const AppBarContent = ({ hidden, settings, saveSettings, toggleNavVisibility }) => {
  return (
    <VerticalAppBarContent
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      toggleNavVisibility={toggleNavVisibility}
    />
  );
};

AppBarContent.propTypes = {
  hidden: PropTypes.any,
  settings: PropTypes.any,
  saveSettings: PropTypes.any,
  toggleNavVisibility: PropTypes.any,
};

// Main UserLayout component
const UpgradeToProImg = () => {
  return <></>;
};

const UserLayout = ({ children }) => {
  const { settings, saveSettings } = useSettings();
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'));
  const navItems = VerticalNavItems();

  return (
    <VerticalLayout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      verticalNavItems={navItems}
      afterVerticalNavMenuContent={<UpgradeToProImg />}
      verticalAppBarContent={() => (
        <AppBarContent
          hidden={hidden}
          settings={settings}
          saveSettings={saveSettings}
          toggleNavVisibility={(props) => props.toggleNavVisibility}
        />
      )}
    >
      {children}
    </VerticalLayout>
  );
};

UserLayout.propTypes = {
  children: PropTypes.any,
  toggleNavVisibility: PropTypes.any,
};

export default UserLayout;
