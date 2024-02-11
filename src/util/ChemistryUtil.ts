
const ELEMENT_NAME_PARTS = [
    { name: 'alf', code: 'a' },
    { name: 'bra', code: 'b' },
    { name: 'cha', code: 'c' },
    { name: 'del', code: 'd' },
    { name: 'ech', code: 'e' },
    { name: 'fox', code: 'f' },
    { name: 'golf', code: 'g' },
    { name: 'hot', code: 'h' },
    { name: 'ind', code: 'i' },
    { name: 'jul', code: 'j' },
    { name: 'kil', code: 'k' },
    { name: 'lim', code: 'l' },
    { name: 'mik', code: 'm' },
    { name: 'nov', code: 'n' },
    { name: 'osc', code: 'o' },
    { name: 'papa', code: 'p' },
    { name: 'que', code: 'q' },
    { name: 'rom', code: 'r' },
    { name: 'sie', code: 's' },
    { name: 'tan', code: 't' },
    { name: 'uni', code: 'u' },
    { name: 'vic', code: 'v' },
    { name: 'whi', code: 'w' },
    { name: 'xay', code: 'x' },
    { name: 'yank', code: 'y' },
    { name: 'zul', code: 'z' },
];


export function calculateElementName(num, isSymbol) {
    num--;
    let nameArr: Array<string> = [];
    do {
        let i = num % (ELEMENT_NAME_PARTS.length);
        nameArr.push(isSymbol ? ELEMENT_NAME_PARTS[i].code : ELEMENT_NAME_PARTS[i].name);
        num /= ELEMENT_NAME_PARTS.length;
        num = parseInt(num);
    } while (num > 0);

    let name = nameArr.reverse().join("");

    if (!isSymbol) {
        name += "ium";
        name = name.replace("aa", "a");
        name = name.replace("ii", "i");
        name = name.replace("kk", "k");
    }

    return name.charAt(0).toUpperCase() + name.substring(1);
}