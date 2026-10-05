export async function deployToVercel(code: string) {
  // Free Vercel deploy mock - real API uses VERCEL_TOKEN
  return { url: `https://emma-ai-builder.vercel.app/preview/${Date.now()}`, success: true }
}
