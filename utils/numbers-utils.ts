export const leadingZero = (num: number): string => (num < 10 ? `0${num}` : num.toString());

export function splitThousands(val: string | number): string {
    if (isNaN(Number(val))) {
        return val.toString();
    }

    const numVal = Math.floor(Number(val));
    const prefix = numVal < 0 ? '-' : '';

    return (
        prefix +
        numVal
            .toString()
            .replace(/\D/g, '')
            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    );
}

export function roundToMillions(
    num: string | number | null | undefined,
    accuracy: number = 1
): string {
    if (num === undefined || num === null) {
        return '';
    }

    return (Number(num) / 1000000).toFixed(accuracy);
}

export function onlyNumbers(val: string | number): string {
    return val.toString().replace(/\D/g, '');
}

export function onlyLetters(val: string): string {
    return val.toString().replace(/[^a-zA-Z ]+/g, '');
}

export function prettyPhone(rawPhoneNumber: string | number): string {
    return onlyNumbers(rawPhoneNumber).replace(
        /(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/,
        '+$1 ($2) $3-$4-$5'
    );
}
