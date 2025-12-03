import { createRoot } from "react-dom/client";

// ---- 今後実装するページを仮 import （作成前なのでコメントでOK） ----
// import SettingsPage from "./pages/SettingsPage";
// import CalendarPage from "./pages/CalendarPage";

// ---- テスト用の仮コンポーネント（後で削除） ----
function HelloReact() {
  return <div>Hello React from TSX!</div>;
}

document.addEventListener("turbo:load", () => {
  // settings-root があれば SettingsPage を描画
  const settingsRoot = document.getElementById("settings-root");
  if (settingsRoot) {
    const root = createRoot(settingsRoot);
    // root.render(<SettingsPage />);
    root.render(<HelloReact />); // ←仮描画（後で SettingsPage に差し替える）
  }

  // calendar-root があれば CalendarPage を描画
  const calendarRoot = document.getElementById("calendar-root");
  if (calendarRoot) {
    const root = createRoot(calendarRoot);
    // root.render(<CalendarPage />);
    root.render(<HelloReact />); // ←仮描画（FullCalendar PoC の前まで使う）
  }
});
