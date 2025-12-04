import { createRoot } from "react-dom/client";
import ApiSample from "./components/ApiSample";
import CalendarPage from "./pages/CalendarPage";

// ---- 今後実装するページを仮 import （作成前なのでコメントでOK） ----
// import CalendarPage from "./pages/CalendarPage";

document.addEventListener("turbo:load", () => {
  // API Sample
  const apiRoot = document.getElementById("api-sample-root");
  if (apiRoot && !apiRoot.hasChildNodes()) {
    const root = createRoot(apiRoot);
    root.render(<ApiSample />);
  }

  // Calendar (PoC)
  const calendarRoot = document.getElementById("calendar-root");
  if (calendarRoot && !calendarRoot.hasChildNodes()) {
    const root = createRoot(calendarRoot);
    // root.render(<CalendarPage />);
    root.render(<CalendarPage />); // ←仮描画（FullCalendar PoC の前まで使う）
  }
});
