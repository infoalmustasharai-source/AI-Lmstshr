# Vercel Configuration for Frontend Deployment
# Place in artifacts/al-mustashar/vercel.json

{
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "outputDirectory": "dist/public",
  "framework": "vite",
  "env": [
    {
      "key": "VITE_API_URL",
      "description": "Backend API URL for production",
      "required": true
    },
    {
      "key": "BASE_PATH",
      "description": "Base path for the application",
      "required": true,
      "default": "/"
    }
  ]
}
