import { createChatBotMessage } from "react-chatbot-kit";
import MainMenu from "../widgets/MainMenu";
import UserMenuSelection from "../widgets/User/UserMenuSelection";
import EditNav from "../widgets/User/EditNav";
import AddNav from "../widgets/User/AddNav";
import UserPassword from "../widgets/User/UserPassword";
import LocationMenuSelect from "../widgets/Location/LocationMenuSelect";
import AddLocationNav from "../widgets/Location/AddLocationNav";
import EditLocationNav from "../widgets/Location/EditLocationNav";
import ChangeLocationPassword from "../widgets/Location/ChangeLocationPassword";
const config = {
  botName: "InspectaTraceBoot",
  customComonents: {

  },
  customStyles: {
    botMessageBox: {
      backgroundColor: '#50BDA0',
    },
    chatButton: {
      backgroundColor: '#50BDA0',
    },
  },
  initialMessages: [
    createChatBotMessage(<img src="/images/eqbot.png" height='100%' width="100%" alt="chatbotimg" />),
    createChatBotMessage("Hi !\n Welcome to Digilize  Bot👋 "),
    createChatBotMessage(
      " To proceed, please select an option or type in your query below. 👇", {
      widget: "mainmenu",
    }),
  ],
  widgets: [
    {
      widgetName: "mainmenu",
      widgetFunc: (props) => <MainMenu {...props} />,
    },
    {
      widgetName: "UserInfo",
      widgetFunc: (props) => <UserMenuSelection {...props} />
    },
    {
      widgetName: "editNav",
      widgetFunc: (props) => <EditNav {...props} />
    },
    {
      widgetName: "addNav",
      widgetFunc: (props) => <AddNav {...props} />
    },
    {
      widgetName: "changeUserPassword",
      widgetFunc: (props) => <UserPassword {...props} />
    },
    {
      widgetName: "LocationInfo",
      widgetFunc: (props) => <LocationMenuSelect {...props} />
    },
    {
      widgetName: "addLocationNav",
      widgetFunc: (props) => <AddLocationNav {...props} />
    },
    {
      widgetName: "editLocationNav",
      widgetFunc: (props) => <EditLocationNav {...props} />
    },
    {
      widgetName: "changeLocPassword",
      widgetFunc: (props) => <ChangeLocationPassword{...props} />
    }
  ],
};
export default config;