import React, { ReactElement, useState, useEffect } from "react";
import IpcService from "./IpcService";
import styled, { createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import {
  Navbar,
  NavbarGroup,
  Alignment,
  NavbarHeading,
  NavbarDivider,
  Classes,
  Button,
} from "@blueprintjs/core";
import ConnectDialog from "./ConnectDialog";

import "@blueprintjs/table/lib/css/table.css";
import PollPage from "./PollPage";

const service = IpcService.getInstance();

const GlobalStyle = createGlobalStyle`
  ${reset}
  /* other styles */
  * {
    box-sizing: border-box;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    :focus {
      outline: none;
    }
  }
  a {
      text-decoration: none;
      color: inherit;
  };
  body {
    background-color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif
  }
  ol, ul, li {
    list-style: none;
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

interface ConnectConfig {
  ipAddress: string;
  port: string;
  timeout: string;
  polldelay: string;
}

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const ViewContainer = styled.div`
  display: flex;
  flex-direct: row;
  height: 100%;
`;
const connectionText = ["connect", "disconnect"];

export default function app(): ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>();
  const [isConnect, setConnected] = useState<boolean>(false);
  const [connectionString, setConnectionString] = useState(connectionText[0]);

  useEffect(() => {
    service.connectionStateCheck((evt, result) => {
      console.log(`connect result = ${result}`);
      if (result === "online") {
        setConnectionString(connectionText[1]);
        setConnected(true);
      } else if (result === "offline") {
        setConnectionString(connectionText[0]);
        setConnected(false);
      }
    });
  }, []);

  const handleConnectionServer = React.useCallback(
    (submit: boolean, config?: ConnectConfig) => {
      setIsOpen(false);
      const { ipAddress, port, timeout, polldelay } = config;

      if (submit && config) {
        service.connectServer(
          ipAddress,
          parseInt(port),
          parseInt(timeout),
          parseInt(polldelay)
        );
      }
    },
    []
  );

  const connectionConfigClicked = async () => {
    if (isConnect) {
      service.disconnectServer();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <MainContainer>
      <GlobalStyle />
      <Navbar>
        <NavbarGroup align={Alignment.LEFT}>
          <NavbarHeading>Modbus Poll</NavbarHeading>
          <NavbarDivider />
          <Button
            className={Classes.MINIMAL}
            icon="log-in"
            text={connectionString}
            onClick={connectionConfigClicked}
          ></Button>
        </NavbarGroup>
      </Navbar>
      <ViewContainer>
        <ConnectDialog
          isOpen={isOpen}
          handleClose={handleConnectionServer}
        ></ConnectDialog>

        <PollPage address={1} />
      </ViewContainer>
    </MainContainer>
  );
}
