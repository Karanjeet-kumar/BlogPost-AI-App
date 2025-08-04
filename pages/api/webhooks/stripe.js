import Cors from "micro-cors";
import stripeInit from "stripe";
import verifyStripe from "@webdeveducation/next-verify-stripe";
import clientPromise from "../../../lib/mongodb";

// Enable CORS
const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

// Disable body parsing (Stripe requires raw body)
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = stripeInit(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handler = async (req, res) => {
  if (req.method === "POST") {
    let event;

    try {
      event = await verifyStripe({
        req,
        stripe,
        endpointSecret,
      });
    } catch (error) {
      console.error("❌ Stripe signature verification failed:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const auth0Id = session.metadata?.sub;

        console.log("✅ Webhook received for Auth0 ID:", auth0Id);

        if (!auth0Id) {
          console.error("❌ Missing auth0Id in metadata");
          break;
        }

        try {
          const client = await clientPromise;
          const db = client.db("BlogPost");

          const result = await db.collection("users").updateOne(
            { auth0Id },
            {
              $inc: { availableTokens: 10 },
              $setOnInsert: { auth0Id },
            },
            { upsert: true }
          );

          console.log("✅ MongoDB update result:", result);
        } catch (dbError) {
          console.error("❌ MongoDB update failed:", dbError.message);
        }

        break;
      }

      default:
        console.log("⚠️ Unhandled event type:", event.type);
    }

    res.status(200).json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default cors(handler);
