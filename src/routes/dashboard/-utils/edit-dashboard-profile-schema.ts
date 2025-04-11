import { z } from "zod";

export const editDashboardProfileSchema = z.object({
    instituteProfilePictureUrl: z.string(),
    instituteProfilePictureId: z.union([z.string(), z.undefined()]),
    instituteName: z.string().min(1, "Institute Name is required"),
    instituteType: z.string().min(1, "Select institute type"),
    instituteEmail: z.string().email("Invalid email address"),
    institutePhoneNumber: z.string().min(1, "Phone number is required"),
    instituteWebsite: z.string().min(1, "Website is required"),
    instituteAddress: z.string().min(1, "Address is required"),
    instituteCountry: z.string().min(1, "Country is required"),
    instituteState: z.string().min(1, "State is required"),
    instituteCity: z.string().min(1, "City is required"),
    institutePinCode: z.string().min(1, "Pin code is required"),
});
