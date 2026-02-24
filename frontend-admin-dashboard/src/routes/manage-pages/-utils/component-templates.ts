import { v4 as uuidv4 } from 'uuid';
import { Component } from '../-types/editor-types';

export const componentTemplates: Record<string, Omit<Component, 'id'>> = {
    header: {
        type: 'header',
        enabled: true,
        props: {
            logo: '',
            title: 'My Platform',
            navigation: [{ label: 'Home', route: 'homepage', openInSameTab: true }],
            authLinks: [{ label: 'Login', route: 'login' }],
        },
    },

    heroSection: {
        type: 'heroSection',
        enabled: true,
        props: {
            layout: 'split',
            backgroundColor: '#F8FAFC',
            left: {
                title: 'Welcome to Our Platform',
                description: 'Start your learning journey today.',
                button: {
                    enabled: false,
                    text: 'Get Started',
                    action: 'navigate',
                    target: '',
                },
            },
            right: { image: '', alt: 'Hero image' },
            styles: { padding: '40px', roundedEdges: true, textAlign: 'left' },
        },
    },

    courseCatalog: {
        type: 'courseCatalog',
        enabled: true,
        props: {
            title: 'Our Courses',
            showFilters: true,
            filtersConfig: [{ id: 'level', label: 'Level', type: 'checkbox', field: 'level_name' }],
            render: {
                layout: 'grid',
                cardFields: ['package_name', 'course_preview_image_media_id', 'price'],
                styles: {
                    hoverEffect: 'shadow',
                    roundedEdges: true,
                    backgroundColor: '#FFFFFF',
                },
            },
        },
    },

    footer: {
        type: 'footer',
        enabled: true,
        props: {
            layout: 'two-column',
            leftSection: {
                title: 'My Platform',
                text: 'Welcome to our platform.',
                socials: [],
            },
            rightSection: { title: 'Links', links: [] },
            bottomNote: '© 2025',
        },
    },

    mediaShowcase: {
        type: 'mediaShowcase',
        enabled: true,
        props: {
            headerText: 'Success Stories',
            description: 'Hear directly from our learners.',
            media: [],
            layout: 'carousel',
            styles: { backgroundColor: '#F0F9FF', roundedEdges: true },
        },
    },

    statsHighlights: {
        type: 'statsHighlights',
        enabled: true,
        props: {
            headerText: 'Our Achievements',
            description: 'Numbers that speak about our growth.',
            stats: [{ label: 'Students', value: '100+' }],
            style: 'circle',
            styles: { backgroundColor: '#FFFFFF', textColor: '#111827', hoverEffect: 'scale' },
        },
    },

    testimonialSection: {
        type: 'testimonialSection',
        enabled: true,
        props: {
            headerText: 'What Our Students Say',
            description: 'Real feedback from our learners.',
            layout: 'grid-scroll',
            testimonials: [],
            styles: {
                backgroundColor: '#F9FAFB',
                roundedEdges: true,
                cardHoverEffect: 'lift',
                scrollEnabled: true,
            },
        },
    },

    bookCatalogue: {
        type: 'bookCatalogue',
        enabled: true,
        props: {
            title: 'Book Collection',
            showFilters: true,
            filtersConfig: [],
            cartButtonConfig: { enabled: true, showAddToCartButton: true },
            render: {
                layout: 'grid',
                cardFields: [],
                styles: { hoverEffect: 'shadow', roundedEdges: true },
            },
        },
    },

    bookDetails: {
        type: 'bookDetails',
        enabled: true,
        props: {
            showEnquiry: true,
            showPayment: true,
            fields: { title: 'package_name', price: 'price' },
            showAddToCart: true,
        },
    },

    cartComponent: {
        type: 'cartComponent',
        enabled: true,
        props: {
            showItemImage: true,
            showItemTitle: true,
            showPrice: true,
            showEmptyState: true,
            styles: { padding: '10px' },
        },
    },

    buyRentSection: {
        type: 'buyRentSection',
        enabled: true,
        props: {
            heading: 'Choose Your Path',
            buy: { buttonLabel: 'Buy', levelFilterValue: 'Buy', targetRoute: 'homepage' },
            rent: { buttonLabel: 'Rent', levelFilterValue: 'Rent', targetRoute: 'homepage' },
        },
    },

    policyRenderer: {
        type: 'policyRenderer',
        enabled: true,
        props: {
            policies: {
                shipping: { title: 'Policy', content: '<p>Content here</p>' },
            },
        },
    },

    courseDetails: {
        type: 'courseDetails',
        enabled: true,
        props: {
            showEnquiry: true,
            fields: { title: 'package_name', price: 'price' },
        },
    },
};

export const getComponentTemplate = (type: string): Component => {
    const template = componentTemplates[type];
    if (!template) throw new Error(`Unknown component type: ${type}`);

    return {
        ...template,
        id: `${type}-${uuidv4().slice(0, 8)}`,
        props: JSON.parse(JSON.stringify(template.props)), // Deep copy props
    };
};
