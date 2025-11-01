import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  const routes = ["/", "/tickets", "/admin"]
  return routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date() }))
}
