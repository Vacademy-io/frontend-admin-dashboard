import { useEditorStore } from '../-stores/editor-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useState } from 'react';

export const PropertyPanel = () => {
    const {
        config,
        selectedComponentId,
        selectedPageId,
        selectedGlobalSettings,
        updateComponent,
        updateGlobalSettings,
    } = useEditorStore();

    if (!config) return null;

    // Global Settings Editor
    if (selectedGlobalSettings) {
        return <GlobalSettingsEditor config={config} updateGlobalSettings={updateGlobalSettings} />;
    }

    if (selectedComponentId) {
        // Find component
        let component: (typeof config.pages)[number]['components'][number] | null = null;
        let pageId = '';
        for (const p of config.pages) {
            const c = p.components.find((c) => c.id === selectedComponentId);
            if (c) {
                component = c;
                pageId = p.id;
                break;
            }
        }

        if (!component) return <div className="p-4">Component not found</div>;

        return (
            <div className="flex flex-col gap-6 p-4">
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold capitalize">{component.type} Settings</h3>
                    <div className="text-xs text-gray-500">ID: {component.id}</div>
                </div>

                <div className="flex items-center justify-between">
                    <Label htmlFor="enabled-switch">Enabled</Label>
                    <Switch
                        id="enabled-switch"
                        checked={component.enabled}
                        onCheckedChange={(c) =>
                            updateComponent(pageId, component!.id, { enabled: c })
                        }
                    />
                </div>

                {/* Component-specific editors */}
                <ComponentEditor
                    component={component}
                    pageId={pageId}
                    updateComponent={updateComponent}
                />
            </div>
        );
    }

    if (selectedPageId) {
        const page = config.pages.find((p) => p.id === selectedPageId);
        if (page) {
            return (
                <div className="p-4">
                    <h3 className="mb-4 text-lg font-semibold">Page Settings</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Page Title</Label>
                            <Input value={page.title || ''} readOnly disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Route Slug</Label>
                            <Input value={page.route} readOnly disabled />
                        </div>
                    </div>
                </div>
            );
        }
    }

    return <div className="p-8 text-center text-gray-400">Select an item to edit</div>;
};

