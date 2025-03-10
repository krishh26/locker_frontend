export const emailReg = /^[\a-z0-9\.]+@([\a-z0-9]+\.)+[\a-z]{2,4}$/;
export const emailValidationMsg = "Enter a valid email address. It should contain alphanumeric characters, dots, and be in the format 'example@example.com'."

export const nameReg = /^[\a-zA-Z\]]{3,20}$/;
export const nameValidationMsg = "Enter a valid name. It should consist of 3 to 20 characters, containing only letters (uppercase or lowercase)."

export const usernameReg = /^[\a-zA-Z_0-9.\]]{3,20}$/;
export const usernameValidationMsg = "Enter a valid username. It should consist of 3 to 20 characters, including letters (uppercase or lowercase), numbers, dots, and underscores."

export const mobileReg = /^(?:\d{10})?$/;
export const mobileValidationMsg = "Enter a valid number. It should be a 10-digit number."

export const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
export const passwordValidation = "Enter a secure password. It must be at least 6 characters long, containing at least one lowercase letter, one uppercase letter, and one digit."
