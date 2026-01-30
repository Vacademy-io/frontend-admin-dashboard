import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/admissions/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admissions/"!</div>
}
