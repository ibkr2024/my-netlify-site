const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    console.log("Incoming Request:", event.body); // 🔍 Log request body for debugging

    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Request body is empty" }),
      };
    }

    // Safe JSON parsing
    let data;
    try {
      data = JSON.parse(event.body);
    } catch (error) {
      console.error("JSON Parsing Error:", error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON format" }),
      };
    }

    const { priceId, email } = data;

    if (!priceId || !email) {
      console.error("Missing Parameters:", { priceId, email });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required parameters: priceId or email" }),
      };
    }

    console.log("Creating Stripe session for:", { priceId, email });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: 'https://instachatai.co/success',
      cancel_url: 'https://instachatai.co/cancel',
      customer_email: email,
    });

    console.log("Stripe Session Created:", session.id);

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error("Stripe Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
