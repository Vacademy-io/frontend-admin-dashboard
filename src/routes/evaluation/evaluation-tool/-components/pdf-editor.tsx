/* eslint-disable */
// @ts-nocheck
import { useState, useEffect, useRef, ChangeEvent, Fragment } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Canvas } from "fabric";
import { Upload, Download, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassMinus, MagnifyingGlassPlus } from "phosphor-react";
import { PDFDocument } from "pdf-lib";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaCalculator, FaPen } from "react-icons/fa6";
import { TbZoomReset } from "react-icons/tb";
import Calculator from "./calculator";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ColorPicker } from "@/components/ui/color-picker";
import useCanvasTools from "../-hooks/tools";
import useFabric from "../-hooks/canvas";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.mjs`;

const PDFEvaluator = () => {
    // File states
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState("");

    // PDF states
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [pagesVisited, setPagesVisited] = useState<number[]>([]);
    const [docLoaded, setDocLoaded] = useState(false);
    const [prevPageNumber, setPrevPageNumber] = useState(1);

    // Canvas states
    const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
    const [annotations, setAnnotations] = useState<{ [key: number]: any }>({});
    const canvasUtils = useFabric(fabricCanvas);
    const { tools, numbers } = useCanvasTools(fabricCanvas);

    // Jump to page state
    const [jumpPage, setJumpPage] = useState<number | "">("");

    // Loading state
    const [isLoading, setIsLoading] = useState(false);

    // Zoom state
    const [zoomLevel, setZoomLevel] = useState(1);

    // Refs
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const canvasRef = useRef(null);
    const canvasContainerRef = useRef<HTMLDivElement | null>(null);
    const pdfViewerRef = useRef<HTMLDivElement | null>(null);

    const [openCalc, setOpenCalc] = useState(false);

    // File handling functions
    const validateFile = (file: File) => {
        setError("");
        if (!file) {
            setError("No file selected");
            return false;
        }
        if (file.type !== "application/pdf") {
            setError("Please upload a PDF file");
            return false;
        }
        if (file.size > 20 * 1024 * 1024) {
            setError("File size should be less than 20MB");
            return false;
        }
        return true;
    };

    const handleFile = (file: File) => {
        if (validateFile(file)) {
            setPdfFile(file);
            const fileUrl = URL.createObjectURL(file);
            console.log(fileUrl);
            setPdfUrl(fileUrl);
            setPageNumber(1);
            setAnnotations({});
        }
    };

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        if (typeof e?.target?.files === "undefined" || e.target.files?.length === 0) return;
        // @ts-expect-error : //TODO: fix this
        handleFile(e.target.files[0] as File);
    };

    // Canvas setup
    useEffect(() => {
        if (pdfFile && canvasRef.current && !fabricCanvas) {
            const canvas = new Canvas(canvasRef.current, {
                width: 600,
                height: 800,
                selection: true,
                renderOnAddRemove: true,
            });

            const handleResize = () => {
                canvas.setDimensions({
                    width: canvasContainerRef.current?.clientWidth || 800,
                    height: canvasContainerRef.current?.clientHeight || 1100,
                });
                canvas.requestRenderAll();
            };

            window.addEventListener("resize", handleResize);
            setFabricCanvas(canvas);
            return () => {
                window.removeEventListener("resize", handleResize);
                canvas.dispose();
            };
        }
        return;
    }, [pdfFile]);

    useEffect(() => {
        console.log(canvasUtils.isDrawingMode);
        setTimeout(() => {
            loadPDF();
        }, 1000);
    }, [fabricCanvas]);

    // Save annotations when changing pages
    useEffect(() => {
        if (fabricCanvas) {
            // Save current page annotations before loading new ones
            const currentAnnotations = fabricCanvas.toJSON();

            // Always save the current state, even if it appears empty
            setAnnotations((prev) => ({
                ...prev,
                [prevPageNumber]: currentAnnotations, // Use previous page number reference
            }));

            // Clear canvas for new page
            fabricCanvas.clear();

            // Load annotations for the new page if they exist
            if (annotations[pageNumber]) {
                fabricCanvas.loadFromJSON(annotations[pageNumber], () => {
                    fabricCanvas.requestRenderAll();
                });
            }

            // Update previous page reference
            setPrevPageNumber(pageNumber);
        }
    }, [pageNumber]);

    // PDF navigation
    const changePage = (offset: number) => {
        setPageNumber((prevPageNumber) => {
            const newPageNumber = prevPageNumber + offset;
            return Math.max(1, Math.min(newPageNumber, numPages));
        });
        setPagesVisited((prev) => {
            const newPagesVisited = [...prev, pageNumber];
            return newPagesVisited;
        });
    };

    const handleJumpPage = () => {
        if (jumpPage && jumpPage > 0 && jumpPage <= numPages) {
            setPageNumber(jumpPage);
            setPagesVisited((prev) => {
                const newPagesVisited = [...prev, pageNumber];
                return newPagesVisited;
            });
        }
    };

    // New download function using html2canvas
    const downloadAnnotatedPDF = async () => {
        if (!pdfFile) return;

        try {
            // Save current page annotations first
            if (fabricCanvas) {
                const currentAnnotations = fabricCanvas.toJSON();
                setAnnotations((prev) => ({
                    ...prev,
                    [pageNumber]: currentAnnotations,
                }));
            }

            // Set loading state
            setIsLoading(true);
            setError("Generating PDF, please wait...");

            const getOrientation = () => {
                if (fabricCanvas?.width && fabricCanvas?.height) {
                    if (fabricCanvas?.width > fabricCanvas?.height) {
                        return "landscape";
                    } else {
                        return "portrait";
                    }
                }
                return "portrait";
            };
            // Create a new PDF document
            const pdfDoc = await PDFDocument.load(await pdfFile.arrayBuffer());
            const outputPdf = new jsPDF({
                orientation: getOrientation(),
                unit: "pt",
            });

            // Store the current page
            const currentPageBeforeExport = pageNumber;

            // Process each page
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                // Navigate to the page
                setPageNumber(pageNum);

                // Wait for page rendering and annotations to load
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Use html2canvas to capture the entire PDF viewer
                if (pdfViewerRef.current) {
                    const canvas = await html2canvas(pdfViewerRef.current, {
                        scale: 2, // Higher scale for better quality
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: null,
                        logging: false,
                    });

                    // Add a new page to the PDF (except for the first page)
                    if (pageNum > 1) {
                        outputPdf.addPage();
                    }

                    // Add the captured canvas to the PDF
                    const imgData = canvas.toDataURL("image/png", 1);
                    console.log(outputPdf.internal.pageSize.getWidth());
                    outputPdf.addImage(
                        imgData,
                        "PNG",
                        0,
                        0,
                        outputPdf.internal.pageSize.getWidth(),
                        outputPdf.internal.pageSize.getHeight(),
                        undefined,
                        "FAST",
                    );
                }
            }

            // Restore the original page
            setPageNumber(currentPageBeforeExport);

            // Save the PDF
            outputPdf.save(`evaluated-${pdfFile.name}`);

            // Clear loading state
            setIsLoading(false);
            setError("");
        } catch (error) {
            console.error("Error generating annotated PDF:", error);
            setError("Failed to generate annotated PDF. Please try again.");
            setIsLoading(false);
        }
    };

    // Loading overlay component
    const LoadingOverlay = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex w-72 flex-col items-center gap-y-2 rounded-lg bg-white p-6 shadow-lg">
                <h1 className="text-lg font-medium">Generating PDF</h1>
                <p className="text-gray-500">This may take a moment...</p>
                <Progress value={(pageNumber / numPages) * 100} className="h-2" />
                <h3 className="text-lg font-medium">
                    Done ({pageNumber} of {numPages})
                </h3>
            </div>
        </div>
    );

    const handleZoomIn = () => {
        setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 3)); // Max zoom level of 3
    };

    const handleZoomOut = () => {
        setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 1)); // Min zoom level of 1
    };

    const handleResetZoom = () => {
        setZoomLevel(1); // Reset zoom level to 1
    };

    async function loadPDF() {
        const abc = document.querySelector(".react-pdf__Document");

        console.log(abc);
        console.log(abc?.clientWidth, abc?.clientHeight);
        const width = abc?.clientWidth || 600;
        const height = abc?.clientHeight || 800;

        // Set canvas dimensions based on orientation
        if (width > height) {
            // Landscape orientation
            console.log(width, height);
            fabricCanvas?.setWidth(width);
            fabricCanvas?.setHeight(height); // Adjust height as needed
        } else {
            // Portrait orientation
            console.log(width, height);
            fabricCanvas?.setWidth(width);
            fabricCanvas?.setHeight(height);
        }

        // Continue with loading the PDF content onto the canvas...
    }

    if (!pdfFile) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-y-4">
                <Card className="w-1/2 text-3xl font-semibold">
                    <CardHeader>
                        <CardTitle>Upload your answer sheet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileInput}
                                accept=".pdf"
                                className="hidden"
                            />
                            <Upload className={`mx-auto mb-4 size-12`} />
                            <div className="flex flex-col items-center gap-2">
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-md bg-primary-500 px-4 py-2 text-white hover:bg-primary-500"
                                >
                                    Select PDF File
                                </Button>
                                <p className="text-sm text-gray-500">
                                    Drag & drop a PDF file here or click to select
                                </p>
                                {error && (
                                    <AlertDialog>
                                        <AlertCircle className="size-4" />
                                        <AlertDialogDescription>{error}</AlertDialogDescription>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex w-full justify-between">
            <div className="flex w-full justify-center gap-4">
                {/* Loading overlay */}
                {isLoading && <LoadingOverlay />}

                <div className="flex gap-4">
                    {/* Toolbar */}
                    <Card className="sticky top-0 z-10 max-h-fit max-w-20 overflow-y-scroll">
                        <CardHeader>
                            <CardTitle className="text-center">Tools</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 px-1 py-2">
                            <div className="flex flex-col items-center gap-y-2">
                                {tools.map((tool, index) => {
                                    // if (tool.label === "Pen") return null;
                                    return (
                                        <Button
                                            key={index}
                                            onClick={
                                                tool.label === "Pen"
                                                    ? () => canvasUtils.addPenTool("black")
                                                    : tool.action
                                            }
                                            className="w-fit"
                                            disabled={isLoading}
                                        >
                                            {tool.icon}
                                        </Button>
                                    );
                                })}
                                <Button onClick={() => setOpenCalc(true)}>
                                    <FaCalculator className="size-4 text-red-500" />
                                </Button>
                                <Button
                                    onClick={downloadAnnotatedPDF}
                                    className="hover:bg-primary-600 w-fit bg-primary-400 text-white"
                                    disabled={isLoading}
                                >
                                    <Download className="size-4" />
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (
                                            confirm(
                                                "Are you sure you want to reupload? This will reset all your annotations.",
                                            )
                                        ) {
                                            window.location.reload();
                                        }
                                    }}
                                >
                                    <Upload className="size-4" />
                                </Button>
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="">
                                        Marks
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-2" side="right">
                                    <div className="grid grid-cols-5 gap-2">
                                        {numbers.map(({ value, action }) => (
                                            <Button
                                                key={value}
                                                onClick={action}
                                                value={value.toString()}
                                                disabled={isLoading}
                                                className="text-base"
                                            >
                                                {value}
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </CardContent>
                    </Card>
                </div>
                {/* PDF Viewer */}
                <Card className="w-full">
                    <CardHeader className="sticky top-0 z-10 bg-white py-1 shadow-md">
                        <div className="flex items-center justify-between">
                            <CardTitle>Answer Sheet Evaluation</CardTitle>

                            <div className="flex items-center gap-x-2">
                                {canvasUtils.isDrawingMode && (
                                    <>
                                        <ColorPicker
                                            onChange={canvasUtils.addPenTool}
                                            value={canvasUtils.penColor}
                                            className="size-6 rounded-full p-0"
                                        />
                                        <Button onClick={canvasUtils.clearCanvas}>Clear</Button>
                                        <Button onClick={canvasUtils.disableDrawingMode}>
                                            Exit
                                        </Button>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => changePage(-1)}
                                    disabled={pageNumber <= 1 || isLoading}
                                    className="rounded-full p-2 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <ChevronLeft className="size-5" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={jumpPage}
                                        onChange={(e) => setJumpPage(Number(e.target.value))}
                                        placeholder="Jump to page"
                                        className="w-16 rounded border p-1"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        onClick={handleJumpPage}
                                        variant={"secondary"}
                                        size={"sm"}
                                        disabled={isLoading}
                                    >
                                        Go
                                    </Button>
                                </div>
                                <span>
                                    Page {pageNumber} of {numPages || "--"}
                                </span>
                                <button
                                    onClick={() => changePage(1)}
                                    disabled={pageNumber >= numPages || isLoading}
                                    className="rounded-full p-2 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <ChevronRight className="size-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={handleZoomIn} className="" disabled={isLoading}>
                                    <MagnifyingGlassPlus size={20} />
                                </Button>
                                <Button onClick={handleZoomOut} className="" disabled={isLoading}>
                                    <MagnifyingGlassMinus size={20} />
                                </Button>
                                <Button onClick={handleResetZoom} className="" disabled={isLoading}>
                                    <TbZoomReset size={25} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex justify-center bg-slate-100 pt-4">
                        <div ref={pdfViewerRef} className="relative">
                            <div
                                style={{
                                    // overflowY: "auto",
                                    // overflowX: "auto",
                                    maxHeight: "fit-content",
                                    // width: "600px",
                                }}
                            >
                                <div
                                    ref={canvasContainerRef}
                                    className="relative flex justify-center rounded-lg"
                                    style={{
                                        transform: `scale(${zoomLevel})`,
                                        transformOrigin: "top left",
                                    }}
                                >
                                    <Document
                                        file={pdfUrl}
                                        onLoadSuccess={({ numPages }) => {
                                            setNumPages(numPages);
                                            setDocLoaded(true);
                                        }}
                                        onLoadError={(error) => console.log(error)}
                                        className="absolute min-w-fit"
                                    >
                                        <Page
                                            pageNumber={pageNumber}
                                            scale={scale}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            className="max-h-fit shadow-lg"
                                        />
                                    </Document>
                                    <canvas
                                        ref={canvasRef}
                                        className="absolute left-0 top-0 z-10"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* {docLoaded && <Evaluation totalPages={numPages} pagesVisited={pagesVisited} />} */}
            {openCalc && <Calculator open={openCalc} onOpenChange={setOpenCalc} />}
        </div>
    );
};

export default PDFEvaluator;
