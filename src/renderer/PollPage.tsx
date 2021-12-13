import {
  Cell,
  Column,
  EditableCell2,
  RowHeaderCell,
  Table2,
} from "@blueprintjs/table";
import React, { ReactElement, useEffect, useState } from "react";

interface PollPageProps {
  address: number;
  quantity: number;
}

export default function PollPage({
  address,
  quantity,
}: PollPageProps): ReactElement {
  const [result, setResult] = useState<Buffer>();
  useEffect(() => {
    if (!requestChanged) {
      return;
    }

    service.readHoldingRegister(address, quantity, (resp) => {
      setResult(resp);
    });

    setRequestChange(false);
  }, [requestChanged]);

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
    <div>
      <Table2 numRows={quantity} rowHeaderCellRenderer={rowHeaderRender}>
        <Column name="alias" cellRenderer={AliasColumn}></Column>
        <Column name="Signed" cellRenderer={signedCellRenderer} />
        <Column name="Unsigned" cellRenderer={unsignedCellRenderer} />
        <Column name="HEX" cellRenderer={hexCellRenderer} />
        <Column name="Float" cellRenderer={floatCellRenderer} />
      </Table2>
    </div>
  );
}
