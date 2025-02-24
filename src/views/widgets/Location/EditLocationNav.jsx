import React from 'react'
import PropTypes from 'prop-types';

const EditLocationNav = (props) => {
  const EditLocationNavOption = [
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
  const buttonsMarkupEdit = EditLocationNavOption.map((EditLocationNavOption) => (
    <button
      key={EditLocationNavOption.id}
      value="Tom Clancy"
      onClick={EditLocationNavOption.handler}
      className="knopf-button"
    >
      {EditLocationNavOption.text}
    </button>
  ));
  return <div className="knopf-container">{buttonsMarkupEdit}</div>;
}
EditLocationNav.propTypes = {
  actionProvider: PropTypes.any
}
export default EditLocationNav
