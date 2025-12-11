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
      <h2>{label}</h2>
      <div className="nav-buttons">
        <button onClick={onPrev}>〈</button>
        <button onClick={onNext}>〉</button>
        <button onClick={onToday}>today</button>
      </div>
    </div>
  );
}
