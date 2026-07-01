import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/setting')({
  component: RouteComponent,
})

function RouteComponent() {
}
