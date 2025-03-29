import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/evaluation/evaluate/$attemptId/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/evaluation/evaluate/$attemptId/"!</div>
}
