import React from 'react'
import PropTypes from 'prop-types';

const ChangeLocationPassword = (props) => {
  const LocationPasswordOption = [
    {
      text: "Back",
      handler: props.actionProvider.choseLocation,
      id: 1
    },
    {
      text: "Main Menu",
      handler: props.actionProvider.goToMainMenu,
      id: 2
    },
  ];

  const buttonsMarkupLocationPassword = LocationPasswordOption.map((LocationPasswordOption) => (
    <button
      key={LocationPasswordOption.id}
      value="Location password"
      onClick={LocationPasswordOption.handler}
      className="knopf-button"
    >
      {LocationPasswordOption.text}
    </button>
  ));
  return <div className="knopf-container">{buttonsMarkupLocationPassword}</div>;
}
ChangeLocationPassword.propTypes = {
  actionProvider: PropTypes.any
}
export default ChangeLocationPassword
