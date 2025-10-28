interface MaskToken {
    pattern: RegExp;
    transform?: (value: string) => string;
}

interface MaskTokens {
    [key: string]: MaskToken;
}

interface Masks {
    [key: string]: string;
}

const tokens: MaskTokens = {
    '#': { pattern: /\d/ },
    S: { pattern: /[a-zA-Z]/ },
    A: { pattern: /[0-9a-zA-Z]/ },
    U: { pattern: /[a-zA-Z]/, transform: (v) => v.toLocaleUpperCase() },
    L: { pattern: /[a-zA-Z]/, transform: (v) => v.toLocaleLowerCase() },
};

export const numberInputs: string[] = [
    'phone',
    'date',
    'time',
    'number',
    'snils',
    'inn',
    'passport',
    'payment',
    'code',
    'percent',
    'year',
    'month',
];

export const masks: Masks = {
    phone: '+7 (###) ###-##-##',
    date: '##/##/####',
    time: '##:##',
    number: '##########',
    snils: '###-###-### ##',
    inn: '############',
    passport: '#### ######',
    payment: '#### #### #### ####',
    percent: '####',
    year: '####',
    pin: '####',
    months: '####',
};

// eslint-disable-next-line complexity
export function addMask(value: string, mask: string, keepMasked: boolean = true): string {
    let iMask = 0;
    let iValue = 0;
    let output = '';

    while (iMask < mask.length && iValue < value.length) {
        let cMask = mask[iMask];
        const masker = tokens[cMask];
        const cValue = value[iValue];

        if (masker) {
            if (masker.pattern.test(cValue)) {
                output += masker.transform ? masker.transform(cValue) : cValue;
                iMask++;
            }
            iValue++;
        } else {
            if (masker) {
                iMask++;
                cMask = mask[iMask];
            }
            if (keepMasked) {
                output += cMask;
            }
            if (cValue === cMask) {
                iValue++;
            }
            iMask++;
        }
    }

    while (iMask < mask.length) {
        const cMask = mask[iMask];
        if (tokens[cMask]) {
            break;
        }
        iMask++;
    }

    return output;
}

export function setCursor(el: HTMLInputElement, position: number): void {
    if (el === document.activeElement) {
        el.setSelectionRange(position, position);
        setTimeout(() => {
            el.setSelectionRange(position, position);
        }, 0);
    }
}

export type { MaskToken, MaskTokens, Masks };
