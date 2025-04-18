import { z } from "zod";

export const editDashboardProfileSchema = z.object({
    instituteProfilePictureUrl: z.string(),
    instituteProfilePictureId: z.union([z.string(), z.undefined()]),
    instituteName: z.string().min(1, "Institute Name is required"),
    instituteType: z.string().min(1, "Select institute type"),
    instituteEmail: z.string().email("Invalid email address").optional(),
    institutePhoneNumber: z.string().optional(),
    instituteWebsite: z.string().optional(),
    instituteAddress: z.string().optional(),
    instituteCountry: z.string().optional(),
    instituteState: z.string().optional(),
    instituteCity: z.string().optional(),
    institutePinCode: z.string().optional(),
});
