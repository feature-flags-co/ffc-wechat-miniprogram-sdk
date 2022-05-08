import { UrlMatchType } from "./types";
import localStorage from "./localStorage";
// generate default user info
export function ffcguid() {
    var ffcHomePageGuid = localStorage.getItem("ffc-guid");
    if (ffcHomePageGuid) {
        return ffcHomePageGuid;
    }
    else {
        var id = uuid();
        localStorage.setItem("ffc-guid", id);
        return id;
    }
}
export function uuid() {
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return uuid;
}
export function validateUser(user) {
    if (!user) {
        return 'user must be defined';
    }
    var id = user.id, userName = user.userName;
    if (id === undefined || id === null || id.trim() === '') {
        return 'user id is mandatory';
    }
    if (userName === undefined || userName === null || userName.trim() === '') {
        return 'userName is mandatory';
    }
    return null;
}
export function validateOption(option) {
    if (option === undefined || option === null) {
        return 'option is mandatory';
    }
    var secret = option.secret, anonymous = option.anonymous, user = option.user, enableDataSync = option.enableDataSync;
    if (enableDataSync && (secret === undefined || secret === null || secret.trim() === '')) {
        return 'secret is mandatory in option';
    }
    // validate user
    if (!!anonymous === false && !user) {
        return 'user is mandatory when not using anonymous user';
    }
    if (user) {
        return validateUser(user);
    }
    return null;
}
/******************** draggable begin ************************/
export function makeElementDraggable(el) {
    el.addEventListener('mousedown', function (e) {
        var offsetX = e.clientX - parseInt(window.getComputedStyle(this).left);
        var offsetY = e.clientY - parseInt(window.getComputedStyle(this).top);
        function mouseMoveHandler(e) {
            e.preventDefault();
            el.style.top = (e.clientY - offsetY) + 'px';
            el.style.left = (e.clientX - offsetX) + 'px';
        }
        function reset() {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', reset);
        }
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', reset);
    });
}
/******************** draggable end ************************/
// add style to html element
export function addCss(element, style) {
    for (var property in style) {
        element.style[property] = style[property];
    }
}
/********************** encode text begin *****************************/
var alphabet = {
    "0": "Q",
    "1": "B",
    "2": "W",
    "3": "S",
    "4": "P",
    "5": "H",
    "6": "D",
    "7": "X",
    "8": "Z",
    "9": "U",
};
function encodeNumber(param, length) {
    var s = "000000000000" + param;
    var numberWithLeadingZeros = s.slice(s.length - length);
    return numberWithLeadingZeros.split('').map(function (n) { return alphabet[n]; }).join('');
}
// generate connection token
export function generateConnectionToken(text) {
    text = text.replace(/=*$/, '');
    var timestamp = Date.now();
    var timestampCode = encodeNumber(timestamp, timestamp.toString().length);
    // get random number less than the length of the text as the start point, and it must be greater or equal to 2
    var start = Math.max(Math.floor(Math.random() * text.length), 2);
    return "".concat(encodeNumber(start, 3)).concat(encodeNumber(timestampCode.length, 2)).concat(text.slice(0, start)).concat(timestampCode).concat(text.slice(start));
}
/********************** encode text end *****************************/
// test if the current page url mathch the given url
export function isUrlMatch(matchType, url) {
    var current_page_url = window.location.href;
    if (url === null || url === undefined || url === '') {
        return true;
    }
    switch (matchType) {
        case UrlMatchType.Substring:
            return current_page_url.includes(url);
        default:
            return false;
    }
}
export function groupBy(xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
}
;
export function extractCSS(css) {
    return css.trim().replace(/(?:\r\n|\r|\n)/g, ';')
        .replace(/\w*([\W\w])+\{/g, '')
        .replace(/(?:\{|\})/g, '')
        .split(';')
        .filter(function (c) { return c.trim() !== ''; })
        .map(function (c) {
        var style = c.split(':');
        if (style.length === 2) {
            return {
                name: style[0].trim(),
                value: style[1].trim()
            };
        }
        return {
            name: '',
            value: ''
        };
    })
        .filter(function (s) {
        return s.name !== '' && s.value !== '';
    });
}
//# sourceMappingURL=utils.js.map