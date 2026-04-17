'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSvgFile, setSvgShapes, setEditMode, set3DMode, setSvgSelection, clearSvgSelection, setSvgFocusIndex } from '@/store/slices/sceneSlice';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { SvgShape } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash2, Ungroup, ZoomIn, ZoomOut, RotateCcw, PenTool } from 'lucide-react';
import type { Canvas as FabricCanvas, FabricObject } from 'fabric';
import { preprocessSVGForThree } from '@/features/three/utils/svgPreprocess';

type SelectionProps = {
  fill: string;
  stroke: string;
  strokeWidth: number;
};

function toHex(color: unknown): string {
  if (!color || typeof color !== 'string') return '#000000';
  // Already hex
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  // rgb(r,g,b) or rgba(r,g,b,a)
  const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    return '#' + [m[1], m[2], m[3]].map((v) => parseInt(v).toString(16).padStart(2, '0')).join('');
  }
  return '#000000';
}

export function SVGEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const svgFile = useAppSelector((state) => state.scene.svgFile);
  const svgFocusIndex = useAppSelector((state) => state.scene.svgFocusIndex);
  const [sel, setSel] = useState<SelectionProps | null>(null);

  const readSelection = useCallback((canvas: FabricCanvas) => {
    const objects = canvas.getActiveObjects();
    if (objects.length === 0) {
      setSel(null);
      dispatch(clearSvgSelection());
      return;
    }
    const first = objects[0];
    const selProps = {
      fill: toHex(first.fill as string),
      stroke: toHex(first.stroke as string),
      strokeWidth: (first.strokeWidth as number) ?? 0,
    };
    setSel(selProps);
    const allObjects = canvas.getObjects();
    const firstIndex = allObjects.indexOf(first);
    dispatch(setSvgSelection({ count: objects.length, firstIndex, ...selProps }));
  }, [dispatch]);

  useEffect(() => {
    if (!canvasRef.current || !svgFile || !containerRef.current) return;

    let cancelled = false;
    const canvasEl = canvasRef.current;
    const containerEl = containerRef.current;

    const run = async () => {
      if (fabricRef.current) {
        await fabricRef.current.dispose();
        fabricRef.current = null;
      }
      if (cancelled) return;

      const { Canvas, loadSVGFromString, Point } = await import('fabric');
      if (cancelled) return;

      const width = containerEl.clientWidth || 800;
      const height = containerEl.clientHeight || 600;

      const canvas = new Canvas(canvasEl, { width, height, backgroundColor: 'transparent' });
      fabricRef.current = canvas;

      const { objects, options } = await loadSVGFromString(svgFile);
      if (cancelled) { canvas.dispose(); fabricRef.current = null; return; }

      const validObjects = objects.filter(Boolean) as FabricObject[];
      if (validObjects.length === 0) return;

      // Use SVG document dimensions from options for scaling
      const svgW = (options as { width?: number }).width || 100;
      const svgH = (options as { height?: number }).height || 100;
      const scaleX = (width - 80) / svgW;
      const scaleY = (height - 80) / svgH;
      const scale = Math.min(scaleX, scaleY, 2);
      const offsetX = (width - svgW * scale) / 2;
      const offsetY = (height - svgH * scale) / 2;

      // Place each path individually — no grouping needed
      validObjects.forEach((item: FabricObject) => {
        item.left = (item.left ?? 0) * scale + offsetX;
        item.top  = (item.top  ?? 0) * scale + offsetY;
        item.scaleX = (item.scaleX ?? 1) * scale;
        item.scaleY = (item.scaleY ?? 1) * scale;
        item.setCoords();
        canvas.add(item);
      });

      canvas.renderAll();
      readSelection(canvas);

      // Selection events → update fill/stroke panel
      canvas.on('selection:created', () => readSelection(canvas));
      canvas.on('selection:updated', () => readSelection(canvas));
      canvas.on('selection:cleared', () => setSel(null));

      // Mouse-wheel zoom centered on cursor
      canvas.on('mouse:wheel', (opt) => {
        const e = opt.e as WheelEvent;
        let zoom = canvas.getZoom();
        zoom *= 0.999 ** e.deltaY;
        zoom = Math.min(Math.max(zoom, 0.02), 10);
        canvas.zoomToPoint(new Point(e.offsetX, e.offsetY), zoom);
        e.preventDefault();
        e.stopPropagation();
      });

      // Alt+drag to pan
      const drag = { active: false, x: 0, y: 0 };
      canvas.on('mouse:down', (opt) => {
        const e = opt.e as MouseEvent;
        if (e.altKey) { drag.active = true; drag.x = e.clientX; drag.y = e.clientY; }
      });
      canvas.on('mouse:move', (opt) => {
        if (!drag.active) return;
        const e = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform!;
        vpt[4] += e.clientX - drag.x;
        vpt[5] += e.clientY - drag.y;
        drag.x = e.clientX;
        drag.y = e.clientY;
        canvas.requestRenderAll();
      });
      canvas.on('mouse:up', () => { drag.active = false; });
    };

    run();

    return () => {
      cancelled = true;
      fabricRef.current?.dispose();
      fabricRef.current = null;
    };
  }, [svgFile, readSelection]);

  // Respond to external focus requests (clicking an item in the Objects list)
  useEffect(() => {
    const canvas = fabricRef.current;
    if (canvas === null || svgFocusIndex === null) return;
    const objects = canvas.getObjects();
    const target = objects[svgFocusIndex];
    if (!target) return;
    canvas.setActiveObject(target);
    canvas.renderAll();
    readSelection(canvas);
    dispatch(setSvgFocusIndex(null));
  }, [svgFocusIndex, dispatch, readSelection]);

  const applyToSelection = (props: Partial<SelectionProps>) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objects = canvas.getActiveObjects();
    if (objects.length === 0) return;
    objects.forEach((obj) => {
      if (props.fill !== undefined) obj.set('fill', props.fill);
      if (props.stroke !== undefined) obj.set('stroke', props.stroke);
      if (props.strokeWidth !== undefined) obj.set('strokeWidth', props.strokeWidth);
    });
    canvas.renderAll();
    setSel((prev) => prev ? { ...prev, ...props } : prev);
  };

  const handleApply = () => {
    if (!fabricRef.current) return;
    const prevBg = fabricRef.current.backgroundColor;
    fabricRef.current.backgroundColor = '';
    const svgOutput = fabricRef.current.toSVG();
    fabricRef.current.backgroundColor = prevBg as string;
    // Store the raw Fabric SVG for re-editing in the 2D canvas
    dispatch(setSvgFile(svgOutput));

    // Parse shapes from raw SVG for the store
    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(svgOutput);
      const shapes: SvgShape[] = svgData.paths.map((path, i) => ({
        id: `shape-${i}`,
        path: svgOutput,
        fill: path.color?.getStyle() || '#cccccc',
        stroke: path.userData?.style?.stroke || undefined,
        opacity: 1,
      }));
      dispatch(setSvgShapes(shapes));
    } catch {
      // shapes will be re-parsed on 3D convert
    }

    dispatch(setEditMode(false));
  };

  const handleCancel = () => dispatch(setEditMode(false));

  const handleConvertTo3D = async () => {
    if (!fabricRef.current) return;
    const prevBg = fabricRef.current.backgroundColor;
    fabricRef.current.backgroundColor = '';
    const svgOutput = fabricRef.current.toSVG();
    fabricRef.current.backgroundColor = prevBg as string;

    // Store raw SVG (Fabric can re-edit it later)
    dispatch(setSvgFile(svgOutput));

    // Preprocess: convert strokes → fills so Three.js extracts correct geometry
    let processedSvg = svgOutput;
    try {
      const result = await preprocessSVGForThree(svgOutput);
      processedSvg = result.svgString;
    } catch {
      // fall back to raw if preprocessing fails
    }

    // Extract shape colour metadata from the preprocessed SVG
    try {
      const loader = new SVGLoader();
      const svgData = loader.parse(processedSvg);
      const shapes: SvgShape[] = svgData.paths.map((path, i) => ({
        id: `shape-${i}`,
        path: processedSvg,
        fill: path.color?.getStyle() || '#cccccc',
        stroke: path.userData?.style?.stroke || undefined,
        opacity: 1,
      }));
      dispatch(setSvgShapes(shapes));
    } catch {
      // shapes will be re-parsed on 3D convert
    }

    dispatch(setEditMode(false));
    dispatch(set3DMode(true));
  };

  const handleDeleteSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.getActiveObjects().forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  const handleUngroup = async () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== 'group') return;
    const { Group } = await import('fabric');
    if (active instanceof Group) {
      const items = active.removeAll();
      canvas.remove(active);
      items.forEach((item) => canvas.add(item));
      canvas.renderAll();
    }
  };

  const handleZoom = (delta: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(Math.min(Math.max(canvas.getZoom() + delta, 0.02), 10));
    canvas.renderAll();
  };

  const handleResetView = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.renderAll();
  };

  return (
    <div className="h-full flex flex-col relative bg-background/80 backdrop-blur-xl">
      {/* Ambient glowing blobs behind the editor */}
      <div className="absolute top-0 left-[-10%] w-96 h-96 rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-96 h-96 rounded-full bg-fuchsia-500/20 blur-[120px] pointer-events-none" />
      
      {/* Compact Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 bg-black/40 backdrop-blur-3xl shrink-0 flex-wrap relative z-10 shadow-lg">
        <div className="flex items-center gap-1.5 mr-2">
          <div className="p-1 bg-linear-to-br from-indigo-500 to-purple-500 rounded-md shadow-sm shadow-indigo-500/20">
             <PenTool className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400 tracking-tight">
            Canvas
          </span>
        </div>

        <div className="flex items-center bg-white/5 rounded p-0.5 border border-white/10 shadow-inner">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-colors" onClick={() => handleZoom(0.1)} title="Zoom In">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-3 bg-white/10 mx-0.5" />
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-colors" onClick={() => handleZoom(-0.1)} title="Zoom Out">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-3 bg-white/10 mx-0.5" />
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-colors" onClick={handleResetView} title="Reset View">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center bg-white/5 rounded p-0.5 border border-white/10 shadow-inner">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/10 transition-colors" onClick={handleUngroup} title="Ungroup">
            <Ungroup className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-3 bg-white/10 mx-0.5" />
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors" onClick={handleDeleteSelected} title="Delete Selected">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Fill / Stroke controls */}
        {sel && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 ml-0 sm:ml-2 px-2 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20 shadow-inner">
            <span className="text-[10px] text-indigo-300/80 font-mono tracking-wider font-medium sm:mr-1 uppercase leading-none">
              {(() => {
                const canvas = fabricRef.current;
                if (!canvas) return null;
                const selected = canvas.getActiveObjects();
                if (selected.length === 1) {
                  const idx = canvas.getObjects().indexOf(selected[0]);
                  return `Shape ${idx + 1}/${canvas.getObjects().length}`;
                }
                return `${selected.length} shapes`;
              })()}
            </span>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-white/90">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium leading-none">Fill</span>
                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/20 shadow-sm transition-transform hover:scale-110 cursor-pointer focus-within:ring-1 focus-within:ring-indigo-500 focus-within:ring-offset-1 focus-within:ring-offset-background">
                  <input
                    type="color"
                    value={sel.fill}
                    onChange={(e) => applyToSelection({ fill: e.target.value })}
                    className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer m-0 p-0 outline-none"
                  />
                </div>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-white/90">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium leading-none">Stroke</span>
                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/20 shadow-sm transition-transform hover:scale-110 cursor-pointer focus-within:ring-1 focus-within:ring-indigo-500 focus-within:ring-offset-1 focus-within:ring-offset-background">
                  <input
                    type="color"
                    value={sel.stroke}
                    onChange={(e) => applyToSelection({ stroke: e.target.value })}
                    className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer m-0 p-0 outline-none"
                  />
                </div>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-white/90">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium leading-none">Width</span>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={sel.strokeWidth}
                  onChange={(e) => applyToSelection({ strokeWidth: parseFloat(e.target.value) || 0 })}
                  className="w-12 h-6 rounded border border-white/10 bg-black/40 px-1.5 text-xs font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-muted-foreground text-center"
                />
              </label>
            </div>
          </div>
        )}

        <div className="ml-auto flex gap-1.5 mt-2 w-full sm:w-auto sm:mt-0 justify-end">
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-white/70 hover:text-white hover:bg-white/5" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-white/10 bg-white/5 hover:bg-white/10 text-white shadow-sm" onClick={handleApply}>
            Save
          </Button>
          <Button size="sm" className="h-7 px-3 text-xs bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md shadow-indigo-500/25 border-0 hover:shadow-indigo-500/40 transition-all font-medium tracking-wide" onClick={handleConvertTo3D}>
            To 3D
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative z-10 w-full h-full flex items-center justify-center p-4">
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div ref={containerRef} className="rounded-lg shadow-black/50 shadow-2xl overflow-hidden relative w-full h-full ring-1 ring-white/10" style={{
            backgroundColor: "#6b7280", /* Tailwind gray-500 */
            backgroundImage: "linear-gradient(45deg, #9ca3af 25%, transparent 25%), linear-gradient(-45deg, #9ca3af 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #9ca3af 75%), linear-gradient(-45deg, transparent 75%, #9ca3af 75%)", /* Tailwind gray-400 */
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px"
        }}>
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}
