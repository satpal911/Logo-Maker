import React, { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import {
  Circle,
  Edit2Icon,
  Ellipse,
  LineStyle,
  RectangleHorizontal,
  Triangle,
} from "lucide-react";

const LogoEditor = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#333333");

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 500,
      backgroundColor: "#ffffff",
    });
    setCanvas(fabricCanvas);

    const handleSelection = (e) => {
      if (e.selected && e.selected[0]) {
        const obj = e.selected[0];
        setSelectedColor(obj.type === "line" ? obj.stroke : obj.fill);
      }
    };

    fabricCanvas.on("selection:created", handleSelection);
    fabricCanvas.on("selection:updated", handleSelection);

    return () => fabricCanvas.dispose();
  }, []);

  const addText = () => {
    const text = new fabric.IText("Double click to edit", {
      left: 100,
      top: 100,
      fill: selectedColor,
      fontSize: 30,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const addShape = (type) => {
    let shape;
    const commonProps = {
      left: 150,
      top: 150,
      fill: selectedColor,
      width: 100,
      height: 100,
    };

    if (type === "rect") shape = new fabric.Rect(commonProps);
    if (type === "circle")
      shape = new fabric.Circle({ ...commonProps, radius: 50 });
    if (type === "triangle") shape = new fabric.Triangle(commonProps);
    if (type === "ellipse")
      shape = new fabric.Ellipse({ ...commonProps, rx: 50, ry: 30 });
    if (type === "line")
      shape = new fabric.Line([50, 50, 200, 50], {
        ...commonProps,
        stroke: selectedColor,
        strokeWidth: 5,
      });

    canvas.add(shape);
    canvas.setActiveObject(shape);
  };

  const handleColorChange = (e) => {
    const color = e.target.value;
    setSelectedColor(color);
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set(activeObject.type === "line" ? "stroke" : "fill", color);
      canvas.renderAll();
    }
  };

  const moveLayer = (direction) => {
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    if (direction === "front") canvas.bringObjectToFront(activeObject);
    if (direction === "back") canvas.sendObjectToBack(activeObject);
    canvas.renderAll();
  };

  const deleteSelected = () => {
    const activeObjects = canvas.getActiveObjects();
    canvas.discardActiveObject();
    activeObjects.forEach((obj) => {
      canvas.remove(obj);
    });
    canvas.renderAll();
  };

  const clearCanvas = () => {
    if (window.confirm("Are you sure you want to clear everything?")) {
      canvas.clear();
      canvas.setBackgroundColor("#ffffff", canvas.renderAll.bind(canvas));
    }
  };

  const exportLogo = (format) => {
    const dataURL =
      format === "svg"
        ? canvas.toSVG()
        : canvas.toDataURL({ format: "png", multiplier: 2 });
    const link = document.createElement("a");
    link.href =
      format === "svg"
        ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(dataURL)}`
        : dataURL;
    link.download = `my-logo.${format}`;
    link.click();
  };

  const btnStyle =
    "flex justify-between items-center w-full text-left px-4 py-2 rounded text-sm font-medium transition-colors border border-slate-200 hover:bg-slate-100 hover:border-slate-300 bg-white text-slate-700";
  const primaryBtn =
    "w-full px-4 py-2 rounded text-sm font-bold transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm";
  const dangerBtn =
    "w-full px-4 py-2 rounded text-sm font-medium transition-all border border-red-200 text-red-600 hover:bg-red-50";

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <div className="h-[35%] md:h-full w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shadow-sm shrink-0">
        <div className="p-4 md:p-6 border-b border-slate-100">
          <h1 className="font-black text-xl md:text-2xl tracking-tighter text-indigo-600 uppercase">
            LogoMaker
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 md:gap-6">
          <section>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 md:mb-3">
              Add Elements
            </label>

            <div className="grid grid-cols-3 md:flex md:flex-col gap-2">
              <button className={btnStyle} onClick={addText}>
                Text Box
                <Edit2Icon size={16} />
              </button>
              <button className={btnStyle} onClick={() => addShape("rect")}>
                Square <RectangleHorizontal size={16} fill="" />
              </button>
              <button className={btnStyle} onClick={() => addShape("circle")}>
                Circle <Circle size={16} fill="" />
              </button>
              <button className={btnStyle} onClick={() => addShape("triangle")}>
                Triangle
                <Triangle size={16} fill="" />
              </button>
              <button className={btnStyle} onClick={() => addShape("ellipse")}>
                Ellipse
                <Ellipse size={16} fill="" />
              </button>
              <button className={btnStyle} onClick={() => addShape("line")}>
                Line
                <LineStyle size={16} />
              </button>
            </div>
          </section>

          <section>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 md:mb-3">
              Appearance
            </label>
            <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
              <input
                className="w-8 h-8 md:w-10 md:h-10 rounded cursor-pointer border-none"
                type="color"
                value={selectedColor}
                onChange={handleColorChange}
              />
              <div className="flex flex-col text-xs">
                <span className="text-slate-500 font-semibold">
                  Brand Color
                </span>
                <span className="font-mono uppercase">{selectedColor}</span>
              </div>
            </div>
          </section>

          <section>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 md:mb-3">
              Actions & Layers
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                className={btnStyle + " justify-center"}
                onClick={() => moveLayer("front")}
              >
                To Front
              </button>
              <button
                className={btnStyle + " justify-center"}
                onClick={() => moveLayer("back")}
              >
                To Back
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <button className={dangerBtn} onClick={deleteSelected}>
                Delete Selected
              </button>
              <button
                className="text-[10px] text-slate-400 hover:text-red-500 uppercase font-bold tracking-tighter transition-colors text-center"
                onClick={clearCanvas}
              >
                Reset Canvas
              </button>
            </div>
          </section>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2 shrink-0">
          <button onClick={() => exportLogo("png")} className={primaryBtn}>
            Download PNG
          </button>
          <button
            onClick={() => exportLogo("svg")}
            className="text-xs text-slate-400 hover:text-indigo-600 transition-colors py-1 text-center"
          >
            Export as SVG
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] overflow-auto">
        <div className="shadow-2xl rounded-xl border border-white p-2 bg-white ring-1 ring-slate-200 transform scale-[0.6] sm:scale-80 md:scale-100">
          <canvas ref={canvasRef} className="rounded-lg shadow-inner" />
        </div>
      </div>
    </div>
  );
};

export default LogoEditor;
