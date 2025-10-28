export interface IScrollBoxProps {
    width?: string;
    height?: string;
    hasMargin?: boolean;

    /**
     * Возможность изменения размера контейнера
     */
    resizable?: boolean;
    /**
     * Пропуск смещения
     */
    skipOffset?: boolean;
    /**
     * Включает эффект fade для скролла
     */
    fade?: boolean;
}
