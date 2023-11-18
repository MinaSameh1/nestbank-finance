// This is used to have a message for the developer to understand
export const ErrorMessages = {
  NOT_FOUND: 'Resource Not Found',
  NOT_FOUND_ID: (name?: string, id?: unknown) =>
    `${name} Resource ${id} Not Found`,
  ACCOUNT_ALREADY_EXISTS: 'User Already Has An Account!!',
  CANNOT_UPDATE_USER_ID: 'Cannot Change User ID!!',
  USER_DOES_NOT_EXIST: 'User Does Not Exist!',
}

export const SuccessMessages = {
  SUCCESSFULLY_DELETED_ID: (name?: string, id?: unknown) =>
    `${name} Resource ${id} Successfully Deleted`,
  SUCCESSFULLY_UPDATED_ID: (name?: string, id?: unknown) =>
    `${name} Resource ${id} Successfully Updated`,
}

// Used for the developer to check against and show a localized message
export const ErrorCodes = {
  NOT_FOUND: 'NOT_FOUND',
  ACCOUNT_ALREADY_EXISTS: 'ACCOUNT_ALREADY_EXISTS',
  CANNOT_UPDATE_USER_ID: 'CANNOT_CHANGE_USER_ID',
  USER_DOES_NOT_EXIST: 'USER_DOES_NOT_EXIST',
}
