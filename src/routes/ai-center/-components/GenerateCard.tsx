import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadSimple } from "phosphor-react";
import { useAICenter } from "../-contexts/useAICenterContext";
interface GenerateCardProps {
    handleUploadClick: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    cardTitle: string;
    cardDescription: string;
    inputFormat: string;
    keyProp: string | null;
}
export const GenerateCard = ({
    handleUploadClick,
    fileInputRef,
    handleFileChange,
    cardTitle,
    cardDescription,
    inputFormat,
    keyProp,
}: GenerateCardProps) => {
    const { key: keyContext, loader } = useAICenter();
    return (
        <Card className="flex h-[160px] w-full cursor-pointer flex-col justify-center bg-primary-50">
            <CardHeader>
                <CardTitle>{cardTitle}</CardTitle>
                <CardDescription>{cardDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                {loader && keyContext == keyProp && keyContext != null ? (
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="primary"
                        layoutVariant="default"
                        className="w-full text-sm"
                    >
                        <DashboardLoader size={20} color="#ffffff" />
                    </MyButton>
                ) : (
                    <MyButton
                        type="button"
                        scale="medium"
                        buttonType="primary"
                        layoutVariant="default"
                        className="w-full text-sm"
                        onClick={handleUploadClick}
                        disable={keyContext !== keyProp && loader && keyContext != null}
                    >
                        <UploadSimple size={32} />
                        Upload
                    </MyButton>
                )}
                <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept={inputFormat}
                />
            </CardContent>
        </Card>
    );
};
