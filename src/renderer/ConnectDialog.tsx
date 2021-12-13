import {
  Button,
  Classes,
  Dialog,
  FormGroup,
  InputGroup,
  Label,
} from "@blueprintjs/core";
import React, { ChangeEvent, ReactElement, useState } from "react";
import styled from "styled-components";

interface Props {
  isOpen: boolean;
  handleClose: (submit: boolean, config?: ConnectConfig) => void;
}

interface ConnectConfig {
  ipAddress: string;
  port: string;
  timeout: string;
  polldelay: string;
}

const Container = styled.div`
  padding: 10px;
`;

export default function ConnectDialog({
  isOpen,
  handleClose,
}: Props): ReactElement {
  const [config, setConfig] = useState<ConnectConfig>({
    ipAddress: "127.0.0.1",
    port: "502",
    timeout: "5000",
    polldelay: "1000",
  });

  const onSubmit = (submit: boolean) => {
    console.log(config);
    handleClose(submit, config);
  };

  const ipAddressChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => {
      return { ...prev, ipAddress: e.target.value };
    });
  };

  const portChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => {
      return { ...prev, port: e.target.value };
    });
  };

  const timeoutChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => {
      return { ...prev, timeout: e.target.value };
    });
  };

  const polldelayChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setConfig((prev) => {
      return { ...prev, polldelay: e.target.value };
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => handleClose(false)}
      title="Modbus Connection Setup"
    >
      <Container>
        <FormGroup label="IP Address" labelFor="text-input">
          <InputGroup
            id="text-input"
            placeholder="IP Address"
            defaultValue={config.ipAddress}
            onChange={ipAddressChanged}
          />
        </FormGroup>

        <FormGroup label="Port(502)" labelFor="text-input">
          <InputGroup
            id="text-input"
            placeholder="PORT"
            defaultValue={config.port}
            onChange={portChanged}
          />
        </FormGroup>

        <FormGroup label="Response Timeout" labelFor="text-input">
          <InputGroup
            id="text-input"
            defaultValue={config.timeout}
            onChange={timeoutChanged}
          />
        </FormGroup>
        <FormGroup label="Delay Between Polls" labelFor="text-input">
          <InputGroup
            id="text-input"
            defaultValue={config.polldelay}
            onChange={polldelayChanged}
          />
        </FormGroup>
      </Container>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={() => onSubmit(true)}>OK</Button>
          <Button onClick={() => onSubmit(false)}>Cancel</Button>
        </div>
      </div>
    </Dialog>
  );
}
