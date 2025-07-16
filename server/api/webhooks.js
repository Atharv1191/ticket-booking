const { Webhook } = require("svix");
const User = require("../models/User"); // Adjust the path as needed


const clerkWebhooks = async (req, res) => {
  try {

    // ✅ Create a Svix webhook instance
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    // ✅ Verify the signature
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    // ✅ Destructure event type and data
    const { type, data } = req.body;

    // ✅ Handle different Clerk event types
    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          email: data.email_addresses[0]?.email_address || "",
          image: data.image_url,
        };

        await User.create(userData);
        console.log("✅ User created:", userData.email);
        res.status(201).json({ success: true });
        break;
      }

      case "user.updated": {
        const updatedData = {
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          email: data.email_addresses[0]?.email_address || "",
          image: data.image_url,
        };

        await User.findByIdAndUpdate(data.id, updatedData);
        console.log("✅ User updated:", updatedData.email);
        res.status(200).json({ success: true });
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        console.log("🗑️ User deleted:", data.id);
        res.status(200).json({ success: true });
        break;
      }

      default:
        console.log("ℹ️ Unhandled event type:", type);
        res.status(204).end();
        break;
    }
  } catch (error) {
    console.error("❌ Webhook error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { clerkWebhooks };
