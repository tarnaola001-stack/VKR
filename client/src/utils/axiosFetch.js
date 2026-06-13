import axios from "axios";

const axiosFetch = axios.create({
    // Принудительно указываем адрес нашего Node.js сервера 
    baseURL: "https://freelancepf-api-tarnaola001.amvera.io/api", 
    withCredentials: true
});

export default axiosFetch;