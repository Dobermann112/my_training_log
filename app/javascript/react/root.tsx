import { createRoot } from "react-dom/client";

// ---- 今後実装するページを仮 import （作成前なのでコメントでOK） ----
// import CalendarPage from "./pages/CalendarPage";

// ---- テスト用の仮コンポーネント（後で削除） ----
function HelloReact() {
  return <div>Hello React from TSX!</div>;
}

document.addEventListener("turbo:load", () => {
  // calendar-root があれば CalendarPage を描画
  const calendarRoot = document.getElementById("calendar-root");
  if (calendarRoot) {
    const root = createRoot(calendarRoot);
    // root.render(<CalendarPage />);
    root.render(<HelloReact />); // ←仮描画（FullCalendar PoC の前まで使う）
  }
});
