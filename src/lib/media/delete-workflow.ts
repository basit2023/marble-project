// Cloudinary cannot participate in an Atlas transaction. A pending tombstone makes
// failures retryable without losing the public ID required for cleanup.
export async function deleteMediaWorkflow<T extends { cloudinaryPublicId: string }>(
  hard: boolean,
  operations: { reserve: () => Promise<T>; destroy: (publicId: string) => Promise<void>; finish: () => Promise<void> },
): Promise<void> {
  const record = await operations.reserve();
  if (!hard) return;
  await operations.destroy(record.cloudinaryPublicId);
  await operations.finish();
}
