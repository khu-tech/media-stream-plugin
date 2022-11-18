import { Manager } from "@twilio/flex-ui";
const manager = Manager.getInstance();

class RecordingUtil {
  startCallStreaming = async (callSid) => {
    console.debug("Creating streaming for call SID:", callSid);
    const fetchUrl = `${process.env.REACT_APP_SERVICE_BASE_URL}/call-streaming/start-streaming`;
    const workerName = "Asurion";
    const streamURL = "wss://cf84-75-172-147-101.ngrok.io";

    const fetchBody = {
      Token: manager.store.getState().flex.session.ssoTokenPayload.token,
      workerCallSid: callSid,
      workerName,
      streamURL,
    };
    const fetchOptions = {
      method: "POST",
      body: new URLSearchParams(fetchBody),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    };

    let streaming;
    try {
      const streamingResponse = await fetch(fetchUrl, fetchOptions);
      streaming = await streamingResponse.json();
      console.debug("Created streaing", streaming);
    } catch (error) {
      console.error(`Error creating recording for call SID ${callSid}.`, error);
    }

    return streaming;
  };

  stopStreaming = (callSid) => {
    return new Promise((resolve, reject) => {
      const body = {
        callSid: callSid,
        Token: manager.store.getState().flex.session.ssoTokenPayload.token,
      };
      // Set up the HTTP options for your request
      const options = {
        method: "POST",
        body: new URLSearchParams(body),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      };
      // Make the network request using the Fetch API
      fetch(
        `${process.env.REACT_APP_SERVICE_BASE_URL}/call-streaming/stop-streaming`,
        options
      )
        .then((resp) => resp.json())
        .then((data) => {
          console.log(data);
          resolve(data);
        })
        .catch((e) => {
          console.log("ERROR Stop Call Streaming Failed : ", e);
          reject(e);
        });
    });
  };
}

const recordingUtil = new RecordingUtil();

export default recordingUtil;
