import axios from "axios";

const generateImageURL = async (image) => {
  const file = new FormData();
  file.append("file", image);

  // Синхронизировано с портом 8080 вашего server.js из технического отчета
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const { data } = await axios.post(
    `${backendUrl}/api/gigs/upload-local`, 
    file,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  
  return { url: data.url }; 
};

export default generateImageURL;
