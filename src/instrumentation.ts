export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { seedDemoUser } = await import("@/db/seed");
  await seedDemoUser();
}
