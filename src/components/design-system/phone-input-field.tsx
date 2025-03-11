import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { type Control } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";

interface PhoneInputFieldProps {
    label: string;
    name: string;
    placeholder: string;
    // eslint-disable-next-line
    control: any;
    disabled?: boolean;
    country?: string;
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
    label,
    name,
    placeholder,
    control,
    disabled = false,
    country = "us",
}) => {
    return (
        <FormField
            control={control as Control}
            name={name}
            render={({ field }) => (
                <FormItem className="w-96">
                    <FormLabel>
                        {label}
                        <span className="text-danger-600">*</span>
                    </FormLabel>
                    <FormControl>
                        <PhoneInput
                            {...field}
                            country={country}
                            enableSearch={true}
                            placeholder={placeholder}
                            onChange={field.onChange}
                            inputClass="w-96 h-7"
                            disabled={disabled}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default PhoneInputField;
