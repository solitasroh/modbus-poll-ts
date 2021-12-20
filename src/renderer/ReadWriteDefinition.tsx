import { Button, Card, Checkbox, H6 } from "@blueprintjs/core";
import React, { ReactElement } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import IpcService from "./IpcService";

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

const Form = styled.form`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
`;

const UserCheckBox = styled.input`
  font-size: 12px;
  margin: 3px 3px 3px 0px;
`;

const UserCard = styled(Card)`
  height: 100%;
`;

const service = IpcService.getInstance();

interface request {
  address: number;
  quantity: number;
  scanRate: number;
  plcAddress: boolean;
}

interface Props {
  callback: (address: number, quantity: number) => void;
}

export default function ReadWriteDefinition({ callback }: Props): ReactElement {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: request) => {
    if (data.address <= 0 || data.address > 65535) return;

    if (data.quantity <= 0 || data.quantity > 125) return;

    if (data.scanRate <= 0) return;
    console.log(data.plcAddress);

    
    if (data.plcAddress) {
        callback(data.address, data.quantity);
        service.readHoldingRegister(data.address-1, data.quantity, data.scanRate);
    } else {
        callback(data.address, data.quantity);
        service.readHoldingRegister(data.address, data.quantity, data.scanRate);
    }
    
  };

  return (
    <Container>
      <UserCard>
        <H6>Register Configuration</H6>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Label>start address</Label>
          <Input type="text" {...register("address")} />
          <Label>quantity</Label>
          <Input type="text" {...register("quantity")} />
          <Label>scan rate(ms)</Label>
          <Input type="text" {...register("scanRate")} />
          <div>
            <UserCheckBox type="checkbox" {...register("plcAddress")}></UserCheckBox>
            <Label>PLC Address base</Label>
          </div>
          <Submit type="submit">submit</Submit>
        </Form>
      </UserCard>
    </Container>
  );
}
