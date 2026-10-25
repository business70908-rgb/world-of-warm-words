import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <h1 style={{ padding: "2rem", fontFamily: "system-ui" }}>Hello world</h1>;
}
