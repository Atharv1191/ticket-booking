// const Stripe = require("stripe");
// const Booking = require("../models/Booking");

// const stripeWebhooks = async (request, response) => {
//   const stripeInstance = Stripe(process.env.STRIPE_SECRET_KEY);

//   const sig = request.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripeInstance.webhooks.constructEvent(
//       request.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (error) {
//     return response.status(400).send(`Webhook Error: ${error.message}`);
//   }

//   try {
//     switch (event.type) {
//       case "payment_intent.succeeded": {
//         const paymentIntent = event.data.object;

//         const sessionList = await stripeInstance.checkout.sessions.list({
//           payment_intent: paymentIntent.id,
//         });

//         const session = sessionList.data[0];
//         const { bookingId } = session.metadata;

//         await Booking.findByIdAndUpdate(bookingId, {
//           isPaid: true,
//           paymentLink: "",
//         });

//         break;
//       }

//       default:
//         console.log("Unhandled event type:", event.type);
//     }

//     response.json({ received: true });
//   } catch (err) {
//     console.log("Webhook processing error", err);
//     response.status(500).send("Internal server error");
//   }
// };

// module.exports = { stripeWebhooks };
const Stripe = require("stripe");
const Booking = require("../models/Booking");
const { inngest } = require("../inngest/index");

const stripeWebhooks = async (request, response) => {
  const stripeInstance = Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const sessionList = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntent.id,
      });

      const session = sessionList.data[0];
      const { bookingId } = session.metadata;

      await Booking.findByIdAndUpdate(bookingId, {
        isPaid: true,
        paymentLink: "",
      });
      //send confirmation email
      await inngest.send({
        name:"app/show.booked",
        data:{bookingId}
      })
    }

    response.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error", err);
    response.status(500).send("Internal server error");
  }
};

module.exports = { stripeWebhooks };
