import type {FilterFacet, FilterSpec} from "~/types/api.ts";

export interface ISelectProps {
    /**
     * Имя поля (phone, email, name и т.д.) нужно для тестов
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
     * Текущее значение для определения активного элемента
     */
    value: number | string | Array<string> | Array<number>;
    /**
     * Название поля для value
     */
    valueName?: string;
    /**
     * Название поля для label
     */
    labelName?: string;
    /**
     * Диапазон всех доступных значений селектора
     */
    specs: FilterSpec;
    /**
     * Значения, которые доступны после передачи параметров в backend,
     * если существует определённый item в specs, но отсуствует в facets,
     * то по логике компонента, он перестаёт быть активным для выбора
     */
    facets: FilterFacet;
    /**
     * Значение, которое подставляется в селектор, визуально,
     * если в value является пустой переменной
     */
    placeholder?: string;
    /**
     * Доп. элемент в селекторе, при выборе
     * которого - сбрасывается состояние value
     */
    resetLabel?: string;
    /**
     * Включает возможноть выбора более одного элемента
     */
    multiple?: boolean;
    /**
     * Скрывает выбранные варианты из селектора
     */
    hideSelected?: boolean;
    /**
     * Модификатор вида селектора с бордером
     */
    border?: boolean;
    /**
     * Это свойство отключает взаимодействие
     */
    disabled?: boolean;
    /**
     * Запрещает сброс активного элемента
     */
    required?: boolean;
}

export interface IDropdownOptionProps {
    /**
     * Объект с данными опции
     */
    option: Record<string, any>;
    /**
     * Текущее значение для определения активного элемента
     */
    value: number | string | Array<any>;
    /**
     * Название поля для value
     */
    valueName?: string;
    /**
     * Название поля для label
     */
    labelName?: string;
    /**
     * Определяет классы, которые будут модифицировать размер
     */
    size?: 'small' | 'medium';
    /**
     * Подсвечена ли опция
     */
    isHighlighted?: boolean;
}
