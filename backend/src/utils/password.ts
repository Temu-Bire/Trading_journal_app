import bycript from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashPassword= async (password: string): Promise<string> => {
  const salt = await bycript.genSalt(SALT_ROUNDS);
  const hashedPassword = await bycript.hash(password, salt);
  return hashedPassword;
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bycript.compare(password, hashedPassword);
}
