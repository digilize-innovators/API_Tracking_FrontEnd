import React from 'react'
import PropTypes from 'prop-types';

const AddLocationNav = (props) => {
  const AddLocationOption = [
    {
      text: "Back",
      handler: props.actionProvider.choseUser,
      id: 1
    },
    {
      text: "Main Menu",
      handler: props.actionProvider.goToMainMenu,
      id: 2
    },
  ];
  const buttonsMarkupAddLocation = AddLocationOption.map((AddLocationOption) => (
    <button
      key={AddLocationOption.id}
      value="Add Location"
      onClick={AddLocationOption.handler}
      className="knopf-button"
    >
      {AddLocationOption.text}
    </button>
  ));
  return <div className="knopf-container">{buttonsMarkupAddLocation}</div>;
}

AddLocationNav.propTypes = {
  actionProvider: PropTypes.any,
}

export default AddLocationNav;