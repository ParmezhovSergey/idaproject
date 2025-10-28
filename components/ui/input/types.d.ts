export interface IInputProps {
    /**
     * Имя поля (phone, email, name и т.д.) нужно для тестов
     */
    name: string;
    /**
     * Определяет классы, которые будут модифицировать размер
     */
    size?: 'small' | 'medium';
    /**
     * Определяет классы, которые будут модифицировать цвет
     */
    color?: 'base' | 'dark';
    /**
     * Тип, для передачи в атрибуты нативного инпута
     */
    type?: string;
    /**
     * Текущее введёное значение
     */
    value?: string;
    /**
     * Даёт возможность отключить autocomplete при вводе
     */
    autocomplete?: boolean;
    /**
     * Лейбл инпута
     */
    label?: string;
    /**
     * Позволяет отображать лейбл после ввода
     */
    keepLabel?: boolean;
    /**
     * Сообщение пользователю, может использоваться для валидации
     */
    msg?: string;
    /**
     * Можно передать название иконки svg-sprite, для отображения в поле ввода
     */
    suffixIcon?: string;
    /**
     * Параметр маски инпута, если необходим
     * @values phone, date, time, number, snils, inn, passport, payment, percent, year, pin, months
     */
    mask?: string;
    /**
     * Отображение маску при вводе
     */
    premask?: boolean;
    /**
     * Если активно, то при эмите, данные будут переданы с учётом активной маски.
     * Т.е. если в инпуте компонента +7 (999) 00-00-00, то без этого параметра,
     * будет передано 9990000. Включено по-умолчанию, для валидации
     */
    keepMasked?: boolean;
    /**
     * Модификатор вида с бордером
     */
    border?: boolean;
    /**
     * Модификатор вида с ошибкой
     */
    error?: boolean;
    /**
     * Это свойство отключает взаимодействие
     */
    disabled?: boolean;
}

export interface IInputThousandsProps {
    value?: string | number;
    /**
     * Имя поля нужно для тестов
     */
    name?: string;
    /**
     * Определяет классы, которые будут модифицировать размер
     */
    size?: 'small' | 'medium';
    /**
     * Определяет классы, которые будут модифицировать цвет
     */
    color?: 'base' | 'dark';
    /**
     * Это свойство отключает взаимодействие
     */
    disabled?: boolean;
    /**
     * Модификатор состояния ошибки
     */
    error?: boolean;
    /**
     * Разделитель тысяч
     */
    delimiter?: string;
    /**
     * Символ десятичного разделителя
     */
    decimalMark?: string;
    /**
     * Количество знаков после запятой
     */
    decimalCount?: number;
    /**
     * Ограничения длины поля
     */
    length?: {
        maxlength?: number | null;
        minlength?: number | null;
    };
    /**
     * При передаче false - позволяет выбирать отрицательные суммы
     */
    positiveOnly?: boolean;
    /**
     * Значение по умолчанию
     */
    defaultValue?: string | number;
}

export interface IInputHintProps {
    /**
     * Определяет классы, которые будут модифицировать цвет
     */
    color?: 'base' | 'dark';
} 