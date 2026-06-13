import axios from "axios";

const generateImageURL = async (image) => {
  const file = new FormData();
  file.append("file", image);

  const { data } = await axios.post(
    "https://freelancepf-api-tarnaola001.amvera.io/api/gigs/upload-local",
    file,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }
  );

  return { url: data.url };
};

export default generateImageURL;