import axios from "axios";

const axiosFetch = axios.create({
    // Принудительно указываем адрес нашего Node.js сервера 
    baseURL: "http://localhost:8080/api", 
    withCredentials: true
});

export default axiosFetch;