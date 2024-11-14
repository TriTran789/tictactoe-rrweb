"use client";
import { eventWithTime } from "@rrweb/types";
import { useEffect, useRef } from "react";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";

const Player = ({ events }: { events: eventWithTime[] }) => {
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (events.length > 1 && wrapper.current) {
      new rrwebPlayer({
        target: wrapper.current,
        props: {
          events: events,
        },
      });
    }
  }, [events]);

  if (events.length < 2) {
    return <p>Loading...</p>;
  }
  console.log("wrapper", wrapper.current);
  return (
    <div id="player" ref={wrapper} className="flex flex-col items-center">
      <style>
        {`
          #player .rr-player {
            background-color: transparent;
            border-width: 2px;
          }

          #player .rr-controller {
            background-color: #324773;
          }
        `}
      </style>
    </div>
  );
};

export default Player;
