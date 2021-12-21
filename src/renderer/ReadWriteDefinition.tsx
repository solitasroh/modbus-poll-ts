import { Button, Card, H6 } from "@blueprintjs/core";
import React, { ReactElement, useEffect } from "react";
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
  forwardInfo: (address: number, quantity: number) => void;
}

const validAddress = (
  address: number,
  quantity: number,
  isPLCBase: boolean
): boolean => {
  const validRange: number =
    parseInt(address.toString()) + parseInt(quantity.toString());
  console.log(validRange);
  if (isPLCBase) {
    return validRange >= 1 && validRange <= 65536;
  }
  return validRange >= 0 && validRange <= 65535;
};

export default function ReadWriteDefinition({
  forwardInfo: forwardRegisterInfo,
}: Props): ReactElement {
  const { register, handleSubmit, getValues } = useForm();

  useEffect(() => {
    service.connectionStateCheck((evt, result) => {
      if (result === "online") {
        let address = getValues("address") ?? 1;
        const quantity = getValues("quantity") ?? 10;
        const scanRate = getValues("scanRate") ?? 1000;

        const plcAddressBase = getValues("plcAddress") ?? false;
        address = plcAddressBase ? address - 1 : address;

        if (validAddress(address, quantity, plcAddressBase)) {
          service.readHoldingRegister(address, quantity, scanRate);
          forwardRegisterInfo(address, quantity);
        } else {
          alert("invalid range");
        }
      }
    });
  }, []);

  const onSubmit = (data: request) => {
    if (data.quantity <= 0 || data.quantity > 125) return;
    if (data.scanRate <= 0) return;

    const address = data.plcAddress ? data.address - 1 : data.address;

    if (validAddress(address, data.quantity, data.plcAddress)) {
      service.readHoldingRegister(address, data.quantity, data.scanRate);
      forwardRegisterInfo(data.address, data.quantity);
    } else {
      alert("invalid range");
    }
  };

  return (
    <Container>
      <UserCard>
        <H6>Register Configuration</H6>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Label>start address</Label>
          <Input {...register("address")} defaultValue={1} />
          <Label>quantity</Label>
          <Input {...register("quantity")} defaultValue={10} />
          <Label>scan rate(ms)</Label>
          <Input {...register("scanRate")} defaultValue={1000} />
          <div>
            <UserCheckBox
              type="checkbox"
              {...register("plcAddress")}
              defaultChecked
            />
            <Label>PLC Address base</Label>
          </div>
          <Submit type="submit">submit</Submit>
        </Form>
      </UserCard>
    </Container>
  );
}
