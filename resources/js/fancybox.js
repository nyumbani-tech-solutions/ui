import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

/**
 * Shared Fancybox setup: it makes Fancybox global and opens every `[data-fancybox]` link in a lightbox,
 * so an app only marks a link with `data-fancybox` and `data-caption`. Links added later (table rows, modals) work too.
 */
window.Fancybox = Fancybox;

/**
 * Bind the lightbox to every element marked with data-fancybox
 */
Fancybox.bind('[data-fancybox]', {
    hideScrollbar: false,
});
