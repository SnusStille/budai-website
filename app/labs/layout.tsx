import "./labs.css";

export default function LabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-labs-root>{children}</div>;
}
