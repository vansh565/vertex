/* Vertex · Tools */
(function () {
  "use strict";

  function nowId() {
    return "a" + Math.random().toString(36).slice(2, 9);
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  class BoxTool {
    constructor() {
      this.state = "idle";
      this.preview = null;
      this.start = null;
      this.dragTarget = null;
      this.orig = null;
      this.canvas = null;
    }
    onDown(ev) {
      const c = this.canvas;
      if (this.state !== "idle") return;
      const hit = c._hitTest(ev.px, ev.py);
      if (hit) {
        c.setSelected(hit.id);
        if (hit.part === "body" || hit.part.indexOf("h") === 0) c.onEditStart();
        this.state = hit.part === "body" ? "moving" : "resizing";
        this.dragTarget = hit;
        this.orig = JSON.parse(JSON.stringify(c.getSelected()));
        this.start = { nx: ev.nx, ny: ev.ny };
      } else {
        c.onEditStart();
        this.state = "drawing";
        this.start = { nx: ev.nx, ny: ev.ny };
        this.preview = { kind: "box", x1: ev.nx, y1: ev.ny,
                          x2: ev.nx, y2: ev.ny };
      }
    }
    onMove(ev) {
      const c = this.canvas;
      if (this.state === "drawing") {
        this.preview.x2 = ev.nx;
        this.preview.y2 = ev.ny;
      } else if (this.state === "moving") {
        const a = c.getSelected(); if (!a) return;
        const dx = ev.nx - this.start.nx;
        const dy = ev.ny - this.start.ny;
        a.x = clamp(this.orig.x + dx, -a.w + 0.001, 1 - 0.001);
        a.y = clamp(this.orig.y + dy, -a.h + 0.001, 1 - 0.001);
      } else if (this.state === "resizing") {
        const a = c.getSelected(); if (!a) return;
        const part = this.dragTarget.part;
        let x1 = this.orig.x, y1 = this.orig.y;
        let x2 = this.orig.x + this.orig.w;
        let y2 = this.orig.y + this.orig.h;
        if (part === "h0") { x1 = ev.nx; y1 = ev.ny; }
        if (part === "h1") { x2 = ev.nx; y1 = ev.ny; }
        if (part === "h2") { x1 = ev.nx; y2 = ev.ny; }
        if (part === "h3") { x2 = ev.nx; y2 = ev.ny; }
        a.x = Math.min(x1, x2);
        a.y = Math.min(y1, y2);
        a.w = Math.abs(x2 - x1);
        a.h = Math.abs(y2 - y1);
      }
    }
    onUp() {
      const c = this.canvas;
      if (this.state === "drawing") {
        const p = this.preview;
        const x = Math.min(p.x1, p.x2);
        const y = Math.min(p.y1, p.y2);
        const w = Math.abs(p.x2 - p.x1);
        const h = Math.abs(p.y2 - p.y1);
        if (w > 0.005 && h > 0.005) {
          const active = (window.__state && window.__state.activeClassId) || 0;
          const ann = { id: nowId(), type: "box", class_id: active,
                        x: x, y: y, w: w, h: h, confidence: 1.0 };
          c.annotations.push(ann);
          c.setSelected(ann.id);
          c.onChange();
})();
