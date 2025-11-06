"use client";
import { useState, useRef, useEffect, ReactNode } from "react";

interface ResizableLayoutProps {
    leftPanel: ReactNode;
    topRightPanel: ReactNode;
    bottomRightPanel: ReactNode;
}

export function ResizableLayout({ leftPanel, topRightPanel, bottomRightPanel }: ResizableLayoutProps) {
    const [editorHeight, setEditorHeight] = useState(60); // percentage
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const container = containerRef.current;
            const containerRect = container.getBoundingClientRect();
            const mouseY = e.clientY - containerRect.top;
            const newHeight = (mouseY / containerRect.height) * 100;

            // Constrain between 20% and 80%
            const constrainedHeight = Math.max(20, Math.min(80, newHeight));
            setEditorHeight(constrainedHeight);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    return (
        <div className="flex h-screen bg-neutral-900 text-neutral-200 overflow-hidden flex-col lg:flex-row">
            {leftPanel}
            <div ref={containerRef} className="flex flex-1 flex-col overflow-hidden min-h-0 relative">
                <div style={{ height: `${editorHeight}%` }} className="overflow-hidden">
                    {topRightPanel}
                </div>
                
                {/* Resizable Divider */}
                <div
                    onMouseDown={() => setIsDragging(true)}
                    className="h-1 bg-neutral-800 hover:bg-blue-500 cursor-row-resize transition-colors relative group"
                >
                    <div className="absolute inset-0 -top-1 -bottom-1" /> {/* Expand hit area */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-neutral-600 rounded group-hover:bg-blue-400 transition-colors" />
                </div>

                <div style={{ height: `${100 - editorHeight}%` }} className="overflow-hidden">
                    {bottomRightPanel}
                </div>
            </div>
        </div>
    );
}
