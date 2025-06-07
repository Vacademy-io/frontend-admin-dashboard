import React from 'react';
import { ButtonProps } from '@/components/ui/button';

export interface myButtonProps {
    className: string;
    type: string;
    scale: string;
}

// Types
type ButtonVariantType = 'primary' | 'secondary' | 'text';
export type ButtonScale = 'large' | 'medium' | 'small';
type ButtonLayoutVariant = 'default' | 'icon' | 'floating' | 'extendedFloating';

// Extend from Shadcn ButtonProps instead of HTML button attributes
export interface MyButtonProps extends Omit<ButtonProps, 'variant'> {
    className?: string;
    buttonType?: ButtonVariantType;
    scale?: ButtonScale;
    layoutVariant?: ButtonLayoutVariant;
    children?: React.ReactNode;
    disable?: boolean;
    hidden?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    type?: 'button' | 'submit' | 'reset';
}
