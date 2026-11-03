// resources/js/number-input.js
var e = (e) => e instanceof HTMLInputElement && e.type === "number" && !("allowSpin" in e.dataset) ? e : null;
document.addEventListener("wheel", () => {
	let t = e(document.activeElement);
	t && t.blur();
}, { passive: !0 }), document.addEventListener("keydown", (t) => {
	e(t.target) && [
		"ArrowUp",
		"ArrowDown",
		"e",
		"E",
		"+"
	].includes(t.key) && !t.ctrlKey && !t.metaKey && t.preventDefault();
}), document.addEventListener("paste", (t) => {
	if (!e(t.target)) return;
	let n = t.clipboardData.getData("text");
	/[eE+]/.test(n) && t.preventDefault();
});
