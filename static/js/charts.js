// GAIDE interactive bar charts, matching the FlowMotionPolicy project page style.
(function () {
  "use strict";

  var TASKS = ["TableTop", "Box", "Bins", "Shelf 1", "Shelf 2", "Shelf 3"];

  var NAMED_CHARTS = {
    benchmark: {
      groups: [
        { label:"Uniform", methods:["birrt","rrtstar"] },
        { label:"Heuristic", methods:["irrtstar","bitstar"] },
        { label:"Neural", methods:["mpnets","simpnet","gaide"] }
      ],
      methodDefs: {
        birrt:    { label:"Bi-RRT",  cls:"m-birrt" },
        rrtstar:  { label:"RRT*",    cls:"m-rrtstar" },
        irrtstar: { label:"IRRT*",   cls:"m-irrtstar" },
        bitstar:  { label:"BIT*",    cls:"m-bitstar" },
        mpnets:   { label:"MPNets",  cls:"m-mpnets" },
        simpnet:  { label:"SIMPNet", cls:"m-simpnet" },
        gaide:    { label:"GAIDE",   cls:"m-gaide" }
      },
      methodOrder: ["birrt","rrtstar","irrtstar","bitstar","mpnets","simpnet","gaide"],
      tasks: TASKS,
      tabs: [
        { key:"sr", label:"Success Rate ↑", unit:"%", log:false,
          data:{ birrt:[88,71,98.3,98,82.6,45], rrtstar:[50,55,64,51,40.6,29],
                 irrtstar:[48,55,66.5,55,37,27], bitstar:[71,67,93.8,91,75,38],
                 mpnets:[41,62,84.5,39,34,32], simpnet:[51,67,94.2,44,35,33],
                 gaide:[52,68,96,55,44,38] }},
        { key:"time", label:"Planning Time ↓", unit:"s", log:false,
          data:{ birrt:[2.85,0.73,1.10,2.71,3.91,4.07], rrtstar:[4.15,2.59,3.08,4.29,5.78,5.12],
                 irrtstar:[4.44,2.54,3.12,4.74,5.94,6.65], bitstar:[3.19,1.40,1.84,4.35,5.95,4.84],
                 mpnets:[2.66,2.41,3.45,2.29,2.57,3.43], simpnet:[5.68,2.68,3.97,3.28,2.96,6.88],
                 gaide:[3.00,2.17,3.72,2.99,5.56,4.34] }},
        { key:"cost", label:"Planning Cost ↓", unit:"", log:false,
          data:{ birrt:[15,14,16,18,21,13], rrtstar:[9.4,6.0,8.8,9.1,15.0,9.8],
                 irrtstar:[10,6.9,11,10,17,11], bitstar:[8.6,7.0,7.7,8.5,15,7.2],
                 mpnets:[5.2,4.9,5.1,5.4,5.9,4.5], simpnet:[5.1,5.7,6.3,4.2,4.9,4.9],
                 gaide:[5.2,4.4,4.5,4.1,4.6,6.1] }},
        { key:"avg_sr", label:"Average Success ↑", unit:"%", log:false, tasks:["Average"],
          data:{ birrt:[80.5], rrtstar:[48.3], irrtstar:[48.1], bitstar:[72.6],
                 mpnets:[48.8], simpnet:[54.0], gaide:[58.8] }},
        { key:"avg_time", label:"Average Time ↓", unit:"s", log:false, tasks:["Average"],
          data:{ birrt:[2.56], rrtstar:[4.17], irrtstar:[4.57], bitstar:[3.60],
                 mpnets:[2.80], simpnet:[4.24], gaide:[3.63] }}
      ]
    },

    ablation: {
      groups: [
        { label:"Variants", methods:["gaidev","gaideh","gaide"] }
      ],
      methodDefs: {
        gaidev: { label:"GAIDE-V", cls:"m-gaidev" },
        gaideh: { label:"GAIDE-H", cls:"m-gaideh" },
        gaide:  { label:"GAIDE",   cls:"m-gaide" }
      },
      methodOrder: ["gaidev","gaideh","gaide"],
      tasks: TASKS,
      tabs: [
        { key:"sr", label:"Success Rate ↑", unit:"%", log:false,
          data:{ gaidev:[45,62,81.3,45,36,33], gaideh:[48,59,77.3,45,34,30], gaide:[52,65,96,55,44,38] }},
        { key:"time", label:"Planning Time ↓", unit:"s", log:false,
          data:{ gaidev:[2.96,2.15,3.61,3.26,3.58,4.03], gaideh:[2.61,2.01,3.41,2.48,4.58,4.42], gaide:[3.00,2.17,3.72,2.99,5.56,4.34] }}
      ]
    }
  };

  function dataRange(data, methodOrder) {
    var max = -Infinity;
    methodOrder.forEach(function (m) {
      (data[m] || []).forEach(function (v) { if (v > max) max = v; });
    });
    return { min: 0, max: max * 1.08 };
  }

  function toHeight(v, range, useLog) {
    if (useLog) {
      var lmin = Math.log10(Math.max(range.min, 1e-4));
      var lmax = Math.log10(Math.max(range.max, 1e-4));
      var lv = Math.log10(Math.max(v, 1e-4));
      return lmax > lmin ? ((lv - lmin) / (lmax - lmin)) * 92 : 0;
    }
    return range.max > 0 ? (v / range.max) * 92 : 0;
  }

  function fmtVal(v, unit) {
    if (unit === "%") return (Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1)) + "%";
    if (unit === "s") return v.toFixed(2) + "s";
    return v.toFixed(2);
  }

  function buildLegend(container, spec) {
    var legend = document.createElement("div");
    legend.className = "fmp-legend";
    spec.groups.forEach(function (grp) {
      var grpEl = document.createElement("span");
      grpEl.className = "fmp-legend-group";
      var lbl = document.createElement("span");
      lbl.className = "fmp-legend-group-label";
      lbl.textContent = grp.label + ":";
      grpEl.appendChild(lbl);
      grp.methods.forEach(function (m) {
        var def = spec.methodDefs[m];
        var item = document.createElement("span");
        item.className = "fmp-legend-item";
        var sw = document.createElement("span");
        sw.className = "fmp-legend-swatch " + def.cls;
        item.appendChild(sw);
        item.appendChild(document.createTextNode(def.label));
        grpEl.appendChild(item);
      });
      legend.appendChild(grpEl);
    });
    container.appendChild(legend);
  }

  function ticksFor(tab, range) {
    if (tab.unit === "%") return [100, 75, 50, 25, 0];
    var step = range.max > 6 ? 2 : range.max > 2 ? 1 : 0.5;
    var ticks = [];
    for (var t = 0; t <= Math.ceil(range.max) + step; t += step) ticks.push(Math.round(t * 10) / 10);
    return ticks.reverse();
  }

  function buildPlot(wrap, tab, spec) {
    var range = tab.unit === "%" ? { min:0, max:100 } : dataRange(tab.data, spec.methodOrder);

    var axis = document.createElement("div");
    axis.className = "fmp-y-axis";
    ticksFor(tab, range).forEach(function (v) {
      var tick = document.createElement("div");
      tick.className = "fmp-y-tick";
      tick.textContent = fmtVal(v, tab.unit);
      axis.appendChild(tick);
    });
    wrap.appendChild(axis);

    var plot = document.createElement("div");
    plot.className = "fmp-chart-plot";

    var tasks = tab.tasks || spec.tasks;
    tasks.forEach(function (task, ti) {
      var group = document.createElement("div");
      group.className = "fmp-bar-group";
      var bars = document.createElement("div");
      bars.className = "fmp-bar-group-bars";

      var prevGrp = null;
      spec.methodOrder.forEach(function (m) {
        var curGrp = null;
        spec.groups.forEach(function (g) { if (g.methods.indexOf(m) >= 0) curGrp = g.label; });
        if (prevGrp && curGrp !== prevGrp) {
          var sp = document.createElement("div");
          sp.className = "fmp-bar-spacer";
          bars.appendChild(sp);
        }
        prevGrp = curGrp;

        var v = (tab.data[m] || [])[ti];
        if (v === undefined || v === null) return;
        var bar = document.createElement("div");
        bar.className = "fmp-bar " + spec.methodDefs[m].cls;
        bar.style.setProperty("--target", toHeight(v, range, tab.log) + "%");
        var tip = document.createElement("span");
        tip.className = "fmp-bar-tooltip";
        tip.textContent = spec.methodDefs[m].label + ": " + fmtVal(v, tab.unit);
        bar.appendChild(tip);
        bars.appendChild(bar);
      });

      group.appendChild(bars);
      var lbl = document.createElement("div");
      lbl.className = "fmp-bar-group-label";
      lbl.textContent = task;
      group.appendChild(lbl);
      plot.appendChild(group);
    });
    wrap.appendChild(plot);
  }

  function buildChart(el) {
    var spec = NAMED_CHARTS[el.getAttribute("data-chart")];
    if (!spec) return;
    var activeIdx = 0;

    var tabs = document.createElement("div");
    tabs.className = "fmp-metric-tabs";
    spec.tabs.forEach(function (tab, idx) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fmp-metric-tab" + (idx === 0 ? " active" : "");
      btn.textContent = tab.label;
      btn.addEventListener("click", function () {
        if (idx === activeIdx) return;
        activeIdx = idx;
        tabs.querySelectorAll(".fmp-metric-tab").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        wrap.innerHTML = "";
        buildPlot(wrap, spec.tabs[activeIdx], spec);
        el.classList.remove("in-view");
        requestAnimationFrame(function () { el.classList.add("in-view"); });
      });
      tabs.appendChild(btn);
    });
    el.appendChild(tabs);
    buildLegend(el, spec);

    var wrap = document.createElement("div");
    wrap.className = "fmp-chart-wrap";
    el.appendChild(wrap);
    buildPlot(wrap, spec.tabs[0], spec);
  }

  function init() {
    document.querySelectorAll(".fmp-bar-chart[data-chart]").forEach(buildChart);
    var charts = document.querySelectorAll(".fmp-bar-chart");
    var revealBlocks = document.querySelectorAll(".reveal-block");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in-view"); e.target.classList.add("is-visible"); io.unobserve(e.target); }
        });
      }, { threshold: 0.1 });
      charts.forEach(function (c) { io.observe(c); });
      revealBlocks.forEach(function (b) { io.observe(b); });
    } else {
      charts.forEach(function (c) { c.classList.add("in-view"); });
      revealBlocks.forEach(function (b) { b.classList.add("is-visible"); });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
