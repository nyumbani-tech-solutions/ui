/**
 * Install every Nyumbani UI script at once: import this single file from the app's js. It sets up toasts,
 * the shell, the double-submit guard, the file input, the modal and the period picker. The packages they import (toastr and
 * @alpinejs/ui) are listed in the package.json beside this folder and bundled into resources/dist, so an
 * app installs none of them. The formatting helpers live in nyumbani/essentials.
 */
import './translate';
import './toastr';
import './shell';
import './submit';
import './file-input';
import './modal';
import './period-picker';
