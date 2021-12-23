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
import { HotkeysProvider } from "@blueprintjs/core";

import { RegisterData } from "./RegisterData";

const Container = styled.div`
  display: flex;
  padding: 5px;
  align-items: stretch;
`;

const ValueCell = styled(Cell)`
  text-align: right;
`;
const UserTable = styled(Table2)`
  margin: 0px;
  height: 100%;
`;

const service = IpcService.getInstance();
interface Props {
  address?: number;
  quantity?: number;
}
export enum Endian {
  Big,
  Little,
}
enum DataTyped {
  Signed,
  Unsigned,
  Hex,
  Float,
}
export type FormattedData = {
  address: number;
  uint16: number;
  int16: number;
  float: string;
  hex: string;
};
export default function PollPage(props: Props): ReactElement {
  const [address, setAddress] = useState(1);
  const [quantity, setQuantity] = useState(10);
  const [registerData, setRegisterData] = useState<RegisterData>();

  useEffect(() => {
    if (props?.address) {
      console.log("adddress is ", props.address);
      setAddress(props.address);
    }

    if (props?.quantity) {
      setQuantity(props.quantity);
    }

    service.on(FC3_POLL_RESP, (event, args) => {
      const buffer = Buffer.from(args);

      const registerData = new RegisterData(address, buffer);
      console.log(registerData);
      setRegisterData(registerData);
    });
  }, []);

  const getAddress = (index: number) => {
    const startAddr: number = parseInt(address.toString());
    return startAddr + index;
  };

  // const charCellRenderer = (rowIndex: number) => {
  //   try {
  //     let hVal = 0;
  //     let lVal = 0;
  //     if (result) {
  //       hVal = result.readUInt8(rowIndex * 2);
  //       lVal = result.readUInt8(rowIndex * 2 + 1);
  //     }
  //     return <ValueCell>{`${String.fromCharCode(hVal, lVal)}`}</ValueCell>;
  //   } catch (error) {
  //     return <Cell>{`-`}</Cell>;
  //   }
  // };

  const rowHeaderRender = (rowIndex: number) => {
    const startAddr: number = parseInt(address.toString());
    console.log("row header address", address);
    const displayValue: number = startAddr + rowIndex;
    return (
      <RowHeaderCell
        style={{ width: 100 }}
        name={displayValue.toString()}
      ></RowHeaderCell>
    );
  };
  const caseFormattedValue = (
    rowIndex: number,
    type: DataTyped
  ): number | string => {
    switch (type) {
      case DataTyped.Signed:
        return registerData.fetchData(getAddress(rowIndex)).int16;
      case DataTyped.Unsigned:
        return registerData.fetchData(getAddress(rowIndex)).uint16;
      case DataTyped.Float:
        return registerData.fetchData(getAddress(rowIndex)).float;
      case DataTyped.Hex:
        return registerData.fetchData(getAddress(rowIndex)).hex;
    }
    return 0;
  };
  const ValueChanged = (
    value: string,
    rowIndex: number,
    columnIndex: number
  ) => {
    const address = getAddress(rowIndex);
    console.log(value, rowIndex);
  };
  const renderer = (rowIndex: number, type: DataTyped) => {
    try {
      return (
        <EditableCell2
          onConfirm={(value, rowIndex, columnIndex) =>
            ValueChanged(value, rowIndex, columnIndex)
          }
          value={caseFormattedValue(rowIndex, type).toString()}
        ></EditableCell2>
      );
    } catch (error) {
      console.log(error, rowIndex);
      return <Cell>{`-`}</Cell>;
    }
  };
  const aliasConfirm = (
    value: string,
    rowIndex?: number,
    columnIndex?: number
  ) => {
    console.log(value);
  };

  const AliasColumn = (rowIndex: number) => (
    <EditableCell2 onConfirm={aliasConfirm}></EditableCell2>
  );

  const forwardInfo = (address: number, quantity: number) => {
    if (address >= 0 && address < 65535) setAddress(address);
    else return;
    if (quantity >= 0 && quantity < 125) setQuantity(quantity);
    else return;
  };

  return (
    <Container>
      <ReadWriteDefinition forwardInfo={forwardInfo} />
      <HotkeysProvider>
        <UserTable
          numRows={quantity}
          rowHeaderCellRenderer={rowHeaderRender}
          enableFocusedCell
        >
          <Column name="alias" cellRenderer={AliasColumn}></Column>
          <Column
            name="signed"
            cellRenderer={(rowIndex) => renderer(rowIndex, DataTyped.Signed)}
          />
          <Column
            name="unsigned"
            cellRenderer={(rowIndex) => renderer(rowIndex, DataTyped.Unsigned)}
          />
          <Column
            name="hex"
            cellRenderer={(rowIndex) => renderer(rowIndex, DataTyped.Hex)}
          />
          <Column
            name="float"
            cellRenderer={(rowIndex) => renderer(rowIndex, DataTyped.Float)}
          />
          {/* <Column name="char" cellRenderer={charCellRenderer} /> */}
        </UserTable>
      </HotkeysProvider>
    </Container>
  );
}
