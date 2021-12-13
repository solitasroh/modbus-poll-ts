import React, { ChangeEvent, ReactElement, useState, useEffect } from "react";
import IpcService from "./IpcService";
import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import { Buffer } from "buffer";
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
import {
  Cell,
  Column,
  Table2,
  RowHeaderCell,
  EditableCell2,
} from "@blueprintjs/table";
import "@blueprintjs/table/lib/css/table.css";

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

export default function app(): ReactElement {
  const [result, setResult] = useState<Buffer>();
  const [address, setAddress] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>();
  const [isConnect, setConnected] = useState<boolean>(false);
  const [requestChanged, setRequestChange] = useState(false);
  const [quantity, setQuantity] = useState(10);
  const [connectionString, setConnectionString] = useState("connect config");

  const onTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const addr = parseInt(e.target.value);
    setAddress(addr);
  };

  const onQuantityChanged = (e: ChangeEvent<HTMLInputElement>) => {
    const quanitity = parseInt(e.target.value);
    setQuantity(quanitity);
  };

  useEffect(() => {
    if (!requestChanged) {
      return;
    }

    service.readHoldingRegister(address, quantity, (resp) => {
      setResult(resp);
    });

    setRequestChange(false);
  }, [requestChanged]);

  useEffect(() => {
    service.connectionStateCheck((evt, args) => {
      if (args === "online") {
        service.disconnectServer();
      }
    });
  }, []);

  const handleConnectionServer = React.useCallback(
    (submit: boolean, config?: ConnectConfig) => {
      setIsOpen(false);
      const { ipAddress, port, timeout, polldelay } = config;
      console.log(config);

      if (submit && config) {
        service
          .connectServer(
            ipAddress,
            parseInt(port),
            parseInt(timeout),
            parseInt(polldelay)
          )
          .then((result) => {
            console.log(`connect result = ${result}`);
            if (result) {
              setConnectionString("Connection Close");
            }
            setConnected(result);
          });
      }
    },
    []
  );

  const readRequest = () => {
    setRequestChange(true);
  };

  const connectionConfigClicked = async () => {
    if (isConnect) {
      service.disconnectServer();
      setConnectionString("Connect config");
      setConnected(false);
    } else {
      setIsOpen(true);
    }
  };

  const signedCellRenderer = (rowIndex: number) => {
    let value = 0;
    if (result) {
      value = result.readInt16BE(rowIndex * 2);
    }
    return <Cell>{value}</Cell>;
  };

  const unsignedCellRenderer = (rowIndex: number) => {
    let value = 0;
    if (result) {
      value = result.readUInt16BE(rowIndex * 2);
    }
    return <Cell>{value}</Cell>;
  };

  const floatCellRenderer = (rowIndex: number) => {
    let value = 0;
    if (result && rowIndex % 2 == 0) {
      value = result.readFloatBE(rowIndex * 2);
    }

    return <Cell>{rowIndex % 2 == 0 ? `${value}` : `-`}</Cell>;
  };

  const hexCellRenderer = (rowIndex: number) => {
    let value = 0;
    if (result) {
      value = result.readUInt16BE(rowIndex * 2);
    }
    return <Cell>{value.toString(16)}</Cell>;
  };

  const rowHeaderRender = (rowIndex: number) => (
    <RowHeaderCell
      style={{ width: 100 }}
      name={address + rowIndex + ""}
    ></RowHeaderCell>
  );

  const AliasColumn = (rowIndex: number) => <EditableCell2></EditableCell2>;

  return (
    <>
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
      <div>
        <ConnectDialog
          isOpen={isOpen}
          handleClose={handleConnectionServer}
        ></ConnectDialog>
        <input
          type="text"
          name="address"
          onChange={onTextChange}
          value={address}
        />
        <input
          type="text"
          name="quanitity"
          value={quantity}
          onChange={onQuantityChanged}
        ></input>
        <button onClick={readRequest}>request</button>

        <Table2 numRows={quantity} rowHeaderCellRenderer={rowHeaderRender}>
          <Column name="alias" cellRenderer={AliasColumn}></Column>
          <Column name="Signed" cellRenderer={signedCellRenderer} />
          <Column name="Unsigned" cellRenderer={unsignedCellRenderer} />
          <Column name="HEX" cellRenderer={hexCellRenderer} />
          <Column name="Float" cellRenderer={floatCellRenderer} />
        </Table2>
      </div>
    </>
  );
}
