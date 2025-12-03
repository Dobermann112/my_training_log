interface ChildProps {
  message: string;
}

export default function Child({ message }: ChildProps) {
  return (
    <div>
      <h4>Child Component</h4>
      <p>Received: {message}</p>
    </div>
  );
}