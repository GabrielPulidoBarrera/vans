import type { APIRoute } from 'astro';
import nodemailer from "nodemailer";

export const prerender = false;

export const POST: APIRoute = async function({ request }) {
  try {
    let {id} = await request.json();

    //console.log(data);

let APIROCKET_ECOMMERCE_TOKEN = process.env.APIROCKET_ECOMMERCE_TOKEN_READWRITE;
if (!APIROCKET_ECOMMERCE_TOKEN){
  APIROCKET_ECOMMERCE_TOKEN = import.meta.env.APIROCKET_ECOMMERCE_TOKEN_READWRITE
}

    async function fetchApirocket(query: string, variables?: any) {
      const body = variables ? JSON.stringify({ query, variables }) : JSON.stringify({ query });
      const res = await fetch('https://graphql.apirocket.io', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${APIROCKET_ECOMMERCE_TOKEN}`,
        },
        body,
      });
      const response = await res.json();
      //console.log("GraphQL response:", JSON.stringify(response, null, 2));
      return response;
    }

    // ---- Peticion 1 ----
    const firstMutation = `
mutation MyMutation {
  __typename
  OrdersUpdate(id: "${id}", input: {sent: true}) {
    sent
    id
  }
}

    `;

    const firstResult = await fetchApirocket(firstMutation);
    if (firstResult.errors) {
      console.error("First mutation errors:", firstResult.errors);
      throw new Error(`First mutation failed: ${JSON.stringify(firstResult.errors)}`);
    }

// ---- Respuesta ----
return new Response(
  JSON.stringify({
    success: true,
    message: 'Order created successfully',
    data: {
      id: id,
    },
  }),
  { status: 200, headers: { 'Content-Type': 'application/json' }  }
);
  } catch (error: any) {
    console.error("Error in POST handler:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};