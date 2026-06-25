export const validateProfileUpdate = (
  body: any
) => {
  const errors: string[] = [];

  if (
    body.fullName &&
    body.fullName.length > 100
  ) {
    errors.push(
      "Full name cannot exceed 100 characters"
    );
  }

  if (
    body.preferredLanguage &&
    body.preferredLanguage.length > 10
  ) {
    errors.push(
      "Invalid language"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};