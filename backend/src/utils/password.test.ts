import { hashPassword, verifyPassword } from "./password.js";

describe("Password Utility", () => {
  it("should hash a password and verify it correctly", async () => {
    const raw = "SuperSecret123!";
    const hashed = await hashPassword(raw);

    expect(hashed).not.toBe(raw);
    const isValid = await verifyPassword(raw, hashed);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword("WrongPassword", hashed);
    expect(isInvalid).toBe(false);
  });
});
