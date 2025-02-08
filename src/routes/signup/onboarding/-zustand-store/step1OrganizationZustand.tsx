import { create } from "zustand";

interface FormValues {
    profilePictureUrl: string;
    instituteProfilePic?: string;
    instituteName: string;
    instituteType: string;
}

interface OrganizationStore {
    formData: FormValues;
    setFormData: (data: FormValues) => void;
    resetForm: () => void;
}

const useOrganizationStore = create<OrganizationStore>((set) => ({
    formData: {
        profilePictureUrl: "",
        instituteProfilePic: undefined,
        instituteName: "",
        instituteType: "",
    },
    setFormData: (data) => set({ formData: data }),
    resetForm: () =>
        set({
            formData: {
                profilePictureUrl: "",
                instituteProfilePic: undefined,
                instituteName: "",
                instituteType: "",
            },
        }),
}));

export default useOrganizationStore;
