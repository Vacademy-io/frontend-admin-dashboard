import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { ContactsListSection } from './-components/contacts-list-section';
import { Helmet } from 'react-helmet';

interface ContactsSearchParams {
    name?: string;
    gender?: string | string[];
}

export const Route = createFileRoute('/manage-contacts/')({
    component: ContactsList,
    validateSearch: (search): ContactsSearchParams => ({
        name: search.name as string | undefined,
        gender: search.gender as string | string[] | undefined,
    }),
});

function ContactsList() {
    return (
        <LayoutContainer>
            <Helmet>
                <title>Contacts</title>
                <meta
                    name="description"
                    content="This page shows all the contacts of the institute."
                />
            </Helmet>
            <ContactsListSection />
        </LayoutContainer>
    );
}
