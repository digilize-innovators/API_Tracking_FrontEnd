import React from 'react'
import PropTypes from 'prop-types';

const LocationMenuSelect = (props) => {
  const locationMenuOptions = [
    {
      text: "Add Location",
      handler: (event) => {
        console.log(event.target.value);
        props.actionProvider.addLocation(event.target.value);
      },
      id: 1
    },
    {
      text: "Edit Location",
      handler: (event) => {
        console.log(event.target.value);
        props.actionProvider.editLocation(event.target.value);
      },
      id: 2
    },
    {
      text: "Change Password",
      handler: (event) => {
        console.log(event.target.value);
        props.actionProvider.changePasswordLocation(event.target.value);
      },
      id: 3
    }
  ];

  const buttonsMarkupLocationMenu = locationMenuOptions.map((locationMenuOptions) => (
    <button
      key={locationMenuOptions.id}
      value="Location Menu"
      onClick={locationMenuOptions.handler}
      className="knopf-button"
    >
      {locationMenuOptions.text}
    </button>
  ));

  return <div className="knopf-container">{buttonsMarkupLocationMenu}</div>;
}

LocationMenuSelect.propTypes = {
  actionProvider: PropTypes.any
};

export default LocationMenuSelect
