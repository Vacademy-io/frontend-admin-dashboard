import { createLazyFileRoute } from '@tanstack/react-router';
import { CatalogueList } from './-components/CatalogueList';

export const Route = createLazyFileRoute('/manage-pages/')({
  component: CatalogueList,
});
