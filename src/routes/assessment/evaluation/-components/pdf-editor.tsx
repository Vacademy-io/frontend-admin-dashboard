/* eslint-disable */
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Canvas, Textbox, IText, Rect, Polygon } from "fabric";
import {
    Upload,
    Check,
    X,
    Type,
    Download,
    ChevronLeft,
    ChevronRight,
    FileText,
    AlertCircle,
    Trash2,
    Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rectangle, Star } from "phosphor-react";
import { PDFDocument } from "pdf-lib";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Evaluation from "./evaluation";
import { FaCalculator } from "react-icons/fa6";
import Calculator from "./calculator";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

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

    // Jump to page state
    const [jumpPage, setJumpPage] = useState<number | "">("");

    // Loading state
    const [isLoading, setIsLoading] = useState(false);

    // Refs
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const canvasRef = useRef(null);
    const canvasContainerRef = useRef<HTMLDivElement | null>(null);
    const pdfViewerRef = useRef<HTMLDivElement | null>(null);

    const [openCalc, setOpenCalc] = useState(false);

    const tools = [
        {
            icon: <Check className="size-5 text-green-600" />,
            label: "Tick",
            action: () => addSymbol("✓", "green"),
        },
        {
            icon: <X className="size-5 text-red-600" />,
            label: "Cross",
            action: () => addSymbol("✗", "red"),
        },
        { icon: <Type className="size-5" />, label: "Text", action: addTextBox },
        { icon: <Star className="size-5 text-yellow-400" />, label: "Star", action: addStar },
        { icon: <Rectangle className="size-5 text-red-600" />, label: "Box", action: addRectangle },
        {
            icon: <Trash2 className="size-4 text-red-600" />,
            label: "Delete",
            action: deleteSelectedShape,
        },
        {
            icon: <FaCalculator className="size-4 text-red-600" />,
            label: "Calculator",
            action: () => {
                setOpenCalc(true);
            },
        },
    ];

    const numbers = Array.from({ length: 10 }, (_, i) => ({
        value: i,
        action: () => addNumber(i),
    }));

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

    function deleteSelectedShape() {
        const activeObject = fabricCanvas?.getActiveObject();
        if (activeObject && fabricCanvas) {
            fabricCanvas.remove(activeObject);
            fabricCanvas.discardActiveObject();
            fabricCanvas.renderAll();
        } else {
            console.log("No shape selected to delete.");
        }
    }

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
    }, [pdfFile]);

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

    // Annotation functions
    async function addSymbol(symbol: string, color: string) {
        if (!fabricCanvas) return;
        const text = new IText(symbol, {
            left: 100,
            top: 100,
            fontSize: 60,
            fill: color,
            selectable: true,
        });
        fabricCanvas.add(text);
        fabricCanvas.requestRenderAll();
    }

    async function addTextBox() {
        if (!fabricCanvas) return;
        const textbox = new Textbox("Add Comment", {
            left: 100,
            top: 100,
            width: 100,
            fontSize: 20,
            fill: "black",
            selectable: true,
        });
        fabricCanvas.add(textbox);
        fabricCanvas.requestRenderAll();
    }

    async function addNumber(num: number) {
        if (!fabricCanvas) return;
        const text = new IText(num.toString(), {
            left: 100,
            top: 100,
            fontSize: 50,
            fill: "blue",
            selectable: true,
        });
        fabricCanvas.add(text);
        fabricCanvas.requestRenderAll();
    }

    async function addRectangle() {
        const rect = new Rect({
            left: 100,
            top: 100,
            width: 100,
            height: 50,
            angle: 0,
        });
        fabricCanvas?.add(rect);
        fabricCanvas?.renderAll();
    }

    async function addStar() {
        const star = new Polygon(
            [
                { x: 0, y: -50 },
                { x: 14, y: -20 },
                { x: 47, y: -20 },
                { x: 23, y: 5 },
                { x: 29, y: 40 },
                { x: 0, y: 15 },
                { x: -29, y: 40 },
                { x: -23, y: 5 },
                { x: -47, y: -20 },
                { x: -14, y: -20 },
            ],
            {
                left: 100,
                top: 100,
                fill: "yellow",
                angle: 0,
            },
        );
        fabricCanvas?.add(star);
        fabricCanvas?.renderAll();
    }

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

            // Create a new PDF document
            const pdfDoc = await PDFDocument.load(await pdfFile.arrayBuffer());
            const outputPdf = new jsPDF({
                orientation: "portrait",
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
            <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg">
                <Loader2 className="mb-4 size-12 animate-spin text-blue-500" />
                <h3 className="text-lg font-medium">Generating PDF</h3>
                <p className="text-gray-500">This may take a moment...</p>
            </div>
        </div>
    );

    if (!pdfFile) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Upload Answer Sheet</CardTitle>
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
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                            >
                                Select PDF File
                            </button>
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
        );
    }

    return (
        <div className="flex w-full">
            <div className="flex flex-col gap-4">
                {/* Loading overlay */}
                {isLoading && <LoadingOverlay />}

                {/* Header with file info and download button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="size-5 text-blue-500" />
                        <span>{pdfFile.name}</span>
                        <span className="text-sm text-gray-500">
                            ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={downloadAnnotatedPDF}
                            className="flex items-center gap-1 rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                            disabled={isLoading}
                        >
                            <Download className="size-4" />
                            Download
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Toolbar */}
                    <Card className="">
                        <CardHeader>
                            <CardTitle>Evaluation Tools</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                {tools.map((tool, index) => (
                                    <Button
                                        key={index}
                                        onClick={tool.action}
                                        className=""
                                        disabled={isLoading}
                                    >
                                        {tool.icon}
                                    </Button>
                                ))}
                            </div>

                            <div className="flex gap-2">
                                {numbers.map(({ value, action }) => (
                                    <Button
                                        key={value}
                                        onClick={action}
                                        className=""
                                        disabled={isLoading}
                                    >
                                        {value}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* PDF Viewer */}
                    <Card className="flex-1">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Answer Sheet Evaluation</CardTitle>
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
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div ref={pdfViewerRef} className="relative">
                                <div ref={canvasContainerRef} className="relative rounded-lg">
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
                        </CardContent>
                    </Card>
                </div>
            </div>
            {docLoaded && <Evaluation totalPages={numPages} pagesVisited={pagesVisited} />}
            {openCalc && <Calculator open={openCalc} onOpenChange={setOpenCalc} />}
        </div>
    );
};

export default PDFEvaluator;
