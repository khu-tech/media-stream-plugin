import { Actions, Manager, TaskHelper } from "@twilio/flex-ui";
import { ParticipantType, ReservationEvents } from "../enums";
import { Actions as StreamingStatusActions } from "../states/StreamingStatus";
import { SyncDoc } from "../utils/Sync";
const manager = Manager.getInstance();
const reservationListeners = new Map();

import RecordingUtil from "../utils/StreamingUtil";

const isTaskActive = (task) => {
  const { sid: reservationSid, taskStatus } = task;
  if (taskStatus === "canceled") {
    return false;
  } else {
    return manager.workerClient.reservations.has(reservationSid);
  }
};

const handleAcceptedCall = async (task) => {
  const participants = await waitForConferenceParticipants(task);
  const customer = participants.find(
    (p) => p.participantType === ParticipantType.customer
  );

  if (!customer) {
    console.warn("No customer participant. Not starting the call streaming");
    return;
  }

  const { callSid } = customer;

  const streaming = await RecordingUtil.startCallStreaming(callSid);

  updateStreamingState(streaming.Status);
 
  SyncDoc.initSyncDoc(callSid,streaming.ResponseData.sid, "add");
};

const waitForConferenceParticipants = (task) =>
  new Promise((resolve) => {
    const waitTimeMs = 100;
    // For outbound calls, the customer participant doesn't join the conference
    // until the called party answers. Need to allow enough time for that to happen.
    const maxWaitTimeMs = 60000;
    let waitForConferenceInterval = setInterval(async () => {
      const { conference } = task;

      if (!isTaskActive(task)) {
        console.debug("Call canceled, clearing waitForConferenceInterval");
        waitForConferenceInterval = clearInterval(waitForConferenceInterval);
        return;
      }
      if (conference === undefined) {
        return;
      }
      const { participants } = conference;
      if (Array.isArray(participants) && participants.length < 2) {
        return;
      }
      const worker = participants.find(
        (p) => p.participantType === ParticipantType.worker
      );
      const customer = participants.find(
        (p) => p.participantType === ParticipantType.customer
      );

      if (!worker || !customer) {
        return;
      }

      console.debug("Worker and customer participants joined conference");
      waitForConferenceInterval = clearInterval(waitForConferenceInterval);

      resolve(participants);
    }, waitTimeMs);

    setTimeout(() => {
      if (waitForConferenceInterval) {
        console.debug(
          `Customer participant didn't show up within ${
            maxWaitTimeMs / 1000
          } seconds`
        );
        clearInterval(waitForConferenceInterval);

        resolve([]);
      }
    }, maxWaitTimeMs);
  });

const handleReservationAccepted = async (reservation) => {
  const task = TaskHelper.getTaskByTaskSid(reservation.sid);
  handleAcceptedCall(task);
};

const handleReservationUpdated = (event, reservation) => {
  console.debug("Event, reservation updated", event, reservation);
  switch (event) {
    case ReservationEvents.accepted: {
      handleReservationAccepted(reservation);
      break;
    }
    case ReservationEvents.wrapup:
    case ReservationEvents.completed:
    case ReservationEvents.rejected:
    case ReservationEvents.timeout:
    case ReservationEvents.canceled:
    case ReservationEvents.rescinded: {
      stopReservationListeners(reservation);
      break;
    }
    default:
      break;
  }
};

const stopReservationListeners = (reservation) => {
  const listeners = reservationListeners.get(reservation);
  if (listeners) {
    listeners.forEach((listener) => {
      reservation.removeListener(listener.event, listener.callback);
    });
    reservationListeners.delete(reservation);
  }
};

const initReservationListeners = (reservation) => {
  const trueReservation = reservation.addListener
    ? reservation
    : reservation.source;
  stopReservationListeners(trueReservation);
  const listeners = [];
  Object.values(ReservationEvents).forEach((event) => {
    const callback = () => handleReservationUpdated(event, trueReservation);
    trueReservation.addListener(event, callback);
    listeners.push({ event, callback });
  });
  reservationListeners.set(trueReservation, listeners);
};

const handleNewReservation = (reservation) => {
  console.debug("new reservation", reservation);
  initReservationListeners(reservation);
};

const updateStreamingState = (status) => {
  manager.store.dispatch(StreamingStatusActions.setStreamingStatus(status));
};

manager.workerClient.on("reservationCreated", (reservation) => {
  handleNewReservation(reservation);
});
