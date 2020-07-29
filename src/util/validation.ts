export interface Validatable {
    value: string | number;
    required?: boolean;
    minLengthString?: number;
    maxLengthString?: number;
    minLengthNumber?: number;
    maxLengthNumber?: Number;
}

export function validate(input: Validatable) {
    let isValid = true;
    // is user type something and is bigger than 0
    if (input.required) {
        isValid = isValid && input.value.toString().trim().length !== 0;
    }
    if (input.minLengthString != null && typeof input.value === 'string') {
        isValid = isValid && input.value.length > input.minLengthString;
    }
    if (input.maxLengthString != null && typeof input.value === 'string') {
        isValid = isValid && input.value.length < input.maxLengthString;
    }
    if (input.minLengthNumber != null && typeof input.value === 'number') {
        isValid = isValid && input.value >= input.minLengthNumber;
    }
    if (input.maxLengthNumber != null && typeof input.value === 'number') {
        isValid = isValid && input.value < input.maxLengthNumber;
    }
    return isValid;
}