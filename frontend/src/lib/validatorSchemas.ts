import { z } from "zod";
export const emailSchema = z.string().trim().toLowerCase().email(
    "Введите корректный email",
);

export const codeSchema = z.string().regex(
    /^\d{6}$/,
    "Код должен содержать 6 цифр",
);
export const nicknameSchema = z
    .string()
    .trim()
    .min(3, "Минимум 3 символа")
    .max(20, "Максимум 20 символов")
    .regex(
        /^[a-zA-Z0-9_]+$/,
        "Только латинские буквы, цифры и _ (подчёркивание)",
    )
    .refine(
        (val) => /[a-zA-Z]/.test(val),
        "Никнейм должен содержать хотя бы одну букву",
    );

//файл понятнее
