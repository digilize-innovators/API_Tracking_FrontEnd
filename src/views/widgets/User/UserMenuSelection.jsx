import React from 'react'
import PropTypes from 'prop-types';

const UserMenuSelection = (props) => {

  const userMenuOptions = [
    {
      text: "Add User",
      handler: (event) => {
        console.log(event.target.value);
        props.actionProvider.addUser(event.target.value);
      },
      id: 1
    },
    {
      text: "Edit User",
      handler: (event) => {
        console.log(event.target.value);
        props.actionProvider.editUser(event.target.value);
      },
      id: 2
    },
    {
      text: "Change Password",
      handler: (event) => {
        console.log(event.target.value);
        props.actionProvider.changePasswordUser(event.target.value);
      },
      id: 3
    }
  ];


  const buttonsMarkup = userMenuOptions.map((userMenuOptions) => (
    <button
      key={userMenuOptions.id}
      value="Tom Clancy"
      onClick={userMenuOptions.handler}
      className="knopf-button"
    >
      {userMenuOptions.text}
    </button>
  ));

  return <div className="knopf-container">{buttonsMarkup}</div>;
}
UserMenuSelection.propTypes = {
  actionProvider: PropTypes.any
}
export default UserMenuSelection
