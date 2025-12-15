import { createLazyFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@/routes/login/-components/LoginPages/sections/login-form';

export const Route = createLazyFileRoute('/login/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <LoginForm />;
}
