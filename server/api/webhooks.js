const { Webhook } = require("svix");
const User = require("../models/User"); // ✅ Adjust the path if needed

const clerkWebhooks = async (req, res) => {
  try {
   

    // ✅ Verify Clerk webhook signature
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const evt = await wh.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { type, data } = evt;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          email: data.email_addresses[0]?.email_address || "",
          image: data.image_url || data.profile_image_url,
        };

        await User.create(userData);
        console.log("✅ User saved:", userData.email);
        return res.status(201).json({ success: true });
      }

      case "user.updated": {
        const updatedData = {
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          email: data.email_addresses[0]?.email_address || "",
          image: data.image_url || data.profile_image_url,
        };

        await User.findByIdAndUpdate(data.id, updatedData);
        console.log("✅ User updated:", updatedData.email);
        return res.status(200).json({ success: true });
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        console.log("🗑️ User deleted:", data.id);
        return res.status(200).json({ success: true });
      }

      default:
        console.log("ℹ️ Unhandled event:", type);
        return res.status(204).end();
    }
  } catch (err) {
    console.error("❌ Clerk webhook error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { clerkWebhooks };
