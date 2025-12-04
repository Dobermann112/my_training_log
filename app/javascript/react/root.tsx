import { createRoot } from "react-dom/client";
import CalendarPage from "./pages/CalendarPage";

// ---- 今後実装するページを仮 import （作成前なのでコメントでOK） ----
// import CalendarPage from "./pages/CalendarPage";

document.addEventListener("turbo:load", () => {
  // calendar-root があれば CalendarPage を描画
  const calendarRoot = document.getElementById("calendar-root");
  if (calendarRoot) {
    const root = createRoot(calendarRoot);
    // root.render(<CalendarPage />);
    root.render(<CalendarPage />); // ←仮描画（FullCalendar PoC の前まで使う）
  }
});
