import React from "react";
import { VERSION, Notifications, NotificationType, Manager } from "@twilio/flex-ui";
import { FlexPlugin } from "@twilio/flex-plugin";

import { SyncClient } from "twilio-sync";
import reducers, { namespace } from "./states";
import StopStreamingButton from "./components/StreamingButton/StopStreamingButton";
import RecordingStatusPanel from "./components/StreamingStatusPanel/StreamingStatusPanel";

const PLUGIN_NAME = "MediaStreamsPlugin";
import "./listeners/CustomListeners";

// Generate token for the sync client
export const SYNC_CLIENT = new SyncClient(Manager.getInstance().user.token);

export default class MediaStreamsPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    this.registerReducers(manager);

    const STOP_STREAMING = "StreamingStopped";
    const START_STREAMING = "StreamingStarted";
    const STOP_FAILED = "StopFailed";
    const START_FAILED = "StartFailed";
    manager.strings[STOP_STREAMING] = "Voice Streaming has been paused.";
    manager.strings[START_STREAMING] =
      "Starting media streaming for this call.";
    manager.strings[STOP_FAILED] =
      "FAILED to stop media streaming. Please try again.";
    manager.strings[START_FAILED] =
      "FAILED to start streaming. Please try again.";

    Notifications.registerNotification({
      id: STOP_STREAMING,
      closeButton: true,
      content: STOP_STREAMING,
      type: NotificationType.warning,
      timeout: 3000,
    });
    Notifications.registerNotification({
      id: START_STREAMING,
      closeButton: true,
      content: START_STREAMING,
      type: NotificationType.success,
      timeout: 3000,
    });
    Notifications.registerNotification({
      id: STOP_FAILED,
      closeButton: true,
      content: STOP_FAILED,
      type: NotificationType.error,
      timeout: 3000,
    });
    Notifications.registerNotification({
      id: START_FAILED,
      closeButton: true,
      content: START_FAILED,
      type: NotificationType.error,
      timeout: 3000,
    });

    flex.CallCanvasActions.Content.add(
      <StopStreamingButton
        icon="Eye"
        key="recording_button"
      ></StopStreamingButton>
    ); //

    flex.CallCanvas.Content.add(
      <RecordingStatusPanel key="recording-status-panel">
        {" "}
      </RecordingStatusPanel>,
      {
        sortOrder: -1,
      }
    );
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint: disable-next-line
      console.error(
        `You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`
      );
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
