---
name: nyumbani-fancybox
description: "Invoke when a Nyumbani app needs to preview an image or file in a lightbox: the data-fancybox attribute, the Fancybox global, previews inside data tables and modals, and the stored-image preview in <x-nyumbani::file-input>. Skip for modals and dialogs (see nyumbani-modal)."
metadata:
  author: nyumbani
---

# Nyumbani Fancybox

Fancybox and its styles are bundled in `ui.js`, which binds every `[data-fancybox]` link. The app never installs `@fancyapps/ui` and never writes its own `Fancybox.bind()`; remove them when migrating an app.

## Usage
```blade
<a href="{{ route('uploads.preview', ['upload' => $upload]) }}" data-fancybox data-caption="{{ $upload->title }}">View</a>
```

- `data-caption` is the text under the image.
- Give several links one value (`data-fancybox="gallery"`) to flip between them.
- Add `data-type="image"` when the address has no file extension (a preview route, a blob URL).
- Links added later, such as table rows and modal bodies, work without extra code.
- From JavaScript, use the `Fancybox` global: `Fancybox.show([{ src, caption }])`.

## File input
`<x-nyumbani::file-input :current="$upload">` already opens a stored or newly chosen image in the lightbox when its thumbnail is clicked. Add nothing.
