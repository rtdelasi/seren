"use client";

import React from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";

interface JitsiRoomProps {
  roomName: string;
  userName: string;
  userEmail: string;
  onClose: () => void;
}

export default function JitsiRoom({ roomName, userName, userEmail, onClose }: JitsiRoomProps) {
  return (
    <div className="w-full h-[600px] border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950 shadow-2xl">
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        configOverwrite={{
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          prejoinPageEnabled: false, // Bypass prejoin screen to join immediately
          disableDeepLinking: true, // Disable prompts for native Jitsi apps
          toolbarButtons: [
            "microphone",
            "camera",
            "closedcaptions",
            "desktop",
            "fullscreen",
            "fodeviceselection",
            "hangup",
            "profile",
            "chat",
            "settings",
            "raisehand",
            "videoquality",
            "tileview",
          ],
        }}
        interfaceConfigOverwrite={{
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
        }}
        userInfo={{
          displayName: userName,
          email: userEmail,
        }}
        onReadyToClose={onClose}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = "100%";
          iframeRef.style.width = "100%";
          iframeRef.style.border = "0";
        }}
      />
    </div>
  );
}
