// resources/js/searchable-select.js
var e = new Map(), t = 0, n = (e, t = {}) => window.__ ? window.__(e, t) : e, r = (e) => e.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim(), i = (e) => e.text.replace(/\s+/g, " ").trim(), a = (e) => {
	let t = null, n = [];
	for (let a of e.options) {
		if (a.hidden) continue;
		if (a.value === "" && t === null) {
			t = a;
			continue;
		}
		let e = a.parentElement instanceof HTMLOptGroupElement ? a.parentElement.label : null, o = i(a);
		n.push({
			option: a,
			text: o,
			group: e,
			haystack: r(`${o} ${a.dataset.search ?? ""} ${e ?? ""}`)
		});
	}
	return {
		placeholder: t,
		options: n
	};
}, o = (n) => {
	let r = `searchable-select-${++t}`, i = document.createElement("input");
	i.type = "text", i.className = n.className, i.autocomplete = "off", i.spellcheck = !1, i.dataset.searchableInput = "", i.setAttribute("role", "combobox"), i.setAttribute("aria-autocomplete", "list"), i.setAttribute("aria-expanded", "false"), i.setAttribute("aria-controls", `${r}-list`);
	let a = document.createElement("div");
	a.id = `${r}-list`, a.hidden = !0, a.dataset.searchableList = "", a.setAttribute("role", "listbox");
	let o = {
		select: n,
		input: i,
		list: a,
		id: r,
		open: !1,
		active: -1,
		shown: [],
		dirty: !0,
		data: null,
		lastIndex: null,
		observer: null
	};
	o.observer = new MutationObserver(() => {
		o.dirty = !0, l(o), o.open && u(o);
	}), o.observer.observe(n, {
		childList: !0,
		subtree: !0,
		characterData: !0,
		attributes: !0,
		attributeFilter: [
			"label",
			"hidden",
			"disabled"
		]
	}), _(o), s(o), e.set(n, o);
}, s = (e) => {
	e.select.dataset.searchableReady = "", e.select.tabIndex = -1, e.input.isConnected || e.select.after(e.input, e.list);
	let t = [...e.select.labels ?? []].map((e) => e.textContent.trim()).join(" ");
	t && e.input.setAttribute("aria-label", t), e.lastIndex = null, l(e);
}, c = (e) => ((e.dirty || !e.data) && (e.data = a(e.select), e.dirty = !1), e.data), l = (e) => {
	let { select: t, input: r } = e;
	if (r.disabled = t.disabled, r.setAttribute("aria-invalid", t.getAttribute("aria-invalid") ?? "false"), e.open) return;
	let { placeholder: a } = c(e);
	r.placeholder = a ? i(a) : n("Search");
	let o = t.selectedOptions[0];
	r.value = o && o.value !== "" ? i(o) : "", e.lastIndex = t.selectedIndex;
}, u = (e) => {
	let { select: t, input: a, list: o, id: s } = e, { placeholder: l, options: u } = c(e), f = r(a.value).split(" ").filter(Boolean), p = u.filter((e) => f.every((t) => e.haystack.includes(t)));
	e.shown = [...l && !t.required && !f.length ? [{
		option: l,
		text: i(l),
		group: null,
		clear: !0
	}] : [], ...p.slice(0, 100)], o.replaceChildren();
	let m = null;
	if (e.shown.forEach((e, t) => {
		if (e.group && e.group !== m) {
			let t = document.createElement("div");
			t.dataset.searchableGroup = "", t.setAttribute("role", "presentation"), t.textContent = e.group, o.append(t);
		}
		m = e.group;
		let n = document.createElement("div");
		n.id = `${s}-option-${t}`, n.dataset.searchableOption = "", n.dataset.index = t, n.setAttribute("role", "option"), n.setAttribute("aria-selected", String(e.option.selected && !e.clear)), n.textContent = e.text, e.clear && (n.dataset.clear = ""), e.option.disabled && n.setAttribute("aria-disabled", "true"), o.append(n);
	}), !e.shown.length || p.length > 100) {
		let t = document.createElement("div");
		t.dataset.searchableNote = "", t.textContent = e.shown.length ? n("Keep typing to see :count more", { count: p.length - 100 }) : n("No matches"), o.append(t);
	}
	let h = e.shown.findIndex((e) => e.option.selected && !e.clear && !e.option.disabled);
	d(e, h >= 0 && !f.length ? h : e.shown.findIndex((e) => !e.option.disabled));
}, d = (e, t) => {
	e.active = t;
	for (let n of e.list.querySelectorAll("[data-searchable-option]")) n.toggleAttribute("data-active", Number(n.dataset.index) === t);
	let n = t >= 0 ? e.list.querySelector(`#${e.id}-option-${t}`) : null;
	if (n) {
		e.input.setAttribute("aria-activedescendant", n.id);
		let { list: t } = e;
		n.offsetTop < t.scrollTop ? t.scrollTop = n.offsetTop : n.offsetTop + n.offsetHeight > t.scrollTop + t.clientHeight && (t.scrollTop = n.offsetTop + n.offsetHeight - t.clientHeight);
	} else e.input.removeAttribute("aria-activedescendant");
}, f = (e, t) => {
	let n = e.active;
	for (let r = 0; r < e.shown.length; r++) if (n = (n + t + e.shown.length) % e.shown.length, !e.shown[n].option.disabled) return d(e, n);
}, p = (e) => {
	let t = e.input.getBoundingClientRect(), n = window.innerHeight - t.bottom - 8, r = t.top - 8, i = n >= 160 || n >= r;
	Object.assign(e.list.style, {
		left: `${t.left}px`,
		width: `${t.width}px`,
		top: i ? `${t.bottom + 4}px` : "auto",
		bottom: i ? "auto" : `${window.innerHeight - t.top + 4}px`,
		maxHeight: `${Math.max(120, Math.min(288, (i ? n : r) - 4))}px`
	});
}, m = (e) => {
	if (e.open || e.select.disabled) return;
	let t = e.input.value;
	e.open = !0, e.input.value = "", t && (e.input.placeholder = t), u(e), p(e), e.list.hidden = !1, e.input.setAttribute("aria-expanded", "true"), d(e, e.active);
}, h = (e) => {
	e.open && (e.open = !1, e.list.hidden = !0, e.input.setAttribute("aria-expanded", "false"), e.input.removeAttribute("aria-activedescendant"), l(e));
}, g = (e, t) => {
	let n = e.shown[t];
	if (!n || n.option.disabled) return;
	let { select: r } = e, i = r.value !== n.option.value;
	r.value = n.option.value, i && (r.dispatchEvent(new Event("input", { bubbles: !0 })), r.dispatchEvent(new Event("change", { bubbles: !0 }))), r.checkValidity() && r.getAttribute("aria-invalid") === "true" && r.setAttribute("aria-invalid", "false"), h(e);
}, _ = (e) => {
	let { select: t, input: n, list: r } = e;
	n.addEventListener("mousedown", () => {
		e.open ? h(e) : requestAnimationFrame(() => m(e));
	}), n.addEventListener("input", () => {
		e.open || m(e), u(e);
	}), n.addEventListener("blur", () => h(e)), n.addEventListener("keydown", (t) => {
		if (!e.open) [
			"ArrowDown",
			"ArrowUp",
			"Enter"
		].includes(t.key) && !t.altKey && (t.preventDefault(), m(e));
		else switch (t.key) {
			case "ArrowDown":
				t.preventDefault(), f(e, 1);
				break;
			case "ArrowUp":
				t.preventDefault(), f(e, -1);
				break;
			case "Home":
				t.preventDefault(), e.active = -1, f(e, 1);
				break;
			case "End":
				t.preventDefault(), e.active = e.shown.length, f(e, -1);
				break;
			case "Enter":
				t.preventDefault(), g(e, e.active);
				break;
			case "Escape":
				t.preventDefault(), t.stopPropagation(), h(e);
				break;
			case "Tab": h(e);
		}
	}), r.addEventListener("mousedown", (e) => e.preventDefault()), r.addEventListener("click", (t) => {
		let n = t.target.closest("[data-searchable-option]");
		n && g(e, Number(n.dataset.index));
	}), t.addEventListener("focus", () => n.focus()), t.addEventListener("change", () => l(e)), t.addEventListener("invalid", () => {
		n.setAttribute("aria-invalid", "true"), n.focus();
	});
}, v = (t = document) => {
	let n = t instanceof HTMLSelectElement ? [t] : t.querySelectorAll?.("select[data-searchable]") ?? [];
	for (let t of n) t.matches("[data-searchable]") && !t.multiple && !e.has(t) && o(t);
}, y = () => {
	for (let [t, n] of e) t.isConnected ? (n.input.isConnected && "searchableReady" in t.dataset || s(n), (t.selectedIndex !== n.lastIndex || t.disabled !== n.input.disabled) && l(n)) : (n.observer.disconnect(), n.list.remove(), e.delete(t));
}, b = () => {
	v(), new MutationObserver((e) => {
		for (let t of e) for (let e of t.addedNodes) e.nodeType === Node.ELEMENT_NODE && v(e);
	}).observe(document.documentElement, {
		childList: !0,
		subtree: !0
	}), setInterval(y, 250);
	let t = (t) => {
		for (let n of e.values()) {
			if (!n.open || n.list.contains(t.target)) continue;
			let e = n.input.getBoundingClientRect();
			e.bottom < 0 || e.top > window.innerHeight ? h(n) : p(n);
		}
	};
	window.addEventListener("scroll", t, !0), window.addEventListener("resize", t);
};
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", b) : b();
