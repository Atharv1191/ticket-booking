const { Webhook } = require("svix");
const User = require("../models/User");

const clerkWebhooks = async (req, res) => {
  console.log("📨 Incoming Clerk webhook");

  try {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const evt = wh.verify(req.rawBody, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    });

    const { data, type } = evt;
    console.log("🔔 Webhook type:", type);
    console.log("📦 Webhook data:", data);

    switch (type) {
      case 'user.created': {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`,
          image: data.image_url,
        };
        console.log("📥 Creating user in DB:", userData);

        try {
          await User.create(userData);
          console.log("✅ User created successfully");
        } catch (err) {
          console.error("❌ MongoDB Create Error:", err.message);
        }

        return res.status(200).json({ ok: true });
      }

      case 'user.updated': {
        const userData = {
          email: data.email_addresses?.[0]?.email_address || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`,
          image: data.image_url,
        };
        console.log("✏️ Updating user:", data.id, userData);

        try {
          await User.findByIdAndUpdate(data.id, userData);
          console.log("✅ User updated successfully");
        } catch (err) {
          console.error("❌ MongoDB Update Error:", err.message);
        }

        return res.status(200).json({ ok: true });
      }

      case 'user.deleted': {
        console.log("🗑️ Deleting user:", data.id);
        try {
          await User.findByIdAndDelete(data.id);
          console.log("✅ User deleted successfully");
        } catch (err) {
          console.error("❌ MongoDB Delete Error:", err.message);
        }

        return res.status(200).json({ ok: true });
      }

      default:
        console.log("ℹ️ Unhandled webhook type:", type);
        return res.status(200).json({ ok: true });
    }

  } catch (error) {
    console.error("❌ Webhook Verification Error:", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { clerkWebhooks };