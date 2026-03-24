import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async function({ request }) {
  try {
    let { data } = await request.json();

    console.log(data);

    const APIROCKET_ECOMMERCE_TOKEN = import.meta.env.APIROCKET_ECOMMERCE_TOKEN_READWRITE;

    // ---- Default values for optional fields ----
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

    // ---- GraphQL helper with variables support ----
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
      console.log("GraphQL response:", JSON.stringify(response, null, 2));
      return response;
    }

    // ---- Mutacion 1 ----
    const firstMutation = `
      mutation First {
        addressPerson: AddressPeopleCreate(input: {
          addressLine1: "${data.direccionPersona.direccion1}",
          addressLine2: "${data.direccionPersona.direccion2}",
          lastName: "${data.direccionPersona.apellido}",
          name: "${data.direccionPersona.nombre}",
          zipCode: "${data.direccionPersona.codigoPostal}",
          phoneNumber: "${data.direccionPersona.telefono}"
        }) { id }

        billingAddress: BillingsAddressCreate(input: {
          addressLine1: "${data.direccionFacturacion.direccion1}",
          addressLine2: "${data.direccionFacturacion.direccion2}",
          lastName: "${data.direccionFacturacion.apellido}",
          name: "${data.direccionFacturacion.nombre}",
          zipCode: "${data.direccionFacturacion.codigoPostal}",
          phoneNumber: "${data.direccionFacturacion.telefono}",
          country: "${data.direccionFacturacion.pais}"
        }) { id }

        billingData: BillingsDataCreate(input: {
          methodOfPayment: "${data.datosPago.metodo}"
        }) { id }

        invoiceData: InvoicesDataCreate(input: {
          businessName: "${data.datosFactura.nombreEmpresa}",
          cif: "${data.datosFactura.CIF}",
          nif: "${data.datosFactura.NIF}",
          billingType: "${data.datosFactura.tipo}"
        }) { id }

        peopleData: PeopleDataCreate(input: {
          email: "${data.datosPersona.correo}",
          mailingOptIn: ${data.datosPersona.ofertas},
          tos: ${data.datosPersona.ToS}
        }) { id }

        shippingMethod: ShippingsMethodCreate(input: {
          deliveryMethod: "${data.metodoEnvio.tipo}",
          homeDeliveryMethod: "${data.metodoEnvio.tipo}",
          zipCode: "${data.metodoEnvio.codigoPostalRecogida}"
        }) { id }
      }
    `;

    const firstResult = await graphql(firstMutation);
    if (firstResult.errors) {
      console.error("First mutation errors:", firstResult.errors);
      throw new Error(`First mutation failed: ${JSON.stringify(firstResult.errors)}`);
    }

    const ids = {
      personDataId: firstResult.data.peopleData.id,
      personAddressId: firstResult.data.addressPerson.id,
      invoiceDataId: firstResult.data.invoiceData.id,
      billingDataId: firstResult.data.billingData.id,
      billingAddressId: firstResult.data.billingAddress.id,
      shippingMethodId: firstResult.data.shippingMethod.id
    };
    console.log("Created IDs:", ids);
// ---- Mutacion 2 ----
const secondMutation = `
  mutation Second(
    $personDataId: [ID!]!,
    $personAddressId: [ID!]!,
    $invoiceDataId: [ID!]!,
    $billingDataId: [ID!]!,
    $billingAddressId: [ID!]!,
    $shippingMethodId: [ID!]!,

    $cart: String!
  ) {
    OrdersCreate(input: {
      personData: $personDataId,
      personAddress: $personAddressId,
      invoiceData: $invoiceDataId,
      billingData: $billingDataId,
      billingAddress: $billingAddressId,
      shippingMethod: $shippingMethodId,
      cart: $cart
    }) { id }
  }
`;

const orderResult = await graphql(secondMutation, {
  personDataId: [ids.personDataId],
  personAddressId: [ids.personAddressId],
  invoiceDataId: [ids.invoiceDataId],
  billingDataId: [ids.billingDataId],
  billingAddressId: [ids.billingAddressId],
  shippingMethodId: [ids.shippingMethodId],
  cart: data.carrito,
});

if (orderResult.errors) {
  console.error("Order creation errors:", orderResult.errors);
  throw new Error(`Order creation failed: ${JSON.stringify(orderResult.errors)}`);
}


// ---- Respuesta ----
return new Response(
  JSON.stringify({
    success: true,
    message: 'Order created successfully',
    data: {
      ids,
      orderId: orderResult.data.OrdersCreate.id,
    },
  }),
  { status: 200, headers: { 'Content-Type': 'application/json' } }
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