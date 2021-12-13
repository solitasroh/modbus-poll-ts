import { Dialog } from "@blueprintjs/core";
import React, { ReactElement } from "react";
import styled from "styled-components";

const Container = styled.div`
  padding: 10px;
`;

export default function RegisterConfigDialog(): ReactElement {
  return (
    <Dialog>
      <h2>Address</h2>
      <input type="text"></input>
      <h2>Quantity</h2>
      <input type="text"></input>
    </Dialog>
  );
}
