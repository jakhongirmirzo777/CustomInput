export interface CustomInputProps {
    modelValue: string
}

export interface CustomInputEmits {
    (e: 'update:modelValue', value: string): void
}

export type DateFormatType = 'MM/DD/YYYY' | 'DD/MM/YYYY'