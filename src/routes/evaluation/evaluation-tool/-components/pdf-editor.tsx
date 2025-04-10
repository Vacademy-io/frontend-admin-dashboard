/* eslint-disable */
// @ts-nocheck
import { useState, useEffect, useRef, ChangeEvent, Fragment } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Canvas } from "fabric";
import { Upload, Download, ChevronLeft, ChevronRight, AlertCircle, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassMinus, MagnifyingGlassPlus, X } from "phosphor-react";
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
import Dropzone, { useDropzone } from "react-dropzone";
import { ImportFileImage } from "@/assets/svgs";
import { DashboardLoader } from "@/components/core/dashboard-loader";
import { toast } from "sonner";
import { ProgressBar } from "@/components/design-system/progress-bar";
import { SlNote } from "react-icons/sl";
import Evaluation from "./evaluation";
import { useRouter } from "@tanstack/react-router";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.mjs`;

const PDFEvaluator = ({ file }: { file?: File }) => {
    // File states
    const [pdfFile, setPdfFile] = useState<File | null>(file);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState("");

    // PDF states
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [pagesVisited, setPagesVisited] = useState<number[]>([]);
    const [docLoaded, setDocLoaded] = useState(false);
    const [prevPageNumber, setPrevPageNumber] = useState(1);
    const [loadingDoc, setLoadingDoc] = useState(true);
    const [progress, setProgress] = useState<number>(0);
    const [dimensions, setDimensions] = useState({
        width: 600,
        height: 800,
    });
    const router = useRouter();

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

    // Evaluation panel state
    const [showEvaluationPanel, setShowEvaluationPanel] = useState(false);

    // Refs
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const canvasRef = useRef(null);
    const canvasContainerRef = useRef<HTMLDivElement | null>(null);
    const pdfViewerRef = useRef<HTMLDivElement | null>(null);

    const [openCalc, setOpenCalc] = useState(false);

    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => handleFile(acceptedFiles[0]),
        accept: {
            "application/pdf": [".pdf"],
        },
        maxFiles: 1,
        onDropRejected: (errors) => {
            console.log(errors);
            setError("Invalid file type. Please upload a PDF file.");
        },
    });

    const handleFile = (file: File) => {
        setPdfFile(file);
        const fileUrl = URL.createObjectURL(file);
        setPdfUrl(fileUrl);
        setPageNumber(1);
        setAnnotations({});
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
    }, [pdfFile, loadingDoc]);

    useEffect(() => {
        setTimeout(() => {
            loadPDF();
            setLoadingDoc(false);
        }, 50);
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

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            const message =
                "Changes you made may not be saved. Are you sure you want to leave this page?";
            e.returnValue = message;
            return message;
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        const unsubscribe = router.subscribe("onBeforeNavigate", (event) => {
            if (pdfFile) {
                const confirmMessage =
                    "Changes you made may not be saved. Are you sure you want to leave this page?";

                if (!window.confirm(confirmMessage)) {
                    event.preventDefault();
                }
            }
        });

        return () => {
            unsubscribe();
        };
    }, [annotations, router]);

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
        if (!loadingDoc || !pdfUrl) return;
        const abc = document.querySelector(".react-pdf__Document");

        const width = abc?.clientWidth || 600;
        const height = abc?.clientHeight || 800;

        fabricCanvas?.setWidth(width);
        fabricCanvas?.setHeight(height);

        setDimensions({ width, height });
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if text is currently selected
            const isTextSelected = window.getSelection()?.toString().trim() !== "";

            // Check if the active element is an input, textarea, or has contenteditable attribute
            const isInputFocused =
                document.activeElement?.tagName.toLowerCase() === "input" ||
                document.activeElement?.getAttribute("contenteditable") === "true";

            // Check if the active canvas object is a text object with an active cursor
            const isTextObjectActive =
                fabricCanvas?.getActiveObject()?.type === "i-text" &&
                (fabricCanvas?.getActiveObject() as fabric.IText)?.isEditing;

            // Only proceed with delete if none of the above conditions are true
            if (
                (event.key === "Delete" || event.key === "Backspace") &&
                fabricCanvas &&
                !isTextSelected &&
                !isInputFocused &&
                !isTextObjectActive
            ) {
                event.preventDefault();
                canvasUtils.deleteSelectedShape();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [fabricCanvas, canvasUtils]);

    const handleSubmit = () => {
        // Close the dialog
        setIsSubmitDialogOpen(false);

        // Show success toast
        toast.success("Evaluation Submitted", {
            description: "The answer sheet evaluation has been completed and submitted.",
            duration: 3000,
        });
        router.navigate({ to: "/evaluation/evaluations" });
        // Go back to last route

        // TODO: Add actual submission logic here
        // For example, sending evaluation data to backend
    };

    if (!pdfFile && !pdfUrl) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-y-4">
                <Card className="w-1/2 text-3xl font-semibold">
                    <CardHeader>
                        <CardTitle>Upload your answer sheet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full flex-col items-center gap-2">
                            <div
                                {...getRootProps()}
                                className={`w-full cursor-pointer rounded-lg border-[1.5px] border-dashed border-primary-500 p-6 ${
                                    isDragActive ? "bg-primary-50" : "bg-white"
                                } transition-colors duration-200 ease-in-out`}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center justify-center gap-4">
                                    <ImportFileImage />

                                    <p className="text-center text-base text-neutral-600">
                                        Drag and drop a PDF file here, or click to select one
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <AlertDialog>
                                    <AlertCircle className="size-6 text-red-400" />
                                    <AlertDialogDescription className="text-red-500">
                                        {error}
                                    </AlertDialogDescription>
                                </AlertDialog>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full justify-between">
            <div className="gap- relative flex w-full justify-center gap-2">
                {/* Loading overlay */}
                {isLoading && <LoadingOverlay />}

                <div className="flex">
                    {/* Toolbar */}
                    <Card className="sticky top-[72px] z-10 max-h-fit max-w-20 overflow-y-scroll">
                        <CardHeader>
                            <CardTitle className="text-wrap text-center"> Tools</CardTitle>
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
                                            <tool.icon className={tool.color} />
                                        </Button>
                                    );
                                })}
                                <Button onClick={() => setOpenCalc(true)}>
                                    <FaCalculator className="size-4 text-red-500" />
                                </Button>
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
                                    <RefreshCcw className="size-4" />
                                </Button>
                                <AlertDialog
                                    open={isSubmitDialogOpen}
                                    onOpenChange={setIsSubmitDialogOpen}
                                >
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            onClick={() => setIsSubmitDialogOpen(true)}
                                            className="w-fit"
                                            disabled={isLoading}
                                        >
                                            Submit
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to submit this evaluation?
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleSubmit}>
                                                Continue
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {/* PDF Viewer */}
                <Card className="w-full">
                    <CardHeader className="sticky top-[72px] z-10 rounded-md bg-white py-1 shadow-md">
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
                                <Button
                                    onClick={() => setShowEvaluationPanel(!showEvaluationPanel)}
                                    className={`w-fit ${
                                        showEvaluationPanel ? "bg-primary-500 text-white" : ""
                                    }`}
                                >
                                    <SlNote className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex justify-center bg-slate-100 pt-4">
                        {loadingDoc ? (
                            <DashboardLoader />
                        ) : (
                            <div
                                ref={pdfViewerRef}
                                className="relative"
                                style={{
                                    width: dimensions.width,
                                    height: dimensions.height,
                                }}
                            >
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
                                        <ProgressBar progress={progress} />
                                        <Document
                                            file={pdfUrl || file}
                                            onLoadSuccess={({ numPages }) => {
                                                setNumPages(numPages);
                                                setDocLoaded(true);
                                            }}
                                            onLoadProgress={({ loaded, total }) => {
                                                setProgress((loaded / total) * 100);
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
                        )}
                    </CardContent>
                </Card>

                {/* Evaluation Panel */}
                {showEvaluationPanel && (
                    <div className="fixed right-0 top-[72px] z-50 h-[calc(100%-72px)] w-1/4 overflow-y-auto bg-white shadow-lg">
                        <div className="p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold">Evaluation Panel</h2>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowEvaluationPanel(false)}
                                    className="hover:bg-gray-100"
                                >
                                    <X className="size-5" />
                                </Button>
                            </div>
                            <Evaluation
                                totalPages={numPages}
                                pagesVisited={pagesVisited}
                                currentPage={pageNumber}
                            />
                        </div>
                    </div>
                )}
            </div>
            {openCalc && <Calculator open={openCalc} onOpenChange={setOpenCalc} />}
        </div>
    );
};

export default PDFEvaluator;
