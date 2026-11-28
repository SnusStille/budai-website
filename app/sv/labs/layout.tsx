import "../../labs/labs.css";
import "../../labs/demos.css";

export default function SvLabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div data-labs-root>{children}</div>;
}
