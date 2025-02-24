import React from 'react'
import PropTypes from 'prop-types'

const EditNav = (props) => {
  const EditNavOption = [
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
  const buttonsMarkupEdit = EditNavOption.map((EditNavOption) => (
    <button
      key={EditNavOption.id}
      value="Tom Clancy"
      onClick={EditNavOption.handler}
      className="knopf-button"
    >
      {EditNavOption.text}
    </button>
  ));
  return <div className="knopf-container">{buttonsMarkupEdit}</div>;
}
EditNav.propTypes = {
  actionProvider: PropTypes.any
};
export default EditNav
