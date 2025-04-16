import { DashboardLoader } from "@/components/core/dashboard-loader";
import { MyButton } from "@/components/design-system/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadSimple } from "phosphor-react";

interface GenerateCardProps {
    handleUploadClick: () => void;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    cardTitle: string;
    cardDescription: string;
    inputFormat: string;
}
export const GenerateCard = ({
    handleUploadClick,
    isUploading,
    fileInputRef,
    handleFileChange,
    cardTitle,
    cardDescription,
    inputFormat,
}: GenerateCardProps) => {
    return (
        <Card className="w-[300px] cursor-pointer bg-primary-50">
            <CardHeader>
                <CardTitle>{cardTitle}</CardTitle>
                <CardDescription>{cardDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                <MyButton
                    type="button"
                    scale="medium"
                    buttonType="primary"
                    layoutVariant="default"
                    className="w-full text-sm"
                    onClick={handleUploadClick}
                >
                    {isUploading ? (
                        <DashboardLoader size={20} color="#ffffff" />
                    ) : (
                        <>
                            <UploadSimple size={32} />
                            Upload
                        </>
                    )}
                </MyButton>
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
