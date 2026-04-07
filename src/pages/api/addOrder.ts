import type { APIRoute } from 'astro';
import nodemailer from "nodemailer";

export const prerender = false;

export const POST: APIRoute = async function({ request }) {
  try {
    let { data } = await request.json();

    //console.log(data);

let APIROCKET_ECOMMERCE_TOKEN = process.env.APIROCKET_ECOMMERCE_TOKEN_READWRITE;
if (!APIROCKET_ECOMMERCE_TOKEN){
  APIROCKET_ECOMMERCE_TOKEN = import.meta.env.APIROCKET_ECOMMERCE_TOKEN_READWRITE
}

  const correoRegex =
    /(?:[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+(?:\.[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9\x2d]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  const codigoPostalRegex = /^\d{5}$/; // Solo España
  const numeroTelefonoRegex = /^[1-9][0-9]{7,14}$/;
  const cvcRegex = /^[0-9]{3,4}$/;
    let valido = true;


    // ---- Validacion ----
    if (data.direccionPersona == null) {
      data.direccionPersona = {
        direccion1: '', direccion2: '', apellido: '', nombre: '', codigoPostal: '', telefono: '',
      };
    }
    if (data.direccionFacturacion == null) {
      data.direccionFacturacion = {
        direccion1: '', direccion2: '', apellido: '', nombre: '', codigoPostal: '', telefono: '',
      };
    }
    if (data.datosFactura == null) {
      data.datosFactura = {
        tipo: '', NIF: '', CIF: '', nombreEmpresa: '',
      };
    }

    if (data.direccionPersona.codigoPostal!='' && codigoPostalRegex.test(data.direccionPersona.codigoPostal)==false){
      valido = false;
    }

    if (data.direccionFacturacion.codigoPostal!='' && codigoPostalRegex.test(data.direccionFacturacion.codigoPostal)==false){
      valido = false;
    }
    if (data.direccionFacturacion.telefono!='' && numeroTelefonoRegex.test(data.direccionFacturacion.telefono)==false){
      valido = false;
    }
    if (data.direccionPersona.telefono!='' && numeroTelefonoRegex.test(data.direccionPersona.telefono)==false){
      valido = false;
    }

  if (correoRegex.test(data.datosPersona.correo)==false){
    valido = false;
  }    

  if (cvcRegex.test(data.datosPago.cvc)==false){
    valido = false
  }

if (valido==false) {
      console.error("error en la validacion de datos");
      throw new Error(`error en la validacion de datos`);
    }


    async function graphql(query: string, variables?: any) {
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
      query MyQuery {
  Orders {
    codigoPedido
  }
}

    `;

    const firstResult = await graphql(firstMutation);
    if (firstResult.errors) {
      console.error("First mutation errors:", firstResult.errors);
      throw new Error(`First mutation failed: ${JSON.stringify(firstResult.errors)}`);
    }


    console.log(firstResult.data.Orders);

    let codigoPedido = Math.floor(Math.random() * 1000000000);
    do{
    codigoPedido = Math.floor(Math.random() * 1000000000);
    } while (firstResult.data.Orders.find((e: any) => {
      return e.codigoPedido == codigoPedido;
    })==false)

    let correo = data.datosPersona.correo;



// ---- Peticion 2 ----
const secondMutation = `
  mutation MyMutation($cart: String!) {
  __typename
  OrdersCreate(input: {cart: $cart, codigoPedido: "${codigoPedido}", correo: "${correo}"}) {
    id
  }
}
`;

const orderResult = await graphql(secondMutation, {cart: JSON.stringify(data)});

if (orderResult.errors) {
  console.error("Order creation errors:", orderResult.errors);
  throw new Error(`Order creation failed: ${JSON.stringify(orderResult.errors)}`);
}
else{



// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gabrielpulidobarrera@gmail.com",
    pass: import.meta.env.PASS_EMAIL,
  },
});

try {
  await transporter.verify();
  console.log("Server is ready to take our messages");
} catch (err) {
  console.error("Verification failed:", err);
}

try {

  console.log(correo);

  let texto = "Tu codido de pedido es "+codigoPedido
  let textoHtml = "<b>"+texto+"</b>"

  const info = await transporter.sendMail({
    from: '"gabrielpulidobarrera" <gabrielpulidobarrera@gmail.com>', // sender address
    to: correo, // list of recipients
    subject: "Hello", // subject line
    text: texto, // plain text body
    html: textoHtml, // HTML body
  });

  console.log("Message sent: %s", info.messageId);
  // Preview URL is only available when using an Ethereal test account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
} catch (err) {
  console.error("Error while sending mail:", err);
}


}



// ---- Respuesta ----
return new Response(
  JSON.stringify({
    success: true,
    message: 'Order created successfully',
    data: {
      codigoPedidoResultado: codigoPedido,
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