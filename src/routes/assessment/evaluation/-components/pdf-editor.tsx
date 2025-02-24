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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rectangle, Star } from "phosphor-react";
import { PDFDocument } from "pdf-lib";
import jsPDF from "jspdf";

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

    // Canvas states
    const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
    const [annotations, setAnnotations] = useState<{ [key: number]: any }>({});

    // Jump to page state
    const [jumpPage, setJumpPage] = useState<number | "">("");

    // Refs
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const canvasRef = useRef(null);
    const canvasContainerRef = useRef<HTMLDivElement | null>(null);

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
        handleFile(e.target.files[0] as File);
    };

    const clearSelection = () => {
        setPdfFile(null);
        setPdfUrl(null);
        setError("");
        setPageNumber(1);
        setAnnotations({});
        if (fileInputRef.current) {
            fileInputRef.current = null;
        }
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
            setAnnotations((prev) => ({
                ...prev,
                [pageNumber]: currentAnnotations,
            }));

            // Load annotations for the new page
            fabricCanvas.clear();
            if (annotations[pageNumber]) {
                fabricCanvas.loadFromJSON(annotations[pageNumber], () => {
                    fabricCanvas.requestRenderAll();
                });
            }
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
    };

    const handleJumpPage = () => {
        if (jumpPage && jumpPage > 0 && jumpPage <= numPages) {
            setPageNumber(jumpPage);
        }
    };

    // Download function
    const downloadAnnotatedPDF = async () => {
        if (!pdfFile || !fabricCanvas) return;

        try {
            // Save current page annotations
            const currentAnnotations = fabricCanvas.toJSON();
            setAnnotations((prev) => ({
                ...prev,
                [pageNumber]: currentAnnotations,
            }));

            // Load the PDF document once
            const fileBuffer = await pdfFile.arrayBuffer();
            const pdfDoc = await PDFDocument.load(fileBuffer);
            const pages = pdfDoc.getPages();

            // Create a temporary hidden div for rendering
            const hiddenDiv = document.createElement("div");
            hiddenDiv.style.position = "absolute";
            hiddenDiv.style.left = "-9999px";
            document.body.appendChild(hiddenDiv);

            // Create a temporary Document component for background rendering
            const tempDocument = document.createElement("div");
            hiddenDiv.appendChild(tempDocument);

            // Process each page
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                if (annotations[pageNum]) {
                    // Create temporary canvas for this page
                    const tempCanvas = new Canvas(null, {
                        width: pages[pageNum - 1].getWidth(),
                        height: pages[pageNum - 1].getHeight(),
                    });

                    // Load and scale annotations
                    await new Promise((resolve) => {
                        tempCanvas.loadFromJSON(annotations[pageNum], () => {
                            const objects = tempCanvas.getObjects();
                            objects.forEach((obj) => {
                                // Scale and position objects relative to PDF page size
                                const scaleX =
                                    pages[pageNum - 1].getWidth() / fabricCanvas.getWidth();
                                const scaleY =
                                    pages[pageNum - 1].getHeight() / fabricCanvas.getHeight();

                                obj.scaleX = obj.scaleX * scaleX;
                                obj.scaleY = obj.scaleY * scaleY;
                                obj.left = obj.left * scaleX;
                                obj.top = obj.top * scaleY;
                            });
                            tempCanvas.renderAll();
                            resolve(true);
                        });
                    });

                    // Convert canvas to PNG with compression
                    const pngData = tempCanvas.toDataURL({
                        format: "png",
                        quality: 0.5,
                        multiplier: 0.5, // Reduce resolution by half
                    });

                    // Convert base64 to Uint8Array
                    const base64Data = pngData.split(",")[1];
                    const imageData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

                    // Embed the PNG into the PDF
                    const image = await pdfDoc.embedPng(imageData);
                    const page = pages[pageNum - 1];

                    // Draw the image on the PDF page
                    page.drawImage(image, {
                        x: 0,
                        y: 0,
                        width: page.getWidth(),
                        height: page.getHeight(),
                        opacity: 1,
                    });

                    // Clean up
                    tempCanvas.dispose();
                }
            }

            // Compress the PDF
            const compressedPdfBytes = await pdfDoc.save({
                useObjectStreams: true,
                addDefaultPage: false,
                objectsPerTick: 20,
                compression: {
                    useCompression: true,
                    compressPages: true,
                    compressImages: true,
                },
            });

            // Clean up the hidden div
            document.body.removeChild(hiddenDiv);

            // Create and download the blob
            const blob = new Blob([compressedPdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `annotated-${pdfFile.name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating annotated PDF:", error);
            setError("Failed to generate annotated PDF. Please try again.");
        }
    };

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
        <div className="flex flex-col gap-4">
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
                        onClick={clearSelection}
                        className="rounded px-3 py-1 text-red-500 hover:bg-red-50"
                    >
                        Clear
                    </button>
                    <button
                        onClick={downloadAnnotatedPDF}
                        className="flex items-center gap-1 rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                    >
                        <Download className="size-4" />
                        Download
                    </button>
                </div>
            </div>

            <div className="flex gap-4">
                {/* Toolbar */}
                <Card className="w-48">
                    <CardHeader>
                        <CardTitle>Evaluation Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            {tools.map((tool, index) => (
                                <button
                                    key={index}
                                    onClick={tool.action}
                                    className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-gray-100"
                                >
                                    {tool.icon}
                                    <span>{tool.label}</span>
                                </button>
                            ))}

                            <div className="mt-4">
                                <h3 className="mb-2 text-sm font-medium">Quick Numbers</h3>
                                <div className="grid grid-cols-5 gap-1">
                                    {numbers.map(({ value, action }) => (
                                        <button
                                            key={value}
                                            onClick={action}
                                            className="rounded border p-2 hover:bg-gray-100"
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
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
                                    disabled={pageNumber <= 1}
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
                                        className="max-w-fit rounded border p-1"
                                    />
                                    <Button
                                        onClick={handleJumpPage}
                                        variant={"secondary"}
                                        size={"sm"}
                                    >
                                        Go
                                    </Button>
                                </div>
                                <span>
                                    Page {pageNumber} of {numPages || "--"}
                                </span>
                                <button
                                    onClick={() => changePage(1)}
                                    disabled={pageNumber >= numPages}
                                    className="rounded-full p-2 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <ChevronRight className="size-5" />
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div ref={canvasContainerRef} className="relative rounded-lg">
                            <Document
                                file={pdfUrl}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
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
                            <canvas ref={canvasRef} className="absolute left-0 top-0 z-10" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PDFEvaluator;
