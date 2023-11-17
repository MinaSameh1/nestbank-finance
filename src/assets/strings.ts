// This is used to have a message for the developer to understand
export const ErrorMessages = {
  NOT_FOUND: 'Resource Not Found',
  NOT_FOUND_ID: (name?: string, id?: unknown) =>
    `${name} Resource ${id} Not Found`,
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
}
