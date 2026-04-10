export async function fetchProductos(){


let APIROCKET_ECOMMERCE_TOKEN = process.env.APIROCKET_ECOMMERCE_TOKEN;
if (!APIROCKET_ECOMMERCE_TOKEN){
  APIROCKET_ECOMMERCE_TOKEN = import.meta.env.APIROCKET_ECOMMERCE_TOKEN
}


let queryCards = `query MyQuery {
  Reviews {
    score
    tag
  }
  TickerTexts {
    text
  }
  Colors {
    name
    color {
      hex
    }
  }
  Products {
    maxQuantity
    name
    price
    description
    color
    images {
      alt
      url
      width
      height
    }
    id
    tag
    category {
      id
    }
  }
  Sizes {
    attributes {
      value
      name
    }
    tag
    id
  }
  Categories {
    order
    name
    id
    father
    categoryName
  }
}


`

let respuesta = (await fetchApirocket(queryCards))


return respuesta;}

 
export async function fetchApirocket(query: String) {
  let APIROCKET_ECOMMERCE_TOKEN = process.env.APIROCKET_ECOMMERCE_TOKEN;
if (!APIROCKET_ECOMMERCE_TOKEN){
  APIROCKET_ECOMMERCE_TOKEN = import.meta.env.APIROCKET_ECOMMERCE_TOKEN
}

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


