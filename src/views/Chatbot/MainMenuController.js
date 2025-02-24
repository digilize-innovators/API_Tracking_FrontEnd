class ActionProvider {
  constructor(createChatBotMessage, setStateFunc, createClientMessage, stateRef, createCustomMessage) {
    this.createChatBotMessage = createChatBotMessage
    this.setState = setStateFunc
    this.createClientMessage = createClientMessage
    this.stateRef = stateRef
    this.createCustomMessage = createCustomMessage
    this.checker = ''
  }

  goBack = (widget, text) => {
    const message = this.createChatBotMessage(`Fantastic, I've got the following resources for you on ${text}:`, {
      widget: widget
    })
    this.addMessageToState(message)
  }
  choseUser = () => {
    const message = this.createChatBotMessage("Fantastic, I've got the following resources for you on User:", {
      widget: 'UserInfo'
    })
    this.addMessageToState(message)
  }
  choseLocation = () => {
    const message = this.createChatBotMessage("Fantastic, I've got the following resources for you on Location:", {
      widget: 'LocationInfo'
    })
    this.addMessageToState(message)
  }


  addUser = () => {
    const message = this.createChatBotMessage('How to Add User ?')
    this.addMessageToState(message)
    const message2 = this.createChatBotMessage("Fantastic, I've got the following resources for you on add user:", {
      widget: 'addNav'
    })
    this.addMessageToState(message2)
  }
  addLocation = () => {
    const message = this.createChatBotMessage('How to Add Location ?')
    this.addMessageToState(message)
    const message2 = this.createChatBotMessage("Fantastic, I've got the following resources for you on add location:", {
      widget: 'addLocationNav'
    })
    this.addMessageToState(message2)
  }


  editUser = () => {
    const message = this.createChatBotMessage('How to Edit User ?')
    this.addMessageToState(message)
    const message2 = this.createChatBotMessage("Fantastic, I've got the following resources for you on edit user:", {
      widget: 'editNav'
    })
    this.addMessageToState(message2)
  }
  editLocation = () => {
    const message = this.createChatBotMessage('How to Edit User ?')
    this.addMessageToState(message)
    const message2 = this.createChatBotMessage("Fantastic, I've got the following resources for you on edit user:", {
      widget: 'editLocationNav'
    })
    this.addMessageToState(message2)
  }


  changePasswordUser = () => {
    const message = this.createChatBotMessage('How to Change Password ?')
    this.addMessageToState(message)
    const message2 = this.createChatBotMessage("Fantastic, I've got the following resources for you on change User Password:", {
      widget: 'changeUserPassword'
    })
    this.addMessageToState(message2)
  }
  changePasswordLocation = () => {
    const message = this.createChatBotMessage('How to Change Password ?')
    this.addMessageToState(message)
    const message2 = this.createChatBotMessage("Fantastic, I've got the following resources for you on how can u change location Password:", {
      widget: 'changeLocPassword'
    })
    this.addMessageToState(message2)
  }
  addMessageToState = (message) => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message]
    }));
  };
  goToMainMenu = () => {
    const initialMessage = this.createChatBotMessage('Hello, what do you like to know today?', { widget: 'mainmenu' })
    this.setState(prevState => ({
      ...prevState,
      messages: [...prevState.messages, initialMessage],
      checker: ''
    }))
  }
}
export default ActionProvider
