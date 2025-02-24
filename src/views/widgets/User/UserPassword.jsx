import React from 'react'
import PropTypes from 'prop-types'

const UserPassword = (props) => {
  const UserPasswordOption = [
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
  const buttonsMarkupUserPassword = UserPasswordOption.map((UserPasswordOption) => (
    <button
      key={UserPasswordOption.id}
      value="Tom Clancy"
      onClick={UserPasswordOption.handler}
      className="knopf-button"
    >
      {UserPasswordOption.text}
    </button>
  ));
  return <div className="knopf-container">{buttonsMarkupUserPassword}</div>;
}
UserPassword.propTypes = {
  actionProvider: PropTypes.any
};
export default UserPassword
