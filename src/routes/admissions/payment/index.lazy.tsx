import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/admissions/payment/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admissions/payment/"!</div>
}
