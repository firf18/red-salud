"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@red-salud/ui";
import { Loader2, Check, Cloud } from "lucide-react";
import { cn } from "@red-salud/core/utils";

interface AutoSaveNotesProps {
    initialValue: string | null;
    onSave: (value: string) => Promise<void>;
    placeholder?: string;
    className?: string;
}

export function AutoSaveNotes({ initialValue, onSave, placeholder, className }: AutoSaveNotesProps) {
    const [value, setValue] = useState(initialValue || "");
    const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        setStatus("idle");

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
            setStatus("saving");
            try {
                await onSave(newValue);
                setStatus("saved");
                // Reset to idle after 2 seconds
                setTimeout(() => setStatus("idle"), 2000);
            } catch (err) {
                console.error("Error auto-saving:", err);
                setStatus("error");
            }
        }, 1000); // 1 second debounce
    };

    return (
        <div className={cn("relative h-full flex flex-col", className)}>
            <div className="absolute top-2 right-2 z-10 pointers-events-none">
                {status === "saving" && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground animate-pulse bg-background/80 px-2 py-1 rounded">
                        <Loader2 className="h-3 w-3 animate-spin" /> Guardando...
                    </div>
                )}
                {status === "saved" && (
                    <div className="flex items-center gap-1 text-xs text-green-600 bg-background/80 px-2 py-1 rounded transition-opacity duration-1000">
                        <Check className="h-3 w-3" /> Guardado
                    </div>
                )}
                {status === "error" && (
                    <div className="flex items-center gap-1 text-xs text-destructive bg-background/80 px-2 py-1 rounded">
                        Error al guardar
                    </div>
                )}
            </div>
            <Textarea
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="flex-1 min-h-[200px] resize-none border-0 focus-visible:ring-0 p-4 leading-relaxed bg-transparent"
            />
        </div>
    );
}
