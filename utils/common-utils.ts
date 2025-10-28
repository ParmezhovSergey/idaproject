export function remToPx(rem: string | number): number {
    return (
        parseFloat(rem.toString()) * parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
}

export function getFontSize() {
    const html = window.document.documentElement;
    const style = window.getComputedStyle(html, null).getPropertyValue('font-size');
    return parseFloat(style);
}
