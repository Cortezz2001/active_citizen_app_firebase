export const markdownStyles = {
    // Базовые стили для всего текста
    body: {
        fontSize: 16,
        lineHeight: 24,
        fontFamily: "Montserrat-Regular",
        color: "#333333",
    },
    
    // Параграфы с отступами для лучшей читаемости
    paragraph: {
        fontFamily: "Montserrat-Regular",
        marginBottom: 16,
        lineHeight: 24,
    },
    
    // Жирный текст - более заметный с небольшим изменением цвета
    strong: {
        fontFamily: "Montserrat-Bold",
        color: "#222222",
    },
    
    // Стили для курсива - с легким наклоном и изменением цвета
    em: {
        fontFamily: "Montserrat-Italic", 
        color: "#454545",
    },
    
    // Заголовки с иерархией размеров и отступов
    heading1: {
        fontFamily: "Montserrat-Bold",
        fontSize: 28,
        lineHeight: 34,
        color: "#111111",
        marginTop: 28,
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    
    heading2: {
        fontFamily: "Montserrat-SemiBold",
        fontSize: 24,
        lineHeight: 30,
        color: "#111111",
        marginTop: 24,
        marginBottom: 16,
        letterSpacing: -0.3,
    },
    
    heading3: {
        fontFamily: "Montserrat-Medium",
        fontSize: 20,
        lineHeight: 26,
        color: "#222222",
        marginTop: 20,
        marginBottom: 12,
    },
    
    heading4: {
        fontFamily: "Montserrat-Medium",
        fontSize: 18,
        lineHeight: 24,
        color: "#333333",
        marginTop: 18,
        marginBottom: 10,
    },
    
    heading5: {
        fontFamily: "Montserrat-Medium",
        fontSize: 16,
        lineHeight: 22,
        color: "#444444",
        marginTop: 16,
        marginBottom: 8,
    },
    
    heading6: {
        fontFamily: "Montserrat-Medium", 
        fontSize: 15,
        lineHeight: 20,
        color: "#555555",
        marginTop: 15,
        marginBottom: 8,
        fontStyle: "italic",
    },
    
    // Цитаты со стильным оформлением
    blockquote: {
        backgroundColor: "#F9F9F9",
        borderLeftColor: "#006FFD",
        borderLeftWidth: 4,
        paddingLeft: 16,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 8,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 4,
    },
    
    // Стили для списков
    bullet_list: {
        marginBottom: 16,
        marginTop: 8,
        paddingLeft: 8,
    },
    
    ordered_list: {
        marginBottom: 16,
        marginTop: 8,
        paddingLeft: 8,
    },
    
    bullet_list_icon: {
        fontSize: 18,
        color: "#006FFD",
        lineHeight: 24,
        marginLeft: 10,
        marginRight: 10,
    },
    
    bullet_list_content: {
        fontFamily: "Montserrat-Regular",
        flex: 1,
        lineHeight: 24,
    },
    
    ordered_list_icon: {
        fontFamily: "Montserrat-SemiBold",
        color: "#006FFD",
        fontSize: 15,
        lineHeight: 24,
        marginLeft: 10,
        marginRight: 10,
    },
    
    ordered_list_content: {
        fontFamily: "Montserrat-Regular",
        flex: 1,
        lineHeight: 24,
    },
    
    // Стили для элементов списка
    list_item: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 6,
        lineHeight: 24,
    },
    
    // Стили для ссылок
    link: {
        fontFamily: "Montserrat-SemiBold",
        color: "#006FFD",
        textDecorationLine: "underline",
    },
    
    // Стили для кода
    code_inline: {
        fontFamily: "Montserrat-Regular",
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 3,
        fontSize: 14,
        color: "#D33682",
    },
    
    code_block: {
        fontFamily: "Montserrat-Regular",
        backgroundColor: "#F5F5F5",
        padding: 12,
        borderRadius: 6,
        marginVertical: 12,
        fontSize: 14,
        color: "#333333",
        lineHeight: 20,
    },
    
    // Горизонтальная линия
    hr: {
        backgroundColor: "#E5E5E5",
        height: 1,
        marginTop: 24,
        marginBottom: 24,
    },
    
    // Изображения
    image: {
        borderRadius: 8,
        marginVertical: 16,
    },
    
    // Стили для таблиц
    table: {
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 8,
    },
    
    tr: {
        borderBottomWidth: 1,
        borderColor: "#E5E5E5",
        flexDirection: 'row',
    },
    
    th: {
        fontFamily: "Montserrat-SemiBold",
        flex: 1,
        padding: 5,
        color: "#333333",
    },
    
    td: {
        fontFamily: "Montserrat-Regular",
        flex: 1,
        padding: 5,
    },
};