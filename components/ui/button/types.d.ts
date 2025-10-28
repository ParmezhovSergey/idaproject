export interface IButtonProps {
    /**
     * Имя поля нужно для тестов
     */
    name?: string;
    /**
     * Определяет тег компонента
     */
    tag?: 'n-link' | 'a' | 'span' | 'div' | 'button' | 'input';
    /**
     * Определяет классы, которые будут модифицировать размер
     */
    size?: 'small' | 'medium';
    /**
     * Определяет классы, которые будут модифицировать цвет
     */
    color?: 'base' | 'fill' | 'dark' | 'darkFill' | 'black';
    /**
     * Модификатор вида кнопки с бордером
     */
    border?: boolean;
    /**
     * Модификатор вида кнопки с округлением
     */
    round?: boolean;
    /**
     * Активное состояние кнопки
     */
    active?: boolean;
    /**
     * Это свойство отключает взаимодействие
     */
    disabled?: boolean;
} 