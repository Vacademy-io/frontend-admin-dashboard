import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/admissions/documents/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admissions/documents/"!</div>
}
