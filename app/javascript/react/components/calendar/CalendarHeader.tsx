export type CalendarHeaderProps = {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export default function CalendarHeader({
  currentDate,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  const label = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="calendar-header">
      <h2 className="calendar-title">{label}</h2>
      
      <div className="calendar-nav">
        <button className="nav-btn" onClick={onPrev}>〈</button>
        <button className="nav-btn" onClick={onNext}>〉</button>
        <button className="nav-btn" onClick={onToday}>today</button>
      </div>
    </div>
  );
}
