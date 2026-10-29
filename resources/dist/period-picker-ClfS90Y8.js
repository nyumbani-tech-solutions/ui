// node_modules/vanilla-calendar-pro/index.mjs
var e = (e) => /* @__PURE__ */ new Date(`${e}T00:00:00`), t = (e) => `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`, n = (n, r) => n.reduce((n, i) => {
	if (i instanceof Date || typeof i == "number") {
		let e = i instanceof Date ? i : new Date(i);
		n.push(t(e));
	} else i.match(/^(\d{4}-\d{2}-\d{2})$/g) ? n.push(i) : i.replace(/(\d{4}-\d{2}-\d{2}).*?(\d{4}-\d{2}-\d{2})/g, (i, a, o) => {
		var s;
		let c = `${a}:${o}`, l = r ? r.start.getTime() : -1 / 0, u = r == null || (s = r.cursors) == null ? void 0 : s.get(c), d = u !== void 0 && u <= l ? new Date(u) : e(a), f = e(o).setHours(23, 59, 59, 999);
		if (r) {
			if (f < l) return i;
			f = Math.min(f, new Date(r.end).setHours(23, 59, 59, 999));
		}
		let p = !1;
		for (let e = d.getTime(); e <= f; e = d.setDate(d.getDate() + 1)) (!r || e >= l) && (r != null && r.cursors && !p && (r.cursors.set(c, e), p = !0), n.push(t(d)));
		return i;
	});
	return n;
}, []), r = (e, t) => {
	if (t && t.values.length === e.length) {
		let n = 0;
		for (; n < e.length && t.values[n] === e[n];) n++;
		if (n === e.length) return t;
	}
	return {
		values: e.slice(),
		set: new Set(e)
	};
}, i = /* @__PURE__ */ new WeakMap(), a = (e) => {
	var t;
	let a = (t = e.selectedHolidays) != null && t[0] ? e.selectedHolidays : [], o = JSON.stringify(a.map((e) => e instanceof Date ? e.getTime() : e)), s = i.get(e);
	i.set(e, {
		holidayKey: o,
		holidays: s?.holidayKey === o ? s.holidays : new Set(n(a)),
		selected: r(e.context.selectedDates, s?.selected),
		disabled: r(e.context.disableDates, s?.disabled),
		enabled: r(e.context.enableDates, s?.enabled),
		min: Date.parse(`${e.context.displayDateMin}T00:00:00`),
		max: Date.parse(`${e.context.displayDateMax}T00:00:00`),
		first: Date.parse(`${e.context.selectedDates[0]}T00:00:00`),
		last: Date.parse(`${e.context.selectedDates[e.context.selectedDates.length - 1]}T00:00:00`)
	});
}, o = (e) => i.get(e), s = [
	"motion",
	"time",
	"annotations",
	"weeks",
	"months"
], c = /* @__PURE__ */ new WeakMap(), l = {}, u = /* @__PURE__ */ Object.freeze([]), d = (e) => c.get(e) ?? l, f = (e, t = e) => {
	if (t.extensions && t.extensions !== e.extensions && (new Set(t.extensions).size !== e.extensions.length || t.extensions.some((t) => !e.extensions.includes(t)))) throw Error("Calendar extensions are fixed at construction. Create a new Calendar to change them.");
	let n = d(e), r = (e, t, r) => {
		if (e && !n[t]) throw Error(`The "${r}" option requires ${t}. Import { ${t} } from 'vanilla-calendar-pro' and add it to extensions: [${t}].`);
	};
	r(t.animation || t.enableSwipe, "motion", t.animation ? "animation" : "enableSwipe"), r(t.selectionTimeMode, "time", "selectionTimeMode"), r(t.popups && Object.keys(t.popups).length || t.onCreateDateRangeTooltip, "annotations", t.onCreateDateRangeTooltip ? "onCreateDateRangeTooltip" : "popups"), r(t.type === "multiple", "months", "type"), r(t.type === "week" || t.enableCollapse || t.enableWeekNumbers || t.onClickWeekDay, "weeks", t.type === "week" ? "type" : t.enableCollapse ? "enableCollapse" : t.enableWeekNumbers ? "enableWeekNumbers" : "onClickWeekDay");
}, p = (e, t, n) => d(e).annotations?.tooltip(e, t, n), m = /* @__PURE__ */ new WeakMap(), h = (e) => {
	let t = m.get(e);
	return t || (t = {
		lastDateEl: null,
		isHovering: !1,
		rangeMin: void 0,
		rangeMax: void 0,
		tooltipEl: null,
		timeoutId: null,
		frameId: null
	}, m.set(e, t)), t;
}, g = (e) => {
	e.context.mainElement.querySelectorAll("[data-vc-date-hover]").forEach((e) => e.removeAttribute("data-vc-date-hover"));
}, _ = (e, t, n) => {
	e.context[t] = n;
}, v = (e, t) => t === void 0 || (typeof t == "function" ? t(e) : t), y = (e) => v(e, e.enableDateToggle), b = (e) => {
	if (e.length < 3 || e.includes(void 0)) return e.sort((e, t) => +new Date(e) - new Date(t));
	let t = e.map((e) => ({
		date: e,
		time: +new Date(e)
	}));
	return t.sort((e, t) => e.time - t.time), t.forEach((t, n) => e[n] = t.date), e;
}, x = (e) => {
	var t;
	let n = m.get(e);
	n && ((t = n.cleanup) == null || t.call(n), n.cleanup = void 0, n.timeoutId !== null && clearTimeout(n.timeoutId), n.frameId !== null && cancelAnimationFrame(n.frameId), n.lastDateEl = null, n.tooltipEl = null, n.timeoutId = null, n.frameId = null, m.delete(e));
}, S = (r, i, a = !0) => {
	let o = h(r);
	if (o.lastDateEl = i, g(r), !o.cleanup) {
		let n = r.context.mainElement, i = ((n) => (r) => {
			if (!n.context.selectedDates[0] || n.context.selectedDates.length !== 1 && !n.onCreateDateRangeTooltip) return;
			let i = h(n);
			if (i.isHovering) return;
			let a = r.target;
			i.isHovering = !0, i.frameId = requestAnimationFrame(() => {
				var r;
				i.frameId = null, i.isHovering = !1, !n.context.isDestroyed && n.context.mainElement.contains(a) && (n.context.selectedDates.length === 1 ? ((n, r) => {
					var i;
					let a = h(n);
					if (n.context.mainElement.hasAttribute("data-vc-dragging") || !r || n == null || (i = n.context) == null || !i.selectedDates[0]) return;
					if (!r.closest("[data-vc=\"dates\"]")) return a.lastDateEl = null, p(n, a.tooltipEl, null), void g(n);
					let o = r.closest("[data-vc-date]");
					if (!o || a.lastDateEl === o) return;
					a.lastDateEl = o, p(n, a.tooltipEl, o), g(n);
					let s = o.dataset.vcDate, c = e(n.context.selectedDates[0]), l = e(s), [u, d] = c < l ? [c, l] : [l, c], [f, m] = c < l ? [n.context.selectedDates[0], s] : [s, n.context.selectedDates[0]], _ = new Set(n.context.disableDates), v = new Date(u);
					for (; v <= d && _.has(t(v));) v.setDate(v.getDate() + 1);
					v <= d && n.context.mainElement.querySelectorAll("[data-vc-date]").forEach((t) => {
						let n = t.dataset.vcDate;
						if (n === f || n === m) t.dataset.vcDateHover = f === m ? "first-and-last" : n === f ? "first" : "last";
						else {
							let r = e(n);
							r >= u && r <= d && !_.has(n) && (t.dataset.vcDateHover = "");
						}
					});
				})(n, a) : n.context.selectedDates[0] && n.onCreateDateRangeTooltip && ((r = d(n).annotations) == null || r.hover(n, a)));
			});
		})(r), a = () => ((e) => {
			let t = h(e);
			t.timeoutId !== null && clearTimeout(t.timeoutId), t.timeoutId = setTimeout(() => {
				t.timeoutId = null, !e.context.isDestroyed && (t.lastDateEl = null, p(e, t.tooltipEl, null), g(e));
			}, 50);
		})(r), s = (e) => ((e, t) => {
			if (t.key !== "Escape" || e.context.selectedDates.length !== 1) return;
			let n = h(e);
			n.lastDateEl = null, _(e, "selectedDates", []), p(e, n.tooltipEl, null), g(e);
		})(r, e);
		n.addEventListener("mousemove", i), n.addEventListener("mouseleave", a), n.addEventListener("keydown", s), o.cleanup = () => {
			n.removeEventListener("mousemove", i), n.removeEventListener("mouseleave", a), n.removeEventListener("keydown", s);
		};
	}
	r.disableDatesGaps && (o.rangeMin ??= r.context.displayDateMin, o.rangeMax ??= r.context.displayDateMax), o.tooltipEl = r.onCreateDateRangeTooltip ? r.context.mainElement.querySelector("[data-vc-date-range-tooltip]") : null;
	let s = i?.dataset.vcDate;
	if (s) {
		let e = r.context.selectedDates.length === 1 && r.context.selectedDates[0].includes(s);
		_(r, "selectedDates", e && !y(r) ? [s, s] : e && y(r) ? [] : r.context.selectedDates.length > 1 ? [s] : [...r.context.selectedDates, s]), r.context.selectedDates.length > 1 && b(r.context.selectedDates);
	}
	({
		set: () => {
			r.disableDatesGaps && ((n) => {
				var r, i;
				if (n == null || (r = n.context) == null || (r = r.selectedDates) == null || !r[0] || (i = n.context.disableDates) == null || !i[0]) return;
				let a = e(n.context.selectedDates[0]), [o, s] = n.context.disableDates.map((t) => e(t)).reduce(([e, t], n) => [a >= n ? n : e, a < n && t === null ? n : t], [null, null]);
				o && _(n, "displayDateMin", t(new Date(o.setDate(o.getDate() + 1)))), s && _(n, "displayDateMax", t(new Date(s.setDate(s.getDate() - 1)))), n.disableDatesPast && !n.disableAllDates && e(n.context.displayDateMin) < e(n.context.dateToday) && _(n, "displayDateMin", n.context.dateToday);
			})(r), p(r, o.tooltipEl, i);
		},
		reset: () => {
			if (!a) return;
			let [e, t] = [r.context.selectedDates[0], r.context.selectedDates[r.context.selectedDates.length - 1]];
			_(r, "selectedDates", r.context.selectedDates[0] === r.context.selectedDates[r.context.selectedDates.length - 1] ? [r.context.selectedDates[0], r.context.selectedDates[0]] : r.enableEdgeDatesOnly ? [e, t] : (() => {
				let i = new Set(r.context.disableDates);
				return n([`${e}:${t}`]).filter((e) => !i.has(e));
			})()), r.disableDatesGaps && (_(r, "displayDateMin", o.rangeMin), _(r, "displayDateMax", o.rangeMax)), r.onCreateDateRangeTooltip && p(r, o.tooltipEl, r.context.selectedDates[0] ? i : null);
		}
	})[r.context.selectedDates.length === 1 ? "set" : "reset"]();
}, C = (e) => e.getRootNode ? e.getRootNode() : document, w = /* @__PURE__ */ new WeakSet(), T = "data-vc-prev-tabindex", ee = (e) => e.tabIndex >= 0 && !e.hasAttribute("disabled") && e.getAttribute("aria-disabled") !== "true", te = (e) => {
	if (e.hasAttribute(T)) return;
	let t = e.getAttribute("tabindex");
	e.setAttribute(T, t ?? "");
}, ne = (e) => {
	if (!e.hasAttribute(T)) return;
	let t = e.getAttribute(T);
	t === "" || t === null ? e.removeAttribute("tabindex") : e.setAttribute("tabindex", t), e.removeAttribute(T);
}, re = (e) => {
	e.setAttribute("inert", ""), e.ariaHidden = "true", ((e) => {
		ee(e) && (te(e), e.tabIndex = -1);
		let t = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => ee(e) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP });
		for (; t.nextNode();) {
			let e = t.currentNode;
			te(e), e.tabIndex = -1;
		}
	})(e);
}, E = (e) => {
	var t;
	if (O(e), !e.context.isShowInInputMode || !e.context.currentType) return;
	let n = e.context.mainElement.contains(C(e.context.mainElement).activeElement);
	e.context.mainElement.dataset.vcCalendarHidden = "", _(e, "isShowInInputMode", !1), e.inputMode && re(e.context.mainElement), (t = e.context.inputElement) != null && t.hasAttribute("aria-expanded") && e.context.inputElement.setAttribute("aria-expanded", "false"), e.context.cleanupHandlers[0] && (e.context.cleanupHandlers.forEach((e) => e()), _(e, "cleanupHandlers", [])), e.inputMode && e.context.inputElement && n && ((typeof e.openOnFocus == "function" || !0 === e.openOnFocus) && ((e) => {
		w.add(e);
	})(e), e.context.inputElement.focus()), e.onHide && e.onHide(e);
};
function ie(e) {
	if (e == null || !e.getBoundingClientRect) return {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	};
	let t = e.getBoundingClientRect(), n = document.documentElement;
	return {
		bottom: t.bottom,
		right: t.right,
		top: t.top + window.scrollY - n.clientTop,
		left: t.left + window.scrollX - n.clientLeft
	};
}
function ae() {
	return {
		vw: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
		vh: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
	};
}
function oe(e, t, n = 5) {
	let r = {
		top: !0,
		bottom: !0,
		left: !0,
		right: !0
	}, i = [];
	if (!t || !e) return {
		canShow: r,
		parentPositions: i
	};
	let { bottom: a, top: o } = function(e) {
		let { top: t, left: n } = {
			left: window.scrollX || document.documentElement.scrollLeft || 0,
			top: window.scrollY || document.documentElement.scrollTop || 0
		}, { top: r, left: i } = ie(e), { vh: a, vw: o } = ae(), s = r - t, c = i - n;
		return {
			top: s,
			bottom: a - (s + e.clientHeight),
			left: c,
			right: o - (c + e.clientWidth)
		};
	}(e), { top: s, left: c } = ie(e), { height: l, width: u } = t.getBoundingClientRect(), { vh: d, vw: f } = ae(), p = f / 2, m = d / 2;
	return [
		{
			condition: s < m,
			position: "top"
		},
		{
			condition: s > m,
			position: "bottom"
		},
		{
			condition: c < p,
			position: "left"
		},
		{
			condition: c > p,
			position: "right"
		}
	].forEach(({ condition: e, position: t }) => {
		e && i.push(t);
	}), Object.assign(r, {
		top: l <= o - n,
		bottom: l <= a - n,
		left: u <= c,
		right: u <= f - c
	}), {
		canShow: r,
		parentPositions: i
	};
}
var se = (e, t, n) => {
	if (!e) return;
	let r = n === "auto" ? function(e, t) {
		let n = "left";
		if (!t || !e) return n;
		let { canShow: r, parentPositions: i } = oe(e, t), a = r.left && r.right;
		return (a && r.bottom ? "center" : a && r.top ? ["top", "center"] : Array.isArray(i) ? [i[0] === "bottom" ? "top" : "bottom", ...i.slice(1)] : i) || n;
	}(e, t) : n, i = {
		top: -t.offsetHeight,
		bottom: e.offsetHeight,
		left: 0,
		center: e.offsetWidth / 2 - t.offsetWidth / 2,
		right: e.offsetWidth - t.offsetWidth
	}, a = Array.isArray(r) ? r[0] : "bottom", o = Array.isArray(r) ? r[1] : r;
	t.dataset.vcPosition = a;
	let { top: s, left: c } = ie(e), l = s + i[a], u = c + i[o], { vw: d } = ae();
	if (u + t.clientWidth > d) {
		let e = window.innerWidth - document.body.clientWidth;
		u = d - t.clientWidth - e;
	} else u < 0 && (u = 0);
	Object.assign(t.style, {
		left: `${u}px`,
		top: `${l}px`
	});
}, D = /* @__PURE__ */ new WeakMap(), O = (e) => {
	clearTimeout(D.get(e)), D.delete(e);
}, ce = (e) => {
	O(e), D.set(e, setTimeout(() => {
		D.delete(e), e.context.isDestroyed || le(e);
	}));
}, le = (e) => {
	var t, n;
	if (O(e), e.context.isShowInInputMode || e.context.isDestroyed) return;
	if (!e.context.currentType) return void e.context.mainElement.click();
	_(e, "cleanupHandlers", []), _(e, "isShowInInputMode", !0), e.inputMode && ((n = e.context.mainElement).removeAttribute("inert"), n.removeAttribute("aria-hidden"), ((e) => {
		ne(e), e.querySelectorAll(`[${T}]`).forEach(ne);
	})(n)), se(e.context.inputElement, e.context.mainElement, e.positionToInput), e.context.mainElement.removeAttribute("data-vc-calendar-hidden"), (t = e.context.inputElement) != null && t.hasAttribute("aria-expanded") && e.context.inputElement.setAttribute("aria-expanded", "true");
	let r = () => {
		se(e.context.inputElement, e.context.mainElement, e.positionToInput);
	};
	window.addEventListener("resize", r), e.context.cleanupHandlers.push(() => window.removeEventListener("resize", r));
	let i = (t) => {
		t.key === "Escape" && E(e);
	};
	document.addEventListener("keydown", i), e.context.cleanupHandlers.push(() => document.removeEventListener("keydown", i));
	let a = (t) => {
		let n = t.composedPath()[0] ?? t.target;
		n === e.context.inputElement || e.context.mainElement.contains(n) || E(e);
	};
	document.addEventListener("click", a, { capture: !0 }), e.context.cleanupHandlers.push(() => document.removeEventListener("click", a, { capture: !0 })), e.onShow && e.onShow(e);
}, ue = "The calendar has not been initialized, please initialize it using the \"init()\" method first.", de = "You specified an incorrect language label or did not specify the required number of values ​​for «locale.weekdays» or «locale.months».", k = (e) => String(e).replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]), fe = (e, t) => `\n  <div class="${k(e.styles.header)}" data-vc="header" role="group" aria-label="${k(e.labels.navigation)}">\n${t ? `    <#ArrowPrev [${t}] />\n` : ""}    <div class="${k(e.styles.headerContent)}" data-vc-header="content" aria-live="polite" aria-atomic="true">\n      <#Month />\n      <#Year />\n    </div>\n${t ? `    <#ArrowNext [${t}] />\n` : ""}  </div>\n`, pe = (e, t = "month") => `${fe(e, t)}  <div class="${k(e.styles.wrapper)}" data-vc="wrapper">\n    <#WeekNumbers />\n    <div class="${k(e.styles.content)}" data-vc="content" role="grid">\n      <#Week />\n      <#Dates />\n      <#DateRangeTooltip />\n    </div>\n  </div>\n  <#Collapse />\n  <#ControlTime />\n`, me = (e) => e, A = /* @__PURE__ */ new WeakMap(), j = (e) => {
	var t;
	(t = A.get(e)) == null || t.observer.disconnect(), A.delete(e);
}, M = j, he = (e) => !(e.animation || e.enableCollapse || e.onCreateDateEls || e.onCreateDateRangeTooltip || e.disableDatesGaps || e.popups && Object.keys(e.popups).length || e.sanitizerHTML !== me || e.context.currentType !== "default" && e.context.currentType !== "multiple" || e.layouts[e.context.currentType] !== (e.context.currentType === "multiple" ? d(e).months?.layout(e) : pe(e))), ge = (e) => JSON.stringify(Object.entries(e).filter(([e]) => e !== "context" && e !== "selectedDates"), (e, t) => typeof t == "function" || t), _e = ({ context: e }) => JSON.stringify([
	e.currentType,
	e.locale,
	e.dateToday,
	e.dateMin,
	e.dateMax,
	e.displayDateMin,
	e.displayDateMax,
	e.selectedYear,
	e.selectedMonth,
	e.displayMonthsCount,
	e.selectedHours,
	e.selectedMinutes,
	e.selectedKeeping,
	e.selectedTime
]), ve = (e) => JSON.stringify([
	_e(e),
	e.context.displayYear,
	e.context.displayWeekDate,
	e.context.selectedDates,
	e.context.disableDates,
	e.context.enableDates
]), ye = (e, t = !1) => {
	let n = A.get(e);
	if (!n || !t && !n.fullLayout || n.dirty || n.observer.takeRecords().length || !he(e)) return;
	let r = C(e.context.mainElement).activeElement;
	if (!r || r === e.context.mainElement || !e.context.mainElement.contains(r) || t && !r.closest("[data-vc=\"column\"], [data-vc=\"dates\"], [data-vc-week=\"numbers\"]")) try {
		if (n.options === ge(e) && n.context === ve(e) && n.timezone === new Intl.DateTimeFormat().resolvedOptions().timeZone) return n;
	} catch {}
}, be = (e, t = !1) => {
	if (j(e), he(e) && !e.context.isDestroyed) try {
		let n = ge(e), r = ve(e);
		if (n.length + r.length > 262144) return;
		let i = Array.from(e.context.mainElement.querySelectorAll("[data-vc=\"dates\"]"));
		if (i.length !== e.context.displayMonthsCount) return;
		let a = {
			observer: new MutationObserver(() => a.dirty = !0),
			dirty: !1,
			fullLayout: t,
			options: n,
			context: r,
			structure: _e(e),
			timezone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
			month: 12 * e.context.selectedYear + e.context.selectedMonth,
			count: i.length
		};
		a.observer.observe(e.context.mainElement, {
			subtree: !0,
			childList: !0,
			attributes: !0,
			characterData: !0
		}), A.set(e, a);
	} catch {
		j(e);
	}
}, N = (e, t, n, r = "") => {
	t ? e.getAttribute(n) !== r && e.setAttribute(n, r) : e.getAttribute(n) === r && e.removeAttribute(n);
}, xe = (t, n, r, i, a, s, c) => {
	let l = (f = s, Date.parse(`${f}T00:00:00`)), u = o(t), d = u.min > l || u.max < l || u.disabled.set.has(s) || !t.selectionMonthsMode && c !== "current" || !t.selectionYearsMode && e(s).getFullYear() !== n;
	var f;
	N(r, d, "data-vc-date-disabled"), i && N(i, d, "aria-disabled", "true"), i && d && N(i, !0, "tabindex", "-1"), i && i.disabled !== !!d && (i.disabled = !!d), N(r, !t.disableToday && t.context.dateToday === s, "data-vc-date-today"), N(r, !t.disableToday && t.context.dateToday === s, "aria-current", "date"), N(r, t.selectedWeekends?.includes(a), "data-vc-date-weekend"), N(r, u.holidays.has(s), "data-vc-date-holiday");
	let p = u.selected.set.has(s), m = p ? "" : void 0;
	p ? (N(r, !0, "aria-selected", "true"), t.context.selectedDates.length > 1 && t.selectionDatesMode === "multiple-ranged" && (t.context.selectedDates[0] === s && t.context.selectedDates[t.context.selectedDates.length - 1] === s ? m = "first-and-last" : t.context.selectedDates[0] === s ? m = "first" : t.context.selectedDates[t.context.selectedDates.length - 1] === s && (m = "last"), t.context.selectedDates[0] !== s && t.context.selectedDates[t.context.selectedDates.length - 1] !== s && (m = "middle"))) : r.hasAttribute("data-vc-date-selected") && r.removeAttribute("aria-selected"), !u.disabled.set.has(s) && t.enableEdgeDatesOnly && t.context.selectedDates.length > 1 && t.selectionDatesMode === "multiple-ranged" && (l > u.first && l < u.last ? m = "middle" : m === "middle" && (m = void 0)), m === void 0 ? r.hasAttribute("data-vc-date-selected") && r.removeAttribute("data-vc-date-selected") : N(r, !0, "data-vc-date-selected", m);
}, P = /* @__PURE__ */ new Map(), F = /* @__PURE__ */ new Map(), Se = (e, t, n) => {
	var r;
	let i = e.disableWeekdays?.includes(n), a = e.disableAllDates && !((r = e.context.enableDates) == null || !r[0]), s = o(e);
	if ((i || a) && !s.enabled.set.has(t) && !s.disabled.set.has(t)) {
		let n = e.context.disableDates;
		if (s.disabled.set.add(t), e.onCreateDateEls) n.push(t), b(n), s.disabled.values = n.slice();
		else {
			let e = +new Date(t), r = 0, i = n.length;
			for (; r < i;) {
				let t = r + i >>> 1;
				+new Date(n[t]) <= e ? r = t + 1 : i = t;
			}
			n.splice(r, 0, t), s.disabled.values.splice(r, 0, t);
		}
	}
}, Ce = (t, n, r, i, o, s) => {
	var c;
	let l, u = e(o).getDay(), f = typeof t.locale == "string" && t.locale.length ? t.locale : "en", p = document.createElement("div");
	p.className = t.styles.date, p.dataset.vcDate = o, p.dataset.vcDateMonth = s, p.dataset.vcDateWeekDay = String(u), p.role = "gridcell", (s === "current" || t.displayDatesOutside) && (l = document.createElement("button"), l.className = t.styles.dateBtn, l.type = "button", l.dataset.vcDateBtn = "", l.ariaLabel = ((e, t) => {
		let n = `${t}:${e}`, r = F.get(n);
		if (r !== void 0) return r;
		let i = P.get(t);
		i || (i = new Intl.DateTimeFormat(t, {
			dateStyle: "long",
			timeZone: "UTC"
		}), P.size >= 8 && P.delete(P.keys().next().value), P.set(t, i));
		let a = i.format(/* @__PURE__ */ new Date(`${e}T00:00:00.000Z`));
		return F.size >= 512 && F.delete(F.keys().next().value), F.set(n, a), a;
	})(o, f), l.innerText = String(i), p.appendChild(l)), t.enableWeekNumbers && ((c = d(t).weeks) == null || c.date(t, p, o)), Se(t, o, u), xe(t, n, p, l, u, o, s), r.addDate(p), t.onCreateDateEls && (t.onCreateDateEls(t, p), a(t));
}, we = [
	{
		container: "[data-vc=\"dates\"]",
		item: "[data-vc-date-btn]",
		active: ["[data-vc-date-selected] [data-vc-date-btn]", "[data-vc-date-today] [data-vc-date-btn]"]
	},
	{
		container: "[data-vc=\"months\"]",
		item: "[data-vc-months-month]",
		active: ["[data-vc-months-month-selected]"]
	},
	{
		container: "[data-vc=\"years\"]",
		item: "[data-vc-years-year]",
		active: ["[data-vc-years-year-selected]"]
	}
], Te = (e) => !e.hasAttribute("disabled") && e.getAttribute("aria-disabled") !== "true", Ee = (e, t, n) => {
	if (n && Te(n)) return e.querySelectorAll(`${t.item}:not([tabindex="-1"])`).forEach((e) => {
		e !== n && (e.tabIndex = -1);
	}), void (n.getAttribute("tabindex") !== "0" && (n.tabIndex = 0));
	let r = Array.from(e.querySelectorAll(t.item));
	if (!r[0]) return;
	let i = ((e, t, n) => t.active.map((t) => e.querySelector(t)).find((e) => !!e && Te(e)) ?? n.find(Te) ?? n[0])(e, t, r);
	r.forEach((e) => {
		let t = e === i ? 0 : -1;
		e.getAttribute("tabindex") !== String(t) && (e.tabIndex = t);
	});
}, De = (e) => {
	let t = e.target, n = we.find((e) => t.matches?.call(t, e.item)), r = n ? t.closest(n.container) : null;
	n && r && Ee(r, n, t);
}, I = (e) => {
	we.forEach((t) => {
		e.context.mainElement.querySelectorAll(t.container).forEach((e) => {
			e.closest("[data-vc-ghost]") || Ee(e, t, null);
		});
	});
}, L = (e, n, r = !0) => {
	M(e);
	let i = new Date(e.context.selectedYear, e.context.selectedMonth, 1), o = e.context.mainElement.querySelectorAll("[data-vc=\"dates\"]"), s = d(e).weeks, c = e.enableWeekNumbers ? e.context.mainElement.querySelectorAll("[data-vc-week=\"numbers\"]") : [], l = d(e).annotations?.prepare(e, o.length);
	o.forEach((r, o) => {
		e.selectionDatesMode || (r.dataset.vcDatesDisabled = "");
		let u = n ? 12 * e.context.selectedYear + e.context.selectedMonth + o - n.month : -1;
		if (n && u >= 0 && u < n.count) return;
		if (r.textContent = "", a(e), e.context.currentType === "week") return s?.dates(e, r), l?.(r), void (s == null || s.numbers(e, 0, 7, c[o], r));
		let d = new Date(i);
		d.setMonth(d.getMonth() + o);
		let f = d.getMonth(), p = d.getFullYear(), m = (new Date(p, f, 1).getDay() - e.firstWeekday + 7) % 7, h = new Date(p, f + 1, 0).getDate(), g = m + h, _ = Math.ceil(g / 7), v = 7 * _ - g, y = [];
		for (let t = 0; t < _; t++) {
			let t = document.createElement("div");
			t.className = e.styles.datesRow, t.setAttribute("data-vc-dates", "row"), t.setAttribute("role", "row"), y.push(t);
		}
		let b = 0, x = 0, S = { addDate: (e) => {
			y[b].appendChild(e), x++, x >= 7 && (b++, x = 0);
		} };
		((e, t, n, r, i) => {
			let a = new Date(n, r, 0).getDate() - (i - 1), o = r === 0 ? n - 1 : n, s = r === 0 ? 12 : r < 10 ? `0${r}` : r;
			for (let r = i; r > 0; r--, a++) Ce(e, n, t, a, `${o}-${s}-${a}`, "prev");
		})(e, S, p, f, m), ((e, n, r, i, a) => {
			for (let o = 1; o <= r; o++) {
				let r = new Date(i, a, o);
				Ce(e, i, n, o, t(r), "current");
			}
		})(e, S, h, p, f), ((e, t, n, r, i) => {
			let a = i + 1 === 12 ? r + 1 : r, o = i + 1 === 12 ? "01" : i + 2 < 10 ? `0${i + 2}` : i + 2;
			for (let i = 1; i <= n; i++) {
				let n = `${a}-${o}-${i < 10 ? `0${i}` : String(i)}`;
				Ce(e, r, t, i, n, "next");
			}
		})(e, S, v, p, f);
		for (let e of y) r.appendChild(e);
		l?.(r), s?.numbers(e, m, h, c[o], r);
	}), I(e), r && be(e, n?.fullLayout);
}, Oe = (e, t) => `${fe(e, t === "Years" ? "year" : void 0)}  <div class="${k(e.styles.wrapper)}" data-vc="wrapper">\n    <div class="${k(e.styles.content)}" data-vc="content">\n      <#${t} />\n    </div>\n  </div>\n`, ke = (e) => Oe(e, "Months"), Ae = (e) => Oe(e, "Years"), je = (e, t, n) => e.labels["arrow" + (t === "prev" ? "Prev" : "Next")][n], Me = {
	ArrowNext: (e, t) => `<button type="button" class="${k(e.styles.arrowNext)}" data-vc-arrow="next" aria-label="${k(je(e, "next", t))}"></button>`,
	ArrowPrev: (e, t) => `<button type="button" class="${k(e.styles.arrowPrev)}" data-vc-arrow="prev" aria-label="${k(je(e, "prev", t))}"></button>`,
	Dates: (e) => `<div class="${k(e.styles.dates)}" data-vc="dates" role="rowgroup" aria-label="${k(e.labels.dates)}"></div>`,
	Month: (e) => `<button type="button" class="${k(e.styles.month)}" data-vc="month"></button>`,
	Months: (e) => `<div class="${k(e.styles.months)}" data-vc="months" role="grid" aria-label="${k(e.labels.months)}"></div>`,
	Week: (e) => `<div class="${k(e.styles.week)}" data-vc="week" role="row" aria-label="${k(e.labels.week)}"></div>`,
	Year: (e) => `<button type="button" class="${k(e.styles.year)}" data-vc="year"></button>`,
	Years: (e) => `<div class="${k(e.styles.years)}" data-vc="years" role="grid" aria-label="${k(e.labels.years)}"></div>`
}, Ne = (e, t) => t.replace(/[\n\t]/g, "").replace(/<#(?!\/?Multiple)(.*?)>/g, (t, n) => {
	let r = (n.match(/\[(.*?)\]/) || [])[1], i = ((e, t) => t === "Collapse" ? d(e).weeks?.component : t === "WeekNumbers" ? d(e).weeks?.numbersComponent : t === "DateRangeTooltip" ? d(e).annotations?.component : t === "ControlTime" ? d(e).time?.component : Object.prototype.hasOwnProperty.call(Me, t) ? Me[t] : void 0)(e, n.replace(/[/\s\n\t]|\[(.*?)\]/g, "")), a = i ? i(e, r ?? null) : "";
	return e.sanitizerHTML(a);
}).replace(/[\n\t]/g, ""), R = (e, t) => {
	var n;
	let r = d(e), i = {
		default: pe,
		month: ke,
		year: Ae,
		multiple: r.months?.layout,
		week: r.weeks?.layout
	};
	var a;
	Object.keys(i).forEach((t) => {
		let n = t;
		e.layouts[n].length || (e.layouts[n] = i[n]?.call(i, e) ?? "");
	}), e.context.mainElement.className = e.styles.calendar, e.context.mainElement.dataset.vc = "calendar", e.context.mainElement.dataset.vcType = e.context.currentType, e.context.mainElement.toggleAttribute("data-vc-swipe", e.enableSwipe), e.context.mainElement.role = e.inputMode ? "dialog" : "group", e.context.mainElement.tabIndex = -1, e.context.mainElement.ariaLabel = e.labels.application, (n = r.months) != null && n.render(e, t) || ((a = r.time) == null || a.destroy(e), e.context.mainElement.innerHTML = e.sanitizerHTML(Ne(e, e.layouts[e.context.currentType]))), ((e) => {
		let t = ["multiple", "multiple-ranged"].includes(String(e.selectionDatesMode));
		e.context.mainElement.querySelectorAll("[data-vc=\"content\"][role=\"grid\"]").forEach((e) => {
			t ? e.setAttribute("aria-multiselectable", "true") : e.removeAttribute("aria-multiselectable");
		});
	})(e);
}, Pe = (e, t, n, r) => {
	e.style.visibility = n ? "hidden" : "", t.style.visibility = r ? "hidden" : "";
}, z = (n) => {
	if (n.context.currentType === "month") return;
	let r = n.context.mainElement.querySelector("[data-vc-arrow=\"prev\"]"), i = n.context.mainElement.querySelector("[data-vc-arrow=\"next\"]");
	r && i && {
		default: () => ((n, r, i) => {
			let a = e(t(new Date(n.context.selectedYear, n.context.selectedMonth, 1))), o = new Date(a.getTime()), s = new Date(a.getTime());
			o.setMonth(o.getMonth() - n.monthsToSwitch), s.setMonth(s.getMonth() + n.monthsToSwitch);
			let c = e(n.context.dateMin), l = e(n.context.dateMax);
			n.selectionYearsMode || (c.setFullYear(a.getFullYear()), l.setFullYear(a.getFullYear())), Pe(r, i, !n.selectionMonthsMode || o.getFullYear() < c.getFullYear() || o.getFullYear() === c.getFullYear() && o.getMonth() < c.getMonth(), !n.selectionMonthsMode || s.getFullYear() > l.getFullYear() || s.getFullYear() === l.getFullYear() && s.getMonth() > l.getMonth() - (n.context.displayMonthsCount - 1));
		})(n, r, i),
		year: () => ((t, n, r) => {
			let i = e(t.context.dateMin), a = e(t.context.dateMax);
			Pe(n, r, !!(i.getFullYear() && t.context.displayYear - 7 <= i.getFullYear()), !!(a.getFullYear() && t.context.displayYear + 7 >= a.getFullYear()));
		})(n, r, i),
		week: () => d(n).weeks?.arrows(n, r, i)
	}[n.context.currentType === "multiple" ? "default" : n.context.currentType]();
}, B = (e, t) => {
	let n = e.context.mainElement.querySelectorAll("[data-vc=\"month\"]"), r = e.context.mainElement.querySelectorAll("[data-vc=\"year\"]"), i = new Date(e.context.selectedYear, e.context.selectedMonth, 1);
	[n, r].forEach((n) => n?.forEach((n, r) => {
		(!t || t.includes(r)) && ((e, t, n, r, i) => {
			let a = new Date(r.setFullYear(e.context.selectedYear, e.context.selectedMonth + n)).getFullYear(), o = new Date(r.setMonth(e.context.selectedMonth + n)).getMonth(), s = e.context.locale.months.long[o], c = t.closest("[data-vc=\"column\"]");
			c && (c.ariaLabel = `${s} ${a}`);
			let l = {
				month: {
					id: o,
					label: s
				},
				year: {
					id: a,
					label: a
				}
			};
			t.innerText = String(l[i].label), t.dataset[`vc${i.charAt(0).toUpperCase() + i.slice(1)}`] = String(l[i].id), t.ariaLabel = `${e.labels[i]} ${l[i].label}`;
			let u = {
				month: e.selectionMonthsMode,
				year: e.selectionYearsMode
			}, d = !1 === u[i] || u[i] === "only-arrows";
			d && (t.tabIndex = -1), t.disabled = d;
		})(e, n, r, i, n.dataset.vc);
	}));
}, Fe = (e, t, n, r, i) => {
	let a = {
		month: {
			selected: "data-vc-months-month-selected",
			aria: "aria-selected",
			value: "vcMonthsMonth",
			selectedProperty: "selectedMonth"
		},
		year: {
			selected: "data-vc-years-year-selected",
			aria: "aria-selected",
			value: "vcYearsYear",
			selectedProperty: "selectedYear"
		}
	};
	var o, s;
	i && ((o = e.context.mainElement.querySelectorAll({
		month: "[data-vc-months-month]",
		year: "[data-vc-years-year]"
	}[n])) == null || o.forEach((e) => {
		var t;
		e.removeAttribute(a[n].selected), (t = e.parentElement) == null || t.removeAttribute(a[n].aria);
	}), _(e, a[n].selectedProperty, Number(t.dataset[a[n].value])), B(e), n === "year" && z(e)), r && (t.setAttribute(a[n].selected, ""), (s = t.parentElement) == null || s.setAttribute(a[n].aria, "true"));
}, Ie = (e, t, n, r, i, a, o, s) => {
	let c = t === "month" ? "months" : "years", l = document.createElement("div");
	l.className = e.styles[`${c}Cell`], l.setAttribute(`data-vc-${c}`, "cell"), l.role = "gridcell";
	let u = n.cloneNode(!1);
	return u.className = e.styles[t === "month" ? "monthsMonth" : "yearsYear"], u.innerText = o, u.ariaLabel = s, u.setAttribute(`data-vc-${c}-${t}`, String(a)), i && (u.ariaDisabled = "true"), i && (u.tabIndex = -1), u.disabled = i, l.appendChild(u), Fe(e, u, t, r === a, !1), l;
}, Le = (e, t) => d(e).months?.column(e, t) ?? {
	currentValue: null,
	columnID: 0
}, Re = (t, n) => {
	var r;
	let i = n == null || (r = n.closest("[data-vc=\"header\"]")) == null ? void 0 : r.querySelector("[data-vc=\"year\"]"), a = i ? Number(i.dataset.vcYear) : t.context.selectedYear, o = n != null && n.dataset.vcMonth ? Number(n.dataset.vcMonth) : t.context.selectedMonth;
	_(t, "currentType", "month"), R(t, n), B(t);
	let s = t.context.mainElement.querySelector("[data-vc=\"months\"]");
	if (!t.selectionMonthsMode || !s) return;
	let c = t.monthsToSwitch > 1 ? t.context.locale.months.long.map((e, n) => o - t.monthsToSwitch * n).concat(t.context.locale.months.long.map((e, n) => o + t.monthsToSwitch * n)).filter((e) => e >= 0 && e <= 12) : Array.from(Array(12).keys()), l = document.createElement("button");
	l.type = "button";
	let u, d = () => ({
		min: e(t.context.dateMin),
		max: e(t.context.dateMax),
		monthCount: t.context.displayMonthsCount - 1,
		columnID: Le(t, "month").columnID
	}), f = t.onCreateMonthEls ? void 0 : d();
	for (let e = 0; e < 12; e++) {
		e % 4 == 0 && (u = document.createElement("div"), u.className = t.styles.monthsRow, u.dataset.vcMonths = "row", u.role = "row", s.appendChild(u));
		let { min: n, max: r, monthCount: i, columnID: p } = f ?? d(), m = Ie(t, "month", l, o, a <= n.getFullYear() && e < n.getMonth() + p || a >= r.getFullYear() && e > r.getMonth() - i + p || a > r.getFullYear() || e !== o && !c.includes(e), e, t.context.locale.months.short[e], t.context.locale.months.long[e]);
		u?.appendChild(m), t.onCreateMonthEls && t.onCreateMonthEls(t, m);
	}
	I(t);
}, V = (e) => {
	let t = e.selectedWeekends ? [...e.selectedWeekends] : [], n = [...e.context.locale.weekdays.long].map((n, r) => ({
		id: r,
		titleShort: e.context.locale.weekdays.short[r],
		titleLong: n,
		isWeekend: t.includes(r)
	})), r = [...n.slice(e.firstWeekday), ...n.slice(0, e.firstWeekday)], i = d(e).weeks?.weekday(e), a = document.createElement(i ? "div" : "b");
	e.context.mainElement.querySelectorAll("[data-vc=\"week\"]").forEach((t) => {
		r.forEach((n) => {
			let r = a.cloneNode(!1);
			r.className = e.styles.weekDay, r.role = "columnheader", r.ariaLabel = n.titleLong, r.dataset.vcWeekDay = String(n.id), n.isWeekend && (r.dataset.vcWeekDayOff = ""), i ? i(r, n.titleShort, n.titleLong) : r.innerText = n.titleShort, t.appendChild(r);
		});
	});
}, H = (t, n) => {
	let r = n != null && n.dataset.vcYear ? Number(n.dataset.vcYear) : t.context.selectedYear;
	_(t, "currentType", "year"), R(t, n), B(t), z(t);
	let i = t.context.mainElement.querySelector("[data-vc=\"years\"]");
	if (!t.selectionYearsMode || !i) return;
	let a = t.type === "multiple" ? t.context.selectedYear === r ? 0 : 1 : 0, o = document.createElement("button");
	o.type = "button";
	let s, c = () => [e(t.context.dateMin).getFullYear(), e(t.context.dateMax).getFullYear()], l = t.onCreateYearEls ? void 0 : c();
	for (let e = t.context.displayYear - 7; e < t.context.displayYear + 8; e++) {
		(e - (t.context.displayYear - 7)) % 5 == 0 && (s = document.createElement("div"), s.className = t.styles.yearsRow, s.dataset.vcYears = "row", s.role = "row", i.appendChild(s));
		let [n, u] = l ?? c(), d = Ie(t, "year", o, r, e < n + a || e > u, e, String(e), String(e));
		s?.appendChild(d), t.onCreateYearEls && t.onCreateYearEls(t, d);
	}
	I(t);
}, U = /* @__PURE__ */ new WeakMap(), ze = (e) => {
	var t, n;
	let r = window.matchMedia("(prefers-color-scheme)").media !== "not all";
	var i, a;
	if (!r || e.selectedTheme !== "system") return (i = (a = e.context).cleanupSystemTheme) == null || i.call(a), void (e.context.mainElement.dataset.vcTheme = r ? e.selectedTheme : "light");
	let o = e.themeAttrDetect.length ? document.querySelector(e.themeAttrDetect) : null, s = e.themeAttrDetect.replace(/^.*\[(.+)\]/g, (e, t) => t), c = U.get(e);
	if (c?.element === o && c.attr === s) return void c.update();
	(t = (n = e.context).cleanupSystemTheme) == null || t.call(n);
	let l, u = window.matchMedia("(prefers-color-scheme: dark)"), d = () => {
		let t = o?.getAttribute(s), n = !t || t === "system";
		e.context.mainElement.dataset.vcTheme = n ? u.matches ? "dark" : "light" : t, n && !l ? u.addEventListener ? (u.addEventListener("change", d), l = () => u.removeEventListener("change", d)) : (u.addListener(d), l = () => u.removeListener(d)) : !n && l && (l(), l = void 0);
	}, f = o ? ((e, t, n) => {
		let r = new MutationObserver((e) => {
			for (let r = 0; r < e.length; r++) if (e[r].attributeName === t) {
				n();
				break;
			}
		});
		return r.observe(e, {
			attributes: !0,
			attributeFilter: [t]
		}), () => r.disconnect();
	})(o, s, d) : void 0;
	U.set(e, {
		element: o,
		attr: s,
		update: d
	}), _(e, "cleanupSystemTheme", () => {
		f?.(), l?.(), U.delete(e), _(e, "cleanupSystemTheme", void 0);
	}), d();
};
function W(e) {
	return W = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, W(e);
}
function G(e, t, n) {
	return (t = function(e) {
		var t = function(e) {
			if (W(e) != "object" || !e) return e;
			var t = e[Symbol.toPrimitive];
			if (t !== void 0) {
				var n = t.call(e, "string");
				if (W(n) != "object") return n;
				throw TypeError("@@toPrimitive must return a primitive value.");
			}
			return String(e);
		}(e);
		return W(t) == "symbol" ? t : t + "";
	}(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
function Be(e, t) {
	var n = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var r = Object.getOwnPropertySymbols(e);
		t && (r = r.filter(function(t) {
			return Object.getOwnPropertyDescriptor(e, t).enumerable;
		})), n.push.apply(n, r);
	}
	return n;
}
function K(e) {
	for (var t = 1; t < arguments.length; t++) {
		var n = arguments[t] == null ? {} : arguments[t];
		t % 2 ? Be(Object(n), !0).forEach(function(t) {
			G(e, t, n[t]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Be(Object(n)).forEach(function(t) {
			Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
		});
	}
	return e;
}
var q = /* @__PURE__ */ new Map(), J = (e, t, n) => {
	let r = new Intl.DateTimeFormat(e, {
		[t]: n,
		timeZone: "UTC"
	});
	return Array.from({ length: t === "weekday" ? 7 : 12 }, (e, n) => {
		return (i = r.format(new Date(Date.UTC(1978, t === "month" ? n : 0, t === "weekday" ? n + 1 : 1)))).charAt(0).toUpperCase() + i.slice(1).replace(/\./, "");
		var i;
	});
}, Ve = (e) => {
	if (e.context.locale.weekdays.short[6] && e.context.locale.weekdays.long[6] && e.context.locale.months.short[11] && e.context.locale.months.long[11]) return;
	if (typeof e.locale != "string") {
		var t, n, r, i;
		if (!((t = e.locale) != null && (t = t.weekdays) != null && t.short[6] && (n = e.locale) != null && (n = n.weekdays) != null && n.long[6] && (r = e.locale) != null && (r = r.months) != null && r.short[11] && (i = e.locale) != null && (i = i.months) != null && i.long[11])) throw Error(de);
		_(e, "locale", K({}, e.locale));
		return;
	}
	if (typeof e.locale == "string" && !e.locale.length) throw Error(de);
	let a = q.get(e.locale);
	a || (a = {
		weekdays: {
			short: J(e.locale, "weekday", "short"),
			long: J(e.locale, "weekday", "long")
		},
		months: {
			short: J(e.locale, "month", "short"),
			long: J(e.locale, "month", "long")
		}
	}, q.size >= 8 && q.delete(q.keys().next().value), q.set(e.locale, a));
	for (let t of ["weekdays", "months"]) for (let n of ["short", "long"]) e.context.locale[t][n].push(...a[t][n]);
}, He = (e, t = !0) => {
	var n;
	M(e), ze(e), Ve(e), R(e), B(e), z(e), (n = d(e).time) == null || n.render(e), {
		default: () => {
			V(e), L(e, void 0, !1);
		},
		multiple: () => {
			V(e), L(e, void 0, !1);
		},
		week: () => {
			var t;
			(t = d(e).weeks) == null || t.init(e), V(e), L(e, void 0, !1);
		},
		month: () => Re(e),
		year: () => H(e)
	}[e.context.currentType](), t && be(e, !0);
}, Y = (t, n = !1) => {
	a(t), t.context.mainElement.querySelectorAll("[data-vc-date]").forEach((r) => {
		let i = r.querySelector("[data-vc-date-btn]"), a = r.dataset.vcDate, o = e(a), s = o.getDay();
		n && Se(t, a, s);
		let c = n ? r.dataset.vcDateMonth : "current";
		c === "prev" && o.setMonth(o.getMonth() + 1, 1), c === "next" && o.setMonth(o.getMonth() - 1, 1), xe(t, n ? o.getFullYear() : t.context.selectedYear, r, i, s, a, c);
	}), I(t);
}, Ue = (e) => {
	let t = [
		{
			container: "[data-vc=\"dates\"]",
			row: "[data-vc-dates=\"row\"]",
			item: "[data-vc-date-btn]"
		},
		{
			container: "[data-vc=\"months\"]",
			row: "[data-vc-months=\"row\"]",
			item: "[data-vc-months-month]"
		},
		{
			container: "[data-vc=\"years\"]",
			row: "[data-vc-years=\"row\"]",
			item: "[data-vc-years-year]"
		}
	], n = (e) => !e.disabled && e.getAttribute("aria-disabled") !== "true", r = (e) => {
		let r = e.target.closest("button");
		if (!r || ![
			"ArrowUp",
			"ArrowDown",
			"ArrowLeft",
			"ArrowRight"
		].includes(e.key)) return;
		let i, a = t.find((e) => r.matches(e.item)), o = a ? r.closest(a.container) : null;
		if (a && o && !o.closest("[data-vc-ghost]") && n(r)) {
			if (e.key === "ArrowUp" || e.key === "ArrowDown") i = ((e, t, r, i) => {
				var a;
				let o = r.closest(t.row);
				if (!o) return r;
				let s = Array.from(e.querySelectorAll(t.row)), c = s.indexOf(o), l = Array.from(o.children).indexOf(r.parentElement), u = s[c + i], d = u == null || (a = u.children[l]) == null ? void 0 : a.querySelector(t.item);
				return d && n(d) ? d : r;
			})(o, a, r, e.key === "ArrowUp" ? -1 : 1);
			else {
				let t = Array.from(o.querySelectorAll(a.item)).filter(n), s = t.indexOf(r);
				if (s === -1) return;
				i = e.key === "ArrowLeft" ? t[Math.max(0, s - 1)] : t[Math.min(t.length - 1, s + 1)];
			}
			e.preventDefault(), i?.focus();
		}
	};
	return e.context.mainElement.addEventListener("keydown", r), e.context.mainElement.addEventListener("focusin", De), () => {
		e.context.mainElement.removeEventListener("keydown", r), e.context.mainElement.removeEventListener("focusin", De);
	};
}, We = "[data-vc=\"dates\"]", Ge = (e, t) => e === "next" ? t : -t, Ke = (n) => {
	let r = {
		selector: We,
		shift: (r) => ((n, r) => {
			let i = e(t(new Date(n.context.selectedYear, n.context.selectedMonth, 1)));
			i.setMonth(i.getMonth() + Ge(r, n.monthsToSwitch)), _(n, "selectedMonth", i.getMonth()), _(n, "selectedYear", i.getFullYear());
		})(n, r),
		render: (e, t) => L(n, t)
	};
	return {
		default: r,
		multiple: r,
		week: {
			selector: We,
			shift: (e) => d(n).weeks?.shift(n, e),
			render: () => L(n)
		},
		year: {
			selector: "[data-vc=\"years\"]",
			shift: (e) => _(n, "displayYear", n.context.displayYear + Ge(e, 15)),
			render: (e) => H(n, e)
		},
		month: null
	}[n.context.currentType];
}, qe = (e, t, n) => {
	let r = Ke(e);
	if (!r) return;
	let { mainElement: i } = e.context, a = i.contains(C(i).activeElement), o = e.context.currentType === "multiple" ? ye(e, !0) : void 0;
	M(e), r.shift(t);
	let s = o ? d(e).months?.rotate(e, o) : void 0;
	s || (o = void 0), B(e, s), z(e);
	let c = d(e).motion;
	c && e.animation ? c.navigate(e, r.selector, t, () => r.render(n, o)) : r.render(n, o), ((e, t, n) => {
		var r;
		let { mainElement: i } = e.context;
		if (!n || i.contains(C(i).activeElement)) return;
		let a = i.querySelector(`[data-vc-arrow="${t}"]`);
		if (a && a.style.visibility !== "hidden") return a.focus();
		(r = Array.from(i.querySelectorAll("[tabindex=\"0\"]")).find((e) => !e.closest("[data-vc-ghost]"))) == null || r.focus();
	})(e, t, a);
}, Je = (e, t, n) => {
	let r = t.dataset.vcDate, i = t.closest("[data-vc-date][data-vc-date-selected]"), a = y(e);
	(!i || a) && _(e, "selectedDates", i ? e.context.selectedDates.filter((e) => e !== r) : n ? [...e.context.selectedDates, r] : [r]);
}, Ye = ["month", "year"], Xe = "[data-vc=\"column\"]", Ze = (e, t, n) => {
	let r = d(e).motion;
	r && e.animation ? r.changeView(e, t, n) : n();
}, Qe = (e, t) => {
	var n;
	let { columnID: r } = Le(e, e.context.currentType);
	_(e, "currentType", e.type), Ze(e, r, () => He(e)), (n = e.context.mainElement.querySelector(`[data-vc="${t}"]`)) == null || n.focus();
}, $e = (e) => {
	let t = (t) => {
		var n, r;
		((e, t) => {
			let n = t.target, r = n.closest("[data-vc-arrow]");
			r && (qe(e, r.dataset.vcArrow, n), e.onClickArrow && e.onClickArrow(e, t));
		})(e, t), (n = d(e).weeks) == null || n.click(e, t), ((e, t) => {
			let n = t.target, r = n.closest("[data-vc-date-btn]");
			if (!e.selectionDatesMode || ![
				"single",
				"multiple",
				"multiple-ranged"
			].includes(e.selectionDatesMode) || !r) return;
			let i = r.closest("[data-vc-date]");
			({
				single: () => Je(e, i, !1),
				multiple: () => Je(e, i, !0),
				"multiple-ranged": () => S(e, i)
			})[e.selectionDatesMode](), e.context.selectedDates && b(e.context.selectedDates), e.onClickDate && e.onClickDate(e, t), e.inputMode && e.context.inputElement && e.context.mainElement && e.onChangeToInput && e.onChangeToInput(e, t);
			let a = n.closest("[data-vc-date-month=\"prev\"]"), o = n.closest("[data-vc-date-month=\"next\"]");
			({
				prev: () => e.enableMonthChangeOnDayClick ? qe(e, "prev") : Y(e),
				next: () => e.enableMonthChangeOnDayClick ? qe(e, "next") : Y(e),
				current: () => Y(e)
			})[a ? "prev" : o ? "next" : "current"]();
		})(e, t), ((e, t) => {
			let n = {
				month: e.selectionMonthsMode,
				year: e.selectionYearsMode
			};
			Ye.forEach((r) => {
				n[r] && t.target && ((e, t, n) => {
					let r = t.target, i = r.closest(`[data-vc="${n}"]`), a = ((e, t) => {
						let n = t.closest(Xe);
						return n ? Array.from(e.context.mainElement.querySelectorAll(Xe)).indexOf(n) : 0;
					})(e, r), o = {
						year: () => Ze(e, a, () => H(e, r)),
						month: () => Ze(e, a, () => Re(e, r))
					};
					if (i && e.onClickTitle && e.onClickTitle(e, t), i && e.context.currentType !== n) {
						let t = r.closest(Xe);
						return o[n](), ((e, t, n) => (n ?? e.context.mainElement).querySelector(`[data-vc-${t}s-${t}][tabindex="0"]`)?.focus())(e, n, t);
					}
					let s = r.closest(`[data-vc-${n}s-${n}]`);
					if (s) return ((e, t, n, r) => {
						({
							year: () => {
								if (e.type === "multiple") return d(e).months?.select(e, "year", r);
								_(e, "selectedYear", Number(r.dataset.vcYearsYear));
							},
							month: () => {
								if (e.type === "multiple") return d(e).months?.select(e, "month", r);
								_(e, "selectedMonth", Number(r.dataset.vcMonthsMonth));
							}
						})[n](), {
							year: () => e.onClickYear?.call(e, e, t),
							month: () => e.onClickMonth?.call(e, e, t)
						}[n](), e.context.currentType === e.type ? Fe(e, r, n, !0, !0) : Qe(e, n);
					})(e, t, n, s);
					let c = r.closest("[data-vc=\"grid\"]"), l = r.closest("[data-vc=\"column\"]");
					(e.context.currentType === n && i || e.type === "multiple" && e.context.currentType === n && c && !l) && Qe(e, n);
				})(e, t, r);
			});
		})(e, t), (r = d(e).weeks) == null || r.collapseClick(e, t);
	};
	return e.context.mainElement.addEventListener("click", t), () => e.context.mainElement.removeEventListener("click", t);
}, et = /* @__PURE__ */ new WeakMap(), tt = (e, t) => {
	let r = e[t].map((e) => e instanceof Date ? e.getTime() : e), i = et.get(e), a = i?.[t];
	if (a && r.length === a.values.length) {
		let e = 0;
		for (; e < r.length && r[e] === a.values[e];) e++;
		if (e === r.length && a.timezone === new Intl.DateTimeFormat().resolvedOptions().timeZone) return a.dates.slice();
	}
	let o = n(e[t]);
	if (o.length > 1 && b(o), o.length > 128 && o.length <= 1e4 && r.length <= 1e4) {
		let n = i ?? {};
		n[t] = {
			values: r,
			dates: o.slice(),
			timezone: new Intl.DateTimeFormat().resolvedOptions().timeZone
		}, et.set(e, n);
	} else i && delete i[t];
	return o;
}, X = (e, t) => e === "today" ? (() => {
	let e = /* @__PURE__ */ new Date();
	/* @__PURE__ */
	return (/* @__PURE__ */ new Date(e.getTime() - 6e4 * e.getTimezoneOffset())).toISOString().substring(0, 10);
})() : e instanceof Date || typeof e == "number" || typeof e == "string" ? n([e])[0] : t, nt = (e, t, n) => {
	_(e, "selectedMonth", t), _(e, "selectedYear", n), _(e, "displayYear", n);
}, rt = (t) => {
	var r, i;
	if (t.enableCollapse && !["default", "week"].includes(t.type)) throw Error("The «enableCollapse» parameter is only supported by the «default» and «week» calendar types.");
	_(t, "currentType", t.type), ((e) => {
		if (e.type === "multiple" && (e.displayMonthsCount <= 1 || e.displayMonthsCount > 12) || e.type !== "multiple" && e.displayMonthsCount > 1) throw Error("For the «multiple» calendar type, the «displayMonthsCount» parameter can have a value from 2 to 12, and for all others it cannot be greater than 1.");
		_(e, "displayMonthsCount", e.displayMonthsCount ? e.displayMonthsCount : e.type === "multiple" ? 2 : 1);
	})(t), ((t) => {
		var n, r, i;
		let a = X(t.dateMin, t.dateMin), o = X(t.dateMax, t.dateMax), s = X(t.displayDateMin, a), c = X(t.displayDateMax, o);
		if (_(t, "dateToday", X(t.dateToday, t.dateToday)), _(t, "displayDateMin", s ? e(a) >= e(s) ? a : s : a), _(t, "displayDateMax", c ? e(o) <= e(c) ? o : c : o), _(t, "displayDateMin", t.disableDatesPast && !t.disableAllDates && e(s) < e(t.context.dateToday) || t.disableAllDates ? t.context.dateToday : s), _(t, "displayDateMax", t.disableAllDates ? t.context.dateToday : c), _(t, "disableDates", t.disableDates[0] && !t.disableAllDates ? tt(t, "disableDates") : t.disableAllDates ? [t.context.displayDateMin] : []), _(t, "enableDates", t.enableDates[0] ? tt(t, "enableDates") : []), (n = t.context.enableDates) != null && n[0] && (r = t.context.disableDates) != null && r[0]) {
			let e = new Set(t.context.enableDates);
			_(t, "disableDates", t.context.disableDates.filter((t) => !e.has(t)));
		}
		(i = t.context.enableDates) != null && i[0] && t.disableAllDates && (_(t, "displayDateMin", t.context.enableDates[0]), _(t, "displayDateMax", t.context.enableDates[t.context.enableDates.length - 1])), _(t, "dateMin", t.displayDisabledDates ? a : t.context.displayDateMin), _(t, "dateMax", t.displayDisabledDates ? o : t.context.displayDateMax);
	})(t), ((t) => {
		var r;
		if (t.enableJumpToSelectedDate && (r = t.selectedDates) != null && r[0] && t.selectedMonth === void 0 && t.selectedYear === void 0) {
			let r = e(n(t.selectedDates)[0]);
			nt(t, r.getMonth(), r.getFullYear());
			return;
		}
		if (((t) => {
			let r = (e) => {
				let n = new Date(e);
				nt(t, n.getMonth(), n.getFullYear());
			};
			return t.displayDateMin && t.displayDateMin !== "today" && (i = t.displayDateMin, a = /* @__PURE__ */ new Date(), new Date(i).getTime() > a.getTime()) ? (r(e(X(t.selectedDates.length && t.selectedDates[0] ? n(t.selectedDates)[0] : t.displayDateMin, t.displayDateMin))), !0) : !(!t.displayDateMax || t.displayDateMax === "today" || !((e, t) => new Date(e).getTime() < t.getTime())(t.displayDateMax, /* @__PURE__ */ new Date()) || (r(e(X(t.selectedDates.length && t.selectedDates[0] ? n(t.selectedDates)[0] : t.displayDateMax, t.displayDateMax))), 0));
			var i, a;
		})(t)) return;
		let i = t.selectedMonth !== void 0 && Number(t.selectedMonth) >= 0 && Number(t.selectedMonth) < 12, a = t.selectedYear !== void 0 && Number(t.selectedYear) >= 0 && Number(t.selectedYear) <= 9999;
		nt(t, i ? Number(t.selectedMonth) : e(t.context.dateToday).getMonth(), a ? Number(t.selectedYear) : e(t.context.dateToday).getFullYear());
	})(t), ((e) => {
		var t;
		_(e, "selectedDates", (t = e.selectedDates) != null && t[0] ? n(e.selectedDates) : []);
	})(t), (r = d(t).weeks) == null || r.init(t), (i = d(t).time) == null || i.init(t);
}, it = (e, { year: t, month: n, dates: r, time: i, locale: a }, o = !0, s) => {
	var c, l, u, f;
	M(e);
	let p = d(e);
	(c = p.motion) == null || c.reset(e), (l = p.time) == null || l.destroy(e), (u = p.annotations) == null || u.destroy(e), x(e);
	let m = {
		year: e.selectedYear,
		month: e.selectedMonth,
		dates: e.selectedDates,
		time: e.selectedTime
	};
	var h;
	e.selectedYear = t ? m.year : e.context.selectedYear, e.selectedMonth = n ? m.month : e.context.selectedMonth, e.selectedTime = i ? m.time : e.context.selectedTime, e.selectedDates = r === "only-first" && (f = e.context.selectedDates) != null && f[0] ? [e.context.selectedDates[0]] : !0 === r ? m.dates : e.context.selectedDates, a && _(e, "locale", {
		months: {
			short: [],
			long: []
		},
		weekdays: {
			short: [],
			long: []
		}
	}), rt(e), o && (s && Ve(e), s && s.structure === _e(e) ? (ze(e), (h = p.time) == null || h.render(e), Y(e, !0)) : He(e, !1)), e.selectedYear = m.year, e.selectedMonth = m.month, e.selectedDates = m.dates, e.selectedTime = m.time, e.selectionDatesMode === "multiple-ranged" && S(e, null, !!r), o && be(e, !0);
}, at = (e, t, n) => {
	if (!e.context.isInit) throw Error(ue);
	f(e), it(e, K(K({}, {
		year: !0,
		month: !0,
		dates: !0,
		time: !0,
		locale: !0
	}), t), !(e.inputMode && !e.context.inputModeInit), n), e.onUpdate && e.onUpdate(e);
}, ot = [
	"extensions",
	"context",
	"init",
	"update",
	"destroy",
	"show",
	"hide",
	"set",
	"queryAndMemoize"
], st = (e, t, n = !0) => {
	let r = Object.keys(t);
	for (let i = 0; i < r.length; i++) {
		let a = r[i];
		a !== "__proto__" && a !== "constructor" && a !== "prototype" && (n && ot.includes(String(a)) || (typeof e[a] != "object" || e[a] === null || typeof t[a] != "object" || t[a] === null || t[a] instanceof Date || Array.isArray(t[a]) ? t[a] !== void 0 && (e[a] = t[a]) : st(e[a], t[a], !1)));
	}
}, ct = {
	application: "Calendar",
	navigation: "Calendar Navigation",
	arrowNext: {
		month: "Next month",
		year: "Next list of years",
		week: "Next week"
	},
	arrowPrev: {
		month: "Previous month",
		year: "Previous list of years",
		week: "Previous week"
	},
	month: "Select month, current selected month:",
	months: "List of months",
	year: "Select year, current selected year:",
	years: "List of years",
	week: "Days of the week",
	weekNumber: "Numbers of weeks in a year",
	collapse: "Collapse to a single week",
	expand: "Expand to the whole month",
	dates: "Dates in the current month",
	selectingTime: "Selecting a time ",
	inputHour: "Hours",
	inputMinute: "Minutes",
	rangeHour: "Slider for selecting hours",
	rangeMinute: "Slider for selecting minutes",
	btnKeeping: "Switch AM/PM, current position:"
}, lt = {
	calendar: "vc",
	controls: "vc-controls",
	grid: "vc-grid",
	column: "vc-column",
	header: "vc-header",
	headerContent: "vc-header__content",
	month: "vc-month",
	year: "vc-year",
	arrowPrev: "vc-arrow vc-arrow_prev",
	arrowNext: "vc-arrow vc-arrow_next",
	wrapper: "vc-wrapper",
	content: "vc-content",
	months: "vc-months",
	monthsRow: "vc-months__row",
	monthsCell: "vc-months__cell",
	monthsMonth: "vc-months__month",
	years: "vc-years",
	yearsRow: "vc-years__row",
	yearsCell: "vc-years__cell",
	yearsYear: "vc-years__year",
	week: "vc-week",
	weekDay: "vc-week__day",
	weekDayBtn: "vc-week__day-btn",
	weekNumbers: "vc-week-numbers",
	weekNumbersTitle: "vc-week-numbers__title",
	weekNumbersContent: "vc-week-numbers__content",
	weekNumber: "vc-week-number",
	collapse: "vc-collapse",
	dates: "vc-dates",
	datesRow: "vc-dates__row",
	date: "vc-date",
	dateBtn: "vc-date__btn",
	datePopup: "vc-date__popup",
	dateRangeTooltip: "vc-date-range-tooltip",
	time: "vc-time",
	timeContent: "vc-time__content",
	timeHour: "vc-time__hour",
	timeMinute: "vc-time__minute",
	timeKeeping: "vc-time__keeping",
	timeRanges: "vc-time__ranges",
	timeRange: "vc-time__range"
}, ut = class {
	constructor() {
		G(this, "type", "default"), G(this, "inputMode", !1), G(this, "openOnFocus", !0), G(this, "positionToInput", "left"), G(this, "animation", !1), G(this, "firstWeekday", 1), G(this, "monthsToSwitch", 1), G(this, "themeAttrDetect", "html[data-theme]"), G(this, "locale", "en"), G(this, "dateToday", "today"), G(this, "dateMin", "1970-01-01"), G(this, "dateMax", "2470-12-31"), G(this, "displayDateMin", void 0), G(this, "displayDateMax", void 0), G(this, "displayDatesOutside", !0), G(this, "displayDisabledDates", !1), G(this, "displayMonthsCount", void 0), G(this, "disableDates", []), G(this, "disableAllDates", !1), G(this, "disableDatesPast", !1), G(this, "disableDatesGaps", !1), G(this, "disableWeekdays", []), G(this, "disableToday", !1), G(this, "enableDates", []), G(this, "enableEdgeDatesOnly", !0), G(this, "enableDateToggle", !0), G(this, "enableWeekNumbers", !1), G(this, "enableMonthChangeOnDayClick", !0), G(this, "enableJumpToSelectedDate", !1), G(this, "enableCollapse", !1), G(this, "enableSwipe", !1), G(this, "selectionDatesMode", "single"), G(this, "selectionMonthsMode", !0), G(this, "selectionYearsMode", !0), G(this, "selectionTimeMode", !1), G(this, "selectedDates", []), G(this, "selectedMonth", void 0), G(this, "selectedYear", void 0), G(this, "selectedHolidays", []), G(this, "selectedWeekends", [0, 6]), G(this, "selectedTime", void 0), G(this, "selectedTheme", "system"), G(this, "timeMinHour", 0), G(this, "timeMaxHour", 23), G(this, "timeMinMinute", 0), G(this, "timeMaxMinute", 59), G(this, "timeControls", "all"), G(this, "timeStepHour", 1), G(this, "timeStepMinute", 1), G(this, "sanitizerHTML", me), G(this, "onClickDate", void 0), G(this, "onClickWeekDay", void 0), G(this, "onClickWeekNumber", void 0), G(this, "onClickTitle", void 0), G(this, "onClickMonth", void 0), G(this, "onClickYear", void 0), G(this, "onClickArrow", void 0), G(this, "onChangeTime", void 0), G(this, "onChangeToInput", void 0), G(this, "onCreateDateRangeTooltip", void 0), G(this, "onCreateDateEls", void 0), G(this, "onCreateMonthEls", void 0), G(this, "onCreateYearEls", void 0), G(this, "onInit", void 0), G(this, "onUpdate", void 0), G(this, "onDestroy", void 0), G(this, "onShow", void 0), G(this, "onHide", void 0), G(this, "popups", {}), G(this, "labels", K(K({}, ct), {}, {
			arrowNext: K({}, ct.arrowNext),
			arrowPrev: K({}, ct.arrowPrev)
		})), G(this, "layouts", {
			default: "",
			multiple: "",
			month: "",
			year: "",
			week: ""
		}), G(this, "styles", K({}, lt));
	}
}, dt = class e extends ut {
	constructor(t, n) {
		super(), G(this, "extensions", void 0), G(this, "init", () => ((e) => {
			var t;
			if (e.context.isInit) throw Error("The calendar has already been initialized, calling init() again is not allowed. Create a new Calendar instance instead.");
			if (f(e), _(e, "originalElement", e.context.mainElement.cloneNode(!0)), _(e, "isInit", !0), e.inputMode) {
				let t = ((e) => {
					_(e, "inputElement", e.context.mainElement);
					let t = e.context.inputElement;
					[
						"input",
						"button",
						"textarea"
					].includes(t.localName) && (t.setAttribute("aria-haspopup", "dialog"), (t.localName === "button" || t.getAttribute("role") === "combobox") && t.setAttribute("aria-expanded", "false"));
					let n = () => {
						e.context.inputModeInit ? ce(e) : ((e) => {
							var t;
							let n = document.createElement("div");
							n.className = e.styles.calendar, n.dataset.vc = "calendar", n.dataset.vcInput = "", n.dataset.vcCalendarHidden = "", Object.assign(n.style, {
								left: "0",
								top: "0"
							}), re(n);
							let r = C(e.context.mainElement), i = r === document ? document.body : r;
							_(e, "inputModeInit", !0), _(e, "isShowInInputMode", !1), _(e, "mainElement", n), i.appendChild(e.context.mainElement), it(e, {
								year: !0,
								month: !0,
								dates: !0,
								time: !0,
								locale: !0
							}), ce(e), e.onInit && e.onInit(e), e.context.isDestroyed || (Ue(e), (t = d(e).motion) == null || t.bind(e), $e(e));
						})(e);
					};
					e.context.inputElement.addEventListener("click", n);
					let r = typeof e.openOnFocus == "function" || !0 === e.openOnFocus, i = () => {
						((e) => w.has(e))(e) ? ((e) => {
							w.delete(e);
						})(e) : ((e) => v(e, e.openOnFocus))(e) && n();
					};
					r && e.context.inputElement.addEventListener("focus", i);
					let a = (t) => {
						let n = t.key === "Tab" && !t.shiftKey, r = [
							"ArrowUp",
							"ArrowDown",
							"ArrowLeft",
							"ArrowRight"
						].includes(t.key);
						(n || r) && ((t) => {
							if (!e.context.isShowInInputMode || C(e.context.mainElement).activeElement !== e.context.inputElement) return !1;
							let n = (e) => e.tabIndex >= 0 && !e.hasAttribute("disabled") && e.getAttribute("aria-disabled") !== "true", r = document.createTreeWalker(e.context.mainElement, NodeFilter.SHOW_ELEMENT, { acceptNode: (e) => n(e) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP }).nextNode() ?? (n(e.context.mainElement) ? e.context.mainElement : null);
							!r || r.tabIndex < 0 || (t.preventDefault(), r.focus());
						})(t);
					};
					return e.context.inputElement.addEventListener("keydown", a), () => {
						t.removeEventListener("click", n), r && t.removeEventListener("focus", i), t.removeEventListener("keydown", a);
					};
				})(e);
				return _(e, "cleanupInput", t), t;
			}
			if (rt(e), He(e), e.selectionDatesMode === "multiple-ranged" && e.context.selectedDates.length === 1 && (S(e, null), Y(e)), e.onInit && e.onInit(e), !e.context.isDestroyed) return Ue(e), (t = d(e).motion) == null || t.bind(e), $e(e);
		})(this)), G(this, "update", (e) => at(this, e)), G(this, "destroy", () => {
			let t = this.inputMode ? this.context.inputElement : this.context.mainElement;
			if (((e) => {
				var t, n, r, a, o, s, c, l;
				if (!e.context.isInit) throw Error(ue);
				if (e.context.isDestroyed) throw Error("The calendar has already been destroyed, calling destroy() again is not allowed.");
				j(e);
				let u = d(e);
				var f, p, m, h, g;
				(t = u.motion) == null || t.destroy(e), (n = u.time) == null || n.destroy(e), (r = u.annotations) == null || r.destroy(e), x(e), ((e) => {
					i.delete(e);
				})(e), O(e), (a = (o = e.context).cleanupInput) == null || a.call(o), _(e, "cleanupInput", void 0), (s = e.context.cleanupHandlers) == null || s.forEach((e) => e()), _(e, "cleanupHandlers", []), _(e, "isShowInInputMode", !1), (c = (l = e.context).cleanupSystemTheme) == null || c.call(l), e.inputMode ? (e.context.mainElement !== e.context.inputElement && ((m = e.context.mainElement.parentElement) == null || m.removeChild(e.context.mainElement)), (f = e.context.inputElement) == null || (p = f.replaceWith) == null || p.call(f, e.context.originalElement), _(e, "inputElement", void 0)) : (h = (g = e.context.mainElement).replaceWith) == null || h.call(g, e.context.originalElement), _(e, "mainElement", e.context.originalElement), _(e, "isDestroyed", !0), e.onDestroy && e.onDestroy(e);
			})(this), t) for (let [n, r] of e.memoizedElements) r === t && e.memoizedElements.delete(n);
		}), G(this, "show", () => le(this)), G(this, "hide", () => E(this)), G(this, "set", (e, t) => ((e, t, n) => {
			f(e, t);
			let r = Object.keys(t);
			t.extensions && r.splice(r.indexOf("extensions"), 1);
			let i = r.length === 1 && r[0] === "selectedDates" ? ye(e) : void 0;
			st(e, t), e.context.isInit && at(e, n, i);
		})(this, e, t)), G(this, "context", void 0), this.context = K(K({}, this.context), {}, { locale: {
			months: {
				short: [],
				long: []
			},
			weekdays: {
				short: [],
				long: []
			}
		} }), _(this, "mainElement", typeof t == "string" ? e.memoizedElements.get(t) ?? this.queryAndMemoize(t) : t);
		let r = n?.extensions;
		this.extensions = r != null && r.length ? Object.freeze(Array.from(new Set(r))) : u, ((e) => {
			if (!e.extensions.length) return;
			let t = {};
			for (let n of e.extensions) {
				let e = n, r = e.name;
				if (!s.includes(r)) throw Error("Unknown calendar extension.");
				if (t[r] && t[r] !== e) throw Error(`Conflicting calendar extension: ${r}.`);
				Object.assign(t, { [r]: e });
			}
			c.set(e, t);
		})(this), n && st(this, n);
	}
	queryAndMemoize(t) {
		let n = document.querySelector(t);
		if (!n) throw Error(((e) => `${e} is not found, check the first argument passed to new Calendar. If the element lives inside a Shadow DOM, a string selector can't reach it - resolve the element yourself (e.g. shadowRoot.querySelector(...)) and pass it directly instead.`)(t));
		return e.memoizedElements.set(t, n), n;
	}
};
G(dt, "memoizedElements", /* @__PURE__ */ new Map());
// resources/js/period-picker.js
var Z = (e) => e.split("-").map(Number), Q = (e, t, n) => new Date(e, t - 1, 1).toLocaleDateString("en-KE", { month: n }), $ = (e, t) => {
	let [n, r, i] = Z(e);
	return t === "year" ? String(n) : t === "month" ? `${Q(n, r, "long")} ${n}` : new Date(n, r - 1, i).toLocaleDateString("en-KE", {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}, ft = (e, t) => {
	let [n, r] = Z(e), [i, a] = Z(t);
	return n === i ? `${Q(n, r, "short")} – ${Q(i, a, "short")} ${i}` : `${Q(n, r, "short")} ${n} – ${Q(i, a, "short")} ${i}`;
}, pt = (e, t) => {
	let [n, r] = e.split(" to ");
	return !r || n === r ? $(n, t) : t === "month" ? ft(n, r) : `${$(n, t)} – ${$(r, t)}`;
};
document.addEventListener("alpine:init", () => {
	Alpine.data("periodPicker", (e) => {
		let t = {};
		return {
			value: e.period,
			presets: e.presets,
			from: "",
			to: "",
			open: !1,
			editing: null,
			popover: {},
			init() {
				this.syncDraft(), this.$watch("open", (e) => {
					this.editing = null, e && this.syncDraft();
				});
			},
			syncDraft() {
				let [e, t] = this.value.split(" to ");
				this.from = e || "", this.to = t || "";
			},
			get label() {
				return this.value ? pt(this.value, e.unit) : e.placeholder;
			},
			get draftLabel() {
				return !this.from && !this.to ? e.placeholder : this.to ? this.from ? pt(`${this.from} to ${this.to}`, e.unit) : `… – ${$(this.to, e.unit)}` : `${$(this.from, e.unit)} – …`;
			},
			summary(t) {
				return pt(t.value, e.unit);
			},
			get valid() {
				return this.from !== "" && this.to !== "" && this.to >= this.from;
			},
			get backwards() {
				return this.from !== "" && this.to !== "" && this.to < this.from;
			},
			isPicked(e) {
				return e.value === `${this.from} to ${this.to}`;
			},
			pick(e) {
				let [t, n] = e.value.split(" to ");
				this.from = t, this.to = n;
			},
			apply() {
				this.valid && (this.value = `${this.from} to ${this.to}`, this.open = !1, this.announce());
			},
			choose(e) {
				this.value = e, this.announce();
			},
			fieldLabel(t) {
				return this[t] ? $(this[t], e.unit) : "";
			},
			toggle(e, t) {
				if (this.editing === e) {
					this.editing = null;
					return;
				}
				let n = t.getBoundingClientRect(), r = Math.min(Math.max(n.width, 272), 320), i = Math.max(8, Math.min(n.left, window.innerWidth - r - 8)), a = window.innerHeight - n.bottom >= 340;
				this.popover = {
					left: i,
					width: r,
					...a ? { top: n.bottom + 4 } : { bottom: window.innerHeight - n.top + 4 }
				}, this.editing = e;
			},
			get popoverStyle() {
				return Object.fromEntries(Object.entries(this.popover).map(([e, t]) => [e, `${t}px`]));
			},
			chosen(e, t) {
				this[e] = t, this.editing = null, e === "value" && this.announce();
			},
			mountCalendar(n, r) {
				let i = this, a = e.unit === "month", o = new dt(n, {
					type: a ? "month" : "default",
					selectionDatesMode: "single",
					selectedTheme: "light",
					firstWeekday: 1,
					onClickDate(e) {
						let [t] = e.context.selectedDates;
						t && i.chosen(r, t);
					},
					onClickMonth(e) {
						if (!a) return;
						let t = String(e.context.selectedMonth + 1).padStart(2, "0");
						i.chosen(r, `${e.context.selectedYear}-${t}`);
					}
				});
				o.init(), t[r] = o, this.syncCalendar(r);
			},
			syncCalendar(n) {
				let r = this[n], [i, a] = [this.from, this.to], o = t[n];
				o && (e.unit === "month" ? r && o.set({
					selectedMonth: Z(r)[1] - 1,
					selectedYear: Z(r)[0]
				}, {
					month: !0,
					year: !0
				}) : o.set({
					selectedDates: r ? [r] : [],
					dateMin: n === "to" && i ? i : "1970-01-01",
					dateMax: n === "from" && a ? a : "2470-12-31"
				}, {
					dates: !0,
					month: !0,
					year: !0
				}));
			},
			announce() {
				this.$nextTick(() => this.$dispatch("period-changed", {
					name: e.name,
					value: this.value
				}));
			}
		};
	});
});
