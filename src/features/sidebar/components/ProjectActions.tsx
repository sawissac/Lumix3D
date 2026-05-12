"use client";

import { useRef } from "react";
import { Download, Upload, Trash, Code, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetScene, loadScene } from "@/store/slices/sceneSlice";
import {
  setShowCodeModal,
  setCodeType,
  setCopied,
  setEmbedRotate,
  setEmbedZoom,
  setEmbedPan,
  setEmbedRotateX,
  setEmbedRotateY,
  setEmbedRotateZ,
} from "@/store/slices/sceneSlice";
import { toEmbedPayload } from "@/lib/embedPayload";

const EMBED_SCRIPT_PATH = "/lumix-embed.js";

export function ProjectActions() {
  const dispatch = useAppDispatch();
  const sceneState = useAppSelector((state) => state.scene);
  const uiState = useAppSelector((state) => state.scene);
  
  const {
    showCodeModal,
    codeType,
    copied,
    embedRotate,
    embedZoom,
    embedPan,
    embedRotateX,
    embedRotateY,
    embedRotateZ,
  } = uiState;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasProject = sceneState.svgShapes.length > 0 || sceneState.is3DMode;

  const handleExport = () => {
    const cameraState =
      typeof window !== "undefined" && (window as any).getLumixCameraState
        ? (window as any).getLumixCameraState()
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
      dispatch(setCopied(true));
      setTimeout(() => dispatch(setCopied(false)), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const buildPayload = () => {
    const cameraState =
      typeof window !== "undefined" && (window as any).getLumixCameraState
        ? (window as any).getLumixCameraState()
        : undefined;
    return toEmbedPayload(
      { ...sceneState, cameraState },
      {
        enableRotate: embedRotate,
        enableZoom: embedZoom,
        enablePan: embedPan,
        enableRotateX: embedRotateX,
        enableRotateY: embedRotateY,
        enableRotateZ: embedRotateZ,
      },
    );
  };

  const generateJavaScriptCode = () => {
    const stateJson = JSON.stringify(buildPayload());
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const scriptUrl = `${origin}${EMBED_SCRIPT_PATH}`;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lumix3D Embed</title>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
    lumix-scene { display: block; width: 100%; height: 100%; }
  </style>
  <script src="${scriptUrl}" defer></script>
</head>
<body>
  <lumix-scene id="lumix"></lumix-scene>
  <script>
    const scene = ${stateJson.replace(/</g, "\\u003c")};
    const el = document.getElementById('lumix');
    const apply = () => { el.scene = scene; };
    if (customElements.get('lumix-scene')) apply();
    else customElements.whenDefined('lumix-scene').then(apply);
  </script>
</body>
</html>`;
  };

  const generateReactCode = () => {
    const stateJson = JSON.stringify(buildPayload(), null, 2);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const scriptUrl = `${origin}${EMBED_SCRIPT_PATH}`;
    return `import { useEffect, useRef } from 'react';

const SCRIPT_URL = '${scriptUrl}';
const scene = ${stateJson};

function ensureEmbedScript() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (customElements.get('lumix-scene')) return Promise.resolve();
  const existing = document.querySelector('script[data-lumix-embed]');
  if (existing) return customElements.whenDefined('lumix-scene');
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_URL;
    s.async = true;
    s.dataset.lumixEmbed = 'true';
    s.onload = () => customElements.whenDefined('lumix-scene').then(resolve);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function Lumix3DEmbed() {
  const ref = useRef(null);

  useEffect(() => {
    let cancelled = false;
    ensureEmbedScript().then(() => {
      if (!cancelled && ref.current) ref.current.scene = scene;
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <lumix-scene
      ref={ref}
      style={{ display: 'block', width: '100%', height: '100%' }}
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
        onClick={() => dispatch(setShowCodeModal(true))}
      >
        <Code className="h-4 w-4" />
      </Button>
      {hasProject && (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                title="New project (current is auto-saved)"
                className="h-7 w-7 text-white/50 hover:text-red-400 hover:bg-white/10"
              >
                <Trash className="h-4 w-4" />
              </Button>
            }
          />
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear current project?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes all shapes, lights, materials, and timeline data.
                The current project is auto-saved — you can re-import the JSON
                export to restore it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500/90 text-white hover:bg-red-500"
                onClick={() => dispatch(resetScene())}
              >
                Clear project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialog>
      )}

      {/* Code Modal */}
      {showCodeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => dispatch(setShowCodeModal(false))}
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
                  onClick={() => dispatch(setShowCodeModal(false))}
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
                      onCheckedChange={(c) => dispatch(setEmbedRotate(c))}
                      size="sm"
                    />
                    <span>Rotate</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch
                      checked={embedZoom}
                      onCheckedChange={(c) => dispatch(setEmbedZoom(c))}
                      size="sm"
                    />
                    <span>Zoom</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Switch
                      checked={embedPan}
                      onCheckedChange={(c) => dispatch(setEmbedPan(c))}
                      size="sm"
                    />
                    <span>Pan</span>
                  </label>
                </div>
                {embedRotate && (
                  <div className="flex gap-4 pt-2 border-t border-border/50 mt-1">
                    <label className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground">
                      <Switch
                        checked={embedRotateX}
                        onCheckedChange={(c) => dispatch(setEmbedRotateX(c))}
                        size="sm"
                      />
                      <span>Rotate X</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground">
                      <Switch
                        checked={embedRotateY}
                        onCheckedChange={(c) => dispatch(setEmbedRotateY(c))}
                        size="sm"
                      />
                      <span>Rotate Y</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer text-muted-foreground">
                      <Switch
                        checked={embedRotateZ}
                        onCheckedChange={(c) => dispatch(setEmbedRotateZ(c))}
                        size="sm"
                      />
                      <span>Rotate Z</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Code Type Tabs */}
              <div className="flex items-center gap-2">
                <Button
                  variant={codeType === "js" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => dispatch(setCodeType("js"))}
                >
                  JavaScript
                </Button>
                <Button
                  variant={codeType === "react" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => dispatch(setCodeType("react"))}
                >
                  React
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-muted p-4 rounded-md space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    {codeType === "js"
                      ? "HTML + Web Component"
                      : "React Component"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {codeType === "js" ? (
                      <>
                        Renders inline via{" "}
                        <code className="px-1 rounded bg-background">
                          &lt;lumix-scene&gt;
                        </code>{" "}
                        custom element. Loads{" "}
                        <code className="px-1 rounded bg-background">
                          {EMBED_SCRIPT_PATH}
                        </code>{" "}
                        from this origin. No iframe.
                      </>
                    ) : (
                      <>
                        Renders{" "}
                        <code className="px-1 rounded bg-background">
                          &lt;lumix-scene&gt;
                        </code>{" "}
                        custom element in your React tree. Loads{" "}
                        <code className="px-1 rounded bg-background">
                          {EMBED_SCRIPT_PATH}
                        </code>{" "}
                        on mount. No iframe.
                      </>
                    )}
                  </p>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-medium text-sm mb-2">Enabled Controls</h4>
                  <div className="flex flex-wrap gap-2 text-sm">
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
                    {embedRotate && embedRotateX && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        ✓ Rotate X
                      </span>
                    )}
                    {embedRotate && embedRotateY && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        ✓ Rotate Y
                      </span>
                    )}
                    {embedRotate && embedRotateZ && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        ✓ Rotate Z
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
                  {codeType === "js" ? (
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li>Copy snippet. Save as .html or paste in page.</li>
                      <li>
                        Script tag loads{" "}
                        <code className="px-1 rounded bg-background">
                          {EMBED_SCRIPT_PATH}
                        </code>{" "}
                        — must be served from this origin (CORS-safe).
                      </li>
                      <li>
                        Custom element registers{" "}
                        <code className="px-1 rounded bg-background">
                          &lt;lumix-scene&gt;
                        </code>
                        ; scene JSON assigned via{" "}
                        <code className="px-1 rounded bg-background">
                          el.scene
                        </code>
                        .
                      </li>
                    </ul>
                  ) : (
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                      <li>Drop component anywhere in your React tree.</li>
                      <li>
                        Script auto-injected on mount; custom element{" "}
                        <code className="px-1 rounded bg-background">
                          &lt;lumix-scene&gt;
                        </code>{" "}
                        receives scene via ref.
                      </li>
                      <li>UI-only state stripped from payload.</li>
                    </ul>
                  )}
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
