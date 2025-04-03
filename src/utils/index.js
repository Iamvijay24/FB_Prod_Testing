const extractAvatarId = (fbId) => {
  if (!fbId) {
    return null;
  }

  const parts = fbId.split(":::");
  if (parts.length !== 3) {
    return null;
  }

  const avatarPart = parts[2];
  if (!avatarPart.startsWith("av")) {
    return null;
  }

  return avatarPart;
};

export { extractAvatarId };