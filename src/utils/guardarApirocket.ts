export async function nuevaOrden(carrito: any, nombre: any){


const APIROCKET_ECOMMERCE_TOKEN = import.meta.env.APIROCKET_ECOMMERCE_TOKEN;


let queryCards = `mutation MyMutation {
  __typename
  OrdersCreate(input: {cart: '${carrito}', name: '${nombre}'})
}


`

 
async function guardarApirocket(query: String) {

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${APIROCKET_ECOMMERCE_TOKEN}`
    },
    body: JSON.stringify({query})
  }

  const data = await fetch('https://graphql.apirocket.io', options).then(response => response.json())
  return data
}
let respuesta = (await guardarApirocket(queryCards))


return respuesta;

}
