import { createRoot } from "react-dom/client";
import Counter from "./Counter";

function HelloReact() {
  return <div>Hello React from TSX!</div>;
}

document.addEventListener("turbo:load", () => {
  const rootElement = document.getElementById("react-root");

  if (rootElement) {
    // 初期化済みかどうかのチェック（重複レンダリングの防止）
    if (!rootElement.hasChildNodes()) {
      const root = createRoot(rootElement);
      root.render(
        <>
          <HelloReact />
          <Counter />
        </>
      );
    }
  }
});
