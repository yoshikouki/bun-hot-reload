import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const ws = new WebSocket("ws://localhost:3000");

const Client = () => {
  const [tick, setTick] = useState("");

  useEffect(() => {
    ws.onopen = () => {
      console.log("connected");
    };
    ws.onmessage = (event) => {
      setTick(event.data.toString());
    };
    ws.onclose = () => {
      console.log("disconnected");
    };
    ws.onerror = (error) => {
      console.error(error);
    };
  });

  return (
    <>
      <div>{tick}</div>
      <button onClick={() => ws.send(new Date().toISOString())} type="button">
        Push
      </button>
    </>
  );
};

const domNode = document.getElementById("root") ?? undefined;
const root = createRoot(domNode);
root.render(<Client />);
