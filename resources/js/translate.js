/**
 * Translate a text in JavaScript the way __() does in PHP. The server writes the translated texts the app
 * lists in config/ui.php (js_translations) into window.__lang; a text that is not there is returned as it is.
 */
window.__ = (text, replace = {}) => {
    //  Define the line
    let line = (window.__lang && window.__lang[text]) || text;

    //  Replace placeholders
    for (const [placeholder, value] of Object.entries(replace)) {
        line = line.replace(`:${placeholder}`, value);
    }

    //  Return
    return line;
};
