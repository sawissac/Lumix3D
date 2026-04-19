"use client";

import { useRef, useState } from "react";
import { Download, Upload, Trash, Code, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetScene, loadScene } from "@/store/slices/sceneSlice";

export function ProjectActions() {
  const dispatch = useAppDispatch();
  const sceneState = useAppSelector((state) => state.scene);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeType, setCodeType] = useState<"js" | "react">("js");
  const [copied, setCopied] = useState(false);
  const [embedRotate, setEmbedRotate] = useState(true);
  const [embedZoom, setEmbedZoom] = useState(false);
  const [embedPan, setEmbedPan] = useState(false);

  const hasProject = sceneState.svgShapes.length > 0 || sceneState.is3DMode;

  const handleExport = () => {
    // @ts-ignore
    const cameraState =
      typeof window !== "undefined" && window.getLumixCameraState
        ? window.getLumixCameraState()
        : undefined;
    const finalState = { ...sceneState, cameraState };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(finalState, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "lumix3d-project.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset input so same file can be selected again
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          // Only dispatch if it looks somewhat like a valid state (basic check)
          if (json && typeof json === "object") {
            dispatch(loadScene(json));
          }
        } catch (error) {
          console.error("Failed to parse project file", error);
          alert("Invalid project file");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const generateJavaScriptCode = () => {
    // @ts-ignore
    const cameraState =
      typeof window !== "undefined" && window.getLumixCameraState
        ? window.getLumixCameraState()
        : undefined;
    const finalState = {
      ...sceneState,
      cameraState,
      embedControls: {
        enableRotate: embedRotate,
        enableZoom: embedZoom,
        enablePan: embedPan,
      },
    };
    const stateJson = JSON.stringify(finalState);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lumix3D Embed</title>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe id="lumix-frame" src="${origin}/embed" allow="fullscreen"></iframe>
  <script>
    const sceneState = ${stateJson.replace(/</g, "\\u003c")};
    const frame = document.getElementById('lumix-frame');
    
    // Send data once iframe is ready
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'LUMIX_READY') {
        frame.contentWindow.postMessage({ type: 'LUMIX_INIT', state: sceneState }, '*');
      }
    });
    
    // Fallback if iframe doesn't send ready
    frame.onload = () => {
      setTimeout(() => {
        frame.contentWindow.postMessage({ type: 'LUMIX_INIT', state: sceneState }, '*');
      }, 500);
    };
  </script>
</body>
</html>`;
  };

  const generateReactCode = () => {
    // @ts-ignore
    const cameraState =
      typeof window !== "undefined" && window.getLumixCameraState
        ? window.getLumixCameraState()
        : undefined;
    const finalState = {
      ...sceneState,
      cameraState,
      embedControls: {
        enableRotate: embedRotate,
        enableZoom: embedZoom,
        enablePan: embedPan,
      },
    };
    const stateJson = JSON.stringify(finalState, null, 2);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `import { useEffect, useRef } from 'react';

export default function Lumix3DEmbed() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const sceneState = ${stateJson};

    const handleMessage = (e) => {
      if (e.data && e.data.type === 'LUMIX_READY') {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'LUMIX_INIT', state: sceneState },
          '*'
        );
      }
    };

    window.addEventListener('message', handleMessage);

    const fallbackSend = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'LUMIX_INIT', state: sceneState },
        '*'
      );
    }, 500);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(fallbackSend);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="${origin}/embed"
      allow="fullscreen"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
    />
  );
}`;
  };

  return (
    <div className="flex items-center gap-0.5">
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="ghost"
        size="icon"
        title="Import Project"
        className="h-7 w-7 text-white/50 hover:text-white/90 hover:bg-white/10"
        onClick={handleImportClick}
      >
        <Upload className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Export Project"
        className="h-7 w-7 text-white/50 hover:text-white/90 hover:bg-white/10"
        onClick={handleExport}
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Show Embed Code"
        className="h-7 w-7 text-white/50 hover:text-white/90 hover:bg-white/10"
        onClick={() => setShowCodeModal(true)}
      >
        <Code className="h-4 w-4" />
      </Button>
      {hasProject && (
        <Button
          variant="ghost"
          size="icon"
          title="New project (current is auto-saved)"
          className="h-7 w-7 text-white/50 hover:text-red-400 hover:bg-white/10"
          onClick={() => {
            if (
              confirm("Are you sure you want to clear the current project?")
            ) {
              dispatch(resetScene());
            }
          }}
        >
          <Trash className="h-4 w-4" />
        </Button>
      )}

      {/* Code Modal */}
      {showCodeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowCodeModal(false)}
        >
          <div
            className="bg-background border rounded-lg shadow-lg w-[700px] max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Embed Code</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCodeModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Embed Controls Configuration */}
              <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-md">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Embed Controls
                </p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch
                      checked={embedRotate}
                      onCheckedChange={setEmbedRotate}
                      size="sm"
                    />
                    <span>Rotate</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch
                      checked={embedZoom}
                      onCheckedChange={setEmbedZoom}
                      size="sm"
                    />
                    <span>Zoom</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch
                      checked={embedPan}
                      onCheckedChange={setEmbedPan}
                      size="sm"
                    />
                    <span>Pan</span>
                  </label>
                </div>
              </div>

              {/* Code Type Tabs */}
              <div className="flex items-center gap-2">
                <Button
                  variant={codeType === "js" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCodeType("js")}
                >
                  JavaScript
                </Button>
                <Button
                  variant={codeType === "react" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCodeType("react")}
                >
                  React
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-muted p-4 rounded-md space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    {codeType === "js" ? "JavaScript Embed" : "React Component"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {codeType === "js"
                      ? "A standalone HTML file that embeds your 3D scene in an iframe. Works on any website."
                      : "A React component that you can import and use in your React application."}
                  </p>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-medium text-sm mb-2">Enabled Controls</h4>
                  <div className="flex gap-2 text-sm">
                    {embedRotate && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        ✓ Rotate
                      </span>
                    )}
                    {embedZoom && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        ✓ Zoom
                      </span>
                    )}
                    {embedPan && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        ✓ Pan
                      </span>
                    )}
                    {!embedRotate && !embedZoom && !embedPan && (
                      <span className="text-muted-foreground">
                        No controls enabled - view only
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-medium text-sm mb-2">
                    What&apos;s Included
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your 3D scene with all shapes and materials</li>
                    <li>• Camera position and lighting setup</li>
                    <li>• Background and visual effects</li>
                    <li>• Configured interaction controls</li>
                  </ul>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-medium text-sm mb-2">Usage</h4>
                  <p className="text-sm text-muted-foreground">
                    {codeType === "js"
                      ? "Click 'Copy Code' below to copy the complete HTML file. Save it as .html and open in a browser, or paste into your website."
                      : "Click 'Copy Code' to copy the React component. Paste it into your project and import it where needed."}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button
                onClick={() =>
                  handleCopy(
                    codeType === "js"
                      ? generateJavaScriptCode()
                      : generateReactCode(),
                  )
                }
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
