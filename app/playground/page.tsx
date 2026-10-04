import { redirect } from "next/navigation";

/** The Playground is the home page now — keep old links working. */
export default function PlaygroundRedirect() {
  redirect("/");
}