// Global Settings Editor Component
const GlobalSettingsEditor = ({
    config,
    updateGlobalSettings,
}: {
    config: any;
    updateGlobalSettings: (updates: any) => void;
}) => {
    const gs = config.globalSettings || {};

    const updateField = (path: string, value: any) => {
        const keys = path.split('.');
        const key0 = keys[0] as string;
        const key1 = keys[1] as string | undefined;
        const key2 = keys[2] as string | undefined;

        if (keys.length === 1) {
            updateGlobalSettings({ [key0]: value });
        } else if (keys.length === 2 && key1) {
            updateGlobalSettings({
                [key0]: {
                    ...gs[key0],
                    [key1]: value,
                },
            });
        } else if (keys.length === 3 && key1 && key2) {
            updateGlobalSettings({
                [key0]: {
                    ...gs[key0],
                    [key1]: {
                        ...gs[key0]?.[key1],
                        [key2]: value,
                    },
                },
            });
        }
    };

    return (
        <div className="flex flex-col gap-6 overflow-auto p-4">
            <div className="flex items-center gap-2 border-b pb-4">
                <Settings className="size-5 text-indigo-600" />
                <h3 className="text-lg font-semibold">Global Settings</h3>
            </div>

            {/* Catalogue Type */}
            <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
                <h4 className="font-medium text-gray-700">Catalogue Type</h4>
                <div className="flex items-center justify-between">
                    <Label>Type</Label>
                    <select
                        className="rounded border px-3 py-1.5 text-sm"
                        value={gs.courseCatalogeType?.value || 'Course'}
                        onChange={(e) => updateField('courseCatalogeType.value', e.target.value)}
                    >
                        <option value="Course">Course</option>
                        <option value="Product">Product</option>
                    </select>
                </div>
            </div>

            {/* Theme Settings */}
            <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
                <h4 className="font-medium text-gray-700">Theme</h4>
                <div className="flex items-center justify-between">
                    <Label>Mode</Label>
                    <select
                        className="rounded border px-3 py-1.5 text-sm"
                        value={gs.mode || 'light'}
                        onChange={(e) => updateField('mode', e.target.value)}
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
                <div className="flex items-center justify-between">
                    <Label>Compactness</Label>
                    <select
                        className="rounded border px-3 py-1.5 text-sm"
                        value={gs.compactness || 'medium'}
                        onChange={(e) => updateField('compactness', e.target.value)}
                    >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                    </select>
                </div>
            </div>

            {/* Fonts */}
            <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
                <h4 className="font-medium text-gray-700">Typography</h4>
                <div className="flex items-center justify-between">
                    <Label>Custom Fonts</Label>
                    <Switch
                        checked={gs.fonts?.enabled || false}
                        onCheckedChange={(c) => updateField('fonts.enabled', c)}
                    />
                </div>
                {gs.fonts?.enabled && (
                    <div className="space-y-2">
                        <Label className="text-xs">Font Family</Label>
                        <select
                            className="w-full rounded border px-3 py-1.5 text-sm"
                            value={gs.fonts?.family || 'Inter, sans-serif'}
                            onChange={(e) => updateField('fonts.family', e.target.value)}
                        >
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Mulish, sans-serif">Mulish</option>
                            <option value="Outfit, sans-serif">Outfit</option>
                            <option value="Poppins, sans-serif">Poppins</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Payment Settings */}
            <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
                <h4 className="font-medium text-gray-700">Payment</h4>
                <div className="flex items-center justify-between">
                    <Label>Enable Payments</Label>
                    <Switch
                        checked={gs.payment?.enabled || false}
                        onCheckedChange={(c) => updateField('payment.enabled', c)}
                    />
                </div>
                {gs.payment?.enabled && (
                    <div className="space-y-2">
                        <Label className="text-xs">Provider</Label>
                        <select
                            className="w-full rounded border px-3 py-1.5 text-sm"
                            value={gs.payment?.provider || 'razorpay'}
                            onChange={(e) => updateField('payment.provider', e.target.value)}
                        >
                            <option value="razorpay">Razorpay</option>
                            <option value="stripe">Stripe</option>
                            <option value="PHONEPE">PhonePe</option>
                            <option value="paypal">PayPal</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Lead Collection */}
            <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
                <h4 className="font-medium text-gray-700">Lead Collection</h4>
                <div className="flex items-center justify-between">
                    <Label>Enable Lead Form</Label>
                    <Switch
                        checked={gs.leadCollection?.enabled || false}
                        onCheckedChange={(c) => updateField('leadCollection.enabled', c)}
                    />
                </div>
                {gs.leadCollection?.enabled && (
                    <>
                        <div className="flex items-center justify-between">
                            <Label className="text-xs">Mandatory</Label>
                            <Switch
                                checked={gs.leadCollection?.mandatory || false}
                                onCheckedChange={(c) => updateField('leadCollection.mandatory', c)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Invite Link</Label>
                            <Input
                                value={gs.leadCollection?.inviteLink || ''}
                                onChange={(e) =>
                                    updateField('leadCollection.inviteLink', e.target.value)
                                }
                                placeholder="Optional invite link"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Enquiry */}
            <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
                <h4 className="font-medium text-gray-700">Enquiry</h4>
                <div className="flex items-center justify-between">
                    <Label>Enable Enquiry</Label>
                    <Switch
                        checked={gs.enrquiry?.enabled || false}
                        onCheckedChange={(c) => updateField('enrquiry.enabled', c)}
                    />
                </div>
            </div>
        </div>
    );
};

// Component-specific editor
const ComponentEditor = ({ component, pageId, updateComponent }: any) => {
    const { type } = component;

    switch (type) {
        case 'header':
            return (
                <HeaderEditor
                    component={component}
                    pageId={pageId}
                    updateComponent={updateComponent}
                />
            );

        case 'footer':
            return (
                <FooterEditor
                    component={component}
                    pageId={pageId}
                    updateComponent={updateComponent}
                />
            );

        case 'heroSection':
            return (
                <HeroSectionEditor
                    component={component}
                    pageId={pageId}
                    updateComponent={updateComponent}
                />
            );

        case 'MediaShowcaseComponent':
        case 'mediaShowcase':
            return (
                <MediaShowcaseEditor
                    component={component}
                    pageId={pageId}
                    updateComponent={updateComponent}
                />
            );

        case 'bookCatalogue':
        case 'courseCatalog':
            return (
                <BookCatalogueEditor
                    component={component}
                    pageId={pageId}
                    updateComponent={updateComponent}
                />
            );

        case 'bookDetails':
            return (
                <BookDetailsEditor
                    component={component}
                    pageId={pageId}
                    updateComponent={updateComponent}
                />
            );

        case 'cartComponent':
            return (
                <CartComponentEditor
                    component={component}
                    pageId={pageId}
                    updateComponent={updateComponent}
                />
            );

        case 'buyRentSection':
            return (
                <BuyRentEditor
                    component={component}
                    pageId={pageId}
                    updateComponent={updateComponent}
                />
            );

        case 'statsHighlights':
            return (
                <StatsHighlightsEditor
                    component={component}
                    pageId={pageId}
                    updateComponent={updateComponent}
                />
            );

        case 'testimonialSection':
            return (
                <TestimonialsEditor
                    component={component}
                    pageId={pageId}
                    updateComponent={updateComponent}
                />
            );

        case 'policyRenderer':
            return (
                <PolicyRendererEditor
                    component={component}
                    pageId={pageId}
                    updateComponent={updateComponent}
                />
            );

        default:
            return (
                <GenericEditor
                    component={component}
                    pageId={pageId}
                    updateComponent={updateComponent}
                />
            );
    }
};

// Media Showcase Editor with slide management
const MediaShowcaseEditor = ({ component, pageId, updateComponent }: any) => {
    const { props } = component;
    const [expandedSlide, setExpandedSlide] = useState<number | null>(null);

    const updateProp = (key: string, value: any) => {
        updateComponent(pageId, component.id, {
            props: { ...props, [key]: value },
        });
    };

    const addSlide = () => {
        const newSlide = {
            backgroundImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794',
            heading: 'New Slide',
            description: 'Add your description here',
            button: {
                enabled: false,
                text: 'Learn More',
                action: 'navigate',
                target: 'homepage',
            },
        };
        updateProp('slides', [...(props.slides || []), newSlide]);
    };

    const deleteSlide = (index: number) => {
        const newSlides = props.slides.filter((_: any, i: number) => i !== index);
        updateProp('slides', newSlides);
        if (expandedSlide === index) setExpandedSlide(null);
    };

    const updateSlide = (index: number, field: string, value: any) => {
        const newSlides = [...props.slides];
        if (field.startsWith('button.')) {
            const buttonField = field.split('.')[1] as string;
            newSlides[index] = {
                ...newSlides[index],
                button: {
                    ...newSlides[index].button,
                    [buttonField]: value,
                },
            };
        } else {
            newSlides[index] = {
                ...newSlides[index],
                [field]: value,
            };
        }
        updateProp('slides', newSlides);
    };

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium">Showcase Settings</h4>

            <div className="space-y-2">
                <Label>Layout</Label>
                <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={props.layout || 'slider'}
                    onChange={(e) => updateProp('layout', e.target.value)}
                >
                    <option value="slider">Slider</option>
                    <option value="grid">Grid</option>
                </select>
            </div>

            <div className="flex items-center justify-between">
                <Label>Autoplay</Label>
                <Switch
                    checked={props.autoplay || false}
                    onCheckedChange={(c) => updateProp('autoplay', c)}
                />
            </div>

            {props.autoplay && (
                <div className="space-y-2">
                    <Label>Autoplay Interval (ms)</Label>
                    <Input
                        type="number"
                        value={props.autoplayInterval || 3000}
                        onChange={(e) => updateProp('autoplayInterval', parseInt(e.target.value))}
                    />
                </div>
            )}

            <div className="border-t pt-4">
                <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-medium">Slides ({props.slides?.length || 0})</h4>
                    <Button size="sm" onClick={addSlide}>
                        <Plus className="mr-1 size-4" />
                        Add Slide
                    </Button>
                </div>

                <div className="space-y-2">
                    {props.slides?.map((slide: any, index: number) => (
                        <div key={index} className="rounded border bg-gray-50 p-3">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() =>
                                        setExpandedSlide(expandedSlide === index ? null : index)
                                    }
                                    className="flex flex-1 items-center gap-2 text-left text-sm font-medium"
                                >
                                    {expandedSlide === index ? (
                                        <ChevronUp className="size-4" />
                                    ) : (
                                        <ChevronDown className="size-4" />
                                    )}
                                    Slide {index + 1}: {slide.heading}
                                </button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteSlide(index)}
                                    className="size-8 p-0 text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>

                            {expandedSlide === index && (
                                <div className="mt-3 space-y-3 border-t pt-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Background Image URL</Label>
                                        <Input
                                            value={slide.backgroundImage}
                                            onChange={(e) =>
                                                updateSlide(
                                                    index,
                                                    'backgroundImage',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs">Heading</Label>
                                        <Input
                                            value={slide.heading}
                                            onChange={(e) =>
                                                updateSlide(index, 'heading', e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs">Description</Label>
                                        <Textarea
                                            value={slide.description}
                                            onChange={(e) =>
                                                updateSlide(index, 'description', e.target.value)
                                            }
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs">Button</Label>
                                            <Switch
                                                checked={slide.button?.enabled || false}
                                                onCheckedChange={(c) =>
                                                    updateSlide(index, 'button.enabled', c)
                                                }
                                            />
                                        </div>

                                        {slide.button?.enabled && (
                                            <div className="ml-4 space-y-2">
                                                <Input
                                                    placeholder="Button text"
                                                    value={slide.button.text}
                                                    onChange={(e) =>
                                                        updateSlide(
                                                            index,
                                                            'button.text',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <Input
                                                    placeholder="Target route"
                                                    value={slide.button.target}
                                                    onChange={(e) =>
                                                        updateSlide(
                                                            index,
                                                            'button.target',
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Book Catalogue Editor
const BookCatalogueEditor = ({ component, pageId, updateComponent }: any) => {
    const { props } = component;

    const updateProp = (key: string, value: any) => {
        updateComponent(pageId, component.id, {
            props: { ...props, [key]: value },
        });
    };

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium">Catalogue Settings</h4>

            <div className="space-y-2">
                <Label>Title</Label>
                <Input
                    value={props.title || ''}
                    onChange={(e) => updateProp('title', e.target.value)}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label>Show Filters</Label>
                <Switch
                    checked={props.showFilters || false}
                    onCheckedChange={(c) => updateProp('showFilters', c)}
                />
            </div>

            <div className="rounded border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
                Advanced filter configuration and cart settings coming soon.
            </div>
        </div>
    );
};

// Buy/Rent Section Editor
const BuyRentEditor = ({ component, pageId, updateComponent }: any) => {
    const { props } = component;

    const updateProp = (path: string, value: any) => {
        const keys = path.split('.');
        const key0 = keys[0] as string;
        const key1 = keys[1] as string | undefined;
        let newProps = { ...props };

        if (keys.length === 2 && key1) {
            newProps = {
                ...newProps,
                [key0]: {
                    ...newProps[key0],
                    [key1]: value,
                },
            };
        } else {
            newProps[path] = value;
        }

        updateComponent(pageId, component.id, { props: newProps });
    };

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium">Buy/Rent Settings</h4>

            <div className="space-y-2">
                <Label>Heading</Label>
                <Input
                    value={props.heading || ''}
                    onChange={(e) => updateProp('heading', e.target.value)}
                />
            </div>

            <div className="border-t pt-4">
                <h5 className="mb-2 text-xs font-semibold">Buy Option</h5>
                <div className="space-y-2">
                    <Input
                        placeholder="Button label"
                        value={props.buy?.buttonLabel || ''}
                        onChange={(e) => updateProp('buy.buttonLabel', e.target.value)}
                    />
                    <Input
                        placeholder="Level filter value"
                        value={props.buy?.levelFilterValue || ''}
                        onChange={(e) => updateProp('buy.levelFilterValue', e.target.value)}
                    />
                </div>
            </div>

            <div className="border-t pt-4">
                <h5 className="mb-2 text-xs font-semibold">Rent Option</h5>
                <div className="space-y-2">
                    <Input
                        placeholder="Button label"
                        value={props.rent?.buttonLabel || ''}
                        onChange={(e) => updateProp('rent.buttonLabel', e.target.value)}
                    />
                    <Input
                        placeholder="Level filter value"
                        value={props.rent?.levelFilterValue || ''}
                        onChange={(e) => updateProp('rent.levelFilterValue', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

// Generic editor for other components
const GenericEditor = ({ component, pageId, updateComponent }: any) => {
    const { props } = component;

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium">Properties</h4>
            {Object.entries(props).map(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                    return (
                        <div key={key} className="space-y-2">
                            <Label className="capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                            <Input
                                value={value}
                                onChange={(e) =>
                                    updateComponent(pageId, component.id, {
                                        props: {
                                            ...props,
                                            [key]: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>
                    );
                }
                if (typeof value === 'boolean') {
                    return (
                        <div key={key} className="flex items-center justify-between">
                            <Label className="capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                            <Switch
                                checked={value}
                                onCheckedChange={(c) =>
                                    updateComponent(pageId, component.id, {
                                        props: {
                                            ...props,
                                            [key]: c,
                                        },
                                    })
                                }
                            />
                        </div>
                    );
                }
                return null;
            })}
            {Object.values(props).some((v) => typeof v === 'object') && (
                <div className="rounded border border-yellow-100 bg-yellow-50 p-4 text-xs text-yellow-800">
                    Some complex properties are hidden. Expand component details to view full JSON.
                </div>
            )}
        </div>
    );
};

// Header Editor
const HeaderEditor = ({ component, pageId, updateComponent }: any) => {
    const { props } = component;
    const [expandedNav, setExpandedNav] = useState<number | null>(null);

    const updateProp = (key: string, value: any) => {
        updateComponent(pageId, component.id, {
            props: { ...props, [key]: value },
        });
    };

    const addNavItem = () => {
        const newItem = { label: 'New Link', route: '/', openInSameTab: true };
        updateProp('navigation', [...(props.navigation || []), newItem]);
    };

    const updateNavItem = (index: number, field: string, value: any) => {
        const newNav = [...(props.navigation || [])];
        newNav[index] = { ...newNav[index], [field]: value };
        updateProp('navigation', newNav);
    };

    const deleteNavItem = (index: number) => {
        updateProp(
            'navigation',
            props.navigation.filter((_: any, i: number) => i !== index)
        );
    };

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium">Header Settings</h4>

            <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                    value={props.logo || ''}
                    onChange={(e) => updateProp('logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                />
            </div>

            <div className="space-y-2">
                <Label>Title</Label>
                <Input
                    value={props.title || ''}
                    onChange={(e) => updateProp('title', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Navigation Items</Label>
                    <Button size="sm" variant="outline" onClick={addNavItem}>
                        <Plus className="mr-1 size-3" /> Add
                    </Button>
                </div>
                {props.navigation?.map((item: any, index: number) => (
                    <div key={index} className="rounded border bg-gray-50 p-2">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setExpandedNav(expandedNav === index ? null : index)}
                                className="flex-1 text-left text-sm font-medium"
                            >
                                {expandedNav === index ? (
                                    <ChevronUp className="mr-1 inline size-3" />
                                ) : (
                                    <ChevronDown className="mr-1 inline size-3" />
                                )}
                                {item.label}
                            </button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNavItem(index)}
                                className="size-6 p-0 text-red-600"
                            >
                                <Trash2 className="size-3" />
                            </Button>
                        </div>
                        {expandedNav === index && (
                            <div className="mt-2 space-y-2">
                                <Input
                                    placeholder="Label"
                                    value={item.label}
                                    onChange={(e) => updateNavItem(index, 'label', e.target.value)}
                                />
                                <Input
                                    placeholder="Route"
                                    value={item.route}
                                    onChange={(e) => updateNavItem(index, 'route', e.target.value)}
                                />
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Open in same tab</Label>
                                    <Switch
                                        checked={item.openInSameTab}
                                        onCheckedChange={(c) =>
                                            updateNavItem(index, 'openInSameTab', c)
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Footer Editor
const FooterEditor = ({ component, pageId, updateComponent }: any) => {
    const { props } = component;

    const updateProp = (key: string, value: any) => {
        updateComponent(pageId, component.id, {
            props: { ...props, [key]: value },
        });
    };

    const updateLeftSection = (field: string, value: any) => {
        updateProp('leftSection', { ...props.leftSection, [field]: value });
    };

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium">Footer Settings</h4>

            <div className="space-y-2">
                <Label>Layout</Label>
                <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={props.layout || 'four-column'}
                    onChange={(e) => updateProp('layout', e.target.value)}
                >
                    <option value="two-column">Two Column</option>
                    <option value="three-column">Three Column</option>
                    <option value="four-column">Four Column</option>
                </select>
            </div>

            <div className="space-y-3 rounded border bg-gray-50 p-3">
                <h5 className="text-xs font-semibold">Left Section</h5>
                <div className="space-y-2">
                    <Label className="text-xs">Title</Label>
                    <Input
                        value={props.leftSection?.title || ''}
                        onChange={(e) => updateLeftSection('title', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                        rows={3}
                        value={props.leftSection?.text || ''}
                        onChange={(e) => updateLeftSection('text', e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Bottom Note</Label>
                <Input
                    value={props.bottomNote || ''}
                    onChange={(e) => updateProp('bottomNote', e.target.value)}
                />
            </div>
        </div>
    );
};

// Hero Section Editor
const HeroSectionEditor = ({ component, pageId, updateComponent }: any) => {
    const { props } = component;

    const updateProp = (key: string, value: any) => {
        updateComponent(pageId, component.id, {
            props: { ...props, [key]: value },
        });
    };

    const updateLeft = (field: string, value: any) => {
        updateProp('left', { ...props.left, [field]: value });
    };

    const updateRight = (field: string, value: any) => {
        updateProp('right', { ...props.right, [field]: value });
    };

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium">Hero Section Settings</h4>

            <div className="space-y-2">
                <Label>Layout</Label>
                <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={props.layout || 'split'}
                    onChange={(e) => updateProp('layout', e.target.value)}
                >
                    <option value="split">Split</option>
                    <option value="centered">Centered</option>
                    <option value="fullwidth">Full Width</option>
                </select>
            </div>

            <div className="space-y-2">
                <Label>Background Image URL</Label>
                <Input
                    value={props.backgroundImage || ''}
                    onChange={(e) => updateProp('backgroundImage', e.target.value)}
                />
            </div>

            <div className="space-y-3 rounded border bg-gray-50 p-3">
                <h5 className="text-xs font-semibold">Left Content</h5>
                <div className="space-y-2">
                    <Label className="text-xs">Title</Label>
                    <Input
                        value={props.left?.title || ''}
                        onChange={(e) => updateLeft('title', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                        rows={2}
                        value={props.left?.description || ''}
                        onChange={(e) => updateLeft('description', e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-3 rounded border bg-gray-50 p-3">
                <h5 className="text-xs font-semibold">Right Image</h5>
                <div className="space-y-2">
                    <Label className="text-xs">Image URL</Label>
                    <Input
                        value={props.right?.image || ''}
                        onChange={(e) => updateRight('image', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Alt Text</Label>
                    <Input
                        value={props.right?.alt || ''}
                        onChange={(e) => updateRight('alt', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

// Book Details Editor
const BookDetailsEditor = ({ component, pageId, updateComponent }: any) => {
    const { props } = component;

    const updateProp = (key: string, value: any) => {
        updateComponent(pageId, component.id, {
            props: { ...props, [key]: value },
        });
    };

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium">Book Details Settings</h4>

            <div className="flex items-center justify-between">
                <Label>Show Enquiry</Label>
                <Switch
                    checked={props.showEnquiry || false}
                    onCheckedChange={(c) => updateProp('showEnquiry', c)}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label>Show Payment</Label>
                <Switch
                    checked={props.showPayment || false}
                    onCheckedChange={(c) => updateProp('showPayment', c)}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label>Show Add to Cart</Label>
                <Switch
                    checked={props.showAddToCart || false}
                    onCheckedChange={(c) => updateProp('showAddToCart', c)}
                />
            </div>
        </div>
    );
};

// Cart Component Editor
const CartComponentEditor = ({ component, pageId, updateComponent }: any) => {
    const { props } = component;

    const updateProp = (key: string, value: any) => {
        updateComponent(pageId, component.id, {
            props: { ...props, [key]: value },
        });
    };

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium">Cart Settings</h4>

            <div className="flex items-center justify-between">
                <Label>Show Item Image</Label>
                <Switch
                    checked={props.showItemImage ?? true}
                    onCheckedChange={(c) => updateProp('showItemImage', c)}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label>Show Item Title</Label>
                <Switch
                    checked={props.showItemTitle ?? true}
                    onCheckedChange={(c) => updateProp('showItemTitle', c)}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label>Show Quantity Selector</Label>
                <Switch
                    checked={props.showQuantitySelector ?? true}
                    onCheckedChange={(c) => updateProp('showQuantitySelector', c)}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label>Show Remove Button</Label>
                <Switch
                    checked={props.showRemoveButton ?? true}
                    onCheckedChange={(c) => updateProp('showRemoveButton', c)}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label>Show Price</Label>
                <Switch
                    checked={props.showPrice ?? true}
                    onCheckedChange={(c) => updateProp('showPrice', c)}
                />
            </div>

            <div className="space-y-2">
                <Label>Empty State Message</Label>
                <Input
                    value={props.emptyStateMessage || ''}
                    onChange={(e) => updateProp('emptyStateMessage', e.target.value)}
                />
            </div>
        </div>
    );
};

// Stats Highlights Editor
const StatsHighlightsEditor = ({ component, pageId, updateComponent }: any) => {
    const { props } = component;

    const updateProp = (key: string, value: any) => {
        updateComponent(pageId, component.id, {
            props: { ...props, [key]: value },
        });
    };

    const addStat = () => {
        const newStat = { label: 'New Stat', value: '0' };
        updateProp('stats', [...(props.stats || []), newStat]);
    };

    const updateStat = (index: number, field: string, value: string) => {
        const newStats = [...(props.stats || [])];
        newStats[index] = { ...newStats[index], [field]: value };
        updateProp('stats', newStats);
    };

    const deleteStat = (index: number) => {
        updateProp(
            'stats',
            props.stats.filter((_: any, i: number) => i !== index)
        );
    };

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium">Stats Highlights Settings</h4>

            <div className="space-y-2">
                <Label>Header Text</Label>
                <Input
                    value={props.headerText || ''}
                    onChange={(e) => updateProp('headerText', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Style</Label>
                <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={props.style || 'card'}
                    onChange={(e) => updateProp('style', e.target.value)}
                >
                    <option value="circle">Circle</option>
                    <option value="card">Card</option>
                    <option value="minimal">Minimal</option>
                </select>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Stats</Label>
                    <Button size="sm" variant="outline" onClick={addStat}>
                        <Plus className="mr-1 size-3" /> Add
                    </Button>
                </div>
                {props.stats?.map((stat: any, index: number) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 rounded border bg-gray-50 p-2"
                    >
                        <Input
                            placeholder="Label"
                            value={stat.label}
                            onChange={(e) => updateStat(index, 'label', e.target.value)}
                            className="flex-1"
                        />
                        <Input
                            placeholder="Value"
                            value={stat.value}
                            onChange={(e) => updateStat(index, 'value', e.target.value)}
                            className="w-24"
                        />
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteStat(index)}
                            className="size-8 p-0 text-red-600"
                        >
                            <Trash2 className="size-3" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Testimonials Editor
const TestimonialsEditor = ({ component, pageId, updateComponent }: any) => {
    const { props } = component;

    const updateProp = (key: string, value: any) => {
        updateComponent(pageId, component.id, {
            props: { ...props, [key]: value },
        });
    };

    const addTestimonial = () => {
        const newItem = {
            name: 'Customer Name',
            role: 'Role',
            feedback: 'Great experience!',
            avatar: '',
        };
        updateProp('testimonials', [...(props.testimonials || []), newItem]);
    };

    const updateTestimonial = (index: number, field: string, value: string) => {
        const newItems = [...(props.testimonials || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        updateProp('testimonials', newItems);
    };

    const deleteTestimonial = (index: number) => {
        updateProp(
            'testimonials',
            props.testimonials.filter((_: any, i: number) => i !== index)
        );
    };

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium">Testimonials Settings</h4>

            <div className="space-y-2">
                <Label>Header Text</Label>
                <Input
                    value={props.headerText || ''}
                    onChange={(e) => updateProp('headerText', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Layout</Label>
                <select
                    className="w-full rounded border px-3 py-2 text-sm"
                    value={props.layout || 'carousel'}
                    onChange={(e) => updateProp('layout', e.target.value)}
                >
                    <option value="carousel">Carousel</option>
                    <option value="grid-scroll">Grid Scroll</option>
                    <option value="static-grid">Static Grid</option>
                </select>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Testimonials</Label>
                    <Button size="sm" variant="outline" onClick={addTestimonial}>
                        <Plus className="mr-1 size-3" /> Add
                    </Button>
                </div>
                {props.testimonials?.map((item: any, index: number) => (
                    <div key={index} className="space-y-2 rounded border bg-gray-50 p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">Testimonial {index + 1}</span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteTestimonial(index)}
                                className="size-6 p-0 text-red-600"
                            >
                                <Trash2 className="size-3" />
                            </Button>
                        </div>
                        <Input
                            placeholder="Name"
                            value={item.name}
                            onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                        />
                        <Input
                            placeholder="Role"
                            value={item.role}
                            onChange={(e) => updateTestimonial(index, 'role', e.target.value)}
                        />
                        <Textarea
                            placeholder="Feedback"
                            rows={2}
                            value={item.feedback}
                            onChange={(e) => updateTestimonial(index, 'feedback', e.target.value)}
                        />
                        <Input
                            placeholder="Avatar URL"
                            value={item.avatar}
                            onChange={(e) => updateTestimonial(index, 'avatar', e.target.value)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

// Policy Renderer Editor
const PolicyRendererEditor = ({ component, pageId, updateComponent }: any) => {
    const { props } = component;

    const updatePolicy = (policyKey: string, field: string, value: string) => {
        const policies = props.policies || {};
        updateComponent(pageId, component.id, {
            props: {
                ...props,
                policies: {
                    ...policies,
                    [policyKey]: {
                        ...policies[policyKey],
                        [field]: value,
                    },
                },
            },
        });
    };

    const addPolicy = () => {
        const key = `policy_${Date.now()}`;
        const policies = props.policies || {};
        updateComponent(pageId, component.id, {
            props: {
                ...props,
                policies: {
                    ...policies,
                    [key]: { title: 'New Policy', content: '<p>Policy content here...</p>' },
                },
            },
        });
    };

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium">Policy Settings</h4>

            <div className="flex items-center justify-between">
                <Label>Policies</Label>
                <Button size="sm" variant="outline" onClick={addPolicy}>
                    <Plus className="mr-1 size-3" /> Add
                </Button>
            </div>

            {Object.entries(props.policies || {}).map(([key, policy]: [string, any]) => (
                <div key={key} className="space-y-2 rounded border bg-gray-50 p-3">
                    <div className="space-y-2">
                        <Label className="text-xs">Title</Label>
                        <Input
                            value={policy.title || ''}
                            onChange={(e) => updatePolicy(key, 'title', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Content (HTML)</Label>
                        <Textarea
                            rows={4}
                            value={policy.content || ''}
                            onChange={(e) => updatePolicy(key, 'content', e.target.value)}
                            className="font-mono text-xs"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
