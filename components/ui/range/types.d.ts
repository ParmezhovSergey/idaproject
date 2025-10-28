export interface IRangeProps {
    /**
     * Имя ключа для работы с формами или запросами
     */
    name: Array<any> | string;
    /**
     * Определяет классы, которые будут модифицировать размер
     */
    size?: 'small' | 'medium';
    /**
     * Определяет классы, которые будут модифицировать цвет
     */
    color?: 'base' | 'dark';
    /**
     * Добавочное значение после инпута, например знак валюты
     */
    postfix?: string;
    /**
     * Включает лейблы от/до, в рейндже
     */
    showLabel?: boolean;
    /**
     * Для переопределения значений лейблов
     */
    labels?: Array<string>;
    /**
     * Диапазон всех доступных значений
     */
    specs: {
        min: number;
        max: number;
    };
    /**
     * Значения, которые доступны после передачи параметров в backend,
     * если существует определённый item в specs, но отсуствует в facets,
     * то по логике компонента, он перестаёт быть активным для выбора
     */
    facets?: Record<string, any>;
    /**
     * Позволяет задать шаг слайдера вручную
     */
    step?: number;
    /**
     * Текущее минимальное значение, при инициализации
     */
    valueMin?: string;
    /**
     * Текущее максимальное значение, при инициализации
     */
    valueMax?: string;
    /**
     * Отключает функционал диапазона, в этом режиме не имеет смысла использовать facets
     */
    single?: boolean;
    /**
     * При передаче false - позволяет выбирать отрицательные суммы
     */
    positiveOnly?: boolean;
    /**
     * Это свойство отключает взаимодействие
     */
    disabled?: boolean;
}

export interface IRangeSliderProps {
    /**
     * Минимальное значение слайдера
     */
    min?: number;
    /**
     * Максимальное значение слайдера
     */
    max?: number;
    /**
     * Шаг слайдера
     */
    step?: number;
    /**
     * Текущее значение слайдера (v-model)
     */
    modelValue?: number | number[];
    /**
     * Включает режим диапазона (два ползунка)
     */
    range?: boolean;
    /**
     * Высота слайдера
     */
    height?: string;
    /**
     * Это свойство отключает взаимодействие
     */
    disabled?: boolean;
    /**
     * Показывать стопперы (засечки) на рельсе
     */
    showStops?: boolean;
    /**
     * Показывать значение на ползунке
     */
    showValue?: boolean;
    /**
     * Функция форматирования отображаемого значения
     */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    valueFormat?: Function;
    /**
     * Метки на слайдере
     */
    marks?: Record<string, any>;
    /**
     * Отключает анимацию переходов
     */
    noTransition?: boolean;
    /**
     * Определяет классы, которые будут модифицировать цвет
     */
    color?: 'base' | 'dark';
}

export interface IRangeSliderDotProps {
    /**
     * Значение ползунка (v-model)
     */
    modelValue?: number;
    /**
     * Состояние перетаскивания
     */
    dragging?: boolean;
    /**
     * Состояние фокуса
     */
    focus?: boolean;
}
