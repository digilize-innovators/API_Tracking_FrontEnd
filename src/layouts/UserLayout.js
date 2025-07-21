import React from 'react';
import PropTypes from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import VerticalLayout from 'src/@core/layouts/VerticalLayout';
import VerticalNavItems from 'src/navigation/vertical';
import VerticalAppBarContent from './components/vertical/AppBarContent';
import { useSettings } from 'src/@core/hooks/useSettings';

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

const UpgradeToProImg = () => {
  return <></>;
};
const renderAppBarContent = (props) => (
  <AppBarContent
    hidden={props.hidden}
    settings={props.settings}
    saveSettings={props.saveSettings}
    toggleNavVisibility={props.toggleNavVisibility}
  />
);
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
     verticalAppBarContent={(props) =>
    renderAppBarContent({
      ...props,
      hidden,
      settings,
      saveSettings
    })
  }
    >
      {children}
    </VerticalLayout>
  );
};

UserLayout.propTypes = {
  children: PropTypes.any,
};

export default UserLayout;
