"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";

import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Mail,
  Download,
  Share,
  FileText,
  Printer,
  Maximize,
  MoreHorizontal,
  Check,
  Copy,
  File
} from "lucide-react";

/**
 * Document Viewer component with Google Docs-inspired layout
 * 
 * @param {Object} props Component props
 * @param {string} props.html HTML content of the document
 * @param {string} props.documentName Name of the document
 * @param {string} props.customerName Customer name
 * @param {string} props.createdAt Document creation date
 * @param {string} props.filename Document filename
 */
export default function DocumentViewer({ html, documentName, customerName, createdAt, filename }) {
  // State for viewer
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Toast hook
  const { toast } = useToast();
  
  // Refs
  const documentContainerRef = useRef(null);
  const documentContentRef = useRef(null);
  
  // Format creation date
  const formattedDate = new Date(createdAt).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  
  // Handle zooming
  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  };
  
  // Handle toggling fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      documentContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Copy document link to clipboard
  const copyDocumentLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setShowCopiedTooltip(true);
      setTimeout(() => setShowCopiedTooltip(false), 2000);
      
      toast({
        title: "Link copied",
        description: "Document link copied to clipboard",
        duration: 3000,
      });
    });
  };
  
  // Handle printing
  const handlePrint = () => {
    window.print();
  };
  
  // Handle email sharing submission
  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Call the API to share the document
      const response = await fetch('/api/documents/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          recipient_email: shareEmail,
          message: shareMessage,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to share document');
      }
      
      // Show success message
      toast({
        title: "Document shared",
        description: `Document shared successfully with ${shareEmail}`,
        variant: "success",
        duration: 5000,
      });
      
      setShareDialogOpen(false);
      setShareEmail("");
      setShareMessage("");
    } catch (error) {
      console.error('Error sharing document:', error);
      
      toast({
        title: "Error",
        description: `Failed to share document: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle downloading as PDF
  const handleDownloadPdf = async () => {
    toast({
      title: "Preparing PDF",
      description: "Your document is being prepared for download",
      duration: 3000,
    });
    
    // Open in a new tab to avoid redirecting the current page
    window.open(`/api/documents/download/${filename}?format=pdf`, '_blank');
  };
  
  // Handle downloading as DOCX
  const handleDownloadDocx = async () => {
    toast({
      title: "Downloading DOCX",
      description: "Your document is being prepared for download",
      duration: 3000,
    });
    
    // Create a hidden link and click it to trigger the download
    const link = document.createElement('a');
    link.href = `/api/documents/download/${filename}?format=docx`;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 print:bg-white">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm print:hidden">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              title="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <h1 className="text-lg font-medium truncate max-w-[200px] sm:max-w-md">
              {documentName}
            </h1>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Zoom controls */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            
            <span className="text-sm w-16 text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            {/* Action buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShareDialogOpen(true)}
              title="Share via email"
            >
              <Mail className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              title="Print"
            >
              <Printer className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownloadPdf}
              title="Download as PDF"
            >
              <FileText className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownloadDocx}
              title="Download as DOCX"
            >
              <File className="w-5 h-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={copyDocumentLink}
              title={showCopiedTooltip ? "Copied!" : "Copy link"}
            >
              {showCopiedTooltip ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Document container */}
      <div 
        ref={documentContainerRef}
        className="flex-1 p-8 mx-auto overflow-auto md:p-12 bg-slate-50 print:p-0 print:bg-white"
        style={{ maxWidth: '100%' }}
      >
        <Card className="w-full max-w-[816px] mx-auto shadow-md print:shadow-none" style={{ overflow: 'hidden' }}>
          <div 
            ref={documentContentRef}
            className="p-8 bg-white transform-gpu"
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              minHeight: '100%',
            }}
          >
            {/* Document content */}
            <div 
              className="document-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </Card>
      </div>
      
      {/* Email sharing dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              Send this document via email to a recipient.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleShareSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Recipient Email
              </label>
              <Input
                id="email"
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="recipient@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message (Optional)
              </label>
              <Textarea
                id="message"
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="Here's the document you requested..."
                rows={4}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShareDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Document"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Print styles - hidden in regular view but applied when printing */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          
          .document-content {
            transform: none !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:bg-white {
            background-color: white !important;
          }
        }
      `}</style>
    </div>
  );
} 