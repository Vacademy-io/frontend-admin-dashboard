import { createLazyFileRoute } from '@tanstack/react-router';
import { AudienceListSection } from './audience-list-section';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';

export const Route = createLazyFileRoute('/audience-manager/list/')({
  component: AudienceManagerList,
});

function AudienceManagerList() {
  return (
    <LayoutContainer>
      <AudienceListSection />
    </LayoutContainer>
  );
}
