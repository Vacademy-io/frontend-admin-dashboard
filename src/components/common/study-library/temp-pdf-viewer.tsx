import React, { useEffect, useRef, useState } from "react";
import { Viewer } from "@react-pdf-viewer/core";
import { Worker } from "@react-pdf-viewer/core";
import { DocumentLoadEvent, PageChangeEvent } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { usePDFStore } from "@/stores/study-library/temp-pdf-store";

interface PDFViewerProps {
    documentId?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ documentId }) => {
    // const samplePdfUrl: string =
    // "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";

    const { pdfUrl } = usePDFStore();

    const [currentPage, setCurrentPage] = useState<number>(0);
    const pageStartTime = useRef<Date>(new Date());

    const defaultPdfUrl =
        "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";

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

        console.log("Page change detected!", {
            previousPage: currentPage,
            enteredAt: pageStartTime.current.toISOString(),
            exitedAt: exitTime.toISOString(),
            timeSpentOnPage: `${timeSpentInSeconds} seconds`,
            newPage: e.currentPage,
        });

        if (timeSpentInSeconds >= 10) console.log("Call API");

        // Update state for new page
        setCurrentPage(e.currentPage);
        pageStartTime.current = new Date();
    };

    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div style={{ height: "750px" }}>
                <Viewer
                    fileUrl={pdfUrl || defaultPdfUrl}
                    onDocumentLoad={handleDocumentLoad}
                    onPageChange={handlePageChange}
                />
            </div>
        </Worker>
    );
};

export default PDFViewer;
