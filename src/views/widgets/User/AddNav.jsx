import React from 'react'
import PropTypes from 'prop-types';

const AddNav = (props) => {
  const AddNavOption = [
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
  const buttonsMarkupAdd = AddNavOption.map((AddNavOption) => (
    <button
      key={AddNavOption.id}
      value="Tom Clancy"
      onClick={AddNavOption.handler}
      className="knopf-button"
    >
      {AddNavOption.text}
    </button>
  ));
  return <div className="knopf-container">{buttonsMarkupAdd}</div>;
}
AddNav.propTypes = {
  actionProvider: PropTypes.any
};
export default AddNav