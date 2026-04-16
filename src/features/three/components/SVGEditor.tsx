'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSvgFile, setSvgShapes, setEditMode, set3DMode, setSvgSelection, clearSvgSelection, setSvgFocusIndex } from '@/store/slices/sceneSlice';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { SvgShape } from '@/types';
import { Button } from '@/components/ui/button';
import { Trash2, Ungroup, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { Canvas as FabricCanvas, FabricObject } from 'fabric';

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

      const canvas = new Canvas(canvasEl, { width, height, backgroundColor: '#1a1a1a' });
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
    dispatch(setSvgFile(svgOutput));

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

  const handleConvertTo3D = () => { handleApply(); dispatch(set3DMode(true)); };

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
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-background shrink-0 flex-wrap">
        <span className="text-sm font-medium mr-1">SVG Editor</span>

        <Button size="sm" variant="outline" onClick={() => handleZoom(0.1)} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleZoom(-0.1)} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleResetView} title="Reset View">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleUngroup} title="Ungroup">
          <Ungroup className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handleDeleteSelected} title="Delete Selected">
          <Trash2 className="h-4 w-4" />
        </Button>

        {/* Fill / Stroke controls — visible when something is selected */}
        {sel && (
          <>
            <div className="w-px h-6 bg-border mx-1" />
            <span className="text-xs text-muted-foreground font-mono px-1">
              {(() => {
                const canvas = fabricRef.current;
                if (!canvas) return null;
                const selected = canvas.getActiveObjects();
                if (selected.length === 1) {
                  const idx = canvas.getObjects().indexOf(selected[0]);
                  return `Shape ${idx + 1} of ${canvas.getObjects().length}`;
                }
                return `${selected.length} shapes`;
              })()}
            </span>

            <label className="flex items-center gap-1.5 text-sm">
              Fill
              <input
                type="color"
                value={sel.fill}
                onChange={(e) => applyToSelection({ fill: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border border-border bg-transparent p-0.5"
              />
            </label>

            <label className="flex items-center gap-1.5 text-sm">
              Stroke
              <input
                type="color"
                value={sel.stroke}
                onChange={(e) => applyToSelection({ stroke: e.target.value })}
                className="w-7 h-7 rounded cursor-pointer border border-border bg-transparent p-0.5"
              />
            </label>

            <label className="flex items-center gap-1.5 text-sm">
              Width
              <input
                type="number"
                min={0}
                max={50}
                step={0.5}
                value={sel.strokeWidth}
                onChange={(e) => applyToSelection({ strokeWidth: parseFloat(e.target.value) || 0 })}
                className="w-14 h-7 rounded border border-border bg-background px-1.5 text-sm"
              />
            </label>
          </>
        )}

        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button size="sm" variant="outline" onClick={handleApply}>Save Changes</Button>
          <Button size="sm" onClick={handleConvertTo3D}>Convert to 3D</Button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-hidden">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
