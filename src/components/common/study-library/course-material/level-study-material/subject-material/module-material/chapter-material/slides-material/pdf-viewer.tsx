import React, { useEffect, useRef, useState } from "react";
import { Viewer } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";
import { DocumentLoadEvent, PageChangeEvent } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

// Plugin imports
import { attachmentPlugin } from "@react-pdf-viewer/attachment";
import { bookmarkPlugin } from "@react-pdf-viewer/bookmark";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { dropPlugin } from "@react-pdf-viewer/drop";
import { fullScreenPlugin } from "@react-pdf-viewer/full-screen";
import { getFilePlugin } from "@react-pdf-viewer/get-file";
import { highlightPlugin } from "@react-pdf-viewer/highlight";
import { localeSwitcherPlugin } from "@react-pdf-viewer/locale-switcher";
import { openPlugin } from "@react-pdf-viewer/open";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { printPlugin } from "@react-pdf-viewer/print";
import { propertiesPlugin } from "@react-pdf-viewer/properties";
import { rotatePlugin } from "@react-pdf-viewer/rotate";
import { scrollModePlugin } from "@react-pdf-viewer/scroll-mode";
import { searchPlugin } from "@react-pdf-viewer/search";
import { selectionModePlugin } from "@react-pdf-viewer/selection-mode";
import { themePlugin } from "@react-pdf-viewer/theme";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

// Style imports
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { PDF_WORKER_URL } from "@/constants/urls";

interface PDFViewerProps {
    documentId?: string;
    pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ documentId, pdfUrl }) => {
    const [currentPage, setCurrentPage] = useState<number>(0);
    const pageStartTime = useRef<Date>(new Date());
    // const {activeItem} = useContentStore()
    // const [pdfUrl, setPdfUrl] = useState("")

    // useEffect(() => {
    //     const fetchPdfUrl = async () => {
    //         try {
    //             const url = await getPublicUrl(activeItem?.document_data);
    //             setPdfUrl(url);
    //         } catch (error) {
    //             console.error("Failed to fetch pdf URL:", error);
    //         }
    //     };
    //     fetchPdfUrl();
    // }, [activeItem]);

    // Plugin instances
    const attachmentPluginInstance = attachmentPlugin();
    const bookmarkPluginInstance = bookmarkPlugin();
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const dropPluginInstance = dropPlugin();
    const fullScreenPluginInstance = fullScreenPlugin();
    const getFilePluginInstance = getFilePlugin();
    const highlightPluginInstance = highlightPlugin();
    const localeSwitcherPluginInstance = localeSwitcherPlugin();
    const openPluginInstance = openPlugin();
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const printPluginInstance = printPlugin();
    const propertiesPluginInstance = propertiesPlugin();
    const rotatePluginInstance = rotatePlugin();
    const scrollModePluginInstance = scrollModePlugin();
    const searchPluginInstance = searchPlugin();
    const selectionModePluginInstance = selectionModePlugin();
    const themePluginInstance = themePlugin();
    const thumbnailPluginInstance = thumbnailPlugin();
    const toolbarPluginInstance = toolbarPlugin();
    const zoomPluginInstance = zoomPlugin();

    useEffect(() => {
        return () => {
            const exitTime = new Date();
            const timeSpent = exitTime.getTime() - pageStartTime.current.getTime();
            const timeSpentInSeconds = Math.round(timeSpent / 1000);

            console.log("Component unmounting - Final page stats:", {
                page: currentPage,
                enteredAt: pageStartTime.current.toISOString(),
                exitedAt: exitTime.toISOString(),
                timeSpentOnPage: `${timeSpentInSeconds} seconds`,
            });
        };
    }, [currentPage]);

    const handleDocumentLoad = (e: DocumentLoadEvent): void => {
        console.log("PDF loaded!", {
            numberOfPages: e.doc.numPages,
            documentId: documentId,
            timeOpened: new Date().toISOString(),
        });
    };

    const handlePageChange = (e: PageChangeEvent): void => {
        const exitTime = new Date();
        const timeSpent = exitTime.getTime() - pageStartTime.current.getTime();
        const timeSpentInSeconds = Math.round(timeSpent / 1000);

        if (timeSpentInSeconds >= 10) console.log("Call API");

        setCurrentPage(e.currentPage);
        pageStartTime.current = new Date();
    };

    return (
        <Worker workerUrl={PDF_WORKER_URL}>
            <div className="size-full">
                <Viewer
                    fileUrl={pdfUrl}
                    onDocumentLoad={handleDocumentLoad}
                    onPageChange={handlePageChange}
                    plugins={[
                        attachmentPluginInstance,
                        bookmarkPluginInstance,
                        defaultLayoutPluginInstance,
                        dropPluginInstance,
                        fullScreenPluginInstance,
                        getFilePluginInstance,
                        highlightPluginInstance,
                        localeSwitcherPluginInstance,
                        openPluginInstance,
                        pageNavigationPluginInstance,
                        printPluginInstance,
                        propertiesPluginInstance,
                        rotatePluginInstance,
                        scrollModePluginInstance,
                        searchPluginInstance,
                        selectionModePluginInstance,
                        themePluginInstance,
                        thumbnailPluginInstance,
                        toolbarPluginInstance,
                        zoomPluginInstance,
                    ]}
                />
            </div>
        </Worker>
    );
};

export default PDFViewer;
