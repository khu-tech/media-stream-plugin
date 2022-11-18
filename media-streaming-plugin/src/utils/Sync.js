import { SYNC_CLIENT } from "../MediaStreamsPlugin";

class SyncDocClass {
  constructor() {}

  // Getting the Sync Document
  getSyncDoc(syncDocName) {
    return new Promise(function (resolve) {
      SYNC_CLIENT.document(syncDocName).then((doc) => {
        resolve(doc);
      });
    });
  }

  initSyncDoc(workerCallSid, streamSid, streamStatus) {
    const docToUpdate = `syncDoc.${workerCallSid}`;

    // Getting the latest Sync Doc agent list and storing in an array
    // We will use this to add/remove the approprate supervisor and then update the Sync Doc
    let streamArray = [];
    this.getSyncDoc(docToUpdate).then((doc) => {
      console.log("doc is" + doc.value.data);
      // Confirm the Sync Doc supervisors array isn't null, as of ES6 we can use the spread syntax to clone the array
      if (doc.value.data.streams) {
        streamArray = [...doc.value.data.streams];
      }

      if (updateStatus === "add") {
        console.log(
          `Updating Sync Doc: ${docToUpdate} callSid: ${streamSid} has been ADDED to the streaming array`
        );
        streamArray.push({
          streamSid,
          streamStatus,
        });
        // Update the Sync Doc with the new supervisorsArray
        this.updateSyncDoc(docToUpdate, streamArray);
        console.log("Sync update successful");

        // Checking Updated Status we pass during the button click
        // to splice/remove the Supervisor from the Supervisor Array within the Sync Doc
      } else if (updateStatus === "remove") {
        console.log(
          `Updating Sync Doc: ${docToUpdate}, stream: ${streamSid} has been REMOVED from the stream array`
        );

        const removeStreamIndex = streamArray.findIndex(
          (s) => s.streamStatus === "stop"
        );
        // Ensure we get something back, let's splice this index where the Supervisor is within the array
        if (removeStreamIndex > -1) {
          streamArray.splice(removeSupervisorIndex, 1);
        }
        // Update the Sync Doc with the new supervisorsArray
        this.updateSyncDoc(docToUpdate, streamArray);
      }
    });
  }

  updateSyncDoc(syncDocName, streamsObject) {
    SYNC_CLIENT.document(syncDocName).then((doc) => {
      doc.update({
        data: {
          streams: streamsObject,
        },
      });
      return new Promise(function (resolve) {
        SYNC_CLIENT.document(syncDocName).then((doc) => {
          resolve(doc);
        });
      });
    });
  }

  clearSyncDoc(syncDocName) {
    SYNC_CLIENT.document(syncDocName).then((doc) => {
      doc.update({
        data: {
          streams: [],
        },
      });
    });
  }

  // Called when we wish to close/unsubscribe from a specific sync document
  closeSyncDoc(syncDocName) {
    SYNC_CLIENT.document(syncDocName).then((doc) => {
      doc.close();
    });
  }
}

export const SyncDoc = new SyncDocClass();
