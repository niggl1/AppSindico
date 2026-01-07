import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    key: "uploads/1/test123.jpg",
    url: "https://storage.example.com/uploads/1/test123.jpg",
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// Create a small valid base64 image (1x1 pixel transparent PNG)
const validBase64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

describe("upload.image", () => {
  it("validates file type - rejects invalid types", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.upload.image({
        fileName: "test.txt",
        fileType: "text/plain",
        fileData: "data:text/plain;base64,SGVsbG8gV29ybGQ=",
        folder: "test",
      })
    ).rejects.toThrow("Tipo de ficheiro não suportado");
  });

  it("accepts valid image types", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.upload.image({
      fileName: "test.png",
      fileType: "image/png",
      fileData: validBase64Image,
      folder: "test",
    });

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("key");
    expect(result.url).toContain("https://");
  });

  it("uses default folder when not specified", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.upload.image({
      fileName: "test.jpg",
      fileType: "image/jpeg",
      fileData: validBase64Image,
    });

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("key");
  });

  it("accepts all supported image formats", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const formats = [
      { type: "image/jpeg", ext: "jpg" },
      { type: "image/png", ext: "png" },
      { type: "image/gif", ext: "gif" },
      { type: "image/webp", ext: "webp" },
    ];

    for (const format of formats) {
      const result = await caller.upload.image({
        fileName: `test.${format.ext}`,
        fileType: format.type,
        fileData: validBase64Image,
      });

      expect(result).toHaveProperty("url");
    }
  });
});
