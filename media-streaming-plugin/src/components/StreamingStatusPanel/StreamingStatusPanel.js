import React from "react";
import { connect } from "react-redux";
import { Manager, withTheme, withTaskContext } from "@twilio/flex-ui";
import styled from "@emotion/styled";

const Status = styled("div")`
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: center;
  text-align: center;
`;
class StreamingStatusPanel extends React.Component {
  render() {
    return <Status>Streaming: {this.props.status}</Status>;
  }
}

const mapStateToProps = (state) => {
  return {
    status: state["stop-streaming"]?.streaming?.status,
  };
};

export default connect(mapStateToProps)(
  withTheme(withTaskContext(StreamingStatusPanel))
);
