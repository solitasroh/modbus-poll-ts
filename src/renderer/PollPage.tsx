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
export default function PollPage(props: Props): ReactElement {
  const [result, setResult] = useState<Buffer>();
  const [address, setAddress] = useState(1);
  const [quantity, setQuantity] = useState(10);

  useEffect(() => {
    if (props?.address) {
      setAddress(props.address);
    }

    if (props?.quantity) {
      setQuantity(props.quantity);
    }

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
      return <ValueCell>{value}</ValueCell>;
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
      return <ValueCell>{value}</ValueCell>;
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

      return (
        <ValueCell>
          {rowIndex % 2 == 0 ? `${value.toPrecision(4)}` : `-`}
        </ValueCell>
      );
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
      return (
        <ValueCell>{`0x${value
          .toString(16)
          .padStart(4, "0")
          .toUpperCase()}`}</ValueCell>
      );
    } catch (error) {
      return <Cell>{`-`}</Cell>;
    }
  };

  const charCellRenderer = (rowIndex: number) => {
    try {
      let hVal = 0;
      let lVal = 0;
      if (result) {
        hVal = result.readUInt8(rowIndex * 2);
        lVal = result.readUInt8(rowIndex * 2 + 1);
      }
      return <ValueCell>{`${String.fromCharCode(hVal, lVal)}`}</ValueCell>;
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

  const forwardInfo = (address: number, quantity: number) => {
    if (address >= 0 && address < 65535) setAddress(address);
    else return;
    if (quantity >= 0 && quantity < 125) setQuantity(quantity);
    else return;
  };

  return (
    <Container>
      <ReadWriteDefinition forwardInfo={forwardInfo} />

      <UserTable numRows={quantity} rowHeaderCellRenderer={rowHeaderRender}>
        <Column name="alias" cellRenderer={AliasColumn}></Column>
        <Column name="signed" cellRenderer={signedCellRenderer} />
        <Column name="unsigned" cellRenderer={unsignedCellRenderer} />
        <Column name="hex" cellRenderer={hexCellRenderer} />
        <Column name="float" cellRenderer={floatCellRenderer} />
        <Column name="char" cellRenderer={charCellRenderer} />
      </UserTable>
    </Container>
  );
}
