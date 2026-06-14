export const BACKEND_URL = (
  import.meta.env.VITE_API_URL || "https://freelancepf-api-tarnaola001.amvera.io"
).replace(/\/$/, "");

export const getImageUrl = (value, fallback = "/media/noimage.png") => {
  if (!value) return fallback;

  if (value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("http://")) {
    return value.replace("http://", "https://");
  }

  if (value.startsWith("/media/")) {
    return value;
  }

  return `${BACKEND_URL}/uploads/${value}`;
};