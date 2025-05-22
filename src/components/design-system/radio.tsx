import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ReactElement } from 'react';

interface RadioOption {
    label: string | ReactElement;
    value: string;
}

interface RadioGroupFieldProps {
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
    name: string;
    className?: string;
}

export function MyRadioButton({ options, value, onChange, name, className }: RadioGroupFieldProps) {
    return (
        <RadioGroup defaultValue={value} onValueChange={onChange} className={className}>
            {options.map((option, index) => {
                const id = `${name}-${index}`;
                return (
                    <div key={id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={id} />
                        <Label htmlFor={id}>{option.label}</Label>
                    </div>
                );
            })}
        </RadioGroup>
    );
}
