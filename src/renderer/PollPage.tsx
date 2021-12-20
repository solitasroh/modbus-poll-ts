import React, { ReactElement, useEffect, useState } from "react";
import {
  Cell,
  Column,
  EditableCell2,
  RowHeaderCell,
  Table2,
} from "@blueprintjs/table";
import styled from "styled-components";

import IpcService from "./IpcService";
import ReadWriteDefinition from "./ReadWriteDefinition";

import { FC3_POLL_RESP } from "@src/IpcMessageDefine";

const Container = styled.div`
  display: flex;
  padding: 5px;
  align-items: stretch;
`;

const UserTable = styled(Table2)`
  margin: 5px;
`;

const service = IpcService.getInstance();

export default function PollPage(): ReactElement {
  const [result, setResult] = useState<Buffer>();
  const [address, setAddress] = useState(1);
  const [quantity, setQuantity] = useState(10);

  useEffect(() => {
    service.on(FC3_POLL_RESP, (event, args) => {
      const buffer = Buffer.from(args);
      setResult(buffer);
    });
  }, []);

  const signedCellRenderer = (rowIndex: number) => {
    try {
      let value = 0;
      if (result) {
        value = result.readInt16BE(rowIndex * 2);
      }
      return <Cell>{value}</Cell>;
    } catch (error) {
      return <Cell>{`-`}</Cell>;
    }
  };

  const unsignedCellRenderer = (rowIndex: number) => {
    try {
      let value = 0;
      if (result) {
        value = result.readUInt16BE(rowIndex * 2);
      }
      return <Cell>{value}</Cell>;
    } catch (error) {
      return <Cell>{`-`}</Cell>;
    }
  };

  const floatCellRenderer = (rowIndex: number) => {
    let value = 0;
    try {
      if (result && rowIndex % 2 == 0) {
        value = result.readFloatBE(rowIndex * 2);
      }

      return <Cell>{rowIndex % 2 == 0 ? `${value}` : `-`}</Cell>;
    } catch (error) {
      return <Cell>{`-`}</Cell>;
    }
  };

  const hexCellRenderer = (rowIndex: number) => {
    try {
      let value = 0;
      if (result) {
        value = result.readUInt16BE(rowIndex * 2);
      }
      return <Cell>{value.toString(16)}</Cell>;
    } catch (error) {
      return <Cell>{`-`}</Cell>;
    }
  };

  const rowHeaderRender = (rowIndex: number) => {
    const startAddr: number = parseInt(address.toString());
    const displayValue: number = startAddr + rowIndex;
    return (
      <RowHeaderCell
        style={{ width: 100 }}
        name={displayValue.toString()}
      ></RowHeaderCell>
    );
  };

  const AliasColumn = (rowIndex: number) => <EditableCell2></EditableCell2>;

  const callbackFunc = (address: number, quantity: number) => {
    if (address > 0 && address < 65535) setAddress(address);
    else return;
    if (quantity > 0 && quantity < 125) setQuantity(quantity);
    else return;
  };

  return (
    <Container>
      <ReadWriteDefinition callback={callbackFunc} />

      <UserTable numRows={quantity} rowHeaderCellRenderer={rowHeaderRender}>
        <Column name="alias" cellRenderer={AliasColumn}></Column>
        <Column name="Signed" cellRenderer={signedCellRenderer} />
        <Column name="Unsigned" cellRenderer={unsignedCellRenderer} />
        <Column name="HEX" cellRenderer={hexCellRenderer} />
        <Column name="Float" cellRenderer={floatCellRenderer} />
      </UserTable>
    </Container>
  );
}
