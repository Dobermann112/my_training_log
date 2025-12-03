import { useState } from "react";
import Child from "./Child";

export default function Parent() {
  const [message] = useState<string>("Hello from Parent")

  return (
    <div>
      <h3>Parent Component</h3>
      <p>Message: {message}</p>

      <Child message={message} />
    </div>
  );
}