import React from 'react'
import PropTypes from 'prop-types';

const MainMenu = props => {
  const mainMenuOptions = [
    {
      text: 'User Master',
      id: 1,
      handler: props.actionProvider.choseUser
    },
    {
      text: 'Location Master',
      id: 2,
      handler: props.actionProvider.choseLocation
    }
  ]
  const buttonsMarkup = mainMenuOptions.map(mainMenuOptions => (
    <button
      key={mainMenuOptions.id}
      value='Main Menu'
      onClick={mainMenuOptions.handler}
      className='knopf-button'>
      {mainMenuOptions.text}
    </button>
  ))
  return <div className='knopf-container'>{buttonsMarkup}</div>
}
MainMenu.propTypes = {
  actionProvider: PropTypes.any
}
export default MainMenu
