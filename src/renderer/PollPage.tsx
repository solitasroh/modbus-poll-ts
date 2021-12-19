import { Button, Card, H5, H6 } from "@blueprintjs/core";
import {
  Cell,
  Column,
  EditableCell2,
  RowHeaderCell,
  Table2,
} from "@blueprintjs/table";
import React, { ReactElement, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import IpcService from "./IpcService";

const Form = styled.form`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  padding: 5px;
  align-items: stretch;
`;

const Label = styled.label`
  font-size: 12px;
  margin: 3px 0px;
`;

const Input = styled.input.attrs(() => ({ type: "text" }))`
  font-size: 12px;
  margin: 3px 0px;
`;

const Submit = styled(Button)`
  font-size: 12px;
  margin: 3px 0px;
`;

const UserTable = styled(Table2)`
  margin: 5px;
`;

const UserCard = styled(Card)`
  height: 100%;
`;

const service = IpcService.getInstance();

interface request {
  address: number;
  quantity: number;
}

export default function PollPage(): ReactElement {
  const [result, setResult] = useState<Buffer>();
  const [requestChanged, setRequestChange] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    service.on("MB_FC3_RESP", (event, ...args) => {
      console.log(args);
    });
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

  const rowHeaderRender = (rowIndex: number) => {
    const startAddr = parseInt(getValues("address"));
    const displayValue = startAddr + rowIndex;
    return (
      <RowHeaderCell
        style={{ width: 100 }}
        name={displayValue.toString()}
      ></RowHeaderCell>
    );
  };

  const AliasColumn = (rowIndex: number) => <EditableCell2></EditableCell2>;

  const onSubmit = (data: request) => {
    console.log(data);

    service.readHoldingRegister(data.address, data.quantity, (resp) => {
      setResult(resp);
    });
  };

  return (
    <Container>
      <UserCard>
        <H6>Register Configuration</H6>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Label>start address</Label>
          <Input type="text" {...register("address")}></Input>
          <Label>quantity</Label>
          <Input type="text" {...register("quantity")}></Input>
          <Submit type="submit">submit</Submit>
        </Form>
      </UserCard>

      <UserTable
        numRows={getValues("quantity")}
        rowHeaderCellRenderer={rowHeaderRender}
      >
        <Column name="alias" cellRenderer={AliasColumn}></Column>
        <Column name="Signed" cellRenderer={signedCellRenderer} />
        <Column name="Unsigned" cellRenderer={unsignedCellRenderer} />
        <Column name="HEX" cellRenderer={hexCellRenderer} />
        <Column name="Float" cellRenderer={floatCellRenderer} />
      </UserTable>
    </Container>
  );
}
