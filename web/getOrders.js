import axios from "axios";

let headersList = {
 "Accept": "*/*",
 "User-Agent": "Thunder Client (https://www.thunderclient.io)",
 "Access-Control-Allow-Origin": "localhost:3000",
 "Access-Control-Allow-Credentials": "true",
 "Content-Type": "application/json" 
}

let reqOptions = {
  url: "http://localhost:3000/api/orders/mobileOrders",
  method: "POST",
  headers: headersList,
  data: "{\n        \"customer_mobile\" : \"123456789\"\n\n}",
}

axios.request(reqOptions).then(function (response) {
  console.log(response.data);
})