import React from "react";
import {
  Notifications,
  TaskHelper,
  IconButton,
  withTaskContext,
} from "@twilio/flex-ui";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Actions as StreamingStatusActions } from "../../states/StreamingStatus";
import RecordingUtil from "../../utils/StreamingUtil";

let streamSid; //store recording Sid
const STREAMING_STOPPED = "StreamingStopped";
const START_STREAMING = "StartStreaming";
const STOP_FAILED = "StopFailed";
const START_FAILED = "StartFailed";

const stopState = {
  icon: "EyeBold",
  color: "red",
  label: "Start",
};

const streamState = {
  icon: "Eye",
  color: "green",
  label: "Stop",
};
class StopStreamingButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = stopState;
  }

  handleClick = async () => {
    let callSid = this.props.task.attributes.call_sid;
    if (this.props.status == "stop") {
      try {
        const streaming = await StreamingUtil.startStreaming(callSid);
        this.setState(streamState);
        console.log("Start streaming");
        console.log(
          "Recording Sid Returned: ",
          streaming.sid,
          "status:",
          streaming.status
        );
        //Update app state in Redux store
        this.props.setStreamingStatus(streaming.status);
        Notifications.showNotification(START_STREAMING);
      } catch (err) {
        console.log("Failed to start recording");
        Notifications.showNotification(START_FAILED);
      }
    } else {
      try {
        const streaming = await RecordingUtil.stopStreaming(callSid);
        this.setState(stopState);
        console.log("Stop Streaming");
        streamSid = streaming.sid;
        console.log(
          "Recording Sid Returned: ",
          streamSid,
          "status:",
          stream.status
        );
        //Update app state in Redux store
        this.props.setStreamingStatus(stream.status);
        Notifications.showNotification(RECORDING_PAUSED);
      } catch (err) {
        console.log("Failed to stop streaming");
        Notifications.showNotification(STOP_FAILED);
      }
    }
  };

  render() {
    const isLiveCall = TaskHelper.isLiveCall(this.props.task);
    return (
      <IconButton
        icon={this.state.icon}
        key="stop_button"
        style={{ color: this.state.color }}
        disabled={!isLiveCall}
        title={this.state.label}
        onClick={() => this.handleClick()}
      />
    );
  }
}
//recording object contains status
const mapStateToProps = (state) => {
  return {
    status: state["stop-streaming"]?.streaming?.status,
  };
};
const mapDispatchToProps = (dispatch) => ({
  setStreamingStatus: bindActionCreators(
    StreamingStatusActions.setStreamingStatus,
    dispatch
  ),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTaskContext(StopStreamingButton));
