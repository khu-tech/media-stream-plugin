exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  response.setHeaders(headers);

  const twilioClient = context.getTwilioClient();
  const { streamSid, workerCallSid } = event;

  console.log("StreamSid is :", streamSid);

  twilioClient
    //calls(CallSid)
    .calls(workerCallSid)
    .streams(streamSid)
    .update({ status: "stopped" })
    .then((data) => {
      console.log("response data is", data);
      response.setBody({ Status: "SUCCESS", ResponseData: data });
      callback(null, response);
    })
    .catch((err) => {
      // If there's an error, send an error response
      console.log("Error is -", err);
      response.setBody({ Status: "FAIL", ResponseData: err });
      callback(null, response);
    });
};
