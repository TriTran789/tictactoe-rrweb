"use client";
import { eventWithTime } from "@rrweb/types";
import React, { useEffect, useRef } from "react";
import rrwebPlayer from "rrweb-player";

const Player = ({ events }: { events: eventWithTime[] }) => {
  useEffect(() => {
    if (events.length > 1) {
      new rrwebPlayer({
        target: document.getElementById("player") as HTMLElement,
        props: {
          events: events,
        },
      });
    }
  }, [events]);

  if (events.length < 2) {
    return <p>Loading...</p>;
  }

  return <div id="player" className="w-full h-full bg-white"></div>;
};

export default Player;
