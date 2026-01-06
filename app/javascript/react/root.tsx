import { createRoot } from "react-dom/client";
import ApiSample from "./components/ApiSample";
import CalendarPage from "./pages/CalendarPage";
import AvatarContainer from "./components/avatar/AvatarContainer";

document.addEventListener("turbo:load", () => {
  // API Sample root
  const apiRoot = document.getElementById("api-sample-root");
  if (apiRoot && !apiRoot.hasChildNodes()) {
    const root = createRoot(apiRoot);
    root.render(<ApiSample />);
  }

  // Calendar root 
  const calendarRoot = document.getElementById("calendar-root");
  if (calendarRoot && !calendarRoot.hasChildNodes()) {
    const root = createRoot(calendarRoot);
    // root.render(<CalendarPage />);
    root.render(<CalendarPage />); // ←仮描画（FullCalendar PoC の前まで使う）
  }

  const avatarRoot = document.getElementById("avatar-root");
  if (avatarRoot) {
    import("react-dom/client").then(({ createRoot }) => {
      createRoot(avatarRoot).render(<AvatarContainer />);
    });
  }
});
