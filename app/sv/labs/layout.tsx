import "../../labs/labs.css";

export default function SvLabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-labs-root>{children}</div>;
}
